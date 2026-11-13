# Templates de e-mail do Mimo Digital

Esta pasta reúne os HTMLs usados como ponto de partida para mensagens no Brevo. Os arquivos são independentes do site: usam tabelas de apresentação, estilos inline e uma pequena media query para telas estreitas. Não carregam o CSS nem o JavaScript da homepage.

## Arquivos

- `boas-vindas.html` — apresentação do Mimo Digital, categorias, serviços personalizados e seção institucional da Vira Mato.
- `boas-vindas.txt` — versão equivalente em texto simples do e-mail de boas-vindas.
- `lancamento-produto.html` — modelo com campos visíveis de exemplo para nome, descrição, conteúdo e preço de um produto real.
- `newsletter.html` — modelo com blocos de exemplo para novidades, dicas e destaques editoriais.

Os textos entre colchetes e os rótulos “EXEMPLO” são lembretes editoriais, não variáveis do Brevo. Revise-os e substitua-os antes de enviar. Não use um modelo com campos de exemplo ainda visíveis.

## Identidade e imagens

As imagens usadas são assets originais já presentes no repositório e hospedados em URLs HTTPS públicas. Seus arquivos fonte permanecem nas pastas existentes; não copie nem renomeie os originais para esta pasta.

| Uso | Arquivo original | URL pública usada |
| --- | --- | --- |
| Logo do Mimo Digital | `assets/img/logo/logo1.webp` | `https://mimo-shop.pages.dev/assets/img/logo/logo1.webp` |
| Estrela decorativa | `assets/img/elementos/star.webp` | `https://mimo-shop.pages.dev/assets/img/elementos/star.webp` |
| Flor decorativa | `assets/img/ilustracoes/Adesivo de flor.webp` | `https://mimo-shop.pages.dev/assets/img/ilustracoes/Adesivo%20de%20flor.webp` |
| Lótus decorativa | `assets/img/ilustracoes/Adesivo de lótus.webp` | `https://mimo-shop.pages.dev/assets/img/ilustracoes/Adesivo%20de%20l%C3%B3tus.webp` |
| Logo branca Vira Mato | `assets/img/vira mato/logo-branco.png` | `https://mimo-shop.pages.dev/assets/img/vira%20mato/logo-branco.png` |

Os links da loja e do catálogo vêm da referência fornecida e da estrutura atual do site: `https://mimo-shop.pages.dev/` e `https://mimo-shop.pages.dev/catalogo.html`. Confirme que o domínio e as páginas continuam publicados antes de cada campanha.

As URLs das imagens listadas acima foram verificadas por HTTPS e responderam publicamente durante a atualização do template. A rota pública de privacidade é `https://mimo-shop.pages.dev/privacidade`; a variante `/privacidade.html` redireciona para ela. Confirme que as URLs continuam disponíveis antes de cada campanha.

## Editar e personalizar

1. Abra o HTML em um editor de texto e mantenha `charset="utf-8"`.
2. Atualize o assunto sugerido no comentário do `<head>` e o preheader oculto no início do `<body>`; configure o assunto real no Brevo, pois o `<title>` não define o assunto da mensagem.
3. No lançamento e na newsletter, substitua todos os campos entre colchetes por conteúdo e dados confirmados. No lançamento, troque o link do catálogo pelo link público do produto somente quando ele estiver publicado.
4. Use imagens somente com URL HTTPS acessível sem login. Prefira os assets oficiais publicados do site. Não cole imagens locais (`file://`) nem inclua arquivos como anexos ao HTML.
5. Preserve as tabelas, os estilos inline e as larguras flexíveis. A media query é um aprimoramento mobile; a leitura básica também deve funcionar sem ela.
6. Não adicione dados de clientes, chaves, tokens de API ou credenciais aos arquivos.

## Testar

Antes de enviar:

