import jwt from "jsonwebtoken";

export class JwtService {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  sign(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: "1h" });
  }

  verify(token: string): any {
    return jwt.verify(token, this.secret);
  }
}