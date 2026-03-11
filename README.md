# RunDelivery - App de Gestão para Entregadores

RunDelivery é um Progressive Web App (PWA) completo, construído para ajudar entregadores e motoristas autônomos a gerenciar suas finanças, rotinas de trabalho e manutenção de veículos de forma eficiente e intuitiva.

O aplicativo foi projetado com foco na experiência móvel, permitindo o acesso rápido a todas as ferramentas essenciais para o dia a dia do profissional de entregas.

## ✨ Funcionalidades Principais

*   **Dashboard Inteligente:** Uma visão geral e centralizada do seu desempenho financeiro mensal, incluindo receita líquida, bruta, despesas totais e progresso em relação às suas metas.
*   **Rastreamento GPS Automático:** Inicie uma rota e deixe o aplicativo contar suas entregas automaticamente. Usando a geolocalização, ele detecta paradas fora da sua base e registra a entrega, com alertas sonoros e de vibração para sucesso e erros de GPS.
*   **Registros Diários Detalhados:** Adicione registros manuais para cada dia de trabalho, incluindo a empresa, veículo, número de entregas, ganhos (diária, taxas, gorjetas) e quilometragem rodada. Marque também seus dias de folga.
*   **Gestão de Custos:** Registre todas as suas despesas, categorizadas como fixas (ex: seguro) ou variáveis (ex: alimentação), para ter um controle preciso do seu lucro.
*   **Controle de Abastecimento:** Anote cada abastecimento, informando o preço por litro, e o app calcula o valor total. Os dados são usados para calcular um custo de combustível realista nos seus relatórios.
*   **Histórico de Manutenção:** Mantenha um registro de todos os serviços de manutenção do seu veículo, associando custos e quilometragem para um controle preventivo.
*   **Gerenciamento de Ativos:** Cadastre múltiplas empresas para as quais trabalha e os veículos que utiliza, cada um com seus próprios detalhes, como forma de pagamento e consumo de combustível.
*   **Relatórios Financeiros:** Visualize relatórios mensais detalhados com gráficos de ganhos diários e uma análise da composição de suas despesas.
*   **Metas Financeiras:** Defina metas de ganhos mensais e acompanhe seu progresso com uma barra visual e motivadora.
*   **Backup e Restauração:** Exporte todos os seus dados para um arquivo JSON seguro e importe-o a qualquer momento, garantindo que você nunca perca seu histórico.

## 🛠️ Tecnologias Utilizadas

*   **Framework:** Next.js (React) com App Router
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS & ShadCN/UI para componentes
*   **Banco de Dados:** IndexedDB no navegador para armazenamento 100% offline
*   **PWA:** Suporte completo para instalação no dispositivo móvel
*   **Qualidade de Código:** ESLint e Prettier

## 🚀 Como Começar

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:9002`.

## ⚙️ Scripts Disponíveis

*   `npm run dev`: Inicia o servidor de desenvolvimento com Turbopack.
*   `npm run build`: Compila o aplicativo para produção.
*   `npm run start`: Inicia o servidor de produção após o build.
*   `npm run lint`: Executa o ESLint para analisar o código em busca de erros e problemas de estilo.
*   `npm run typecheck`: Executa o compilador TypeScript para verificar erros de tipo em todo o projeto.