1. Abra cada HTML em um navegador e confira larguras desktop (600 px) e mobile (390 px), especialmente colunas, botões, texto e imagens. Para boas-vindas, consulte também `boas-vindas.txt` como alternativa em texto simples.
2. Na conta Brevo, cole o HTML em uma mensagem de teste e use a pré-visualização desktop/mobile.
3. Envie testes para caixas de Gmail e Outlook e, se disponível, confira um cliente Apple Mail/iOS. Compare também com imagens bloqueadas: os links e textos precisam continuar compreensíveis.
4. Confirme todas as imagens HTTPS, links de destino, assunto, preheader, remetente e conteúdo de exemplo substituído.
5. Clique no link de descadastro no teste da própria plataforma para confirmar que ele foi convertido pela Brevo.

## Copiar para o Brevo

Para criar um modelo reutilizável, acesse **Marketing → Templates → Email**, crie um template HTML e cole o conteúdo integral do arquivo escolhido no editor HTML. Para uma campanha, crie a mensagem em **Marketing → Campaigns → Email** e use o editor HTML. Revise a prévia e o envio de teste antes de agendar ou enviar.

O HTML não configura o remetente, a lista, a automação, a página de descadastro, o domínio de envio ou o consentimento. Esses itens precisam ser definidos e conferidos na conta Brevo.

## Configuração pendente na conta Brevo

Os dados abaixo não estão configurados por estes arquivos e não foram inventados:

- **Remetente:** confirmar o nome de exibição, o endereço `From` verificado e o `Reply-to`. O site publica `mimodigital.studio@gmail.com` como contato, mas isso não confirma que a conta Brevo o tem verificado como remetente.
- **Identificação postal/legal:** preencher no Brevo o endereço postal exigido para o remetente e confirmar a entidade/nome legal que deve aparecer. Os templates mostram `[CONFIGURAR NO BREVO ANTES DO ENVIO]` nesse lugar de propósito; substitua pelo dado aprovado antes de enviar.
- **Descadastro:** os três modelos usam `{{ unsubscribe }}` no link “Cancelar inscrição”. A documentação oficial da Brevo indica esse placeholder para links de descadastro em HTML. Escolha a página padrão ou uma página personalizada na plataforma e confira o link convertido em uma mensagem de teste: [Inserir um link de cancelamento de inscrição](https://help.brevo.com/hc/pt/articles/209553645-Insira-um-link-de-cancelamento-de-inscri%C3%A7%C3%A3o-personalizado-em-seus-e-mails).
- **Autenticação de envio:** revisar a autenticação do domínio de envio (SPF, DKIM e DMARC) na conta antes de campanhas.
- **Preferências e lista:** confirmar a lista correta, consentimento registrado, regras de opt-in/duplo opt-in e a página de preferências/descadastro configurada.

### Automação de boas-vindas

Na Brevo, crie uma automação de boas-vindas acionada quando um contato elegível for adicionado à lista de inscritos. Insira uma ação de envio de e-mail, selecione o template `boas-vindas.html`, revise as condições de entrada e só então ative a automação. Confirme que contatos sem consentimento não entram na lista de marketing. A Brevo informa que a automação pré-configurada de boas-vindas usa a entrada do contato em uma lista: [Welcome message — Send welcome emails](https://help.brevo.com/hc/en-us/articles/15476926804370-Welcome-message-Send-welcome-emails-to-onboard-new-contacts).

### Lançamentos e newsletters

Use `lancamento-produto.html` e `newsletter.html` em campanhas planejadas para a lista apropriada. Antes de cada envio, confirme que a lista tem consentimento para aquele tipo de comunicação, substitua os exemplos, confira os links e mantenha o descadastro visível.

## Pendências conhecidas

- Confirmar na conta Brevo o remetente verificado, o endereço postal/legal, a página de descadastro e a lista que acionará a automação.
- Substituir os campos editoriais de exemplo nos modelos de lançamento e newsletter antes de cada uso.
- Confirmar na prévia do Brevo e em caixas de teste que a logo branca da Vira Mato permanece legível no bloco escuro e que todas as imagens públicas são carregadas.
