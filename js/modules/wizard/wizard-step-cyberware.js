import { detailedCyberware } from '../../data.js';
import { getRequirements, areRequirementsMet } from '../../data/cyberware-requirements.js';  // [REQ]
import { cyberwareRecommendations } from '../../data/cyberware-recommendations.js';
export function renderCyberwareStep(data) {
    const groups = {
        "нейро": { name: "🧠 Нейроимпланты", items: [] },
        "оптика": { name: "👁️ Оптика", items: [] },
        "аудио": { name: "🎧 Аудио", items: [] },
        "внутренние": { name: "💪 Внутренние", items: [] },
        "внешние": { name: "🛡️ Внешние", items: [] },
        "конечности": { name: "🦿 Конечности", items: [] },
        "боргирование": { name: "🤖 Боргирование", items: [] },
        "стилевые": { name: "✨ Стилевые", items: [] }
    };
    detailedCyberware.forEach(item => {
        if (groups[item.type]) groups[item.type].items.push(item);
    });
    Object.keys(groups).forEach(key => { if (groups[key].items.length === 0) delete groups[key]; });

    const selected = data.cyberware || [];
    const totalSpent = data.totalSpentOnGearAndCyber || 0;
    const remaining = 2550 - totalSpent;
    const role = data.role || 'Соло';                                  // [REC]
    const recommendations = cyberwareRecommendations[role] || [];      // [REC]
    return `
        <h3>🦾 Киберимпланты (общий бюджет 2550 eb на снаряжение + импланты)</h3>
        <div class="cyber-budget-info">Осталось: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong> eb</div>
        <div class="cyber-controls">
            <input type="text" id="cyberSearchTable" placeholder="🔍 Поиск имплантов...">
        </div>
        <div id="cyberTablesContainer">
            ${Object.entries(groups).map(([key, group]) => `
                <div class="cyber-group-table" data-group="${key}">
                    <h4 class="collapsible-header">📦 ${group.name} <span class="collapse-icon">▼</span></h4>
                    <div class="table-wrapper">
                        <table class="cyber-table">
                            <thead>
                                <tr><th style="width:30px">✓</th><th>Название</th><th>Установка</th><th>Эффект</th><th>Цена</th><th>ПЧ</th></tr>
                            </thead>
                            <tbody>
                                ${group.items.map(item => {
    const isSelected = selected.includes(item.name);
    const reqs = getRequirements(item.name);
    const isLocked = !isSelected && reqs.length > 0
        && !areRequirementsMet(item.name, selected);
    const isRecommended = !isLocked && recommendations.includes(item.name);   // [REC]

    // Иконки рядом с названием
    const lockIcon = isLocked
        ? ` <span class="cyber-lock-icon" aria-label="Заблокировано">🔒</span>` : '';
    const starIcon = isRecommended
        ? ` <span class="cyber-rec-icon" aria-label="Рекомендуется для роли">⭐</span>` : '';

    // Классы на строке
    const rowClasses = [
        isLocked ? 'cyber-locked' : '',
        isRecommended ? 'cyber-recommended' : ''
    ].filter(Boolean).join(' ');

    const rowTitle = isLocked
        ? ` title="Требуется: ${reqs.join(', ')}"`
        : (isRecommended ? ` title="Рекомендуется для роли «${role}»"` : '');

    const cbClass = isLocked
        ? 'cyber-checkbox-table cyber-locked-checkbox'
        : 'cyber-checkbox-table';

    return `
        <tr data-name="${item.name}" class="${rowClasses}"${rowTitle} data-required="${reqs.join(', ')}">
            <td style="text-align:center"><input type="checkbox" class="${cbClass}" value="${item.name}" data-cost="${item.cost}" data-humanity="${item.humanity}" ${isSelected ? 'checked' : ''}> </td>
            <td><strong>${item.name}</strong>${lockIcon}${starIcon}</td>
            <td>${item.install}</td>
            <td>${item.effect.substring(0, 60)}${item.effect.length > 60 ? '…' : ''}</td>
            <td>${item.cost} eb</td>
            <td>${item.humanity}</td>
        </tr>
    `;
}).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('')}
        </div>
        <p class="note">Каждый имплант снижает человечность. Общая стоимость снаряжения и имплантов не должна превышать 2550 eb.</p>
    `;
}