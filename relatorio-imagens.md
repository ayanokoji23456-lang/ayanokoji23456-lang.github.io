# Relatório de imagens do catálogo

Data da verificação: 17/09/2026

## Resumo

- Arquivos de imagem encontrados no projeto: **223**
- Referências de imagem no `produtos.json`: **235**
- Referências que correspondem a arquivos existentes antes da nova pasta: **161**
- Referências recuperadas na pasta `floricultura files`: **67**
- Referências ainda sem arquivo correspondente: **0**
- Imagens existentes sem referência no catálogo ou no `index.html`: **42**
- Correspondências seguras para substituição automática: **0**
- Correspondências possíveis, mas ambíguas: **22**
- Referências sem candidato semelhante: **52**

Os números não precisam ser iguais: uma referência ausente é um caminho citado pelo JSON que não foi encontrado; uma imagem não utilizada é um arquivo que existe, mas não é citado pelo JSON nem pelo HTML.

## Referências anteriormente ausentes, agora resolvidas

Depois da adição da pasta `floricultura files` e do fallback de extensão, as referências abaixo foram resolvidas:

- `minic.webp` -> `floricultura files/minic.png`
- `minic2.webp` -> `floricultura files/minic2.png`
- `in6.webp`, `li3.webp`, `mini0.webp`, `mini1.webp`, `mini4.webp` -> arquivos adicionados à pasta `floricultura files`

## Referências ambíguas anteriores

Estas referências têm arquivos com nomes parecidos, mas não é seguro escolher automaticamente:

- `girab4.webp`, `girab2.webp` -> `gira.webp`, `gira2.webp`
- `astroge1.webp` até `astroge5.webp` -> `astro.webp`, `astro2.webp`, `astrom.webp` até `astrom5.webp`
- `girazu.webp`, `girazu2.webp` -> `gira.webp`, `gira2.webp`
- `girof.webp`, `girof2.webp`, `girof5.webp` -> `gira.webp`, `gira2.webp`
- `cxro.webp`, `cxro1.webp`, `cxro2.webp`, `cxro3.webp` -> famílias `cx*` e `cxz*`
- `cx65.webp`, `cx651.webp`, `cx652.webp`, `cx653.webp` -> `ce65.webp`
- `cxvi.webp` -> famílias `cx*`
- `ce302.webp` -> `ce30.webp`

## Referências sem candidato

`minic.webp`, `minic2.webp`, `liro.webp`, `liro2.webp`, `liro3.webp`, `in.webp`, `in2.webp`, `in3.webp`, `in4.webp`, `in5.webp`, `in6.webp`, `li3.webp`, `li6.webp`, `li8.webp`, `rosa.webp`, `rosa3.webp`, `rosa4.webp`, `rosa5.webp`, `rosa6.webp`, `rose3.webp`, `ruscus.webp`, `ruscus2.webp`, `ruscus3.webp`, `ruscus4.webp`, `veja.webp`, `veja2.webp`, `veja3.webp`, `roge.webp`, `roge1.webp`, `ult.webp`, `ult2.webp`, `IMG-20260706-WA0038.webp`, `IMG-20260706-WA0042.webp`, `IMG-20260706-WA0043.webp`, `mini0.webp`, `mini1.webp`, `mini4.webp`, `otmini.webp`, `otmini2.webp`, `moni0.webp`, `moni5.webp`, `moni6.webp`, `moni8.webp`, `moni9.webp`, `IMG-20260716-WA0058.webp`, `IMG-20260716-WA0059.webp`, `IMG-20260716-WA0060.webp`, `IMG-20260716-WA0061.webp`, `IMG-20260716-WA0062.webp`, `psf.webp`, `nn.webp`, `nn2.webp`.

## Próximo procedimento seguro

1. No painel, abra um dos produtos que ainda mostra “Imagem não encontrada”.
2. Selecione a foto correta no campo de imagens.
3. Salve o produto.
4. Quando o backend estiver ativo, a nova imagem será salva em `uploads/` e o caminho será atualizado automaticamente no `produtos.json`.

Não foram feitas substituições automáticas porque os candidatos semelhantes podem pertencer a produtos diferentes.
