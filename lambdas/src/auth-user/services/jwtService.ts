import jwt, { JwtPayload } from "jsonwebtoken";

export class JwtService {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  sign(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: "20s" });
  }

  verify(token: string): string | JwtPayload {
    return jwt.verify(token, this.secret);
  }
}
