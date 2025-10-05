"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;

console.log("Antes cognito service import");
const cognitoService = require("./services/cognitoService");

console.log("Depois cognito service import",cognitoService);
const cognito = new cognitoService.CognitoService();
console.log("Depois cognito  import",cognito);

const apiUrl = `${process.env.CUSTOMER_API_URL}customer`;
const jwtService = require("./services/jwtService");
const jwt = new jwtService.JwtService(process.env.JWT_SECRET || "dev-secret");

const handler = async (event) => {
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
      console.log('cpf',cpf);
      console.log("body.name",body.name);
      console.log("body.email", body.email);
      console.log("apiUrl", apiUrl);
      const token = jwt.sign({ cpf });
      console.log("token", token);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${token}`},
        body: JSON.stringify({
          cpf,
          name: body.name,
          email: body.email,
        }),
      });
      console.log("response", response);

      if (response.status == 201) {
        console.log("response.status 201");
        const customer = await cognito.createCustomer(cpf);
        console.log("customer", customer);
        return {
          statusCode: 201,
          body: JSON.stringify({ token }),
          message: "Cliente criado com sucesso!"
        };
      }

      if (response.status == 409) {
        return {
          statusCode: 409,
          message: "Customer already exists"
        };
      }

    } catch (err) {
      console.error("Erro ao criar cliente:", err);
  
      if (err.name === "UsernameExistsException") {
        return { statusCode: 400, body: JSON.stringify({ error: "Customer already exists" }) };
      }
  
      return { statusCode: response.status, body: JSON.stringify({ error: response.message }) };
    }
  };

exports.handler = handler;