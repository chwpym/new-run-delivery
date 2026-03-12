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
- [x] Campo Taxa Extra (Tx Extra/Dif) para precificação variável
- [x] Média diária de entregas no dashboard
- [x] Custo por km (combustível ÷ km rodados) no dashboard
- [x] Offline indicator (banner quando sem internet)
- [x] Modo escuro automático por horário

---

## 🔥 Próximas Features (por prioridade)

### v1.1 — Relatórios e Exportação
- [ ] Exportar relatórios pra PDF/Excel
- [ ] Gráficos no Dashboard (evolução mensal de ganhos/custos)

### v1.2 — UX e Cloud Sync
- [ ] Sincronização Nuvem Offline-First (Supabase + IndexedDB) para backup em tempo real
- [ ] Onboarding de primeiro uso (cadastrar empresa → veículo → começar)

### v1.3 — Comunicação e Gamificação
- [ ] Compartilhar resumo mensal via WhatsApp
- [ ] Notificações push (meta atingida, lembrete de abastecimento)
- [ ] Ranking/recorde mensal de entregas
- [ ] Foto de comprovante em abastecimento/manutenção

### v1.4 — Filtros Avançados & Automação
- [ ] Geofencing (Aprovar entrega automaticamente baseado na localização GPS + Raio em metros)
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
