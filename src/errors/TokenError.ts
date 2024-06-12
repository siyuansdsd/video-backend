export class TokenError extends Error {
  super(message: string) {
    this.name = "TokenError";
    this.message = message;
  }
}
