# QA Manager BrowserStack

Aplicação Next.js para gerenciar o ciclo de uso de contas BrowserStack com autenticação Firebase, reservas e histórico de utilização.

## Requisitos

- Node.js 18+
- Conta Firebase com Authentication (Email/Senha) e Firestore
- Credenciais BrowserStack (username e access key)

## Configuração

1. Crie um arquivo `.env.local` baseado em `.env.local.example` com as credenciais do Firebase e da BrowserStack.
2. Configure o serviço de Authentication no Firebase para permitir apenas login por Email/Senha e exigir verificação de e-mail.
3. Certifique-se de que a coleção `browserstackAccounts` já possui os documentos importados da planilha (`id`, `username`, `email`, `status`, `owner`, `lastUsedAt`).
4. Opcional: configure regras do Firestore para permitir leitura conforme o modelo de segurança desejado e defina os papéis (`user` ou `admin`) na coleção `userRoles`.

## Conta administrativa padrão

- Na primeira renderização do aplicativo o Firebase Admin garante a existência de uma conta administrativa padrão.
- As credenciais iniciais são `admin@qualitydigital.global` com senha `QaManager!2024` (personalize-as pelas variáveis `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` e `DEFAULT_ADMIN_DISPLAY_NAME`).
- A conta tem o papel `admin` registrado na coleção `userRoles` do Firestore automaticamente.


## Scripts

```bash
npm install
npm run dev
npm run build
npm start
```

## Estrutura

- `/` – Tela de login com e-mail corporativo e senha.
- `/dashboard` – Painel autenticado com filtros, histórico, ações de reservar/liberar e visão administrativa (para administradores).
- `/api/check` – Rota de API que sincroniza o status das contas consultando a BrowserStack.

## Verificação Automática

Agende uma chamada periódica para `GET /api/check` (cron job ou serviço como Vercel Cron) para manter os status atualizados com a BrowserStack.

## Histórico

Toda ação de reserva/liberação gera registro na coleção `accountLogs` e na subcoleção `history` de cada conta. A visualização do histórico dentro do painel é restrita a usuários com papel `admin`.
