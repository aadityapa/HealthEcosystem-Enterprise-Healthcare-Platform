import type { Hl7Observation, Hl7ParseResult, Hl7Segment } from './protocol.types';

const VT = '\x0B';
const FS = '\x1C';

export function stripMllpFraming(raw: string): string {
  let message = raw;
  if (message.startsWith(VT)) {
    message = message.slice(1);
  }
  const fsIndex = message.indexOf(FS);
  if (fsIndex >= 0) {
    message = message.slice(0, fsIndex);
  }
  return message.trim();
}

export function parseHl7Segments(message: string): Hl7Segment[] {
  return message
    .split(/\r\n|\r|\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const fields = line.split('|');
      return {
        name: fields[0] ?? '',
        fields,
        raw: line,
      };
    });
}

function parseObxSegment(segment: Hl7Segment): Hl7Observation | null {
  const fields = segment.fields;
  const identifier = fields[3] ?? '';
  const parts = identifier.split('^');
  const parameterCode = parts[0] || parts[1] || identifier;
  const value = fields[5] ?? '';

  if (!parameterCode || !value) return null;

  return {
    setId: fields[1],
    valueType: fields[2],
    parameterCode,
    value,
    unit: fields[6] || undefined,
    referenceRange: fields[7] || undefined,
    abnormalFlags: fields[8] || undefined,
    observedAt: fields[14] || fields[19] || undefined,
  };
}

export function parseHl7Message(raw: string): Hl7ParseResult {
  const message = stripMllpFraming(raw);
  const segments = parseHl7Segments(message);

  const msh = segments.find((s) => s.name === 'MSH');
  const messageType = msh?.fields[8];
  const messageControlId = msh?.fields[9];

  const obr = segments.find((s) => s.name === 'OBR');
  const sampleBarcode =
    obr?.fields[3]?.split('^')[0] ||
    obr?.fields[2]?.split('^')[0] ||
    segments.find((s) => s.name === 'PID')?.fields[3]?.split('^')[0];

  const observations = segments
    .filter((s) => s.name === 'OBX')
    .map(parseObxSegment)
    .filter((o): o is Hl7Observation => o !== null);

  return {
    segments,
    messageType,
    messageControlId,
    sampleBarcode,
    observations,
  };
}

export function wrapMllp(message: string): string {
  return `${VT}${message}${FS}\r`;
}
