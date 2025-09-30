# QA Manager BrowserStack

Aplicação Next.js para gerenciar o ciclo de uso de contas BrowserStack com autenticação Firebase, reservas, histórico e convites temporários.

## Requisitos

- Node.js 18+
- Conta Firebase com Authentication (Google + Email/Senha) e Firestore
- Credenciais BrowserStack (username e access key)

## Configuração

1. Crie um arquivo `.env.local` baseado em `.env.local.example` com as credenciais do Firebase e da BrowserStack.
2. Configure o serviço de Authentication no Firebase para permitir Google Sign-In e Email/Senha.
3. Certifique-se de que a coleção `browserstackAccounts` já possui os documentos importados da planilha (`id`, `username`, `email`, `status`, `owner`, `lastUsedAt`).
4. Opcional: configure regras do Firestore para permitir leitura conforme o modelo de segurança desejado.

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
```

## Estrutura

- `/` – Tela de login com Google ou email/senha.
- `/dashboard` – Painel autenticado com filtros, histórico, ações de reservar/liberar e geração de links de convite.
- `/invite/[token]` – Página simplificada para convidados reservarem contas livres.
- `/api/check` – Rota de API que sincroniza o status das contas consultando a BrowserStack.
- `/api/invites` – Rota autenticada para gerar convites.

## Verificação Automática

Agende uma chamada periódica para `GET /api/check` (cron job ou serviço como Vercel Cron) para manter os status atualizados com a BrowserStack.

## Histórico

Toda ação de reserva/liberação gera registro na coleção `accountLogs` e na subcoleção `history` de cada conta.
