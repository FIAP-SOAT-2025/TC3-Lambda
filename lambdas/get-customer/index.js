const { 
  CognitoIdentityProviderClient, 
  AdminInitiateAuthCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const DEFAULT_PASSWORD = 'l@nchoNETE12#';

exports.handler = async (event) => {
  try {
    const { cpf } = event.pathParameters;
    
    if (!cpf) {
      return { statusCode: 400, body: JSON.stringify({ message: "CPF é obrigatório." }) };
    }

    const sanitizedCpf = cpf.replace(/\D/g, '');
    if (sanitizedCpf.length !== 11) {
        return { statusCode: 400, body: JSON.stringify({ message: "Formato de CPF inválido." }) };
    }

    const authParams = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      ClientId: CLIENT_ID,
      UserPoolId: USER_POOL_ID,
      AuthParameters: {
        USERNAME: sanitizedCpf,
        PASSWORD: DEFAULT_PASSWORD,
      },
    };

    const authResponse = await cognitoClient.send(new AdminInitiateAuthCommand(authParams));
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Token gerado com sucesso.",
        tokens: authResponse.AuthenticationResult,
      }),
    };
  } catch (error) {
    if (error.name === 'NotAuthorizedException') {
        return { statusCode: 404, body: JSON.stringify({ message: "Usuário não encontrado ou credenciais inválidas."}) };
    }

    if (error.name === 'UserNotConfirmedException') {
        return { statusCode: 403, body: JSON.stringify({ message: "Usuário não confirmado."}) };
    }

    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro ao buscar usuário.", error: error.message }),
    };
  }
};