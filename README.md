# Teste prático - Backend - shopper.com.br

## Desrição do projeto

Este projeto foi desenvolvido segundo as especificações descritas no documento enviado pela empresa.
Implementa uma api para envio de fotos dos registros de água e gás para uma operadora. O objetivo é utilizar o gemini do google para fazer a leitura do registro a ser faturado no mês.
Possui 3 endpoints:

- /:client_id/list: Lista todas as leituras feitas para o cliente especificado, podendo filtrar pelo tipo de registro: água ou gás.
- /upload: Faz o envio da imagem codificada em base64, salva e conecta-se ao gemini para efetuar a leitura do registro.
- /confirm: Enviar a confirmação do valor lido ou correção.

## Executando o projeto

O projeto está funcionando através do docker. Para executá-lo é necessário manter as configurações de teste presentes no arquivo `.env.example` ou substituí-las.

**.env.example**

```bash
# API key para utilizar o gemini
GEMINI_API_KEY=
# Dados para acesso ao postgresql. usuário, senha e nome do banco podem ser alterados
DATABASE_URL=postgresql://root:shopperpassword@postgres:5432/shopper?schema=public
# UUID criado para testar a api, já que não foi criada uma rota de criação de cliente.
TEST_CLIENT_ID=f9264c5b-a20d-479f-9b53-533f3245e722
```

Ao executar o docker compose, serão criados 2 containers, um postgres padrão e um com base no arquivo `Dockerfile` para executar o backend. Após a criação dos containers, executa comandos para fazer as migrações de criação das tabelas e inserção do cliente teste.

```bash
docker-compose up --build -d
```

## Tecnologias utilizadas

O banco de dados utilizado foi o `PostgreSQL`.

A IA utilizada para fazer a leitura das images foi o `Gemini` do google.

O backend foi criado utilizando o framework `NestJS` rodando o servidor `Express` por padrão. Acesso ao banco de dados foi feito com o `prisma ORM` e o código foi escrito com `Typescript`.
