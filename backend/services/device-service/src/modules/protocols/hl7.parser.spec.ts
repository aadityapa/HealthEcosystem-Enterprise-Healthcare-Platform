import { parseHl7Message, parseHl7Segments, stripMllpFraming, wrapMllp } from './hl7.parser';

describe('Hl7Parser', () => {
  const oruMessage = [
    'MSH|^~\\&|Cobas|Roche|LIMS|Lab|20260101120000||ORU^R01|MSG001|P|2.3',
    'PID|1||PAT001||Doe^John',
    'OBR|1|SAMPLE001|SAMPLE001|GLU^Glucose',
    'OBX|1|NM|GLU^Glucose||95|mg/dL|70-110|N|||F',
    'OBX|2|NM|CREA^Creatinine||1.1|mg/dL|0.6-1.2|N|||F',
  ].join('\r');

  it('strips MLLP framing', () => {
    const framed = wrapMllp(oruMessage);
    const stripped = stripMllpFraming(framed);
    expect(stripped.startsWith('MSH|')).toBe(true);
    expect(stripped).not.toContain('\x0B');
  });

  it('parses HL7 segments', () => {
    const segments = parseHl7Segments(oruMessage);
    expect(segments.map((s) => s.name)).toEqual(['MSH', 'PID', 'OBR', 'OBX', 'OBX']);
  });

  it('parses ORU^R01 message type and control ID', () => {
    const result = parseHl7Message(wrapMllp(oruMessage));
    expect(result.messageType).toBe('ORU^R01');
    expect(result.messageControlId).toBe('MSG001');
  });

  it('extracts sample barcode from OBR', () => {
    const result = parseHl7Message(oruMessage);
    expect(result.sampleBarcode).toBe('SAMPLE001');
  });

  it('parses OBX observations', () => {
    const result = parseHl7Message(oruMessage);
    expect(result.observations).toHaveLength(2);
    expect(result.observations[0].parameterCode).toBe('GLU');
    expect(result.observations[0].value).toBe('95');
    expect(result.observations[1].parameterCode).toBe('CREA');
  });
});
