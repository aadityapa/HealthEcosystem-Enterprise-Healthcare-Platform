import type { FhirObservation, FhirParseResult } from './protocol.types';

interface FhirCodeableConcept {
  coding?: Array<{ code?: string; display?: string }>;
  text?: string;
}

interface FhirQuantity {
  value?: number | string;
  unit?: string;
}

interface FhirResource {
  resourceType: string;
  id?: string;
  code?: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
  valueString?: string;
  effectiveDateTime?: string;
  subject?: { reference?: string };
  identifier?: Array<{ value?: string }>;
  result?: Array<{ reference?: string }>;
  entry?: Array<{ resource?: FhirResource }>;
}

function extractCode(code?: FhirCodeableConcept): { code: string; display?: string } {
  const coding = code?.coding?.[0];
  return {
    code: coding?.code ?? code?.text ?? 'unknown',
    display: coding?.display ?? code?.text,
  };
}

function observationFromResource(resource: FhirResource): FhirObservation | null {
  if (resource.resourceType !== 'Observation') return null;

  const { code, display } = extractCode(resource.code);
  const value =
    resource.valueQuantity?.value?.toString() ??
    resource.valueString ??
  '';

  if (!value) return null;

  return {
    code,
    display,
    value,
    unit: resource.valueQuantity?.unit,
    effectiveDateTime: resource.effectiveDateTime,
  };
}

export function parseFhirBundle(raw: string | object): FhirParseResult {
  const bundle: FhirResource =
    typeof raw === 'string' ? (JSON.parse(raw) as FhirResource) : (raw as FhirResource);

  const observations: FhirObservation[] = [];
  let sampleBarcode: string | undefined;

  if (bundle.resourceType === 'Bundle' && bundle.entry) {
    for (const entry of bundle.entry) {
      const resource = entry.resource;
      if (!resource) continue;

      if (resource.resourceType === 'DiagnosticReport') {
        sampleBarcode =
          resource.identifier?.[0]?.value ??
          resource.subject?.reference?.split('/').pop();
      }

      const obs = observationFromResource(resource);
      if (obs) observations.push(obs);
    }
  } else if (bundle.resourceType === 'Observation') {
    const obs = observationFromResource(bundle);
    if (obs) observations.push(obs);
  } else if (bundle.resourceType === 'DiagnosticReport') {
    sampleBarcode =
      bundle.identifier?.[0]?.value ?? bundle.subject?.reference?.split('/').pop();
  }

  return {
    resourceType: bundle.resourceType,
    id: bundle.id,
    sampleBarcode,
    observations,
  };
}
