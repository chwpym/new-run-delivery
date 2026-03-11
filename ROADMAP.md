# Roadmap — RunDelivery

## ✅ Concluído (v1.0.0)
- [x] PWA funcional (manifest, SW, meta tags, ícones)
- [x] GPS corrigido (stale closure fix)
- [x] Limpeza de dependências (firebase, genkit)
- [x] Security headers
- [x] Lazy loading (bundle -55%)
- [x] Validação importação DB
- [x] Ícone maskable
- [x] App Router (13 rotas reais)
- [x] TypeScript strict (0 erros)
- [x] Testes (15/15 Vitest)
- [x] Filtro por data (Recebimentos, Abastecimento, Manutenções, Dashboard)
- [x] Botão decrementar funcional
- [x] Versão no footer
- [x] Touch targets 44-48px
- [x] Next.js 16 + Turbopack

---

## 🔥 Próximas Features (por prioridade)

### v1.1 — Relatórios e Exportação
- [ ] Exportar relatórios pra PDF/Excel
- [ ] Gráficos no Dashboard (evolução mensal de ganhos/custos)
- [ ] Custo por km (combustível ÷ km rodados)
- [ ] Média diária de entregas no dashboard

### v1.2 — UX e Offline
- [ ] Offline indicator (banner quando sem internet)
- [ ] Onboarding de primeiro uso (cadastrar empresa → veículo → começar)
- [ ] Backup automático semanal (IndexedDB → JSON no dispositivo)
- [ ] Modo escuro automático por horário

### v1.3 — Comunicação e Gamificação
- [ ] Compartilhar resumo mensal via WhatsApp
- [ ] Notificações push (meta atingida, lembrete de abastecimento)
- [ ] Ranking/recorde mensal de entregas
- [ ] Foto de comprovante em abastecimento/manutenção

### v1.4 — Filtros Avançados
- [ ] Filtro por empresa em todas as telas
- [ ] Busca por texto nos registros
- [ ] Paginação de listas longas

---

## 🛠️ Melhorias Técnicas (backlog)
- [ ] Migrar de ESLint para Biome (mais rápido, sem OOM)
- [ ] E2E tests com Playwright
- [ ] CI/CD pipeline no GitHub Actions
- [ ] Versionamento automático (bumping)
- [ ] Lighthouse score > 90 em todas as categorias
