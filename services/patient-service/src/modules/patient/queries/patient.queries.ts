export class GetPatientQuery {
  constructor(
    public readonly tenantId: string,
    public readonly patientId: string,
  ) {}
}

export class SearchPatientsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly query: string | undefined,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}

export class GetPatientTimelineQuery {
  constructor(
    public readonly tenantId: string,
    public readonly patientId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}

export class GetPatientVisitsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly patientId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}

export class ListPatientDocumentsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly patientId: string,
  ) {}
}
