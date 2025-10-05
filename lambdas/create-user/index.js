"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const cognitoService = require("./services/cognitoService");
const cognito = new cognitoService.CognitoService();
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

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cpf,
            name: body.name,
            email: body.email,
          }),
        });

        if (response.status == 201) {
          const customer = await cognito.createUser(cpf);
          const token = jwt.sign({ cpf: customer.cpf });
          return {
            statusCode: 201,
            body: JSON.stringify({ token }),
            message: "Usuário criado com sucesso!"
          };
      }  else {
        return { statusCode: response.status, body: JSON.stringify({ error: response.message }) };
      }

      } catch (err) {
        console.error("Erro ao criar usuário:", err);
    
        if (err.name === "UsernameExistsException") {
          return { statusCode: 400, body: JSON.stringify({ error: "User account already exists" }) };
        }
    
        return { statusCode: 500, body: err };
      }
    };

exports.handler = handler;
