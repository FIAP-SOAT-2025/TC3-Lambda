import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CognitoService } from "./services/cognitoService";
import { JwtService } from "./services/jwtService";

const cognito = new CognitoService();
const jwt = new JwtService(process.env.JWT_SECRET || "dev-secret");

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const body = event.body ? JSON.parse(event.body) : null;
    const cpfRaw = body?.cpf;

    if (!cpfRaw) {
      return { statusCode: 400, body: JSON.stringify({ error: "CPF é obrigatório" }) };
    }

    const cpf = cpfRaw.toString().replace(/\D/g, "");

    if (cpf.length !== 11) {
      return { statusCode: 400, body: JSON.stringify({ error: "CPF inválido" }) };
    }

    const customer = await cognito.findUserByCpf(cpf);

    if (!customer) {
      return { statusCode: 404, body: JSON.stringify({ error: "Usuário não encontrado" }) };
    }

    const token = jwt.sign({ cpf: customer.cpf });

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Erro interno" }) };
  }
};
