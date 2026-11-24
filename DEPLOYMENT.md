# Publicacao no Cloudflare Pages

## Configuracao do projeto

- Repositorio: `CarolinaGarcez/mimo_shop` (publico; confirme a conexao no painel).
- Branch padrao do GitHub: `main`; confirme que ela esta selecionada como branch de producao no Pages.
- Comando de build: `node scripts/build-pages.mjs`.
- Diretorio de saida: `public`.
- Root directory: `/` (raiz do repositorio).
- Previews: configure previews para branches que nao sejam `main`; somente `main` deve promover uma producao. Essa separacao depende da configuracao no painel.

O site usa HTML, CSS, JavaScript e dados estaticos. O script Node sem dependencias valida as fontes e os dados, remove somente a pasta gerada `public/` e a recria a partir de uma lista permitida. A validacao confere JSON dos kits, imagens dos produtos, canonicals, sitemap, referencias locais e hash CSP do script Brevo; a saida final precisa corresponder exatamente a allowlist. Isso remove residuos de builds anteriores sem apagar fontes ou materiais de trabalho. `public/` e uma pasta gerada localmente e esta no `.gitignore`; nao a adicione ao commit.

## Publicar

Revise as alteracoes e o indice do Git antes de criar um commit. Adicione explicitamente os arquivos aprovados; nao use `git add -A` se houver outras alteracoes no workspace.

```powershell
git status --short
git switch -c pages-publication-preview
git add .gitignore _headers DEPLOYMENT.md scripts/build-pages.mjs index.html catalogo.html contato.html entrega-digital.html privacidade.html termos.html 404.html robots.txt sitemap.xml css/styles.css css/tokens.css data/products.json js/catalog.js js/main.js js/product-data.js assets/img/ilustracoes/hero.webp
git diff --cached --stat
git commit -m "Prepare isolated Cloudflare Pages output"
git push -u origin pages-publication-preview
```

Revise o resumo staged antes do commit e inclua somente fontes aprovadas. Os diretorios `artifacts/`, `docs/` e `emails/` e os arquivos `hero-preview*.png` ficam fora da saida por causa da allowlist; nao os remova do workspace nem use `git add -u` para excluir materiais de trabalho. A geracao limpa de `public/` nao apaga esses arquivos nem altera o historico Git. `public/` e ignorada pelo Git porque o Cloudflare executa o build ao criar o deployment.

Configure `main` como branch de producao e deployments de preview para branches nao produtivas antes de enviar a branch. O push de `pages-publication-preview` deve criar apenas um preview. Depois de validar o preview e confirmar a configuracao, promova o mesmo commit:

```powershell
git switch main
git merge --ff-only pages-publication-preview
git push origin main
```

O push de `main` inicia a publicacao de producao quando o painel esta configurado para essa branch. Nao promova o preview antes de validar as rotas, o 404 e os recursos.

## Identificar uma versao publicada

No painel do Cloudflare Pages, abra **Deployments** e compare o branch e o commit SHA do deployment de producao com o commit no GitHub (`git rev-parse HEAD`). Registre o SHA aprovado. Um preview deve exibir uma URL de preview separada e o SHA de sua branch/commit; confirme que o ambiente continua separado da URL de producao.

## Recuperar a versao anterior

Se um deployment novo falhar, use **Rollback** no deployment de producao anterior que esteja marcado como bem-sucedido, se a opcao estiver disponivel. Alternativamente, reverta o commit defeituoso com `git revert <sha>` e envie o novo commit para `main`. Nao reescreva o historico nem use force push para recuperar a producao.

## Validar o preview antes de promover

No painel, confirme que o deployment da branch de preview tem o SHA do commit enviado e uma URL diferente da producao. Substitua o valor de `$previewUrl` pela URL completa fornecida pelo Cloudflare:

