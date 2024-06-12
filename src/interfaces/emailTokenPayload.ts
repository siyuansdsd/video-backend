export interface EmailTokenPayload {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}
