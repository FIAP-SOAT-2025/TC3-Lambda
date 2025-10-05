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
        return { statusCode: 400, body: JSON.stringify({ error: "Token without CPF" }) };
      }

      const customer = await this.cognito.findCustomerByCpf(cpf);
      if (!customer) {
        return { statusCode: 404, body: JSON.stringify({ error: "Customer not found in Cognito" }) };
      }

      return { statusCode: 200, body: JSON.stringify({ message: "Valid token", user: customer }) };
    } catch (err) {
      return { statusCode: 401, body: JSON.stringify({ error: "Invalid or expired token" }) };
    }
  }
}

module.exports = { JwtService };
