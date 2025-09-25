"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
class CognitoService {
    client;
    userPoolId;
    constructor() {
        this.client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: secrets.AWS_REGION || "us-east-2",
        });
        this.userPoolId = secrets.COGNITO_USER_POOL_ID || "";
    }
    async createUser(cpf) {
        console.log("Criando usuário na base de dados...");
        try {
            const command = new client_cognito_identity_provider_1.AdminCreateUserCommand({
                UserPoolId: this.userPoolId,
                Username: cpf,
                TemporaryPassword: "Senha123!",
                MessageAction: "SUPPRESS",
            });
            const response = await this.client.send(command);
            console.log("Usuário criado com sucesso!");
            return response.User;
        }
        catch (err) {
            console.error("Erro ao criar usuário:", err);
            throw err;
        }
    }
}
exports.CognitoService = CognitoService;
