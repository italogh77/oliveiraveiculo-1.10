# Admin: fotos e catálogo de veículos

## Como abrir

1. Extraia o ZIP em uma pasta nova.
2. Abra o terminal nessa pasta e execute `npm install`.
3. Execute `npm run dev` e abra o endereço mostrado no terminal.
4. Entre no painel administrativo com a conta que você já utiliza.

Para gerar a versão de produção: `npm run build`. A pasta `dist` contém o site compilado e deve ser servida por uma hospedagem/servidor HTTP.

## Ajustar as fotos

1. Abra o cadastro de um veículo e adicione fotos por upload ou link, como antes.
2. Clique em **Ajustar** sobre uma foto.
3. Use **Zoom**, **Posição vertical (altura)** e **Posição horizontal**.
4. Escolha **Preencher o quadro** ou **Mostrar foto inteira**.
5. Confira a prévia em **Computador** e **Celular**.
6. Clique em **Aplicar enquadramento** e depois em **Salvar alterações**.

- O ajuste é de enquadramento na tela; não altera nem baixa o arquivo original.
- O zoom vai de 100% a 300%. Se a imagem ocupar exatamente o quadro, aumente o zoom para perceber a mudança de posição.
- **Restaurar** volta aos valores iniciais; **Cancelar ajuste** descarta a edição em andamento.
- Os ajustes são individuais e acompanham a foto ao reordenar, trocar a capa ou excluir outra foto.
- Vitrine, página de detalhes, modal e miniaturas usam os ajustes salvos.
- Imagens antigas continuam funcionando com enquadramento padrão.

## Buscar marca, modelo e versão

1. No início do formulário, escolha a **Marca do catálogo**.
2. Escolha **Ano-modelo / combustível** entre 2000 e o ano atual.
3. Digite o nome do modelo ou versão, por exemplo **Corolla XEi** ou **Fit EX**.
4. Selecione a descrição em **Modelo e versão disponíveis nesse ano**.
5. Clique em **Usar no cadastro**.
6. Confira ano de fabricação, câmbio, combustível, categoria, preço e demais informações antes de salvar.

A busca preenche marca, descrição completa do modelo/versão e ano-modelo. Modelo e versão ficam juntos, conforme a descrição da fonte, evitando separar incorretamente nomes compostos. Os demais dados do anúncio continuam sob seu controle.

A fonte é a API FIPE da Parallelum: https://fipe.api.br/docs/api/fipe . As marcas e versões são consultadas ao abrir as listas, sem manter uma lista estática incompleta no código. A cobertura depende da base e não representa garantia de todas as versões já comercializadas no Brasil. Anos-modelo futuros e a categoria especial “zero km” não entram no recorte de 2000 ao ano atual; modelos recentes aparecem quando cadastrados no ano correspondente pela fonte.

A consulta exige internet e tem limites do provedor. Há cache de 24 horas para reduzir chamadas. Em caso de falha ou de versão ausente, os campos **Marca**, **Modelo e versão** e **Ano Modelo** podem ser preenchidos manualmente. Não é necessário configurar uma chave para as consultas públicas utilizadas.

## Dados e compatibilidade

- O array `fotos` continua contendo URLs, como antes.
- O novo array `fotosAjustes` guarda `{ zoom, x, y, fit }` na mesma ordem das fotos.
- `catalogoFipe` guarda os identificadores selecionados para referência; editar manualmente marca, modelo ou ano-modelo remove essa associação.
- O fluxo existente de gravação do Firebase foi mantido. O projeto original possui modo local de contingência: quando ativado, os dados ficam apenas no navegador e não são publicados para visitantes.
- Esta atualização não foi publicada automaticamente.

## Verificações feitas

- Compilação de produção com `npm run build`.
- Análise com `npm run lint` (sem erros; avisos já presentes no projeto).
- Consultas reais de marcas, anos e modelos à API, incluindo cabeçalhos CORS.
- Testes dos componentes em DOM simulado: aplicação do catálogo; edição de zoom/posição; reordenação; dados enviados ao salvar; reabertura após serialização; restaurar/cancelar; exclusão; renderização da capa pública.
- Testes de valores padrão, recorte de anos e erro de limite de consultas.

Limites da validação: o navegador gráfico ficou indisponível no ambiente. Não houve login, upload ou escrita no seu Firebase real. A interface visual e a gravação com sua conta devem ser conferidas ao abrir o projeto.
