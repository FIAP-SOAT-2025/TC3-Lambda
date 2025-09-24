"use strict";
const jwt = require("jsonwebtoken");

class JwtService {
  constructor(secret, cognitoService) {
    this.secret = secret;
    this.cognito = cognitoService;
  }

  async verify(token) {
    try {
      const decoded = jwt.verify(token, this.secret);

      const cpf = decoded.cpf;
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

module.exports = { JwtService };
