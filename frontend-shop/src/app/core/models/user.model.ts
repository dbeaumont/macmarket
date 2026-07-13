export interface UserInfo {
  readonly sub: string;
  readonly email: string;
  readonly name: string;
  readonly preferredUsername: string;
  readonly roles: readonly string[];
}

export interface ShippingProfile {
  readonly name: string;
  readonly address: string;
  readonly email: string;
}
