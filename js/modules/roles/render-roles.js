// modules/roles/render-roles.js
import { rolesData } from '../../data/roles-data.js';

export function renderRoles() {
    const container = document.getElementById('rolesContainer');
    if (!container) return;

    // Добавляем поисковую строку и сетку карточек
    const html = `
        <div class="roles-controls">
            <input type="text" id="rolesSearchInput" placeholder="🔍 Поиск роли или навыка...">
        </div>
        <div class="roles-grid" id="rolesGrid"></div>
        <div id="roleModal" class="modal-overlay" style="display: none;">
            <div class="modal-content role-modal-content">
                <div class="modal-header">
                    <span class="modal-title" id="roleModalTitle"></span>
                    <button class="modal-close" id="roleModalClose">&times;</button>
                </div>
                <div class="modal-body" id="roleModalBody"></div>
                <div class="modal-footer">
                    <button class="modal-close-btn" id="roleModalCloseBtn">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;

    const searchInput = document.getElementById('rolesSearchInput');
    const grid = document.getElementById('rolesGrid');
    
    function renderRoleCards(filter = '') {
        const term = filter.toLowerCase();
        const filtered = rolesData.filter(role => 
            role.name.toLowerCase().includes(term) || 
            role.skill.toLowerCase().includes(term)
        );
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-results">😵 Ничего не найдено. Попробуйте другой запрос.</div>';
            return;
        }
        grid.innerHTML = filtered.map(role => `
            <div class="role-card" data-role-name="${role.name}">
                <div class="role-icon">${getRoleIcon(role.name)}</div>
                <div class="role-info">
                    <div class="role-name">${role.name}</div>
                    <div class="role-skill">🎭 ${role.skill}</div>
                    <div class="role-desc-preview">${role.description.substring(0, 80)}${role.description.length > 80 ? '…' : ''}</div>
                </div>
                <button class="role-details-btn" data-role-name="${role.name}">📖 Подробнее</button>
            </div>
        `).join('');
        
        // Привязываем обработчики к кнопкам "Подробнее"
        document.querySelectorAll('.role-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const roleName = btn.dataset.roleName;
                const role = rolesData.find(r => r.name === roleName);
                if (role) showRoleModal(role);
            });
        });
    }

    function showRoleModal(role) {
        const modal = document.getElementById('roleModal');
        const titleEl = document.getElementById('roleModalTitle');
        const bodyEl = document.getElementById('roleModalBody');
        
        titleEl.textContent = `${getRoleIcon(role.name)} ${role.name}`;
        bodyEl.innerHTML = `
            <div class="role-modal-detail">
                <p><strong>🎭 Ролевой навык:</strong> ${role.skill}</p>
                <p><strong>📖 Описание:</strong> ${role.description}</p>
                <p><strong>📊 Ранги:</strong></p>
                <ul>
                    ${role.ranks.map(r => `<li><strong>Ранг ${r.rank}:</strong> ${r.effects}</li>`).join('')}
                </ul>
                <p><strong>💡 Пример использования:</strong> ${role.example}</p>
            </div>
        `;
        modal.style.display = 'flex';
        
        const closeModal = () => {
            modal.style.display = 'none';
        };
        const closeBtns = ['roleModalClose', 'roleModalCloseBtn'];
        closeBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.removeEventListener('click', closeModal);
                btn.addEventListener('click', closeModal);
            }
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    renderRoleCards();
    searchInput.addEventListener('input', (e) => renderRoleCards(e.target.value));
}

function getRoleIcon(roleName) {
    const icons = {
        "Рокербой": "🎸",
        "Соло": "⚔️",
        "Нетраннер": "💻",
        "Техник": "🔧",
        "Медтех": "🩺",
        "Медиа": "📹",
        "Законник": "👮",
        "Менеджер": "💼",
        "Фиксер": "🤝",
        "Кочевник": "🏍️"
    };
    return icons[roleName] || "🎲";
}