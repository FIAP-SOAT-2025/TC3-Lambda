"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const cognitoService_1 = require("./services/cognitoService");
const jwtService_1 = require("./services/jwtService");
const cognito = new cognitoService_1.CognitoService();
const jwt = new jwtService_1.JwtService(secrets.JWT_SECRET || "dev-secret");
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
        const customer = await cognito.findUserByCpf(cpf);
        if (!customer) {
            return { statusCode: 404, body: JSON.stringify({ error: "Usuário não encontrado" }) };
        }
        const token = jwt.sign({ cpf: customer.cpf });
        return {
            statusCode: 200,
            body: JSON.stringify({ token }),
        };
    }
    catch (err) {
        console.error("Handler error:", err);
        return { statusCode: 500, body: JSON.stringify({ error: "Erro interno" }) };
    }
};
exports.handler = handler;
