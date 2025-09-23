import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  UserType
} from "@aws-sdk/client-cognito-identity-provider";

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || "us-east-2",
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || "";
  }

  async createUser(cpf: string): Promise<any> {
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
      return response.User!;
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      return err;
    }
  }
}
