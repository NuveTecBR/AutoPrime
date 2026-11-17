import { query, get, run } from '../database/conexao.js';

export const veiculosService = {
  listar(filtros = {}) {
    let sql = 'SELECT * FROM veiculos WHERE 1=1';
    const params = [];

    if (filtros.marca && filtros.marca !== 'Todas') {
      sql += ' AND marca = ?';
      params.push(String(filtros.marca));
    }
    if (filtros.carroceria && filtros.carroceria !== 'Todas') {
      sql += ' AND carroceria = ?';
      params.push(String(filtros.carroceria));
    }
    if (filtros.cambio && filtros.cambio !== 'Todos') {
      sql += ' AND cambio = ?';
      params.push(String(filtros.cambio));
    }
    if (filtros.combustivel && filtros.combustivel !== 'Todos') {
      sql += ' AND combustivel = ?';
      params.push(String(filtros.combustivel));
    }
    if (filtros.precoMax && Number(filtros.precoMax) > 0) {
      sql += ' AND preco <= ?';
      params.push(Number(filtros.precoMax));
    }
    if (filtros.status && filtros.status !== 'Todos') {
      sql += ' AND status = ?';
      params.push(String(filtros.status));
    }
    if (filtros.busca && String(filtros.busca).trim() !== '') {
      const termo = `%${String(filtros.busca).trim()}%`;
      sql += ' AND (marca LIKE ? OR modelo LIKE ? OR versao LIKE ? OR itens_serie LIKE ?)';
      params.push(termo, termo, termo, termo);
    }

    sql += ' ORDER BY destaque DESC, preco ASC LIMIT 50';
    return query(sql, params);
  },

  obterPorId(id) {
    const veiculo = get('SELECT * FROM veiculos WHERE id = ?', [Number(id)]);
    if (!veiculo) {
      const err = new Error('Veículo não encontrado no estoque.');
      err.statusCode = 404;
      throw err;
    }
    return veiculo;
  },

  calcularFinanciamento({ veiculo_id, valor_entrada, prazo_meses }) {
    const veiculo = this.obterPorId(veiculo_id);
    const precoVeiculo = Number(veiculo.preco);
    const entradaMinima = Math.round(precoVeiculo * 0.15); // 15% entrada mínima sugerida

    if (valor_entrada >= precoVeiculo) {
      const err = new Error('O valor de entrada deve ser menor que o valor total do veículo.');
      err.statusCode = 400;
      throw err;
    }

    const valorFinanciado = Math.max(0, precoVeiculo - valor_entrada);
    // Taxa progressiva conforme percentual de entrada (regra real de negócio executada no servidor)
    const percentualEntrada = (valor_entrada / precoVeiculo) * 100;
    const taxaMensalPct = percentualEntrada >= 40 ? 1.29 : (percentualEntrada >= 20 ? 1.49 : 1.69);
    const i = taxaMensalPct / 100;

    // Fórmula Tabela Price: PMT = PV * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
    const fator = Math.pow(1 + i, prazo_meses);
    const valorParcela = Number(((valorFinanciado * (i * fator)) / (fator - 1)).toFixed(2));
    const totalPrazo = Number((valorParcela * prazo_meses + valor_entrada).toFixed(2));

    return {
      veiculo: {
        id: veiculo.id,
        titulo: `${veiculo.marca} ${veiculo.modelo} ${veiculo.versao}`,
        preco: precoVeiculo
      },
      valor_entrada,
      entrada_minima_recomendada: entradaMinima,
      valor_financiado: valorFinanciado,
      prazo_meses,
      taxa_juros_mensal: taxaMensalPct,
      valor_parcela: valorParcela,
      total_estimado: totalPrazo
    };
  },

  criar(dados) {
    const res = run(
      `INSERT INTO veiculos (
        marca, modelo, versao, ano_fabricacao, ano_modelo, preco, quilometragem,
        cambio, combustivel, cor, final_placa, carroceria, destaque, laudo_cautelar,
        garantia_meses, imagem_url, itens_serie, descricao, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Disponível')`,
      [
        dados.marca, dados.modelo, dados.versao, dados.ano_fabricacao, dados.ano_modelo,
        dados.preco, dados.quilometragem, dados.cambio, dados.combustivel, dados.cor,
        dados.final_placa, dados.carroceria, dados.destaque, dados.laudo_cautelar,
        dados.garantia_meses, dados.imagem_url, dados.itens_serie, dados.descricao
      ]
    );
    return this.obterPorId(res.lastInsertRowid);
  },

  atualizarStatus(id, novoStatus) {
    if (!['Disponível', 'Reservado', 'Vendido'].includes(novoStatus)) {
      const err = new Error('Status inválido. Use Disponível, Reservado ou Vendido.');
      err.statusCode = 400;
      throw err;
    }
    this.obterPorId(id);
    run('UPDATE veiculos SET status = ? WHERE id = ?', [novoStatus, Number(id)]);
    return this.obterPorId(id);
  },

  remover(id) {
    this.obterPorId(id);
    run('DELETE FROM veiculos WHERE id = ?', [Number(id)]);
    return { sucesso: true, mensagem: 'Veículo removido do estoque.' };
  }
};
