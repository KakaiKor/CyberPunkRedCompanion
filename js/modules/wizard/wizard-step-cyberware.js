import { detailedCyberware } from '../../data.js';

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
                                ${group.items.map(item => `
                                    <tr data-name="${item.name}">
                                        <td style="text-align:center"><input type="checkbox" class="cyber-checkbox-table" value="${item.name}" data-cost="${item.cost}" data-humanity="${item.humanity}" ${selected.includes(item.name) ? 'checked' : ''}> </td>
                                        <td><strong>${item.name}</strong></td>
                                        <td>${item.install}</td>
                                        <td>${item.effect.substring(0, 60)}${item.effect.length > 60 ? '…' : ''}</td>
                                        <td>${item.cost} eb</td>
                                        <td>${item.humanity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('')}
        </div>
        <p class="note">Каждый имплант снижает человечность. Общая стоимость снаряжения и имплантов не должна превышать 2550 eb.</p>
    `;
}