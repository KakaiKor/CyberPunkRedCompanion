// modules/roles/render-roles.js
import { rolesData } from '../../data/roles-data.js';

export function renderRoles() {
    const container = document.getElementById('rolesContainer');
    if (!container) return;

    let html = '';
    for (let role of rolesData) {
        html += `
            <details class="role-details">
                <summary class="role-summary">
                    <span class="role-name">${role.name}</span>
                    <span class="role-skill">${role.skill}</span>
                </summary>
                <div class="role-content">
                    <p><strong>Описание:</strong> ${role.description}</p>
                    <p><strong>Что дают ранги:</strong></p>
                    <ul>
                        ${role.ranks.map(r => `<li><strong>Ранг ${r.rank}:</strong> ${r.effects}</li>`).join('')}
                    </ul>
                    <p><strong>Пример использования:</strong> ${role.example}</p>
                </div>
            </details>
        `;
    }
    container.innerHTML = html;
}