import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandOutput,
  UserType,
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

  async findUserByCpf(cpf: string): Promise<{ cpf: string } | null> {
    console.log("Iniciando busca de usuário:", cpf);
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Filter: `username = "${cpf}"`,
      });

      const response: ListUsersCommandOutput = await this.client.send(command);

      if (!response.Users || response.Users.length === 0) {
        console.log("Usuário não encontrado.");
        return null;
      }

      const user: UserType = response.Users[0];
      return { cpf: user.Username || "" };
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      throw err;
    }
  }
}
