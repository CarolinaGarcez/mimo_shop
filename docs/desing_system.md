Mimo Digital — Design System V1.0

Produto: Mimo Digital — Arquivos Criativos
Direção: retrô criativo equilibrado

1. Princípios
1. Criativo, não confuso: padrões vibrantes apenas nas bordas, banners e detalhes; preservar áreas de leitura limpas.
2. Afetivo, não infantil: formas suaves, ilustrações expressivas e personalidade editorial.
3. Loja primeiro: preço, descrição, categoria e CTA precisam ser mais claros que a decoração.
4. Marca preservada: usar assets/images/logo.png e assets/images/perfil.png sem redesenhar, distorcer ou recolorir.
5. Consistência: usar os tokens deste documento, sem espalhar cores e medidas arbitrárias pelo código.

2. Paleta / tokens de cor
Token	HEX	Uso
--color-pink	#F50078	CTA principal, links ativos, detalhes
--color-purple	#4B0750	títulos, ícones e texto forte
--color-cream	#FFF1DC	fundo principal
--color-paper	#FFF9F0	cartões e superfícies
--color-gold	#F5A400	estrelas e destaques decorativos
--color-rose	#F9C5D8	fundos de cards e faixas
--color-teal	#237D78	detalhes secundários
--color-orange	#F36A21	acentos retrô
--color-border	#E8C5B5	bordas suaves
--color-text	#301B35	texto de corpo
--color-white	#FFFFFF	texto em botões escuros


Regra: pink e roxo são as cores estruturais. Laranja, verde e dourado são acentos. O creme ocupa a maior parte do fundo.

3. Tipografia
- Títulos editoriais: Fraunces, serif, peso 700–800; alternativa Georgia.
- Interface, corpo e botões: Nunito Sans, sans-serif, pesos 400–800; alternativa Arial.
- Logo: sempre imagem original; nunca tentar reconstruí-la com fontes.
- H1 desktop: clamp(2.5rem, 5vw, 4.75rem); line-height 1.05.
- H2: clamp(1.8rem, 3vw, 2.8rem); line-height 1.15.
- H3: 1.25rem–`1.5rem`.
- Corpo: 1rem, line-height 1.6.
- Pequeno: 0.875rem; evitar texto essencial abaixo de 14px.
- Preferir frases curtas, em português brasileiro.

4. Espaçamento e geometria
- Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96 px.
- Container: min(1200px, calc(100% - 32px)); desktop pode usar 48px de margem.
- Grid de catálogo: 4 colunas desktop, 2 tablet, 1 mobile pequeno.
- Radius: 12px pequeno, 20px cards, 28px banners, 999px botões-pill.
- Sombra: leve, quente e difusa; não usar sombras pretas pesadas.
- Bordas: 1px creme-rosado, com foco visível mais forte.

5. Ícones
Preferir Lucide (SVG, traço uniforme 1.75–2px), ou SVGs locais licenciados. Tamanhos 18–24px em UI, 28–32px em benefícios. Exemplos:
- Navegação: search, menu, x, shopping-bag, arrow-right.
- Benefícios: shield-check, download, heart, file-check.
- Categorias: book-open, mail-heart, calendar-days, gift.
- Personalizados: message-circle, sparkles.
Não exibir carrinho, conta ou login como funcionais na V1, porque o checkout será externo e não haverá autenticação própria. Ícones de estrelas e lótus podem ser decorativos, com aria-hidden="true".

6. Botões
Primário
- Fundo pink; texto branco; peso 800; altura mínima 48px; radius pill.
- Hover: pink mais escuro #C90061; foco visível com outline roxo.
- Usos: Explorar a loja, Comprar agora (apenas com checkout válido).
Secundário
- Fundo transparente/papel; borda roxa 1.5px; texto roxo.
- Hover: fundo rosa claro.
- Usos: Ver detalhes, Encomenda personalizada.
Estado desabilitado
- Fundo neutro, texto legível, sem clique; rótulo Em breve.
- Nunca simular compra ou pagamento.

