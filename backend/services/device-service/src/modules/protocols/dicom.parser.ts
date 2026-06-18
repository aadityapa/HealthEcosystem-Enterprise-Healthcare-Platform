import type { DicomParseResult } from './protocol.types';

const DICOM_TAG_PATTERN = /\(([\dA-Fa-f]{4}),([\dA-Fa-f]{4})\)\s+(\S+)\s+(\[[^\]]*\]|[^\n\r]+)/g;

export function parseDicomMetadata(raw: string): DicomParseResult {
  const metadata: Record<string, string> = {};

  let match: RegExpExecArray | null;
  while ((match = DICOM_TAG_PATTERN.exec(raw)) !== null) {
    const group = match[1];
    const element = match[2];
    const tag = `${group}${element}`;
    const value = match[4].replace(/^\[|\]$/g, '').trim();
    metadata[tag] = value;
  }

  const get = (...tags: string[]) => tags.map((t) => metadata[t]).find(Boolean);

  return {
    sopClassUid: get('00080016'),
    sopInstanceUid: get('00080018'),
    studyInstanceUid: get('0020000D'),
    seriesInstanceUid: get('0020000E'),
    accessionNumber: get('00080050'),
    patientId: get('00100020'),
    modality: get('00080060'),
    metadata,
  };
}

export function parseDicomCStoreHeaders(headers: Record<string, string>): DicomParseResult {
  const metadata: Record<string, string> = { ...headers };

  return {
    sopClassUid: headers['00080016'] ?? headers.sopClassUid,
    sopInstanceUid: headers['00080018'] ?? headers.sopInstanceUid,
    studyInstanceUid: headers['0020000D'] ?? headers.studyInstanceUid,
    seriesInstanceUid: headers['0020000E'] ?? headers.seriesInstanceUid,
    accessionNumber: headers['00080050'] ?? headers.accessionNumber,
    patientId: headers['00100020'] ?? headers.patientId,
    modality: headers['00080060'] ?? headers.modality,
    metadata,
  };
}
