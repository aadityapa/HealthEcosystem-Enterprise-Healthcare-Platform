import { DeviceVendor } from '@health/db';
import { parseAstmMessage } from '../protocols/astm.parser';
import { parseHl7Message } from '../protocols/hl7.parser';
import { AdapterRegistry } from './adapter.registry';

describe('Vendor adapter sample workflow', () => {
  const registry = new AdapterRegistry();

  it('maps Roche Cobas HL7 results', () => {
    const hl7 = [
      'MSH|^~\\&|Cobas|Roche|LIMS|Lab|20260101120000||ORU^R01|R001|P|2.3',
      'OBR|1|S001|S001|CHEM',
      'OBX|1|NM|GLU||92|mg/dL',
      'OBX|2|NM|CREA||1.0|mg/dL',
    ].join('\r');

    const parsed = { protocol: 'HL7_V2' as const, data: parseHl7Message(hl7) };
    const results = registry.getAdapter(DeviceVendor.ROCHE).mapToNormalized(parsed);

    expect(results).toHaveLength(2);
    expect(results[0].parameterCode).toBe('GLUCOSE');
    expect(results[1].parameterCode).toBe('CREATININE');
  });

  it('maps Abbott Architect ASTM results', () => {
    const astm = [
      'H|\\^&|||Architect',
      'O|1|A001||^^^GLU',
      'R|1|^^^GLU|105|mg/dL',
      'L|1|N',
    ].join('\r');

    const parsed = { protocol: 'ASTM' as const, data: parseAstmMessage(astm) };
    const results = registry.getAdapter(DeviceVendor.ABBOTT).mapToNormalized(parsed);

    expect(results[0].parameterCode).toBe('GLUCOSE');
    expect(results[0].sampleBarcode).toBe('A001');
  });

  it('maps Siemens Atellica HL7 electrolytes', () => {
    const hl7 = [
      'MSH|^~\\&|Atellica|Siemens|LIMS|Lab|20260101120000||ORU^R01|S001|P|2.3',
      'OBR|1|E001|E001|ISE',
      'OBX|1|NM|Na||140|mmol/L',
      'OBX|2|NM|K||4.2|mmol/L',
    ].join('\r');

    const parsed = { protocol: 'HL7_V2' as const, data: parseHl7Message(hl7) };
    const results = registry.getAdapter(DeviceVendor.SIEMENS).mapToNormalized(parsed);

    expect(results[0].parameterCode).toBe('SODIUM');
    expect(results[1].parameterCode).toBe('POTASSIUM');
  });

  it('maps Sysmex XN CBC panel', () => {
    const hl7 = [
      'MSH|^~\\&|XN|Sysmex|LIMS|Lab|20260101120000||ORU^R01|X001|P|2.3',
      'OBR|1|H001|H001|CBC',
      'OBX|1|NM|WBC||6.2|10*3/uL',
      'OBX|2|NM|HGB||14.5|g/dL',
      'OBX|3|NM|PLT||250|10*3/uL',
    ].join('\r');

    const parsed = { protocol: 'HL7_V2' as const, data: parseHl7Message(hl7) };
    const results = registry.getAdapter(DeviceVendor.SYSMEX).mapToNormalized(parsed);

    expect(results.map((r) => r.parameterCode)).toEqual([
      'WHITE_BLOOD_CELL',
      'HEMOGLOBIN',
      'PLATELET',
    ]);
  });

  it('maps Beckman AU ASTM chemistry', () => {
    const astm = [
      'H|\\^&|||AU5800',
      'O|1|B001||^^^BUN',
      'R|1|^^^BUN|18|mg/dL',
      'L|1|N',
    ].join('\r');

    const parsed = { protocol: 'ASTM' as const, data: parseAstmMessage(astm) };
    const results = registry.getAdapter(DeviceVendor.BECKMAN_COULTER).mapToNormalized(parsed);

    expect(results[0].parameterCode).toBe('UREA');
    expect(results[0].value).toBe('18');
  });
});