```powershell
$previewUrl = "https://REPLACE-WITH-CLOUDFLARE-PREVIEW"
curl.exe -i "$previewUrl/"
curl.exe -i "$previewUrl/robots.txt"
curl.exe -i "$previewUrl/sitemap.xml"
curl.exe -i "$previewUrl/__rota-inexistente-para-teste"
curl.exe -i "$previewUrl/css/styles.css"
curl.exe -i "$previewUrl/js/main.js"
curl.exe -i "$previewUrl/data/products.json"
curl.exe -i "$previewUrl/assets/img/logo/logo1.webp"
curl.exe -i "$previewUrl/.gitignore"
curl.exe -i "$previewUrl/DEPLOYMENT.md"
curl.exe -i "$previewUrl/scripts/build-pages.mjs"
curl.exe -i "$previewUrl/data/products.schema.json"
curl.exe -i "$previewUrl/hero-preview.png"
curl.exe -i "$previewUrl/hero-preview-mobile.png"
curl.exe -i "$previewUrl/docs/desing_system.md"
curl.exe -i "$previewUrl/emails/boas-vindas.html"
curl.exe -i "$previewUrl/artifacts/hero/after-desktop.png"
curl.exe -i "$previewUrl/assets/img/inspiracao/Guia-Visual.png"
curl.exe -i "$previewUrl/assets/img/inspiracao/mock.png"
curl.exe -i "$previewUrl/assets/img/ilustracoes/hero.png"
curl.exe -i "$previewUrl/assets/img/produtos/"
curl.exe -i "$previewUrl/assets/img/produtos/cartoes/Cole%C3%A7%C3%A3o%20A%20Luz%20do%20Primeiro%20Natal.png"
curl.exe -i "$previewUrl/assets/img/produtos/cartoes/cole%C3%A7%C3%A3o%20de%20Natal%20em%20aquarela.png"
curl.exe -i "$previewUrl/assets/img/produtos/cartoes/cole%C3%A7%C3%A3o%20Os%20Biscoitos_%20cart%C3%B5es%20natalinos%20retr%C3%B4.png"
curl.exe -i "$previewUrl/assets/img/produtos/cartoes/Kit%20com%2010%20cart%C3%B5es%20Lulinha%2013.png"
curl.exe -i "$previewUrl/assets/img/produtos/colorir/adulto/Mockup%20do%20Jardim%20C%C3%B3smico.png"
curl.exe -i "$previewUrl/assets/img/produtos/colorir/infantil/o%20natal%20das%20pequenas%20coisas.png"
curl.exe -i "$previewUrl/.env"
curl.exe -i "$previewUrl/.dev.vars"
curl.exe -i "$previewUrl/.git/config"
curl.exe -i "$previewUrl/scripts/build-pages.mjs.bak"
curl.exe -i "$previewUrl/DEPLOYMENT.md.old"
curl.exe -i "$previewUrl/index.html~"
curl.exe -i "$previewUrl/assets/img/inspiracao/Guia-Visual.png.bak"
curl.exe -i "$previewUrl/private-delivery/"
curl.exe -i "$previewUrl/customer-data/"
curl.exe -i "$previewUrl/contact-exports/"
curl.exe -i "$previewUrl/contacts/"
curl.exe -i "$previewUrl/exports/"
```

Esperado: paginas e recursos usados respondem 200; robots e sitemap retornam texto e XML respectivamente; URL inexistente e caminhos internos retornam 404; os headers incluem CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e Permissions-Policy. Pages deve fornecer `Cache-Control: public, max-age=0, must-revalidate`; os nomes atuais de assets nao sao versionados por hash, portanto nao defina `immutable`. Em navegador, teste newsletter sem enviar o formulario, filtros, menu, teclado, zoom 200%, larguras de 360, 390, 768 e 1440 px e console/rede para bloqueios de CSP ou recursos mistos.

O build local nao simula os headers, redirects ou status HTTP do runtime Pages. A verificacao acima deve ocorrer no preview antes de promover. Depois de validar, confira novamente o SHA e os mesmos endpoints na producao.
