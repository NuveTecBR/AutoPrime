import { query, get, run } from '../database/conexao.js';
import { veiculosService } from './veiculosService.js';

export const leadsService = {
  registrarLead(dados) {
    const calculo = veiculosService.calcularFinanciamento({
      veiculo_id: dados.veiculo_id,
      valor_entrada: dados.valor_entrada,
      prazo_meses: dados.prazo_meses
    });

    const sufixo = Math.floor(1000 + Math.random() * 9000);
    const protocolo = `APR-2026-${sufixo}`;

    const res = run(
      `INSERT INTO simulacoes_leads (
        protocolo, veiculo_id, tipo_atendimento, nome_cliente, telefone, email,
        valor_entrada, prazo_meses, valor_parcela, taxa_juros_mensal,
        possui_troca, descricao_troca, consentimento_lgpd, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Novo Lead')`,
      [
        protocolo,
        dados.veiculo_id,
        dados.tipo_atendimento,
        dados.nome_cliente,
        dados.telefone,
        dados.email,
        dados.valor_entrada,
        dados.prazo_meses,
        calculo.valor_parcela,
        calculo.taxa_juros_mensal,
        dados.possui_troca,
        dados.descricao_troca,
        dados.consentimento_lgpd
      ]
    );

    const textoWhats = encodeURIComponent(
      `Olá AutoPrime! Gerado protocolo *${protocolo}* para o veículo *${calculo.veiculo.titulo}*.\n` +
      `• Modalidade: ${dados.tipo_atendimento}\n` +
      `• Entrada: R$ ${dados.valor_entrada.toLocaleString('pt-BR')} + ${dados.prazo_meses}x de R$ ${calculo.valor_parcela.toLocaleString('pt-BR')}\n` +
      (dados.possui_troca ? `• Veículo na troca: ${dados.descricao_troca}\n` : '') +
      `• Cliente: ${dados.nome_cliente}`
    );

    return {
      id: res.lastInsertRowid,
      protocolo,
      calculo,
      whatsapp_url: `https://wa.me/5511999990000?text=${textoWhats}`,
      mensagem: 'Simulação e reserva de atendimento registradas com sucesso!'
    };
  },

  listarTodos() {
    return query(`
      SELECT l.*, v.marca, v.modelo, v.versao, v.preco AS preco_veiculo
      FROM simulacoes_leads l
      JOIN veiculos v ON v.id = l.veiculo_id
      ORDER BY l.id DESC
    `);
  },

  atualizarStatusLead(id, status) {
    if (!['Novo Lead', 'Em Negociação', 'Test-Drive Agendado', 'Concluído'].includes(status)) {
      const err = new Error('Status de lead inválido.');
      err.statusCode = 400;
      throw err;
    }
    const lead = get('SELECT id FROM simulacoes_leads WHERE id = ?', [Number(id)]);
    if (!lead) {
      const err = new Error('Lead não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    run('UPDATE simulacoes_leads SET status = ? WHERE id = ?', [status, Number(id)]);
    return get('SELECT * FROM simulacoes_leads WHERE id = ?', [Number(id)]);
  },

  registrarSolicitacaoLgpd(dados) {
    const protocolo = `LGPD-APR-${Math.floor(10000 + Math.random() * 90000)}`;
    run(
      `INSERT INTO solicitacoes_lgpd (protocolo, nome_titular, email_titular, tipo_direito, detalhes)
       VALUES (?, ?, ?, ?, ?)`,
      [protocolo, dados.nome_titular, dados.email_titular, dados.tipo_direito, dados.detalhes]
    );
    return {
      protocolo,
      status: 'Recebido pelo Encarregado de Dados (DPO)',
      prazo_resposta: 'Até 15 dias corridos conforme Art. 18 e 19 da LGPD (Lei nº 13.709/2018).'
    };
  }
};
