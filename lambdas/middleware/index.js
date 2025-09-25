"use strict";
const { JwtService } = require("./services/jwtService");
const { CognitoService } = require("./services/cognitoService");

const cognito = new CognitoService();
const jwtService = new JwtService(secrets.JWT_SECRET || "dev-secret", cognito);

const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : null;
    const tokenRaw = body?.token;

    if (!tokenRaw) {
      return { statusCode: 400, body: JSON.stringify({ error: "Token JWT é obrigatório" }) };
    }

    return await jwtService.verify(tokenRaw);
  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Erro interno" }) };
  }
};

module.exports = { handler };
