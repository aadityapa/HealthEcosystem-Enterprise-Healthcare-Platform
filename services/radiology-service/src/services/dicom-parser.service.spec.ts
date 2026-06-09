import { BadRequestException } from '@nestjs/common';
import { ModalityType } from '@health/db';
import { DicomParserService } from './dicom-parser.service';

function buildDicomBuffer(tags: Record<string, string>): Buffer {
  const chunks: Buffer[] = [Buffer.alloc(128, 0), Buffer.from('DICM')];

  for (const [tagHex, value] of Object.entries(tags)) {
    const group = parseInt(tagHex.slice(0, 4), 16);
    const element = parseInt(tagHex.slice(4, 8), 16);
    const vr = tagHex.startsWith('0008') && tagHex.endsWith('0060') ? 'CS' : 'UI';
    const valueBuf = Buffer.from(value, 'ascii');
    const length = valueBuf.length;
    const header = Buffer.alloc(8);
    header.writeUInt16LE(group, 0);
    header.writeUInt16LE(element, 2);
    header.write(vr, 4, 2, 'ascii');
    header.writeUInt16LE(length, 6);
    chunks.push(header, valueBuf);
    if (length % 2 === 1) chunks.push(Buffer.alloc(1));
  }

  return Buffer.concat(chunks);
}

describe('DicomParserService', () => {
  let service: DicomParserService;

  beforeEach(() => {
    service = new DicomParserService();
  });

  it('parses study, series, modality from buffer', () => {
    const buffer = buildDicomBuffer({
      '0020000D': '1.2.840.10008.1.2.1.1',
      '0020000E': '1.2.840.10008.1.2.1.2',
      '00080018': '1.2.840.10008.1.2.1.3',
      '00080060': 'CT',
    });

    const result = service.parseBuffer(buffer);

    expect(result.studyInstanceUid).toBe('1.2.840.10008.1.2.1.1');
    expect(result.seriesInstanceUid).toBe('1.2.840.10008.1.2.1.2');
    expect(result.sopInstanceUid).toBe('1.2.840.10008.1.2.1.3');
    expect(result.modality).toBe(ModalityType.CT);
  });

  it('throws on empty buffer', () => {
    expect(() => service.parseBuffer(Buffer.alloc(0))).toThrow(BadRequestException);
  });

  it('returns partial tags when not all present', () => {
    const buffer = buildDicomBuffer({
      '0020000D': '1.2.3',
    });

    const result = service.parseBuffer(buffer);
    expect(result.studyInstanceUid).toBe('1.2.3');
    expect(result.modality).toBeUndefined();
  });
});
