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
    console.log("Iniciando busca de usuário por CPF:", cpf);
    console.log("Filtro Cognito:", `custom:cpf = "${cpf}"`);

    const command = new ListUsersCommand({
      UserPoolId: this.userPoolId,
    });

    const response = await this.client.send(command);

    if (!response.Users || response.Users.length === 0) return null;

    const user: UserType | undefined = response.Users.find(
      (u: UserType) =>
        u.Attributes?.some(
          (attr: AttributeType) => attr.Name === "custom:cpf" && attr.Value === cpf
        )
    );

    if (!user) return null;

    const attributes: Record<string, string> = {};
    user.Attributes?.forEach((attr: AttributeType) => {
      if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
    });

    return { cpf: attributes["custom:cpf"] || "" };
  }
}
