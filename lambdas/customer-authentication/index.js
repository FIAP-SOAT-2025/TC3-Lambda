"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;

console.log("---------- Before cognito service import");
const cognitoService = require("./services/cognitoService");

console.log("---------- After cognito service import", cognitoService);
const cognito = new cognitoService.CognitoService();
console.log("---------- After cognito import", cognito);

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
      return { statusCode: 400, body: JSON.stringify({ error: "CPF is required" }) };
    }
    const cpf = cpfRaw.toString().replace(/\D/g, "");
    if (cpf.length !== 11) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid CPF" }) };
    }

    console.log(`---------- Params Received: cpf=${cpf}, name=${body?.name}, email=${body?.email}`);

    const cognitoCustomer = await cognito.findCustomerByCpf(cpf);
    if (cognitoCustomer) {
      return customerAlreadyExists(cpf);
    }

    const response = await createCustomerInEKS(cpf, body);
    if (response.status === 201) {
      await createCognitoCustomer(cpf);
      const token = jwt.sign({ cpf });
      return responseStatusCreated(token);
    }

    return {
      statusCode: response.status || 500,
      body: JSON.stringify({ error: response.message || "Error creating customer" })
    };

  } catch (err) {
    console.error("Error creating customer:", err);
    if (err.name === "UsernameExistsException") {
      return { statusCode: 400, body: JSON.stringify({ error: "Customer already exists" }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Internal error" }) };
  }
};

async function createCustomerInEKS(cpf, body) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cpf,
      name: body.name,
      email: body.email,
    }),
  });

  if (response.status === 409) {
    return {
      statusCode: 409,
      message: "Customer already exists"
    };
  }
  console.log("---------- EKS customer CREATED:", response);
  return response;
}

function customerAlreadyExists(cpf) {
  const token = jwt.sign({ cpf });
  return responseStatusCreated(token);
}

async function createCognitoCustomer(cpf) {
  const customer = await cognito.createCustomer(cpf);
  if (!customer) {
    return {
      statusCode: 500,
      message: "Error creating customer in Cognito"
    };
  }
  console.log("---------- Cognito customer CREATED:", customer);
  return customer;
}

function responseStatusCreated(token) {
  return {
    statusCode: 201,
    body: JSON.stringify({ token }),
    message: "Customer created successfully!"
  };
}

exports.handler = handler;