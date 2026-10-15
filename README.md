# VitrineMix — protótipo inicial

Este projeto é separado do PedeFácil. É um starter visual em Next.js com uma vitrine ilustrativa e um schema inicial para Supabase.

## O que funciona neste protótipo
- Layout responsivo para desktop e celular.
- Identidade visual VitrineMix (roxo, coral e fundos claros).
- Categorias, cards de produtos ilustrativos e CTA de anúncio.
- Estrutura inicial de schema SQL para perfis, produtos, fotos e denúncias.

## O que ainda NÃO está conectado
Os produtos exibidos na home são dados fictícios de demonstração. Login, cadastro real, upload de fotos, WhatsApp, busca funcional, favoritos, moderação e painel administrativo ainda precisam ser implementados e testados antes de publicar para usuários reais.

## Rodar localmente
1. Instale Node.js LTS: https://nodejs.org/
2. Extraia o ZIP e abra a pasta no terminal.
3. Execute `npm install`.
4. Execute `npm run dev`.
5. Abra `http://localhost:3000`.

## Configurar Supabase sem afetar o PedeFácil
1. Crie um projeto Supabase NOVO, com nome `vitrinemix` (não use o projeto do PedeFácil).
2. No Supabase novo, abra SQL Editor e execute `supabase/schema.sql`.
3. Em Project Settings / API, copie Project URL e a chave publicável/anon para um arquivo `.env.local` baseado em `.env.example`.
4. Nunca coloque `service_role` no navegador, no GitHub ou em variáveis `NEXT_PUBLIC_`.
5. O SQL é uma base inicial, não uma configuração pronta para produção. Antes de aceitar usuários reais, revisar as políticas de admin, autenticação, limites de upload, bucket Storage e moderação.

## Publicar na Vercel
1. Crie um repositório GitHub NOVO chamado `vitrinemix` e envie apenas os arquivos desta pasta.
2. Na Vercel, importe esse repositório como um projeto novo chamado `vitrinemix`.
3. Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas Environment Variables da Vercel.
4. Faça deploy. Não conecte nem altere o repositório do PedeFácil.

## Observações de custo
Vercel e Supabase têm planos gratuitos com limites e condições próprias, que podem mudar. Confira os limites atuais antes de abrir ao público. Não há domínio pago nem integração de pagamento neste starter.
