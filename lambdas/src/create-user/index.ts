import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CognitoService } from "./services/cognitoService";

const cognito = new CognitoService();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : null;
    const cpfRaw = body?.cpf;

    if (!cpfRaw) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "CPF é obrigatório" }),
      };
    }

    const cpf = cpfRaw.toString().replace(/\D/g, "");
    if (cpf.length !== 11) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "CPF inválido" }),
      };
    }

    const customer = await cognito.createUser(cpf);

    return {
      statusCode: 201,
      body: "Usuário criado com sucesso!",
    };
  } catch (err: any) {
    console.error("Erro ao criar usuário:", err);

    if (err.name === "UsernameExistsException") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User account already exists" }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno no servidor" }),
    };
  }
};
