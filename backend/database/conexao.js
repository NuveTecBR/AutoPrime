import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'autoprime.sqlite');
const sqlPath = path.resolve(__dirname, '../../sql/autoprime.sql');

export const db = new DatabaseSync(dbPath);

// Inicializar schema DDL
const ddl = fs.readFileSync(sqlPath, 'utf-8');
db.exec(ddl);

/**
 * Executa SELECT retornando múltiplas linhas (100% parametrizado contra SQL Injection)
 */
export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Executa SELECT retornando uma única linha (100% parametrizado)
 */
export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params) || null;
}

/**
 * Executa INSERT, UPDATE ou DELETE (100% parametrizado)
 */
export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  const res = stmt.run(...params);
  return {
    changes: Number(res.changes),
    lastInsertRowid: Number(res.lastInsertRowid)
  };
}

// Popular Seeds Fictícios Demonstrativos caso o banco esteja vazio
function inicializarSeeds() {
  const countUsers = get('SELECT COUNT(*) as total FROM usuarios');
  if (countUsers && countUsers.total === 0) {
    const hashLojista = bcrypt.hashSync('AutoPrime@2026', 10);
    const hashVendedor = bcrypt.hashSync('Vendas@2026', 10);

    run(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)',
      ['Roberto Almeida (Diretor Lojista)', 'diretoria@autoprime-demo.com.br', hashLojista, 'lojista']
    );
    run(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)',
      ['Lucas Martins (Consultor Seminovos)', 'vendas@autoprime-demo.com.br', hashVendedor, 'vendedor']
    );
  }

  const countVeiculos = get('SELECT COUNT(*) as total FROM veiculos');
  if (countVeiculos && countVeiculos.total === 0) {
    const carros = [
      [
        'Toyota', 'Corolla Cross', '2.0 XRE Direct Shift', 2023, 2024, 148900, 24500,
        'CVT', 'Flex', 'Branco Lunar Perolizado', 4, 'SUV', 1, '100% Aprovado Dekra', 12,
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
        '7 Airbags, Piloto Automático Adaptativo (ACC), Central Multimídia 9" Apple CarPlay/Android Auto, Bancos em Couro, Faróis Full LED, Chave Presencial',
        'Único dono, todas as revisões carimbadas na concessionária Toyota. Pintura 100% original sem retoques e pneus Michelin novos.',
        'Disponível'
      ],
      [
        'Jeep', 'Compass', '1.3 T270 Turbo Longitude', 2022, 2023, 134500, 38200,
        'Automático', 'Flex', 'Cinza Sting', 7, 'SUV', 1, '100% Aprovado SuperVisão', 12,
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
        'Painel Digital 10.25", Carregador por Indução, Rodas 18", Ar Digital Dual Zone, 6 Airbags, Controle de Estabilidade e Tração',
        'SUV impecável de uso urbano, interior higienizado e vitrificado. Laudo cautelar aprovado sem apontamentos.',
        'Disponível'
      ],
      [
        'Honda', 'Civic', '1.5 Touring Turbo CVT', 2020, 2021, 139900, 49800,
        'CVT', 'Gasolina', 'Preto Cristal', 9, 'Sedan', 1, '100% Aprovado Dekra', 12,
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80',
        'Teto Solar Elétrico, Motor 1.5 Turbo 173cv, Sistema de Som Premium Subwoofer, Câmera no Retrovisor (LaneWatch), Freio de Estacionamento Eletrônico',
        'Versão topo de linha Touring G10 muito procurada. Revisado recentemente com troca preventiva de fluido de câmbio CVT.',
        'Disponível'
      ],
      [
        'Volkswagen', 'Nivus', '1.0 200 TSI Highline', 2023, 2024, 119800, 19100,
        'Automático', 'Flex', 'Cinza Moonstone', 2, 'SUV', 0, '100% Aprovado Dekra', 12,
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
        'VW Play 10", Painel Active Info Display, ACC + Frenagem Autônoma de Emergência, Bancos em Couro Bi-ton, Faróis em LED',
        'Estado de zero quilômetro, na garantia de fábrica. Baixíssima quilometragem comprovada.',
        'Disponível'
      ],
      [
        'Chevrolet', 'Onix', '1.0 Turbo Premier II', 2022, 2023, 89900, 34000,
        'Automático', 'Flex', 'Azul Seeker Metálico', 5, 'Hatch', 0, '100% Aprovado SuperVisão', 12,
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        'Alerta de Ponto Cego, Estacionamento Automático (Easy Park), Wi-Fi Nativo, Carregador Sem Fio, 6 Airbags, Bancos com Acabamento Premium',
        'Hatch compacto mais completo e seguro da categoria (5 estrelas Latin NCAP). Econômico (até 16,5 km/l na estrada).',
        'Disponível'
      ],
      [
        'Fiat', 'Toro', '2.0 Turbo Diesel Ultra 4x4 AT9', 2022, 2022, 146900, 52000,
        'Automático', 'Diesel', 'Vermelho Colorado', 8, 'Picape', 0, '100% Aprovado Dekra', 12,
        'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80',
        'Tração 4x4 com Reduzida, Capota Rígida Removível, Central Vertical 10.1", Câmbio ZF 9 Marchas, Santo Antônio Integrado',
        'Picape nunca usada para carga pesada, apenas passeio e viagens em família. 4 pneus Bridgestone novos.',
        'Disponível'
      ],
      [
        'Hyundai', 'HB20', '1.0 TGDI Platinum Plus', 2023, 2024, 96500, 15400,
        'Automático', 'Flex', 'Prata Brisk', 1, 'Hatch', 0, '100% Aprovado Dekra', 12,
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
        'Assistente de Permanência em Faixa, Partida Remota pela Chave, Paddle Shifts no Volante, Painel Digital Supervision Cluster',
        'Seminovo com cheiro de novo, manual e chave reserva intactos.',
        'Reservado'
      ],
      [
        'BYD', 'Song Plus', '1.5 DM-i Híbrido Plug-in', 2023, 2024, 184900, 11800,
        'Automático', 'Híbrido', 'Cinza Time', 0, 'SUV', 1, '100% Aprovado Dekra', 24,
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
        'Autonomia Combinada de 1.100km, Teto Solar Panorâmico, Câmera 360° 3D, Tela Giratória 12.8", Abertura via NFC',
        'SUV Híbrido Plug-in referência de mercado. Acompanha carregador portátil original.',
        'Disponível'
      ]
    ];

    const insertSql = `
      INSERT INTO veiculos (
        marca, modelo, versao, ano_fabricacao, ano_modelo, preco, quilometragem,
        cambio, combustivel, cor, final_placa, carroceria, destaque, laudo_cautelar,
        garantia_meses, imagem_url, itens_serie, descricao, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const c of carros) {
      run(insertSql, c);
    }

    // Leads demonstrativos iniciais
    run(
      `INSERT INTO simulacoes_leads (
        protocolo, veiculo_id, tipo_atendimento, nome_cliente, telefone, email,
        valor_entrada, prazo_meses, valor_parcela, taxa_juros_mensal,
        possui_troca, descricao_troca, consentimento_lgpd, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'APR-2026-1042', 1, 'Simulação & Test-Drive', 'Carlos Eduardo Menezes (Fictício)',
        '(11) 98765-4321', 'carlos.demo@email.com', 50000, 48, 2894.50, 1.49,
        1, 'Honda Fit EX 2018 Automático 65.000km', 1, 'Test-Drive Agendado'
      ]
    );
  }
}

inicializarSeeds();

export default { db, query, get, run };
