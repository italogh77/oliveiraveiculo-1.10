# Oliveira Veículos — versão 1.8

Atualização da versão 1.7 com a foto enviada pelo cliente na abertura do site. Abaixo consta o histórico das mudanças anteriores.

- Página inicial com a foto da loja Oliveira Veículos em Maricá, tipografia editorial e destaques do estoque.
- Navegação com Início, Comprar carros, Financiamento, Sobre nós e Contato.
- Estoque com filtros laterais em telas grandes, incluindo câmbio e combustível; filtros já existentes de marca, ano, preço, quilometragem, busca e paginação foram mantidos.
- Simulação ilustrativa de parcelas com taxa editável e encaminhamento para solicitar uma proposta pelo WhatsApp. A simulação não consulta bancos e não é proposta de crédito.
- Página de contato com mensagem encaminhada ao WhatsApp, telefone, localização, horário e Instagram.
- Rodapé e cores ajustados ao estilo de referência. Recursos existentes de veículos, painel administrativo, Firebase e visualização de detalhes preservados.
- Ajuste de compatibilidade da configuração de build para Vite 8.

## Abrir e testar

Na pasta do projeto, execute `npm install` e `npm run dev`. Para gerar os arquivos de produção, execute `npm run build`. A pasta `dist` já acompanha este ZIP.

O arquivo original 1.6 tinha dados inválidos em algumas fotos da pasta `.codex-test`; essa pasta de testes não integra esta versão. As fotos do estoque dependem das URLs e dos dados configurados no projeto.
