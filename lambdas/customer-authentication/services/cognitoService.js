"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
class CognitoService {
    client;
    userPoolId;
    constructor() {
        this.client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: "us-east-1",
        });
        this.userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    }
    async createCustomer(cpf) {
        console.log("Creating customer in the database...");
        try {
            const command = new client_cognito_identity_provider_1.AdminCreateUserCommand({
                UserPoolId: this.userPoolId,
                Username: cpf,
                TemporaryPassword: "Senha123!",
                MessageAction: "SUPPRESS",
            });
            const response = await this.client.send(command);
            console.log("Customer created successfully!");
            return response.User;
        }
        catch (err) {
            console.error("Error creating customer:", err);
            throw err;
        }
    }

    async findCustomerByCpf(cpf) {
        console.log("Starting customer search:", cpf);
        try {
            const command = new client_cognito_identity_provider_1.ListUsersCommand({
                UserPoolId: this.userPoolId,
                Filter: `username = "${cpf}"`,
            });
            const response = await this.client.send(command);
            if (!response.Users || response.Users.length === 0) {
                console.log("Customer not found.");
                return null;
            }
            const user = response.Users[0];
            return { cpf: user.Username || "" };
        }
        catch (err) {
            console.error("Error searching for customer:", err);
            throw err;
        }
    }
}
exports.CognitoService = CognitoService;
