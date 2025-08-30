import { CognitoIdentityProviderClient, ListUsersCommand, UserType } from "@aws-sdk/client-cognito-identity-provider";

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || "";
  }

  async findByCpf(cpf: string): Promise<{ cpf: string } | null> {
    const command = new ListUsersCommand({
      UserPoolId: this.userPoolId,
      Filter: `custom:cpf = "${cpf}"`,
    });

    const response = await this.client.send(command);

    if (!response.Users || response.Users.length === 0) return null;

    const user: UserType = response.Users[0];
    const attributes: Record<string, string> = {};

    user.Attributes?.forEach((attr) => {
      if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
    });

    return {
      cpf: attributes["custom:cpf"] || "",
    };
  }
}
