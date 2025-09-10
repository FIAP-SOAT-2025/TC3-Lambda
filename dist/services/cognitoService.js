"use strict";
const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

class CognitoService {
  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || "us-east-2",
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || "";
  }

  async findUserByCpf(cpf) {
    console.log("Iniciando busca de usuário:", cpf);
  
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Filter: `username = "${cpf}"`,
      });
  
      const response = await this.client.send(command);
  
      if (!response.Users || response.Users.length === 0) {
        console.log("Usuário não encontrado. Criando...");
        const newUser = await this.createUser(cpf);
        return { cpf: newUser.Username };
      }
  
      const user = response.Users[0];
      return { cpf: user.Username || "" };
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      throw err;
    }
  }
  
  async createUser(cpf) {
    console.log("Criando usuário na base de dados...");
  
    try {
      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: cpf,
        TemporaryPassword: "Senha123!",
        MessageAction: "SUPPRESS",
      });
  
      const response = await this.client.send(command);
  
      console.log("Usuário criado com sucesso!");
      return response.User;
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      throw err;
    }
  }
  
}

module.exports = { CognitoService };
