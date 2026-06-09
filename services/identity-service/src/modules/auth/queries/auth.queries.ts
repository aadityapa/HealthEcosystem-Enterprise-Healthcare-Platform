export class GetUserProfileQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserSessionsQuery {
  constructor(public readonly userId: string) {}
}

export class ValidateTokenQuery {
  constructor(public readonly token: string) {}
}
