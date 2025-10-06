# TC3-Lambda

## Descrição do Projeto

Este repositório contém funções AWS Lambda desenvolvidas para o desafio técnico TC3. O objetivo do projeto é fornecer uma arquitetura serverless para operações relacionadas a clientes, utilizando funções Lambda escritas em Node.js.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
lambdas/
	create-customer/
		index.js
		package.json
	get-customer/
		index.js
		package.json
```

Cada subpasta dentro de `lambdas/` representa uma função Lambda independente, com seu próprio código-fonte e dependências.

## Lambdas Disponíveis

### 1. create-customer

- **Descrição:** Responsável por criar um novo cliente no sistema.
- **Localização:** `lambdas/create-customer/`
- **Arquivo principal:** `index.js`
- **Como funciona:** Recebe dados do cliente via evento, processa e armazena as informações conforme a lógica implementada.
- **Dependências:** Listadas no `package.json` da pasta.

### 2. get-customer

- **Descrição:** Responsável por buscar informações de um cliente existente e gerar um token de autenticação via Cognito.
- **Localização:** `lambdas/get-customer/`
- **Arquivo principal:** `index.js`
- **Como funciona:** Recebe o CPF do cliente via parâmetro de rota (`event.pathParameters.cpf`), valida o formato, e tenta autenticar o usuário no Cognito usando um usuário e senha padrão. Se o usuário existir e as credenciais estiverem corretas, retorna os tokens de autenticação.
- **Dependências:** Listadas no `package.json` da pasta.
- **Tipo de retorno:**
	- Sempre retorna um objeto no formato `{ statusCode, headers, body }`.
	- O campo `body` é uma string JSON.
	- Exemplos de resposta:
		- **Sucesso:**
			```json
			{
				"statusCode": 200,
				"headers": { "Content-Type": "application/json" },
				"body": "{\"message\":\"Token gerado com sucesso.\",\"tokens\":{...}}"
			}
			```
		- **CPF inválido:**
			```json
			{
				"statusCode": 400,
				"body": "{\"message\":\"Formato de CPF inválido.\"}"
			}
			```
		- **Usuário não encontrado:**
			```json
			{
				"statusCode": 404,
				"body": "{\"message\":\"Usuário não encontrado ou credenciais inválidas.\"}"
			}
			```
		- **Usuário não confirmado:**
			```json
			{
				"statusCode": 403,
				"body": "{\"message\":\"Usuário não confirmado.\"}"
			}
			```
		- **Erro interno:**
			```json
			{
				"statusCode": 500,
				"body": "{\"message\":\"Erro ao buscar usuário.\",\"error\":\"<detalhe do erro>\"}"
			}
			```
## Deploy

O deploy das funções é realizado automaticamente por meio de uma pipeline CI/CD configurada no arquivo `.github/workflows/deploy.yml`.

### Como funciona o deploy

O workflow de deploy é executado automaticamente quando há um push ou pull request para a branch `main`, ou manualmente via GitHub Actions. Ele possui dois fluxos principais:

- **Build and Upload:**
	- Instala as dependências do projeto.
	- Empacota cada Lambda em um arquivo `.zip` individual, incluindo suas dependências.
	- Faz upload dos arquivos `.zip` para um bucket S3 (`lambda-code-tc3-g38`).

- **Update Lambdas:**
	- Atualiza o código das funções Lambda na AWS utilizando os arquivos `.zip` enviados para o S3.
	- Executa o comando `aws lambda update-function-code` para cada função, publicando a nova versão automaticamente.

Esse processo garante que toda alteração feita no código das Lambdas seja automaticamente empacotada, enviada e publicada na AWS, facilitando o versionamento e a atualização contínua das funções.

> **Observação:** As credenciais AWS utilizadas no pipeline são fornecidas via GitHub Secrets, garantindo segurança no processo de deploy.

## Requisitos

- Node.js >= 14.x
- AWS CLI configurado (para deploy manual)
