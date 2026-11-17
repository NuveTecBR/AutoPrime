import { apiFetch, escapeHtml } from './api.js';

let veiculosCache = [];
let carroceriaAtiva = 'Todas';
let ultimoElementoFocado = null;
let debounceTimer = null;

const container = document.getElementById('catalogo-container');
const contadorEl = document.getElementById('contador-veiculos');
const drawer = document.getElementById('veiculo-drawer');
const backdrop = document.getElementById('drawer-backdrop');
const drawerBody = document.getElementById('drawer-body-content');

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizarSkeletons() {
  container.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-box" style="height: 190px; width: 100%;"></div>
      <div class="skeleton-box" style="height: 22px; width: 70%;"></div>
      <div class="skeleton-box" style="height: 16px; width: 50%;"></div>
      <div class="skeleton-box" style="height: 48px; width: 100%; margin-top: auto;"></div>
    </div>
  `).join('');
}

function renderizarErro(mensagem) {
  contadorEl.textContent = 'Falha ao carregar veículos';
  container.innerHTML = `
    <div class="state-box" role="alert">
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--danger); margin-bottom: 8px;">
        Não foi possível carregar o estoque agora
      </h3>
      <p style="font-family: var(--font-serif); color: var(--text-muted); margin-bottom: 18px;">
        ${mensagem}
      </p>
      <button type="button" id="btn-retry-estoque" class="btn btn-primary">
        Tentar Novamente
      </button>
    </div>
  `;
  document.getElementById('btn-retry-estoque')?.addEventListener('click', carregarVeiculos);
}

function renderizarEmptyState() {
  contadorEl.textContent = '0 veículos encontrados';
  container.innerHTML = `
    <div class="state-box">
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">
        Nenhum veículo encontrado com estes filtros
      </h3>
      <p style="font-family: var(--font-serif); color: var(--text-muted); margin-bottom: 18px;">
        Tente ampliar a faixa de preço máximo ou limpar os filtros de marca e transmissão para ver todo o nosso pátio.
      </p>
      <button type="button" id="btn-empty-reset" class="btn btn-dark">
        Redefinir Todos os Filtros
      </button>
    </div>
  `;
  document.getElementById('btn-empty-reset')?.addEventListener('click', limparFiltros);
}

function renderizarCards(lista) {
  if (!lista || lista.length === 0) {
    renderizarEmptyState();
    return;
  }

  contadorEl.textContent = `${lista.length} ${lista.length === 1 ? 'veículo periciado disponível' : 'veículos periciados no estoque'}`;

  container.innerHTML = lista.map(carro => {
    const statusClass = carro.status === 'Disponível' ? 'badge-status-disponivel' : 'badge-status-reservado';
    const parcelaEstimada = Math.round((carro.preco * 0.7) * 0.0295);

    return `
      <article class="vehicle-card">
        <div class="vehicle-media">
          <img
            src="${carro.imagem_url}"
            alt="${carro.marca} ${carro.modelo} ${carro.versao} cor ${carro.cor}, ano ${carro.ano_modelo}"
            class="vehicle-img"
            loading="lazy"
          >
          <div class="vehicle-badges">
            <span class="badge badge-dekra"><span aria-hidden="true">🛡️</span> ${carro.laudo_cautelar}</span>
            <span class="badge ${statusClass}">${carro.status}</span>
          </div>
        </div>

        <div class="vehicle-body">
          <div class="vehicle-brand-year">
            <span>${carro.marca} • ${carro.carroceria}</span>
            <span>${carro.ano_fabricacao}/${carro.ano_modelo}</span>
          </div>

          <h3 class="vehicle-title">${carro.modelo}</h3>
          <p class="vehicle-version">${carro.versao}</p>

          <div class="vehicle-specs-row">
            <div class="spec-item">
              <span class="spec-label">KM Auditada</span>
              <span class="spec-val">${Number(carro.quilometragem).toLocaleString('pt-BR')} km</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Câmbio</span>
              <span class="spec-val">${carro.cambio}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Combustível</span>
              <span class="spec-val">${carro.combustivel}</span>
            </div>
          </div>

          <div class="vehicle-footer">
            <div class="vehicle-price-group">
              <span class="vehicle-price-label">Valor à Vista ou Troca</span>
              <span class="vehicle-price">${formatarMoeda(carro.preco)}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                ou ~R$ ${parcelaEstimada.toLocaleString('pt-BR')}/mês
              </span>
            </div>
            <button
              type="button"
              class="btn btn-primary btn-abrir-simulacao"
              data-id="${carro.id}"
              aria-label="Simular financiamento e ver detalhes do ${carro.marca} ${carro.modelo}"
            >
              Simular & Ver
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  container.querySelectorAll('.btn-abrir-simulacao').forEach(btn => {
    btn.addEventListener('click', (e) => {
      ultimoElementoFocado = e.currentTarget;
      const id = Number(e.currentTarget.getAttribute('data-id'));
      abrirDrawerVeiculo(id);
    });
  });
}

