import { JwtService } from "./services/jwtService";
import { CognitoService } from "./services/cognitoService";

const cognito = new CognitoService();
const jwtService = new JwtService(process.env.JWT_SECRET || "dev-secret", cognito);

interface Event {
  body?: string;
}

interface Response {
  statusCode: number;
  body: string;
}

export const handler = async (event: Event): Promise<Response> => {
  try {
    const body = event.body ? JSON.parse(event.body) : null;
    const tokenRaw: string | undefined = body?.token;

    if (!tokenRaw) {
      return { statusCode: 400, body: JSON.stringify({ error: "Token JWT é obrigatório" }) };
    }

    const result = await jwtService.verify(tokenRaw);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Erro interno" }) };
  }
};
