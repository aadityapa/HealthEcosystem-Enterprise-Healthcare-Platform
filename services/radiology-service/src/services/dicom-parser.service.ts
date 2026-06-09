import { Injectable, BadRequestException } from '@nestjs/common';
import type { ModalityType } from '@health/db';

export interface DicomParsedTags {
  studyInstanceUid?: string;
  seriesInstanceUid?: string;
  sopInstanceUid?: string;
  modality?: ModalityType;
}

const EXPLICIT_VR_LONG = new Set(['OB', 'OW', 'OF', 'SQ', 'UT', 'UN']);

const TAG_STUDY_UID = 0x0020000d;
const TAG_SERIES_UID = 0x0020000e;
const TAG_SOP_UID = 0x00080018;
const TAG_MODALITY = 0x00080060;

const VALID_MODALITIES = new Set(['XR', 'CT', 'MR', 'US', 'MG']);

@Injectable()
export class DicomParserService {
  parseBuffer(buffer: Buffer): DicomParsedTags {
    if (!buffer?.length) {
      throw new BadRequestException('Empty DICOM buffer');
    }

    const offset = this.findDatasetOffset(buffer);
    const tags = this.walkElements(buffer, offset);
    const modality = tags.modality
      ? this.normalizeModality(tags.modality)
      : undefined;

    return {
      studyInstanceUid: tags.studyInstanceUid,
      seriesInstanceUid: tags.seriesInstanceUid,
      sopInstanceUid: tags.sopInstanceUid,
      modality,
    };
  }

  private findDatasetOffset(buffer: Buffer): number {
    if (buffer.length >= 132 && buffer.subarray(128, 132).toString('ascii') === 'DICM') {
      return 132;
    }
    return 0;
  }

  private walkElements(
    buffer: Buffer,
    start: number,
  ): {
    studyInstanceUid?: string;
    seriesInstanceUid?: string;
    sopInstanceUid?: string;
    modality?: string;
  } {
    const result: {
      studyInstanceUid?: string;
      seriesInstanceUid?: string;
      sopInstanceUid?: string;
      modality?: string;
    } = {};

    let pos = start;
    const maxIterations = 10_000;
    let iterations = 0;

    while (pos + 8 <= buffer.length && iterations < maxIterations) {
      iterations += 1;

      const parsed = this.readElement(buffer, pos);
      if (!parsed) break;

      const { tag, value, nextOffset } = parsed;
      pos = nextOffset;

      if (tag === TAG_STUDY_UID) result.studyInstanceUid = value;
      else if (tag === TAG_SERIES_UID) result.seriesInstanceUid = value;
      else if (tag === TAG_SOP_UID) result.sopInstanceUid = value;
      else if (tag === TAG_MODALITY) result.modality = value;

      if (
        result.studyInstanceUid &&
        result.seriesInstanceUid &&
        result.sopInstanceUid &&
        result.modality
      ) {
        break;
      }
    }

    return result;
  }

  private readElement(
    buffer: Buffer,
    offset: number,
  ): { tag: number; value: string; nextOffset: number } | null {
    if (offset + 8 > buffer.length) return null;

    const group = buffer.readUInt16LE(offset);
    const element = buffer.readUInt16LE(offset + 2);
    const tag = (group << 16) | element;

    const vr = buffer.subarray(offset + 4, offset + 6).toString('ascii');
    const isLikelyVr = /^[A-Z]{2}$/.test(vr);

    let length: number;
    let valueOffset: number;

    if (isLikelyVr) {
      if (EXPLICIT_VR_LONG.has(vr)) {
        if (offset + 12 > buffer.length) return null;
        length = buffer.readUInt32LE(offset + 8);
        valueOffset = offset + 12;
      } else {
        if (offset + 8 > buffer.length) return null;
        length = buffer.readUInt16LE(offset + 6);
        valueOffset = offset + 8;
      }
    } else {
      length = buffer.readUInt32LE(offset + 4);
      valueOffset = offset + 8;
    }

    if (length === 0xffffffff) {
      return { tag, value: '', nextOffset: valueOffset };
    }

    if (valueOffset + length > buffer.length) return null;

    const raw = buffer.subarray(valueOffset, valueOffset + length);
    const value = raw.toString('ascii').replace(/\0/g, '').trim();

    const paddedLength = length % 2 === 1 ? length + 1 : length;
    return { tag, value, nextOffset: valueOffset + paddedLength };
  }

  private normalizeModality(value: string): ModalityType | undefined {
    const code = value.split('\\')[0]?.trim().toUpperCase();
    if (code && VALID_MODALITIES.has(code)) {
      return code as ModalityType;
    }
    return undefined;
  }
}