export async function carregarVeiculos() {
  renderizarSkeletons();

  const params = new URLSearchParams();
  const busca = document.getElementById('filtro-busca')?.value.trim();
  const marca = document.getElementById('filtro-marca')?.value;
  const cambio = document.getElementById('filtro-cambio')?.value;
  const combustivel = document.getElementById('filtro-combustivel')?.value;
  const precoMax = document.getElementById('filtro-preco')?.value;

  if (busca) params.set('busca', busca);
  if (carroceriaAtiva && carroceriaAtiva !== 'Todas') params.set('carroceria', carroceriaAtiva);
  if (marca && marca !== 'Todas') params.set('marca', marca);
  if (cambio && cambio !== 'Todos') params.set('cambio', cambio);
  if (combustivel && combustivel !== 'Todos') params.set('combustivel', combustivel);
  if (precoMax && Number(precoMax) > 0) params.set('precoMax', precoMax);

  try {
    veiculosCache = await apiFetch(`/api/veiculos?${params.toString()}`);
    renderizarCards(veiculosCache);
  } catch (err) {
    renderizarErro(err.message);
  }
}

function limparFiltros() {
  document.getElementById('filtro-busca').value = '';
  document.getElementById('filtro-marca').value = 'Todas';
  document.getElementById('filtro-cambio').value = 'Todos';
  document.getElementById('filtro-combustivel').value = 'Todos';
  document.getElementById('filtro-preco').value = '0';
  carroceriaAtiva = 'Todas';

  document.querySelectorAll('.pill-btn').forEach(b => {
    const isTodas = b.getAttribute('data-carroceria') === 'Todas';
    b.classList.toggle('active', isTodas);
    b.setAttribute('aria-pressed', isTodas ? 'true' : 'false');
  });

  carregarVeiculos();
}

