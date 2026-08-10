# Ciclo de vida do protótipo

```
proposto → ativo → decidido → promovido | descartado → arquivado
```

| Estado | Significado | Artefato no repo |
|---|---|---|
| **proposto** | Brief combinado; ainda sem rota | Só texto (US/chat) |
| **ativo** | Autor pode abrir e comparar | `/prototipo/<slug>` + `components/prototypes/*` |
| **decidido** | Letra(s) ou descarte registrados | Rota ainda existe até o PR de fechamento |
| **promovido** | Variante em componentes de produção | Protótipo **removido no mesmo PR** |
| **descartado** | Não vai para produção | Protótipo **removido no mesmo PR** |
| **arquivado** | Histórico da decisão | **Apenas** US/chat — sem código |

## Regras

1. **Arquivado = texto**, nunca pasta `archive/prototypes` no frontend
2. Limpeza ocorre no **mesmo PR** da promoção ou do descarte
3. Protótipo **ativo** sem feedback: perguntar ao autor (manter / decidir / apagar) — não acumular galeria eterna
4. Uma rota por exploração (`/prototipo/<slug>`); redirects órfãos também saem na limpeza
5. Se uma nova rodada for pedida sobre o mesmo tema, **reutilizar** o mesmo slug e substituir variantes — não criar `/prototipo/<slug>-v2` sem necessidade
