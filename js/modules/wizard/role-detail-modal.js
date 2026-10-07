// js/modules/wizard/role-detail-modal.js
// Модалка «Подробнее о роли» для визарда.
// Создаётся один раз в body, потом переиспользуется.

import { roleSkillDescriptions } from '../../data/role-skill-descriptions.js';
import { rolesData } from '../../data/roles-data.js';

const ROLE_ICONS = {
    "Рокербой": "🎸", "Соло": "⚔️", "Нетраннер": "💻", "Техник": "🔧",
    "Медтех": "🩺", "Медиа": "📹", "Законник": "👮", "Менеджер": "💼",
    "Фиксер": "🤝", "Кочевник": "🏍️"
};

let modalEl = null;

function ensureModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.className = 'modal-overlay role-detail-overlay';
    modalEl.style.display = 'none';
    modalEl.innerHTML = `
        <div class="modal-content role-detail-modal">
            <div class="modal-header">
                <span class="modal-title" id="rdmTitle"></span>
                <button class="modal-close" id="rdmCloseTop">&times;</button>
            </div>
            <div class="modal-body" id="rdmBody"></div>
            <div class="modal-footer">
                <button class="cyber-btn" id="rdmSelectBtn">✓ Выбрать эту роль</button>
                <button class="modal-close-btn" id="rdmCloseBottom">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalEl);

    // Закрытие
    const close = () => { modalEl.style.display = 'none'; };
    modalEl.querySelector('#rdmCloseTop').addEventListener('click', close);
    modalEl.querySelector('#rdmCloseBottom').addEventListener('click', close);
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) close();
    });

    return modalEl;
}

/** Открыть модалку для конкретной роли. onSelect — колбэк выбора. */
export function openRoleDetailModal(roleName, onSelect) {
    const role = rolesData.find(r => r.name === roleName);
    if (!role) {
        alert('Роль не найдена: ' + roleName);
        return;
    }

    const skill = roleSkillDescriptions[role.skill]; // детальное описание из нового файла
    const icon = ROLE_ICONS[roleName] || '🎲';

    const modal = ensureModal();

    // Заголовок
    modal.querySelector('#rdmTitle').innerHTML = `${icon} ${roleName}`;

    // Тело
    const body = modal.querySelector('#rdmBody');
    let html = `
        <div class="role-detail-skill-badge">
            <span class="role-detail-skill-label">Ролевой навык</span>
            <span class="role-detail-skill-name">${role.skill}</span>
        </div>
    `;

    if (skill) {
        // ЧТО ЭТО
        html += `
            <div class="role-detail-section">
                <h4>📖 Что это</h4>
                <p>${escapeHtml(skill.what || '')}</p>
            </div>
        `;

        // КАК ПРИМЕНЯТЬ
        if (skill.how) {
            html += `
                <div class="role-detail-section">
                    <h4>⚙️ Как применять</h4>
                    <p>${escapeHtml(skill.how)}</p>
                </div>
            `;
        }

        // СПОСОБНОСТИ
        if (skill.abilities && skill.abilities.length) {
            html += `
                <div class="role-detail-section">
                    <h4>✨ Способности</h4>
                    <ul class="role-detail-abilities">
                        ${skill.abilities.map(a => `
                            <li>
                                <strong>${escapeHtml(a.name)}</strong>${a.cost ? `<span class="role-ability-cost">${escapeHtml(a.cost)}</span>` : ''}
                                — ${escapeHtml(a.effect || '')}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // ПРИМЕР
        if (skill.example || role.example) {
            html += `
                <div class="role-detail-section role-detail-example">
                    <h4>💡 Пример из игры</h4>
                    <p>${escapeHtml(skill.example || role.example)}</p>
                </div>
            `;
        }

        // РАНГИ
        const rankList = (skill.ranks && skill.ranks.length) ? skill.ranks : (role.ranks || []).map(r => ({ range: r.rank, desc: r.effects }));
        if (rankList.length) {
            html += `
                <div class="role-detail-section">
                    <h4>📊 Что дают ранги</h4>
                    <div class="role-detail-ranks">
                        ${rankList.map(r => `
                            <div class="role-rank-row">
                                <span class="role-rank-range">${escapeHtml(r.range)}</span>
                                <span class="role-rank-desc">${escapeHtml(r.desc)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } else {
        // Fallback — если в role-skill-descriptions.js нет записи, показываем только базовое из roles-data
        html += `
            <div class="role-detail-section">
                <h4>📖 Описание</h4>
                <p>${escapeHtml(role.description || '')}</p>
            </div>
        `;
        if (role.ranks && role.ranks.length) {
            html += `
                <div class="role-detail-section">
                    <h4>📊 Что дают ранги</h4>
                    <div class="role-detail-ranks">
                        ${role.ranks.map(r => `
                            <div class="role-rank-row">
                                <span class="role-rank-range">${escapeHtml(r.rank)}</span>
                                <span class="role-rank-desc">${escapeHtml(r.effects)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        if (role.example) {
            html += `
                <div class="role-detail-section role-detail-example">
                    <h4>💡 Пример</h4>
                    <p>${escapeHtml(role.example)}</p>
                </div>
            `;
        }
    }

    body.innerHTML = html;

    // Кнопка выбора
    const selectBtn = modal.querySelector('#rdmSelectBtn');
    // Убираем старые обработчики — клонируем кнопку
    const freshSelectBtn = selectBtn.cloneNode(true);
    selectBtn.parentNode.replaceChild(freshSelectBtn, selectBtn);
    freshSelectBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (typeof onSelect === 'function') onSelect(roleName);
    });

    modal.style.display = 'flex';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}