7. Componentes
Header
- Fundo creme/papel; logo horizontal à esquerda, menu ao centro/direita.
- Links: Início, Loja, Personalizados, Sobre, Ajuda.
- Mobile: botão menu com aria-expanded, navegação acessível.
- Não exibir conta/carrinho próprios na V1.
Hero
- Banner horizontal com fundo retro texturizado fornecido.
- Conteúdo textual em coluna esquerda, imagem/colagem de produtos à direita somente se houver assets adequados.

- Não colocar textos dentro da imagem de fundo; texto deve permanecer HTML acessível.

Faixa de benefícios
- 3–4 itens com ícones: compra segura via Kiwify, entrega digital após pagamento confirmado, personalização, arquivos digitais.
- Não afirmar entrega instantânea sem validação real do fluxo da plataforma.
Card de categoria
- Imagem em proporção 4:3; título, descrição de até duas linhas, seta circular.
- Bordas arredondadas e fundo papel; hover com elevação discreta.
Card de produto
- Imagem 4:3 ou 1:1 consistente, nome, formato, preço real, CTA Ver detalhes.
- Sem preços fictícios, avaliações falsas, descontos simulados ou botão de compra sem URL válida.
Banner de personalizados
- Fundo rosa-claro ou creme com textura, flor de lótus discreta, título e CTA de WhatsApp configurado.
Footer
- Logo, categorias, ajuda, contato e links legais; sem dados empresariais inventados.

8. Fundos, padrões e ilustrações
- Usar o fundo de página da pasta img áreas amplas, com background-size: cover apenas se o corte for aceitável; para páginas longas, considerar fundo de cor creme e detalhes decorativos em seções.
- Usar o fundo do banner na seção hero, com background-position: center e ajuste responsivo.
- Xadrez ondulado, fitas, lótus e estrelas devem ser acentos, nunca competir com textos ou CTAs.
- Imagens de referência não são automaticamente produtos à venda. Usar produtos reais/autorizados e suas prévias próprias.
- Evitar imagens externas de terceiros sem licença de uso comercial.

9. Estados de interface
- Links: padrão, hover, foco visível, ativo.
- Botões: padrão, hover, foco, disabled.
- Busca: vazio, sem resultados, erro de carregamento.
- Produto: disponível, em breve, indisponível, slug inválido.
- Formulário: obrigatório, erro, sucesso de preparação de mensagem (não alegar envio sem confirmação).

10. Responsividade
- Mobile: 320–767px; conteúdo em coluna, CTA de largura adequada, menu recolhível.
- Tablet: 768–1023px; grid 2 colunas.
- Desktop: >=1024px; grid 3–4 colunas conforme espaço.
- Garantir 44×44px para alvos de toque e nenhum scroll horizontal acidental.
- Hero mobile: texto antes da imagem; evitar que decorações escondam conteúdo.

11. Acessibilidade e performance
- Contraste WCAG AA para texto; verificar combinações reais (especialmente pink sobre creme).
- Alt descritivo para imagens informativas; alt="" em imagens puramente decorativas.
- :focus-visible perceptível; labels em formulários; HTML semântico.
- Respeitar prefers-reduced-motion.
- Imagens WebP/AVIF quando possível, lazy-load fora da primeira dobra, dimensões explícitas.
- Não usar textura como imagem gigante repetida sem otimização.

12. Kiwify e fluxo comercial
- Checkout é externo. Cada produto pode possuir checkoutUrl HTTPS configurada.
- Link de compra deve ser habilitado apenas com URL real validada.
- Entrega do arquivo é responsabilidade da configuração da plataforma; testar compra e acesso antes de publicar.
- Personalizados: formulário abre WhatsApp com mensagem pré-preenchida; não confirma pedido.
- Nenhum segredo, token ou chave de API no JavaScript público.


