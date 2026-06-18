import {
  computeAstmChecksum,
  extractAstmResults,
  parseAstmMessage,
  parseAstmRecords,
  stripAstmFraming,
} from './astm.parser';

describe('AstmParser', () => {
  const sampleRecords = [
    'H|\\^&|||Cobas6000^Roche|||||||P|1',
    'P|1||PAT001||Doe^John',
    'O|1|SAMPLE001||^^^GLU^Glucose',
    'R|1|^^^GLU^Glucose|95|mg/dL|70-110|N',
    'L|1|N',
  ].join('\r');

  it('strips STX/ETX framing', () => {
    const framed = `\x021${sampleRecords}\x034A\r\n`;
    const stripped = stripAstmFraming(framed);
    expect(stripped).toContain('H|\\^&');
    expect(stripped).not.toContain('\x02');
  });

  it('parses ASTM record types H/P/O/R/L', () => {
    const records = parseAstmRecords(sampleRecords);
    expect(records.map((r) => r.type)).toEqual(['H', 'P', 'O', 'R', 'L']);
    expect(records[0].fields[0]).toBe('H');
    expect(records[3].fields[3]).toBe('95');
  });

  it('validates checksum when framed', () => {
    const body = `1${sampleRecords}`;
    const checksum = computeAstmChecksum(body);
    const framed = `\x02${body}\x03${checksum}\r\n`;
    const result = parseAstmMessage(framed);
    expect(result.checksumValid).toBe(true);
  });

  it('extracts sample barcode from O record', () => {
    const result = parseAstmMessage(sampleRecords);
    expect(result.sampleBarcode).toBe('SAMPLE001');
    expect(result.records).toHaveLength(5);
  });

  it('extracts results from R records', () => {
    const records = parseAstmRecords(sampleRecords);
    const results = extractAstmResults(records);
    expect(results).toHaveLength(1);
    expect(results[0].parameterCode).toBe('^^^GLU^Glucose');
    expect(results[0].value).toBe('95');
    expect(results[0].unit).toBe('mg/dL');
  });

  it('flags invalid checksum', () => {
    const framed = `\x021${sampleRecords}\x03FF\r\n`;
    const result = parseAstmMessage(framed);
    expect(result.checksumValid).toBe(false);
  });
});
