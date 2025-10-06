const { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const DEFAULT_PASSWORD = 'l@nchoNETE12#';

exports.handler = async (event) => {
  try {
    
    const { name, email, cpf } = JSON.parse(event.body);

    if (!name || !email || !cpf) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Nome, email e CPF são obrigatórios." }),
      };
    }

    const createUserParams = {
      UserPoolId: USER_POOL_ID,
      Username: cpf,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "custom:nome", Value: name },
        { Name: "custom:cpf", Value: cpf },
        { Name: "email_verified", Value: "true" }
      ],
      MessageAction: "SUPPRESS",
    };

    await cognitoClient.send(new AdminCreateUserCommand(createUserParams));

    const setPasswordParams = {
      UserPoolId: USER_POOL_ID,
      Username: cpf,
      Password: DEFAULT_PASSWORD,
      Permanent: true,
    };

    await cognitoClient.send(new AdminSetUserPasswordCommand(setPasswordParams));

    const apiResponse = await fetch(`${process.env.API_ENDPOINT}customer`, {
      method: 'POST',
      body: JSON.stringify({ name, email, cpf }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!apiResponse.ok) {
      console.error("Falha ao salvar usuário na API interna");
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Usuário criado com sucesso!"
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro ao criar usuário.", error: error.message }),
    };
  }
};