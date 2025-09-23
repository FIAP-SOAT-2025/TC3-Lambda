import jwt, { JwtPayload } from "jsonwebtoken";
import { CognitoService } from "./cognitoService";

interface JwtVerifyResponse {
  statusCode: number;
  body: string;
}

export class JwtService {
  private secret: string;
  private cognito: CognitoService;

  constructor(secret: string, cognitoService: CognitoService) {
    this.secret = secret;
    this.cognito = cognitoService;
  }

  async verify(token: string): Promise<JwtVerifyResponse> {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;

      const cpf = decoded.cpf as string | undefined;
      if (!cpf) {
        return { statusCode: 400, body: JSON.stringify({ error: "CPF não encontrado no token" }) };
      }

      const customer = await this.cognito.findUserByCpf(cpf);
      if (!customer) {
        return { statusCode: 404, body: JSON.stringify({ error: "Usuário não encontrado no Cognito" }) };
      }

      return { statusCode: 200, body: JSON.stringify({ message: "Token válido", user: customer }) };
    } catch (err) {
      return { statusCode: 401, body: JSON.stringify({ error: "Token inválido ou expirado" }) };
    }
  }
}
