# Árvore da Família Pacheco Guimarães

Site estático, sem servidor e sem banco de dados.

```
index.html        estrutura da página
dados.js          ← a família (único arquivo que você edita)
fotos/            ← fotos das pessoas
assets/app.js     lógica (árvore, parentesco, busca)
assets/estilo.css visual
```

## O que o site tem
- **Abertura**: é a primeira tela ao escanear o QR. O leque é desenhado a partir dos dados: cada ponto é uma pessoa e cada anel é uma geração.
- **Árvore**: dá para arrastar, dar zoom (roda do mouse ou pinça no celular) e tocar em qualquer pessoa.
- **Gerações**: galeria com o retrato de cada pessoa, agrupada por geração.
- **Parentesco**: escolha duas pessoas para ver o grau (tio-avô, primo de 2º grau, cunhada, sogra…) e o caminho que as liga na árvore.
- **Perfil**: mostra foto, linhagem até a matriarca, pais, cônjuge, irmãos, filhos e galeria de fotos, além de um botão de compartilhar.
- **Busca**: pelo botão de lupa, pela tecla `/` ou por Ctrl+K.
- **Tema claro e escuro.**

## Editar pessoas (`dados.js`)
- Para preencher um nome pendente, troque `[PREENCHER] ...` pelo nome real.
- Campos opcionais de cada pessoa:
  - `nascimento: "12/03/1932"`, `falecimento`, `local: "Guarapuava – PR"`
  - `historia: "Texto livre sobre a pessoa."`
  - `sexo: "F"` ou `"M"`: serve para flexionar os termos de parentesco (ex.: "sogra" em vez de "sogro(a)"). Sem esse campo, o site usa a forma neutra.
  - `galeria: ["fotos/P001-casamento.jpg", "fotos/P001-1960.jpg"]`
  - `conjuge: "P039"`: só é necessário para casais sem filhos cadastrados.

## Fotos
- **Foto principal:** coloque a foto na pasta `fotos/` e aponte para ela no campo `foto` da pessoa (ex.: `foto: "fotos/Ricardo Volpe.jpeg"`). Sem esse campo, o site procura `fotos/<id>.jpg` (ex.: `fotos/P001.jpg`).
- O nome do arquivo precisa ser **idêntico** ao escrito no `dados.js`, inclusive acentos, maiúsculas e a extensão (`.jpeg` ≠ `.jpg`).
- **Fotos extras:** coloque-as na pasta e liste no campo `galeria`.
- Prefira fotos com o rosto centralizado e com até cerca de 500 KB cada.

## Rodar no computador
Abra o `index.html` no navegador. Para testar no celular pela mesma rede Wi-Fi:
```bash
python3 -m http.server 8000     # depois acesse http://IP-DO-PC:8000 no celular
```

## Publicar e gerar o QR code
1. Acesse app.netlify.com/drop e arraste esta pasta. O site recebe um link na hora.
2. Gere o QR a partir desse link: `qrencode -s 10 -o qr.png "https://seu-link.netlify.app"`.
3. Para atualizar o site, arraste a pasta de novo. O link continua o mesmo, então o QR impresso segue funcionando.

**Dica:** cada pessoa tem um link próprio, como `https://seu-link.netlify.app/#P001`. Dá para gerar um QR individual para colar atrás de um porta-retrato, e ele abre direto no perfil daquela pessoa.

## Miniaturas com enquadramento facial (nova funcionalidade)

As fotos originais continuam em `fotos/`, sem alterações. As miniaturas da árvore, das gerações e dos perfis utilizam `miniaturas/P001.webp`, etc. Clicar na foto do perfil abre a imagem original.

O arquivo `RELATORIO_MINIATURAS.txt` informa quais imagens tiveram rosto identificado e quais receberam apenas recorte central. Confira especialmente fotografias com várias pessoas, rostos de perfil ou fotografias antigas.

Para atualizar as miniaturas após acrescentar ou substituir fotos, execute `python gerar_miniaturas.py` na pasta do site (requer `pip install opencv-python pillow numpy`). É possível corrigir manualmente qualquer miniatura substituindo o arquivo WEBP correspondente por uma imagem quadrada de 320 × 320 pixels.


## Atualização de enquadramento e logomarca
As miniaturas agora usam recorte conservador com margem acima do rosto. Se a detecção falhar ou o rosto ocupar grande parte da foto, a imagem inteira é exibida sobre um fundo desfocado, sem perder a pessoa. O arquivo original não é alterado. A logomarca do colégio aparece na abertura e no cabeçalho de todas as seções. Confira fotos de grupos: o detector pode escolher a pessoa errada.
