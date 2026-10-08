---
name: oliveira-sales-site
description: Aprimorar o site da Oliveira Veiculos para conversao e vendas, preservando identidade visual, conteudo confiavel e funcionalidades existentes. Use em ajustes de layout, UX, responsividade, desempenho, copy comercial, estoque, CTAs e jornadas de contato no site React/Vite deste projeto.
---

# Oliveira Sales Site

Melhore a capacidade do site de gerar contatos e oportunidades de venda sem descaracterizar a Oliveira Veiculos nem quebrar fluxos existentes.

## Resultado esperado

Entregue uma experiencia premium, clara e rapida em celular e computador. Cada alteracao deve aproximar o visitante de uma acao util — explorar o estoque, abrir um veiculo, simular financiamento, encontrar a loja ou iniciar uma conversa — sem transformar toda secao em propaganda.

## Antes de editar

1. Confirme qual pasta e versao sao executadas. Este repositorio pode conter uma copia aninhada do projeto; nao presuma que ela e a fonte ativa.
2. Inspecione `git status` e preserve alteracoes existentes do usuario.
3. Leia os componentes, estilos e dados diretamente relacionados ao pedido. Nao redesenhe areas fora do escopo.
4. Se houver mudanca de texto comercial, leia `.agents/rules/prohibited-terms-copywriting.md` e trate essas restricoes como obrigatorias.
5. Identifique o comportamento atual em celular e computador antes de decidir a solucao. Quando a mudanca for visual, capture ou observe o estado anterior nas larguras relevantes.

## Invariantes do produto

- Preserve logo, paleta preta/grafite/dourada, linguagem premium e reconhecimento visual da marca, salvo pedido explicito em contrario.
- Preserve rotas por hash, filtros do estoque, detalhes de veiculos, compartilhamento, temas claro/escuro, contatos, WhatsApp, painel administrativo, Firebase e demais fluxos existentes.
- Use somente telefones, horarios, endereco, links, numeros e promessas presentes nas fontes confiaveis do projeto. Nao invente prova social, urgencia, desconto, disponibilidade ou condicao financeira.
- Nao esconda informacao essencial para forcar cliques. Conversao deve vir de clareza, confianca e baixa friccao.
- Evite novas dependencias quando HTML, CSS e os componentes existentes resolverem o problema com qualidade.

## Criterios de conversao

Priorize, conforme a pagina e o pedido:

- proposta de valor compreensivel nos primeiros segundos;
- estoque e veiculos acessiveis com poucos passos;
- hierarquia clara entre acao principal e secundaria;
- CTA com verbo e destino explicitos, especialmente para estoque e WhatsApp;
- sinais de confianca proximos das decisoes, sem exagero ou repeticao;
- contato contextual: a mensagem deve indicar o veiculo ou assunto quando essa informacao estiver disponivel;
- formularios e filtros curtos, legiveis e faceis de corrigir;
- continuidade entre card, detalhe do veiculo e conversa com o vendedor.

Nao aumente a quantidade de CTAs por padrao. Remova competicao visual e destaque a acao mais relevante de cada bloco.

## Qualidade visual e responsiva

- Trabalhe mobile-first e valide pelo menos 360 px, 390 px, 768 px e 1440 px quando o ambiente permitir.
- Evite rolagem horizontal, texto cortado, sobreposicoes, saltos de layout e elementos importantes fora da area visivel.
- Mantenha alvos de toque confortaveis, espacamento consistente e leitura clara sem depender de hover.
- Preserve a imagem principal e o veiculo em enquadramentos relevantes. Use `object-position` responsivo quando um unico corte nao funcionar.
- Reaproveite tokens, classes, componentes, icones e ritmos existentes. Evite estilos isolados que parecam pertencer a outro site.
- Use animacao para orientar e dar continuidade, nao para atrasar. Prefira transicoes curtas, propriedades baratas (`transform` e `opacity`) e suporte a `prefers-reduced-motion`.
- Garanta contraste, foco visivel, ordem de teclado, rotulos acessiveis e semantica adequada.
- Confira temas claro e escuro em qualquer componente que suporte ambos.

## Fluidez e desempenho

- Evite trabalho desnecessario no primeiro carregamento e durante scroll, resize e digitacao.
- Nao adicione listeners, timers ou animacoes continuas sem limpeza e justificativa.
- Reserve dimensoes de imagens e midia para reduzir mudancas de layout.
- Comprima e dimensione imagens para o uso real; preserve nitidez de logos e fotos de veiculos.
- Mantenha carregamento tardio para conteudo abaixo da dobra quando isso nao prejudicar a primeira impressao.
- Nao sacrifique resposta imediata do clique por overlays ou transicoes longas.

## Forma de implementar

1. Defina a principal friccao de venda ou de uso que o ajuste resolve.
2. Faca a menor mudanca coerente capaz de resolver essa friccao e manter a identidade.
3. Reutilize a arquitetura atual antes de criar novas abstracoes.
4. Trate estados vazio, carregando, erro, sem resultados e conteudo longo quando forem afetados.
5. Revise os textos como parte da interface: curtos, especificos, naturais em portugues do Brasil e coerentes com o destino da acao.

## Validacao obrigatoria

Execute os checks disponiveis e proporcionais ao ajuste:

- lint dos arquivos afetados ou `npm run lint`;
- testes existentes relacionados;
- `npm run build` para mudancas de codigo ou configuracao;
- verificacao visual das paginas alteradas em celular e computador;
- teste real dos cliques, hashes, filtros, modais, tema e links de contato tocados pela mudanca;
- verificacao de erros no console e de overflow horizontal.

Nao declare que a interface foi validada visualmente se ela nao foi realmente renderizada e inspecionada. Se algum check nao puder ser executado, informe isso claramente.

## Entrega

Ao concluir, explique de forma breve:

- qual friccao foi reduzida e como isso favorece vendas;
- o que mudou visual e funcionalmente;
- quais arquivos foram alterados;
- quais larguras, temas, fluxos e comandos foram verificados;
- qualquer risco ou decisao que ainda dependa do proprietario.
