import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
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

      const response = await this.client.send(command);

      if (!response.Users || response.Users.length === 0) {
        console.log("Usuário não encontrado. Criando...");
        const newUser = await this.createUser(cpf);
        return { cpf: newUser.Username || "" };
      }

      const user: UserType = response.Users[0];
      return { cpf: user.Username || "" };
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      throw err;
    }
  }

  async createUser(cpf: string): Promise<UserType> {
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
      return response.User as UserType;
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      throw err;
    }
  }
}
