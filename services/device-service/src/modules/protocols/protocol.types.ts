export interface AstmRecord {
  type: string;
  fields: string[];
  raw: string;
}

export interface AstmParseResult {
  records: AstmRecord[];
  checksumValid: boolean;
  sampleBarcode?: string;
  messageControlId?: string;
}

export interface Hl7Segment {
  name: string;
  fields: string[];
  raw: string;
}

export interface Hl7ParseResult {
  segments: Hl7Segment[];
  messageType?: string;
  messageControlId?: string;
  sampleBarcode?: string;
  observations: Hl7Observation[];
}

export interface Hl7Observation {
  setId?: string;
  valueType?: string;
  parameterCode: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  abnormalFlags?: string;
  observedAt?: string;
}

export interface FhirObservation {
  code: string;
  display?: string;
  value: string;
  unit?: string;
  effectiveDateTime?: string;
}

export interface FhirParseResult {
  resourceType: string;
  id?: string;
  sampleBarcode?: string;
  observations: FhirObservation[];
}

export interface DicomParseResult {
  sopClassUid?: string;
  sopInstanceUid?: string;
  studyInstanceUid?: string;
  seriesInstanceUid?: string;
  accessionNumber?: string;
  patientId?: string;
  modality?: string;
  metadata: Record<string, string>;
}

export interface NormalizedResult {
  sampleBarcode: string;
  parameterCode: string;
  value: string;
  unit?: string;
  rawValue?: string;
  messageControlId?: string;
  observedAt?: string;
}

export type ParsedProtocolPayload =
  | { protocol: 'ASTM'; data: AstmParseResult }
  | { protocol: 'HL7_V2'; data: Hl7ParseResult }
  | { protocol: 'FHIR'; data: FhirParseResult }
  | { protocol: 'DICOM'; data: DicomParseResult };
