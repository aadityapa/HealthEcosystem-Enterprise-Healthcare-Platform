import type { AstmParseResult, AstmRecord } from './protocol.types';

const STX = '\x02';
const ETX = '\x03';
const CR = '\r';
const LF = '\n';

export function stripAstmFraming(raw: string): string {
  let payload = raw;

  if (payload.includes(STX)) {
    const start = payload.indexOf(STX) + 1;
    const end = payload.indexOf(ETX, start);
    payload = end >= 0 ? payload.slice(start, end) : payload.slice(start);
  }

  return payload.replace(/\x0B/g, '').replace(/\x1C/g, '').trim();
}

export function computeAstmChecksum(frame: string): string {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) {
    sum += frame.charCodeAt(i);
  }
  return (sum % 256).toString(16).toUpperCase().padStart(2, '0');
}

export function parseAstmRecords(payload: string): AstmRecord[] {
  const lines = payload.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0);
  const records: AstmRecord[] = [];

  for (const line of lines) {
    const trimmed = line.replace(/^\d/, '');
    const fields = trimmed.split('|');
    const type = fields[0]?.charAt(0) ?? '';
    records.push({
      type,
      fields,
      raw: line,
    });
  }

  return records;
}

export function parseAstmMessage(raw: string): AstmParseResult {
  const framed = raw.includes(STX) && raw.includes(ETX);
  let checksumValid = true;

  if (framed) {
    const start = raw.indexOf(STX) + 1;
    const end = raw.indexOf(ETX, start);
    const frameBody = raw.slice(start, end);
    const afterEtx = raw.slice(end + 1).trim();
    const expectedChecksum = computeAstmChecksum(frameBody);
    const providedChecksum = afterEtx.replace(/[\r\n]/g, '').slice(0, 2);
    checksumValid = providedChecksum.length === 0 || providedChecksum === expectedChecksum;
  }

  const payload = stripAstmFraming(raw);
  const records = parseAstmRecords(payload);

  let sampleBarcode: string | undefined;
  let messageControlId: string | undefined;

  for (const record of records) {
    if (record.type === 'H') {
      messageControlId = record.fields[2] || record.fields[1];
    }
    if (record.type === 'O') {
      sampleBarcode = record.fields[2] || record.fields[3];
    }
    if (record.type === 'P' && !sampleBarcode) {
      sampleBarcode = record.fields[3] || record.fields[2];
    }
  }

  return {
    records,
    checksumValid,
    sampleBarcode,
    messageControlId,
  };
}

export function extractAstmResults(records: AstmRecord[]) {
  return records
    .filter((r) => r.type === 'R')
    .map((record) => ({
      parameterCode: record.fields[2] ?? record.fields[1] ?? '',
      value: record.fields[3] ?? '',
      unit: record.fields[4] || undefined,
      rawValue: record.raw,
    }))
    .filter((r) => r.parameterCode && r.value);
}