async function abrirDrawerVeiculo(veiculoId) {
  const carro = veiculosCache.find(v => v.id === veiculoId);
  if (!carro) return;

  const entradaSugerida = Math.round(carro.preco * 0.30);
  document.getElementById('drawer-marca-ano').textContent = `${carro.marca} • ${carro.ano_fabricacao}/${carro.ano_modelo} • Final Placa ${carro.final_placa}`;
  document.getElementById('drawer-titulo').textContent = `${carro.modelo} ${carro.versao}`;

  drawerBody.innerHTML = `
    <div style="margin-bottom: 20px;">
      <img
        src="${carro.imagem_url}"
        alt="${carro.marca} ${carro.modelo}"
        style="width: 100%; height: 220px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 14px;"
      >
      <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
        <div>
          <span style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Preço à Vista / Base de Troca</span>
          <div style="font-family: var(--font-mono); font-size: 1.75rem; font-weight: 800; color: var(--text-main);">${formatarMoeda(carro.preco)}</div>
        </div>
        <span class="badge badge-status-disponivel">Garantia ${carro.garantia_meses} Meses</span>
      </div>
      <p style="font-family: var(--font-serif); font-size: 0.95rem; color: var(--text-body); margin-bottom: 14px;">
        ${carro.descricao}
      </p>
      <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.85rem;">
        <strong style="display: block; margin-bottom: 4px; color: var(--text-main);">Principais Equipamentos de Série:</strong>
        <span style="color: var(--text-muted);">${carro.itens_serie}</span>
      </div>
    </div>

    <hr style="border: 0; border-top: 1px solid var(--border-subtle); margin: 22px 0;">

    <!-- Simulador de Financiamento Server-Side -->
    <section aria-labelledby="simulador-heading">
      <h3 id="simulador-heading" style="font-size: 1.15rem; font-weight: 800; margin-bottom: 12px;">
        1. Simulador Oficial Tabela Price (Cálculo no Servidor)
      </h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label for="sim-entrada" class="form-label">Valor de Entrada (R$)</label>
          <input type="number" id="sim-entrada" class="form-input" value="${entradaSugerida}" min="0" max="${carro.preco - 1000}" step="1000">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label for="sim-prazo" class="form-label">Prazo (Meses)</label>
          <select id="sim-prazo" class="form-select">
            <option value="12">12x meses</option>
            <option value="24">24x meses</option>
            <option value="36">36x meses</option>
            <option value="48" selected>48x meses</option>
            <option value="60">60x meses</option>
          </select>
        </div>
      </div>

      <div style="margin-top: 12px;">
        <button type="button" id="btn-recalcular-price" class="btn btn-dark" style="width: 100%;">
          Atualizar Cálculo de Parcelas
        </button>
      </div>

      <div id="sim-resultado-box" class="sim-result-box" aria-live="polite">
        Calculando financiamento no servidor...
      </div>
    </section>

    <!-- Formulário de Reserva de Test-Drive / Avaliação de Troca -->
    <section aria-labelledby="reserva-heading">
      <h3 id="reserva-heading" style="font-size: 1.15rem; font-weight: 800; margin-bottom: 12px;">
        2. Agendar Test-Drive ou Enviar Proposta no WhatsApp
      </h3>

      <form id="form-lead-autoprime" novalidate>
        <!-- Honeypot Invisível Anti-Bot (Pilar 12) -->
        <div style="display: none;" aria-hidden="true">
          <label for="empresa_website_honeypot">Não preencha este campo</label>
          <input type="text" id="empresa_website_honeypot" name="empresa_website_honeypot" tabindex="-1" autocomplete="off">
        </div>

        <div class="form-group">
          <label for="lead-tipo" class="form-label">Modalidade de Atendimento</label>
          <select id="lead-tipo" class="form-select" required>
            <option value="Simulação & Test-Drive">Agendar Test-Drive + Aprovar Ficha</option>
            <option value="Avaliação de Troca">Incluir Meu Usado na Troca (Superavaliação FIPE)</option>
            <option value="Proposta à Vista">Proposta de Compra à Vista / PIX</option>
          </select>
        </div>

        <div class="form-group">
          <label for="lead-nome" class="form-label">Seu Nome Completo *</label>
          <input type="text" id="lead-nome" class="form-input" placeholder="Ex: Marcos Vinícius Oliveira" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label for="lead-telefone" class="form-label">WhatsApp com DDD *</label>
            <input type="tel" id="lead-telefone" class="form-input" placeholder="(11) 99888-7766" required>
          </div>
          <div class="form-group">
            <label for="lead-email" class="form-label">E-mail (Opcional)</label>
            <input type="email" id="lead-email" class="form-input" placeholder="voce@email.com">
          </div>
        </div>

        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer;">
            <input type="checkbox" id="lead-possui-troca">
            Desejo dar meu veículo atual como parte de pagamento
          </label>
        </div>

        <div class="form-group" id="grupo-descricao-troca" style="display: none;">
          <label for="lead-desc-troca" class="form-label">Qual o modelo, ano e KM aproximada do seu carro?</label>
          <input type="text" id="lead-desc-troca" class="form-input" placeholder="Ex: Honda Fit EX 2019 Automático com 55.000 km">
        </div>

        <!-- Consentimento LGPD não marcado por padrão (Art. 6º III LGPD) -->
        <div class="form-group" style="background: #F8FAFC; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 0.82rem; color: var(--text-body); cursor: pointer;">
            <input type="checkbox" id="lead-lgpd" style="margin-top: 4px;" required>
            <span>
              Autorizo o uso do meu nome e WhatsApp exclusivamente para retorno sobre esta simulação, conforme a <a href="/termos.html?secao=privacidade" style="color: var(--accent-blue); font-weight: 700;">Política de Privacidade LGPD</a>. (Nota: site demonstrativo com dados fictícios).
            </span>
          </label>
        </div>

        <div id="lead-feedback" aria-live="polite" style="margin-bottom: 12px;"></div>

        <button type="submit" id="btn-submit-lead" class="btn btn-primary" style="width: 100%;">
          Gerar Protocolo e Chamar Consultor
        </button>
      </form>
    </section>
  `;

  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.getElementById('btn-fechar-drawer')?.focus();

  const atualizarSimulacao = async () => {
    const box = document.getElementById('sim-resultado-box');
    const valor_entrada = Number(document.getElementById('sim-entrada').value || 0);
    const prazo_meses = Number(document.getElementById('sim-prazo').value || 48);

    try {
      const calc = await apiFetch('/api/veiculos/simular', {
        method: 'POST',
        body: JSON.stringify({ veiculo_id: carro.id, valor_entrada, prazo_meses })
      });

      box.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Parcela Estimada (${calc.prazo_meses}x)
          </span>
          <strong style="font-family: var(--font-mono); font-size: 1.5rem; color: var(--primary);">
            ${formatarMoeda(calc.valor_parcela)}/mês
          </strong>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-body); margin-top: 6px; display: flex; justify-content: space-between; flex-wrap: wrap;">
          <span>Valor Financiado: <strong>${formatarMoeda(calc.valor_financiado)}</strong></span>
          <span>Taxa: <strong>${calc.taxa_juros_mensal}% a.m.</strong></span>
        </div>
      `;
    } catch (err) {
      box.innerHTML = `<span style="color: var(--danger); font-weight: 700;">${err.message}</span>`;
    }
  };

  await atualizarSimulacao();

  document.getElementById('btn-recalcular-price')?.addEventListener('click', atualizarSimulacao);

  const chkTroca = document.getElementById('lead-possui-troca');
  const grupoTroca = document.getElementById('grupo-descricao-troca');
  chkTroca?.addEventListener('change', () => {
    grupoTroca.style.display = chkTroca.checked ? 'block' : 'none';
  });

  document.getElementById('form-lead-autoprime')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('lead-feedback');
    const btnSubmit = document.getElementById('btn-submit-lead');

    const payload = {
      veiculo_id: carro.id,
      tipo_atendimento: document.getElementById('lead-tipo').value,
      nome_cliente: document.getElementById('lead-nome').value,
      telefone: document.getElementById('lead-telefone').value,
      email: document.getElementById('lead-email').value,
      valor_entrada: Number(document.getElementById('sim-entrada').value || 0),
      prazo_meses: Number(document.getElementById('sim-prazo').value || 48),
      possui_troca: document.getElementById('lead-possui-troca').checked,
      descricao_troca: document.getElementById('lead-desc-troca').value,
      consentimento_lgpd: document.getElementById('lead-lgpd').checked,
      empresa_website_honeypot: document.getElementById('empresa_website_honeypot').value
    };

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Processando Protocolo...';

    try {
      const res = await apiFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      feedback.innerHTML = `
        <div style="background: var(--success-bg); border: 1.5px solid var(--success); color: #065F46; padding: 16px; border-radius: var(--radius-sm);">
          <strong style="display: block; font-size: 0.98rem; margin-bottom: 4px;">
            ✓ Solicitação Registrada! Protocolo: <span style="font-family: var(--font-mono);">${res.protocolo}</span>
          </strong>
          <p style="font-size: 0.85rem; margin-bottom: 12px;">
            Sua simulação de ${res.calculo.prazo_meses}x de ${formatarMoeda(res.calculo.valor_parcela)} foi salva no painel do lojista.
          </p>
          <a href="${res.whatsapp_url}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="width: 100%;">
            Abrir Conversa no WhatsApp com Protocolo
          </a>
        </div>
      `;
      btnSubmit.textContent = 'Protocolo Gerado com Sucesso ✓';
    } catch (err) {
      feedback.innerHTML = `
        <div style="background: var(--danger-bg); border: 1.5px solid var(--danger); color: var(--danger); padding: 12px; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.88rem;">
          ${err.message}
        </div>
      `;
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Gerar Protocolo e Chamar Consultor';
    }
  });
}

function fecharDrawer() {
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (ultimoElementoFocado) {
    ultimoElementoFocado.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarVeiculos();

  document.getElementById('filtro-busca')?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(carregarVeiculos, 280);
  });

  ['filtro-marca', 'filtro-cambio', 'filtro-combustivel', 'filtro-preco'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', carregarVeiculos);
  });

  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      carroceriaAtiva = btn.getAttribute('data-carroceria');
      carregarVeiculos();
    });
  });

  document.getElementById('btn-reset-filtros')?.addEventListener('click', limparFiltros);
  document.getElementById('btn-fechar-drawer')?.addEventListener('click', fecharDrawer);
  backdrop?.addEventListener('click', fecharDrawer);

  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') {
      fecharDrawer();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = drawer.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
});
