import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-lgpd-autoprime');
  const fb = document.getElementById('lgpd-feedback');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/leads/lgpd', {
        method: 'POST',
        body: JSON.stringify({
          nome_titular: document.getElementById('lgpd-nome').value,
          email_titular: document.getElementById('lgpd-email').value,
          tipo_direito: document.getElementById('lgpd-direito').value
        })
      });
      fb.innerHTML = `
        <div style="background: var(--success-bg); color: var(--success); padding: 12px; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.86rem;">
          ✓ Protocolo gerado: ${res.protocolo}. ${res.prazo_resposta}
        </div>
      `;
      form.reset();
    } catch (err) {
      fb.innerHTML = `<div style="color: var(--danger); font-weight: 700;">${err.message}</div>`;
    }
  });
});
