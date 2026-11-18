/**
 * AutoPrime — Gestão de Consentimento de Cookies LGPD e Rodapé Transparente
 */

const COOKIE_KEY = 'autoprime_lgpd_cookies_v1';

export function inicializarGovernancaFrontend() {
  renderizarBannerCookies();
}

function renderizarBannerCookies() {
  if (localStorage.getItem(COOKIE_KEY)) return;

  const banner = document.createElement('aside');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Preferências de Cookies e Privacidade LGPD');
  banner.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
        <div>
          <strong style="font-size: 1rem; color: #FFFFFF; display: block; margin-bottom: 4px;">
            <span aria-hidden="true">🍪</span> Transparência de Cookies e Privacidade (LGPD)
          </strong>
          <p style="font-size: 0.875rem; color: #CBD5E1; max-width: 72ch;">
            Utilizamos cookies essenciais para segurança de sessão e simulações financeiras. Nenhum cookie analítico ou de marketing é ativado sem seu consentimento livre e informado. Consulte nossos <a href="./termos.html" style="color: #FCA5A5; text-decoration: underline;">Termos de Uso, Política de Privacidade e Direitos do Titular</a>.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button type="button" id="btn-cookies-essenciais" class="btn btn-outline" style="color: #0F172A;">
            Apenas Essenciais
          </button>
          <button type="button" id="btn-cookies-todos" class="btn btn-primary">
            Aceitar Todos
          </button>
        </div>
      </div>
      <div style="display: flex; gap: 18px; font-size: 0.8rem; color: #CBD5E1; flex-wrap: wrap;">
        <label><input type="checkbox" checked disabled> Essenciais (Obrigatórios)</label>
        <label><input type="checkbox" id="chk-cookie-analytics"> Analíticos de Desempenho</label>
        <label><input type="checkbox" id="chk-cookie-marketing"> Funcionais & Atendimento</label>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('btn-cookies-essenciais')?.addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ essenciais: true, analiticos: false, marketing: false, data: new Date().toISOString() }));
    banner.remove();
  });

  document.getElementById('btn-cookies-todos')?.addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ essenciais: true, analiticos: true, marketing: true, data: new Date().toISOString() }));
    banner.remove();
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarGovernancaFrontend);
  } else {
    inicializarGovernancaFrontend();
  }
}
