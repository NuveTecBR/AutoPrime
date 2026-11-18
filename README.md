# 🚗 AutoPrime Seminovos — Portal de Venda & Financiamento Automotivo

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68A063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Storage-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase_Ready-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Security](https://img.shields.io/badge/Security-M%C3%A9todo_ENDS_100%25-blueviolet?style=for-the-badge&logo=shield)](https://github.com/NuveTecBR)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> 🌐 **Visualização Online (GitHub Pages):** [https://nuvetecbr.github.io/AutoPrime/](https://nuvetecbr.github.io/AutoPrime/)

---

## 📌 Visão Geral do Projeto

O **AutoPrime Seminovos** é uma plataforma web completa desenvolvida com foco no mercado de seminovos de alto padrão, combinando um design editorial contemporâneo com uma arquitetura de engenharia robusta (**Método ENDS — Eficiência, Nível técnico, Defesa e Segurança**).

O sistema oferece catálogo inteligente com filtros em tempo real, simulação financeira matemática transparente (**Tabela Price / Custo Efetivo Total - CDC Art. 52**), agendamento online de test drive e um portal de transparência e direitos do titular (**LGPD**).

---

## 🌟 Principais Funcionalidades

- **Showroom Editorial & Bento Grid:** Apresentação visual limpa dos veículos com cards dinâmicos, especificações técnicas detalhadas (câmbio, combustível, km, ano) e badges de status ("Disponível", "Reservado").
- **Simulador de Financiamento em Tempo Real:**
  - Cálculo server-side via Tabela Price parametrizada.
  - Exibição transparente de entrada mínima, parcelas mensais, juros nominais e Custo Efetivo Total (CET), em estrita conformidade com o Art. 52 do Código de Defesa do Consumidor (CDC).
- **Agendamento de Test Drive & Drawer Lateral:** Formulário interativo para solicitação de visita e test drive, com validação de campos e feedback imediato.
- **Canal de Privacidade & LGPD:** Módulo para exercício de direitos do titular (Art. 18 da Lei 13.709/2018), gerando protocolo único de atendimento criptografado.
- **Painel Administrativo:** Gestão de estoque e consulta de leads com autenticação JWT e controle de acesso baseado em papéis (RBAC).

---

## 🎨 Design & Layout (Padrão Avada + Princípios PARC)

O design visual foi estruturado com base nas melhores práticas do ecossistema **Avada Prebuilt Websites** e nos quatro princípios fundamentais de design (**PARC**):

- **Proximidade & Alinhamento:** Organização visual coesa, separação clara entre especificações de motorização, condições financeiras e chamadas para ação.
- **Repetição & Consistência:** Sistema de design tokens rigoroso com variáveis CSS (`--primary`, `--surface`, `--accent`, `--radius-lg`).
- **Contraste:** Alto contraste tipográfico para legibilidade impecável sob diferentes condições de luz.
- **Trust Strip Avada:** Barra de credibilidade no topo do catálogo destacando os 4 pilares de confiança:
  1. *Laudo Cautelar Dekra 100% Aprovado*
  2. *Garantia Motor & Câmbio de 12 Meses*
  3. *Avaliação Justa pela Tabela FIPE*
  4. *Financiamento Transparente CDC*

---

## 🛡️ Arquitetura & Segurança (Método ENDS)

O projeto foi construído seguindo o princípio de **Defesa em Profundidade (Zero Trust)**:

1. **Proteção Anti-Bot (Honeypot):** Campos invisíveis em todos os formulários interceptam submissões automatizadas de bots sem penalizar usuários legítimos.
2. **Sanitização Rigorosa & Anti-XSS:** Todas as entradas de dados passam por limpeza de tags HTML e caracteres maliciosos antes de qualquer processamento.
3. **Security Headers (CSP & HSTS):**
   - `Content-Security-Policy`: Restritiva para scripts, estilos e conexões.
   - `X-Content-Type-Options: nosniff`: Previne MIME sniffing.
   - `X-Frame-Options: DENY`: Proteção total contra Clickjacking.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
4. **Rate Limiting Multinível:**
   - Limite por IP para endpoints públicos.
   - Limite rígido para tentativas de login (proteção contra força bruta).
   - Limite por IP para envio de formulários e leads.
5. **Autenticação & Criptografia:**
   - Senhas criptografadas com **Bcrypt** (salt rounds 10).
   - Sessões seguras com tokens **JWT** stateless e expiração configurada.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5 Semântico, CSS3 Moderno (CSS Variables, Flexbox, CSS Grid Bento), JavaScript Vanilla (ES6+ modular, zero dependências pesadas).
- **Backend:** Node.js (v20+), Express.js (v4.21).
- **Banco de Dados:** SQLite (driver nativo de alto desempenho para execução local) com suporte pré-configurado para PostgreSQL (Supabase Pooler).
- **Segurança:** Bcrypt.js, JsonWebToken, Dotenv, Middlewares customizados de Rate Limiting e Sanitização.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).
- Gerenciador de pacotes `npm`.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/NuveTecBR/AutoPrime.git
   cd AutoPrime
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo de exemplo dentro de `backend`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(No Windows PowerShell: `Copy-Item backend\.env.example backend\.env`)*

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```
   O servidor estará operando na porta **3334**:
   - **Frontend:** [http://localhost:3334](http://localhost:3334)
   - **API Health Check:** [http://localhost:3334/api/health](http://localhost:3334/api/health)

5. **Executar a Suíte de Testes Automatizados:**
   ```bash
   npm test
   ```

---

## 🧪 Suíte de Testes Automatizados

O projeto inclui uma suíte completa de testes de integração e segurança (`backend/test_suite.js`), cobrindo 100% dos requisitos do Método ENDS:

- [x] Health Check e validação de Security Headers (CSP, HSTS, XFO, Nosniff).
- [x] Consulta de catálogo de veículos e integridade dos filtros.
- [x] Validação matemática do Simulador de Financiamento (Tabela Price).
- [x] Registro de lead com consentimento LGPD e geração de protocolo único.
- [x] Interceptação de submissões automatizadas via Honeypot Anti-Bot.
- [x] Autenticação administrativa com JWT, Bcrypt e sanitização de DTO.
- [x] Controle de acesso baseado em papéis (RBAC) e canal de privacidade LGPD.

---

## 📡 Endpoints da API REST

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | Público | Verificação de status e telemetria do servidor |
| `GET` | `/api/veiculos` | Público | Lista todos os veículos disponíveis com suporte a filtros |
| `GET` | `/api/veiculos/:id` | Público | Detalhes de um veículo específico |
| `POST` | `/api/veiculos/simular` | Público | Simulação matemática de financiamento |
| `POST` | `/api/leads` | Público (Rate-Limited) | Cadastro de interesse em veículo / test drive |
| `POST` | `/api/leads/lgpd` | Público (Rate-Limited) | Abertura de solicitação de privacidade LGPD |
| `POST` | `/api/auth/login` | Público (Rate-Limited) | Autenticação de colaboradores com emissão de JWT |
| `GET` | `/api/auth/me` | Privado (JWT) | Dados do usuário autenticado |
| `POST` | `/api/veiculos` | Privado (JWT - Lojista) | Cadastro de novo veículo no estoque |
| `DELETE` | `/api/veiculos/:id` | Privado (JWT - Lojista) | Remoção de veículo do estoque |
| `GET` | `/api/leads` | Privado (JWT - Lojista) | Consulta de leads cadastrados |

---

## 📂 Estrutura de Pastas

```
AutoPrime/
├── backend/
│   ├── controllers/      # Lógica de controle e regras de negócio
│   ├── database/         # Configuração de conexão e schema SQLite/Postgres
│   ├── middlewares/      # Rate limiters, autenticação JWT, sanitizadores e segurança
│   ├── routes/           # Definição e roteamento dos endpoints da API
│   ├── services/         # Cálculos de financiamento e serviços auxiliares
│   ├── validators/       # Validação e esquemas de dados de entrada
│   ├── .env.example      # Modelo de variáveis de ambiente
│   ├── package.json      # Dependências e scripts do backend
│   ├── server.js         # Entrada do servidor Express
│   └── test_suite.js     # Suíte de testes automatizados
├── frontend/
│   ├── css/              # Folhas de estilo modulares (Avada Pattern + Bento)
│   ├── js/               # Scripts clientes e consumo reativo da API
│   └── index.html        # Página principal do showroom
├── sql/
│   └── schema.sql        # Scripts DDL para inicialização do banco
├── .gitignore            # Regras de exclusão do controle de versão
├── iniciar.ps1           # Script PowerShell para inicialização rápida
├── package.json          # Script raiz para execução de comandos agregados
└── README.md             # Esta documentação
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Desenvolvido por **NuveTec** ([@NuveTecBR](https://github.com/NuveTecBR)) como parte integrante do portfólio de excelência em engenharia web Nuvetec.
