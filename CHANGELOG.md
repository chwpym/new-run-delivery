# Changelog

Todas as mudanças notáveis do projeto RunDelivery.

## [1.1.0] - 2026-03-11

### 🚀 Novas Features (Quick Wins)
- **Offline Indicator**: Banner rojo no topo avisando quando o app está offline.
- **Média Diária (Dashboard)**: Novo card exibindo a média de entregas/dia e dias trabalhados.
- **Custo por Km (Dashboard)**: Novo card exibindo o custo de combustível por quilômetro rodado.
- **Tema Automático**: Botão de tema agora tem 3 estados (Claro, Escuro, Sistema).
- **Taxa Extra (Tx Extra/Dif)**: Novo campo na tela de registros para valores variáveis de entrega, permitindo ajustar os ganhos sem alterar a taxa base da empresa.

## [1.0.0] - 2026-03-11

### 🚀 Migração Completa (P0 → P3)

#### P0 — Críticos
- **PWA funcional**: migrado de `next-pwa` (obsoleto) para `@ducanh2912/next-pwa@10`
- **Manifest completo**: 5 ícones, maskable dedicado, scope, id, categories
- **Meta tags PWA**: viewport, apple-web-app, apple-touch-icon, lang pt-BR
- **GPS corrigido**: bug de stale closure no `processNewPosition` corrigido com `useRef`
- **DB singleton**: conexão IndexedDB cacheada, evita opens redundantes
- **Deps limpas**: removidos firebase, genkit, next-pwa antigo, `src/ai/`, `apphosting.yaml`

#### P1 — Segurança
- **Security headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

#### P2 — Performance
- **Lazy loading**: 13 telas com `next/dynamic` (bundle: 314kB → 141kB, **-55%**)
- **Validação de import**: `importDbFromJson` valida JSON, tipos e campo `id`
- **Ícone maskable**: gerado com safe zone de 20% para Android

#### P3 — Arquitetura
- **App Router**: migração de SPA (useState) para 13 rotas reais com Next.js App Router
- **AppProvider context**: state compartilhado (count, settings, companies, vehicles)
- **MainMenu reescrito**: usa `next/link` + `usePathname` para navegação real
- **God Component removido**: `delivery-tracker.tsx` deletado
- **TypeScript strict**: `ignoreBuildErrors: false`, 0 erros
- **Testes**: Vitest + 15 testes (db-import: 11, alerts: 4)

#### Features Novas
- **Filtro por data**: componente `DateRangeFilter` reutilizável (mês + período customizado)
  - Aplicado em: Recebimentos, Abastecimento, Manutenções, Dashboard
  - Totais recalculam conforme filtro selecionado
- **Botão decrementar**: `-` agora diminui o contador de entregas com feedback
- **Versão do app**: footer `v1.0.0` visível em todas as telas
- **Touch targets**: botões de ação com mínimo 44-48px (mobile UX)
- **Dashboard com Links**: navegação instantânea via `next/link`

#### Infraestrutura
- **Next.js 16.1.6**: atualizado de 15.3.3 para corrigir CVE-2025-66478
- **next.config.ts**: migrado para Turbopack (Next.js 16 default)
- **Hydration fix**: `suppressHydrationWarning` no `<body>` contra extensões do browser
