"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
class CognitoService {
    client;
    userPoolId;
    constructor() {
        this.client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: process.env.AWS_REGION || "us-east-1",
        });
        this.userPoolId = process.env.COGNITO_USER_POOL_ID || "";
    }
    async findByCpf(cpf) {
        const command = new client_cognito_identity_provider_1.ListUsersCommand({
            UserPoolId: this.userPoolId,
            Filter: `custom:cpf = "${cpf}"`,
        });
        const response = await this.client.send(command);
        if (!response.Users || response.Users.length === 0)
            return null;
        const user = response.Users[0];
        const attributes = {};
        user.Attributes?.forEach((attr) => {
            if (attr.Name && attr.Value)
                attributes[attr.Name] = attr.Value;
        });
        return {
            cpf: attributes["custom:cpf"] || "",
        };
    }
}
exports.CognitoService = CognitoService;
