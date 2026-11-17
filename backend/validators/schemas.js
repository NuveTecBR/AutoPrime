/**
 * Validação Estrita de Contratos e Schemas no Servidor (Pilar 8 e 14 da Nuvetec)
 * Bloqueia Mass Assignment, XSS e tipos inválidos antes da camada de serviço.
 */

function sanitizarTexto(valor, maxLen = 500) {
  if (typeof valor !== 'string') return '';
  return valor
    .trim()
    .replace(/[<>]/g, '') // Prevenção contra injeção de tags HTML/XSS
    .slice(0, maxLen);
}

export function validarLoginInput(body = {}) {
  const email = sanitizarTexto(body.email, 120).toLowerCase();
  const senha = typeof body.senha === 'string' ? body.senha : '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const err = new Error('Informe um endereço de e-mail válido.');
    err.statusCode = 400;
    throw err;
  }
  if (!senha || senha.length < 6) {
    const err = new Error('A senha deve conter no mínimo 6 caracteres.');
    err.statusCode = 400;
    throw err;
  }
  return { email, senha };
}

export function validarSimulacaoInput(body = {}) {
  // Verificação de Honeypot Anti-Bot (Pilar 12)
  if (body.empresa_website_honeypot && String(body.empresa_website_honeypot).trim() !== '') {
    return { isBotHoneypot: true };
  }

  const veiculo_id = Number(body.veiculo_id);
  const valor_entrada = Number(body.valor_entrada ?? 0);
  const prazo_meses = Number(body.prazo_meses ?? 48);

  if (!Number.isInteger(veiculo_id) || veiculo_id <= 0) {
    const err = new Error('Selecione um veículo válido para realizar a simulação.');
    err.statusCode = 400;
    throw err;
  }
  if (Number.isNaN(valor_entrada) || valor_entrada < 0) {
    const err = new Error('O valor de entrada não pode ser negativo.');
    err.statusCode = 400;
    throw err;
  }
  if (![12, 24, 36, 48, 60].includes(prazo_meses)) {
    const err = new Error('O prazo de financiamento deve ser de 12, 24, 36, 48 ou 60 meses.');
    err.statusCode = 400;
    throw err;
  }

  return { veiculo_id, valor_entrada, prazo_meses };
}

export function validarLeadInput(body = {}) {
  if (body.empresa_website_honeypot && String(body.empresa_website_honeypot).trim() !== '') {
    return { isBotHoneypot: true };
  }

  const { veiculo_id, valor_entrada, prazo_meses } = validarSimulacaoInput(body);
  const nome_cliente = sanitizarTexto(body.nome_cliente, 100);
  const telefone = sanitizarTexto(body.telefone, 30);
  const email = body.email ? sanitizarTexto(body.email, 120).toLowerCase() : null;
  const tipo_atendimento = ['Simulação & Test-Drive', 'Avaliação de Troca', 'Proposta à Vista'].includes(body.tipo_atendimento)
    ? body.tipo_atendimento
    : 'Simulação & Test-Drive';
  const possui_troca = body.possui_troca ? 1 : 0;
  const descricao_troca = body.descricao_troca ? sanitizarTexto(body.descricao_troca, 250) : null;
  const consentimento_lgpd = body.consentimento_lgpd === true || body.consentimento_lgpd === 1;

  if (nome_cliente.length < 3) {
    const err = new Error('Informe seu nome completo (mínimo de 3 caracteres).');
    err.statusCode = 400;
    throw err;
  }

  const digitosTel = telefone.replace(/\D/g, '');
  if (digitosTel.length < 10 || digitosTel.length > 13) {
    const err = new Error('Informe um telefone/WhatsApp válido com DDD.');
    err.statusCode = 400;
    throw err;
  }

  if (!consentimento_lgpd) {
    const err = new Error('É necessário aceitar o tratamento de dados (LGPD) para enviar a solicitação.');
    err.statusCode = 400;
    throw err;
  }

  return {
    veiculo_id,
    tipo_atendimento,
    nome_cliente,
    telefone,
    email,
    valor_entrada,
    prazo_meses,
    possui_troca,
    descricao_troca,
    consentimento_lgpd: 1
  };
}

export function validarNovoVeiculoInput(body = {}) {
  const marca = sanitizarTexto(body.marca, 50);
  const modelo = sanitizarTexto(body.modelo, 60);
  const versao = sanitizarTexto(body.versao, 80);
  const ano_fabricacao = Number(body.ano_fabricacao);
  const ano_modelo = Number(body.ano_modelo);
  const preco = Number(body.preco);
  const quilometragem = Number(body.quilometragem ?? 0);
  const cambio = ['Automático', 'Manual', 'CVT'].includes(body.cambio) ? body.cambio : 'Automático';
  const combustivel = ['Flex', 'Diesel', 'Híbrido', 'Gasolina', 'Elétrico'].includes(body.combustivel) ? body.combustivel : 'Flex';
  const cor = sanitizarTexto(body.cor || 'Prata', 40);
  const final_placa = Math.min(9, Math.max(0, Number(body.final_placa ?? 1)));
  const carroceria = ['SUV', 'Sedan', 'Hatch', 'Picape'].includes(body.carroceria) ? body.carroceria : 'SUV';
  const destaque = body.destaque ? 1 : 0;
  const laudo_cautelar = sanitizarTexto(body.laudo_cautelar || '100% Aprovado Dekra', 80);
  const garantia_meses = Number(body.garantia_meses ?? 12);
  const imagem_url = sanitizarTexto(body.imagem_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80', 400);
  const itens_serie = sanitizarTexto(body.itens_serie || 'Ar condicionado, Direção elétrica, Multimídia, Airbags', 500);
  const descricao = sanitizarTexto(body.descricao || 'Veículo periciado e com garantia da loja.', 600);

  if (!marca || !modelo || !versao) {
    const err = new Error('Marca, modelo e versão são obrigatórios.');
    err.statusCode = 400;
    throw err;
  }
  if (!Number.isInteger(ano_modelo) || ano_modelo < 1990 || ano_modelo > 2028) {
    const err = new Error('Ano do modelo inválido.');
    err.statusCode = 400;
    throw err;
  }
  if (Number.isNaN(preco) || preco <= 5000) {
    const err = new Error('Informe um preço válido maior que R$ 5.000.');
    err.statusCode = 400;
    throw err;
  }

  return {
    marca, modelo, versao,
    ano_fabricacao: Number.isInteger(ano_fabricacao) ? ano_fabricacao : ano_modelo,
    ano_modelo, preco, quilometragem, cambio, combustivel, cor,
    final_placa, carroceria, destaque, laudo_cautelar, garantia_meses,
    imagem_url, itens_serie, descricao
  };
}

export function validarLgpdInput(body = {}) {
  const nome_titular = sanitizarTexto(body.nome_titular, 100);
  const email_titular = sanitizarTexto(body.email_titular, 120).toLowerCase();
  const tipo_direito = ['Confirmacao', 'Acesso', 'Correcao', 'Exclusao'].includes(body.tipo_direito)
    ? body.tipo_direito
    : 'Acesso';
  const detalhes = sanitizarTexto(body.detalhes || '', 400);

  if (nome_titular.length < 3 || !email_titular.includes('@')) {
    const err = new Error('Informe nome completo e e-mail válido para registrar o protocolo LGPD.');
    err.statusCode = 400;
    throw err;
  }

  return { nome_titular, email_titular, tipo_direito, detalhes };
}
