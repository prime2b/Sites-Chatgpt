# Sites ChatGPT — Prime2B

## Bajaj InteriorSP

O código final do site existente está em [BajajInteriorSP](BajajInteriorSP/), incluindo as 14 páginas, imagens, estilos, scripts, fontes e testes.

Site publicado: https://bajaj-interiorsp.netlify.app

### Gerar e verificar

Requisitos: Python 3.11 ou superior, Pillow e Node.js para os testes. Não há dependências de frontend a instalar.

```bash
cd BajajInteriorSP
python3 build.py
python3 tests/static_check.py
node --test tests/*.test.mjs
```

A pasta `dist/` é o resultado para hospedagem. O build recompõe os PNGs oficiais a partir dos arquivos de origem em `source-assets/offers/`. Consulte o [README do projeto](BajajInteriorSP/README.md) para manutenção e publicação.

Esta importação corresponde à versão final do projeto de origem `6f85cdbc2afe9f1980ef7e3f859872a48f44df2e`, com o fade das seções da home. A publicação atual no Netlify permanece manual; este repositório não ativa publicação contínua automaticamente.
