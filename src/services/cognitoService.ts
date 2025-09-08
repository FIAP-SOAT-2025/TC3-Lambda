import { CognitoIdentityProviderClient, ListUsersCommand, UserType, AttributeType } from "@aws-sdk/client-cognito-identity-provider";

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || "us-east-2",
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || "";
  }

   async findByCpf(cpf: string): Promise<{ cpf: string } | null> {
    console.log("Iniciando busca de usuário:", cpf);

    const command = new ListUsersCommand({
      UserPoolId: this.userPoolId,
      Filter: `username = "${cpf}"`,
    });

    const response = await this.client.send(command);

    if (!response.Users || response.Users.length === 0) return null;

    const user: UserType = response.Users[0];

    return { cpf: user.Username || "" };
  }
}
