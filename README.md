# TGL API

## Como rodar essa API?

```
npm i
```

```
npm run build
```

```
touch .env

Nesse arquivo .env insira os dados do banco de dados e do serviço de email
```

```
docker-compose up
```

## Diagrama lógico do banco de dados

![](readme-images/diagram.png)

## Sobre o projeto

- A API possui dois tipos de usuários, os usuários comuns e os administradores.

- Tanto os administradores, quanto os usuários devem estar autenticados para realizarem suas devidas funções.

- A função dos ADMS são de verificar todos os usuários, promover, despromover novos administradores e criar e gerenciar os jogos da loteria

- Os usuários podem criar e administrar suas apostas, alterar seus dados e deletar a conta

- As rotas para visualizar os jogos, criar novos usuários e de "esqueci minha senha" não necessitam de autenticação

- Foi criado um scheduler onde a cada 9:00 de cada dia será enviado um email convidando usuários que não apostaram nos últimos sete dias a apostarem

## Templates de email

- Quando o usuário é criado, é enviado um email de boas vindas:

  ![](readme-images/mails/welcome.png)

- Quando um usuário realiza uma nova aposta, é enviado um email mostando que ele realizou uma aposta e o valor total das apostas

  ![](readme-images/mails/newbet.png)

- Quando um usuário não apostou nos últimos sete dias, todas as 9:00 AM será enviado um email convidando para apostar.

  ![](readme-images/mails/placeABet.png)

## Informações adicionais

- API desenvolvida no LabLuby da LubySofware!
