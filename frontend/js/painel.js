import { apiFetch } from './api.js';
import { salvarSessao, obterUsuarioLogado, limparSessao } from './auth.js';

const secaoLogin = document.getElementById('secao-login');
const secaoDashboard = document.getElementById('secao-dashboard');
const userBar = document.getElementById('painel-user-bar');

function formatarMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function inicializarPainel() {
  const usuario = obterUsuarioLogado();
  if (!usuario) {
    secaoLogin.style.display = 'block';
    secaoDashboard.style.display = 'none';
    userBar.innerHTML = '';
    return;
  }

  secaoLogin.style.display = 'none';
  secaoDashboard.style.display = 'block';
  document.getElementById('metric-cargo').textContent = `${usuario.nome} (${usuario.cargo.toUpperCase()})`;

  userBar.innerHTML = `
    <span style="font-size: 0.88rem; font-weight: 700;">Olá, ${usuario.nome}</span>
    <button type="button" id="btn-sair-painel" class="btn btn-outline" style="min-height: 38px; padding: 6px 14px;">
      Sair
    </button>
  `;

  document.getElementById('btn-sair-painel')?.addEventListener('click', async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    limparSessao();
    inicializarPainel();
  });

  await carregarDadosDashboard();
}

async function carregarDadosDashboard() {
  try {
    const [carros, leads] = await Promise.all([
      apiFetch('/api/veiculos'),
      apiFetch('/api/leads')
    ]);

    document.getElementById('metric-total-carros').textContent = String(carros.length);
    document.getElementById('metric-total-leads').textContent = String(leads.length);

    const leadsContainer = document.getElementById('lista-leads-container');
    if (leads.length === 0) {
      leadsContainer.innerHTML = `<p style="color: var(--text-muted);">Nenhum lead registrado até o momento.</p>`;
    } else {
      leadsContainer.innerHTML = leads.map(l => `
        <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 12px; background: #F8FAFC;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-family: var(--font-mono); color: var(--primary); font-size: 0.85rem;">${l.protocolo}</strong>
            <span class="badge badge-status-disponivel">${l.status}</span>
          </div>
          <div style="font-weight: 800; font-size: 1rem;">${l.nome_cliente} • ${l.telefone}</div>
          <div style="font-size: 0.86rem; color: var(--text-body); margin-top: 4px;">
            Veículo: <strong>${l.marca} ${l.modelo}</strong> (${l.tipo_atendimento})<br>
            Entrada: ${formatarMoeda(l.valor_entrada)} + ${l.prazo_meses}x de <strong>${formatarMoeda(l.valor_parcela)}</strong>
            ${l.possui_troca ? `<br>Troca oferecida: <em>${l.descricao_troca}</em>` : ''}
          </div>
        </div>
      `).join('');
    }

    const estoqueContainer = document.getElementById('estoque-admin-lista');
    estoqueContainer.innerHTML = carros.map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-subtle); gap: 12px; flex-wrap: wrap;">
        <div>
          <strong>#${c.id} — ${c.marca} ${c.modelo} ${c.versao}</strong> (${c.ano_modelo}) • ${formatarMoeda(c.preco)}
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label for="status-carro-${c.id}" class="spec-label">Status:</label>
          <select id="status-carro-${c.id}" class="form-select select-status-veiculo" data-id="${c.id}" style="width: auto; min-height: 36px; padding: 4px 10px;">
            <option value="Disponível" ${c.status === 'Disponível' ? 'selected' : ''}>Disponível</option>
            <option value="Reservado" ${c.status === 'Reservado' ? 'selected' : ''}>Reservado</option>
            <option value="Vendido" ${c.status === 'Vendido' ? 'selected' : ''}>Vendido</option>
          </select>
        </div>
      </div>
    `).join('');

    estoqueContainer.querySelectorAll('.select-status-veiculo').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const status = e.currentTarget.value;
        await apiFetch(`/api/veiculos/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
        await carregarDadosDashboard();
      });
    });
  } catch (err) {
    limparSessao();
    inicializarPainel();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarPainel();

  document.getElementById('btn-demo-lojista')?.addEventListener('click', () => {
    document.getElementById('login-email').value = 'diretoria@autoprime-demo.com.br';
    document.getElementById('login-senha').value = 'AutoPrime@2026';
  });

  document.getElementById('btn-demo-vendedor')?.addEventListener('click', () => {
    document.getElementById('login-email').value = 'vendas@autoprime-demo.com.br';
    document.getElementById('login-senha').value = 'Vendas@2026';
  });

  document.getElementById('form-login-painel')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const erroEl = document.getElementById('login-erro');
    erroEl.textContent = '';

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('login-email').value,
          senha: document.getElementById('login-senha').value
        })
      });
      salvarSessao(res.token, res.usuario);
      await inicializarPainel();
    } catch (err) {
      erroEl.innerHTML = `<div style="color: var(--danger); font-weight: 700; font-size: 0.88rem;">${err.message}</div>`;
    }
  });

  document.getElementById('form-novo-veiculo')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fb = document.getElementById('nv-feedback');
    try {
      await apiFetch('/api/veiculos', {
        method: 'POST',
        body: JSON.stringify({
          marca: document.getElementById('nv-marca').value,
          modelo: document.getElementById('nv-modelo').value,
          versao: document.getElementById('nv-versao').value,
          ano_fabricacao: Number(document.getElementById('nv-ano').value),
          ano_modelo: Number(document.getElementById('nv-ano').value),
          preco: Number(document.getElementById('nv-preco').value),
          quilometragem: Number(document.getElementById('nv-km').value),
          carroceria: document.getElementById('nv-carroceria').value,
          cambio: document.getElementById('nv-cambio').value,
          combustivel: document.getElementById('nv-combustivel').value
        })
      });
      fb.innerHTML = `<span style="color: var(--success); font-weight: 700;">✓ Veículo adicionado ao estoque!</span>`;
      e.target.reset();
      await carregarDadosDashboard();
    } catch (err) {
      fb.innerHTML = `<span style="color: var(--danger); font-weight: 700;">${err.message}</span>`;
    }
  });
});
