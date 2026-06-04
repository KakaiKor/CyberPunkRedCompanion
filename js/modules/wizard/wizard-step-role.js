// modules/wizard/wizard-step-role.js
import { rolesData } from '../../data/roles-data.js';

export function renderRoleStep(data) {
    const selectedRole = data.role || "Соло";
    const roleInfo = rolesData.find(r => r.name === selectedRole);
    const roleRank = data.roleRank ?? 4;

    // Иконки для ролей (можно заменить на emoji или font-awesome)
    const roleIcons = {
        "Рокербой": "🎸", "Соло": "⚔️", "Нетраннер": "💻", "Техник": "🔧",
        "Медтех": "🩺", "Медиа": "📹", "Законник": "👮", "Менеджер": "💼",
        "Фиксер": "🤝", "Кочевник": "🏍️"
    };

    const rolesList = rolesData.map(role => `
        <div class="role-card-v2 ${selectedRole === role.name ? 'active' : ''}" data-role="${role.name}">
            <div class="role-card-icon">${roleIcons[role.name] || "🎲"}</div>
            <div class="role-card-name">${role.name}</div>
            <div class="role-card-skill">${role.skill}</div>
        </div>
    `).join('');

    // Детальная информация о выбранной роли
    const ranksHtml = roleInfo.ranks.map(r => `<li><strong>Ранг ${r.rank}:</strong> ${r.effects}</li>`).join('');

    return `
        <h3>🎭 Выберите роль</h3>
        <div class="role-grid-v2">
            ${rolesList}
        </div>
        <div class="role-detail-panel">
            <div class="role-detail-header">
                <span class="role-detail-icon">${roleIcons[selectedRole] || "🎲"}</span>
                <span class="role-detail-name">${selectedRole}</span>
                <span class="role-detail-skill">${roleInfo.skill}</span>
                <div class="role-rank-control">
                    <label>Уровень навыка:</label>
                    <input type="number" id="roleRank" min="1" max="10" value="${roleRank}" step="1">
                </div>
            </div>
            <div class="role-detail-description">${roleInfo.description}</div>
            <details class="role-detail-ranks">
                <summary>📊 Что дают ранги</summary>
                <ul>${ranksHtml}</ul>
            </details>
            <div class="role-detail-example">💡 <strong>Пример:</strong> ${roleInfo.example}</div>
        </div>
        <p class="note">Ролевой навык определяет уникальные способности персонажа. Повышайте ранг для усиления.</p>
    `;
}