export interface RefreshTokenPayload {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}
