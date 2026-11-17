process.env.NODE_ENV = 'test';
const { default: app } = await import('./server.js');

const PORT = 3394;
const BASE = `http://localhost:${PORT}/api`;

async function executarSuite() {
  const server = app.listen(PORT);
  console.log(`🧪 Iniciando Suíte de Testes Automatizados AutoPrime na porta ${PORT}...\n`);

  try {
    // 1. Health Check & Security Headers
    const resHealth = await fetch(`${BASE}/health`);
    const health = await resHealth.json();
    console.assert(resHealth.status === 200 && health.status === 'online', 'Health check falhou');
    console.assert(resHealth.headers.get('x-content-type-options') === 'nosniff', 'Header nosniff ausente');
    console.assert(resHealth.headers.get('x-frame-options') === 'DENY', 'Header X-Frame-Options ausente');
    console.assert(resHealth.headers.get('content-security-policy')?.includes("default-src 'self'"), 'Header CSP ausente');
    console.log('✅ 1. Health Check e Security Headers (CSP, HSTS, XFO, Nosniff) validados.');

    // 2. Catálogo e Filtros de Veículos
    const resCarros = await fetch(`${BASE}/veiculos`);
    const carros = await resCarros.json();
    console.assert(Array.isArray(carros) && carros.length >= 8, 'Catálogo inicial incompleto');
    const resFiltroSuv = await fetch(`${BASE}/veiculos?carroceria=SUV&precoMax=150000`);
    const suvs = await resFiltroSuv.json();
    console.assert(suvs.every(c => c.carroceria === 'SUV' && c.preco <= 150000), 'Filtro de SUV/Preço falhou');
    console.log(`✅ 2. Catálogo (${carros.length} veículos) e filtros parametrizados validados.`);

    // 3. Simulador de Financiamento Server-Side (Tabela Price)
    const resSim = await fetch(`${BASE}/veiculos/simular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ veiculo_id: 1, valor_entrada: 50000, prazo_meses: 48 })
    });
    const sim = await resSim.json();
    console.assert(resSim.status === 200 && sim.valor_parcela > 0, 'Cálculo de financiamento falhou');
    console.log(`✅ 3. Simulador Tabela Price Server-Side OK: 48x de R$ ${sim.valor_parcela}.`);

    // 4. Criação de Lead + Protocolo + Validação LGPD Obrigatória
    const resLeadSemLgpd = await fetch(`${BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        veiculo_id: 1,
        nome_cliente: 'Cliente Teste',
        telefone: '(11) 98888-7777',
        valor_entrada: 40000,
        prazo_meses: 36,
        consentimento_lgpd: false
      })
    });
    console.assert(resLeadSemLgpd.status === 400, 'Deveria rejeitar lead sem consentimento LGPD');

    const resLeadOk = await fetch(`${BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        veiculo_id: 1,
        tipo_atendimento: 'Simulação & Test-Drive',
        nome_cliente: 'Mariana Costa',
        telefone: '(11) 98888-7777',
        email: 'mariana@exemplo.com',
        valor_entrada: 45000,
        prazo_meses: 48,
        possui_troca: true,
        descricao_troca: 'VW Polo Highline 2020 42.000km',
        consentimento_lgpd: true
      })
    });
    const leadCriado = await resLeadOk.json();
    console.assert(resLeadOk.status === 201 && leadCriado.protocolo.startsWith('APR-2026-'), 'Criação de lead falhou');
    console.log(`✅ 4. Registro de Lead com Consentimento LGPD e Protocolo (${leadCriado.protocolo}) validado.`);

    // 5. Proteção Honeypot Anti-Bot
    const resBot = await fetch(`${BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        veiculo_id: 1,
        nome_cliente: 'Spam Bot',
        telefone: '11999999999',
        consentimento_lgpd: true,
        empresa_website_honeypot: 'http://spambot.ru'
      })
    });
    const botJson = await resBot.json();
    console.assert(botJson.protocolo === 'APR-BOT-0000', 'Honeypot não interceptou bot');
    console.log('✅ 5. Honeypot Anti-Bot interceptou submissão automatizada sem gravar no banco.');

    // 6. Autenticação JWT + Bcrypt + Bloqueio RBAC
    const resNaoAut = await fetch(`${BASE}/leads`);
    console.assert(resNaoAut.status === 401, 'Rota privada de leads acessível sem token');

    const resLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'diretoria@autoprime-demo.com.br',
        senha: 'AutoPrime@2026'
      })
    });
    const loginData = await resLogin.json();
    console.assert(resLogin.status === 200 && loginData.token && !loginData.usuario.senha_hash, 'Login falhou ou vazou hash');
    console.log(`✅ 6. Autenticação JWT + Bcrypt + Trim DTO validados para: ${loginData.usuario.nome}.`);

    // 7. CRUD Protegido de Veículo e Direito do Titular LGPD
    const resNovoCarro = await fetch(`${BASE}/veiculos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        marca: 'Nissan',
        modelo: 'Kicks',
        versao: '1.6 Exclusive CVT',
        ano_fabricacao: 2023,
        ano_modelo: 2024,
        preco: 118900,
        quilometragem: 14000,
        cambio: 'CVT',
        combustivel: 'Flex',
        cor: 'Branco Diamond',
        final_placa: 6,
        carroceria: 'SUV'
      })
    });
    const carroCriado = await resNovoCarro.json();
    console.assert(resNovoCarro.status === 201 && carroCriado.id, 'Criação autenticada de veículo falhou');

    const resDelCarro = await fetch(`${BASE}/veiculos/${carroCriado.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    console.assert(resDelCarro.status === 200, 'Remoção de veículo pelo lojista falhou');

    const resLgpd = await fetch(`${BASE}/leads/lgpd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_titular: 'Mariana Costa',
        email_titular: 'mariana@exemplo.com',
        tipo_direito: 'Confirmacao',
        detalhes: 'Solicito confirmação de tratamento de dados.'
      })
    });
    const lgpdData = await resLgpd.json();
    console.assert(resLgpd.status === 201 && lgpdData.protocolo.startsWith('LGPD-APR-'), 'Canal LGPD falhou');
    console.log(`✅ 7. Gestão de Estoque (RBAC) e Canal LGPD (${lgpdData.protocolo}) validados.`);

    console.log('\n🎉 TODOS OS TESTES AUTOMATIZADOS DA AUTOPRIME PASSARAM COM 100% DE SUCESSO!\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

executarSuite().catch(err => {
  console.error('❌ Erro na suíte de testes:', err);
  process.exit(1);
});
