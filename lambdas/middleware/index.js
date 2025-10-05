"use strict";
const { JwtService } = require("./services/jwtService");
const { CognitoService } = require("./services/cognitoService");

const cognito = new CognitoService();
const jwtService = new JwtService(process.env.JWT_SECRET || "dev-secret", cognito);

const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : null;
    const tokenRaw = body?.token;

    if (!tokenRaw) {
      return { statusCode: 400, body: JSON.stringify({ error: "Token JWT is required" }) };
    }

    return await jwtService.verify(tokenRaw);
  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};

module.exports = { handler };
