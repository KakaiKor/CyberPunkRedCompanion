import { rangedWeapons, meleeWeapons, armors, gearItems } from '../../data.js';

export function renderGearStep(data, getItemCost) {
    const gear = data.gear || { weapons: [], armor: { body: "", head: "" }, items: [] };
    const totalSpent = data.totalSpentOnGearAndCyber || 0;
    const remaining = 2550 - totalSpent;

    return `
        <h3>🛡️ Снаряжение (общий бюджет 2550 eb на снаряжение + импланты)</h3>
        <div class="gear-budget">Осталось: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong> eb</div>
        
        <div class="gear-filter">
            <label>Показать:
                <select id="gearCategoryFilter">
                    <option value="all">Всё</option>
                    <option value="weapons">Оружие</option>
                    <option value="armor">Броня</option>
                    <option value="items">Снаряжение</option>
                </select>
            </label>
            <input type="text" id="gearSearch" placeholder="🔍 Поиск...">
        </div>

        <div id="weaponsSection" class="gear-section">
            <h4>🔫 Дальнобойное оружие</h4>
            ${renderTable(rangedWeapons, 'weapon', gear.weapons, ['Название', 'Навык', 'Урон', 'Маг.', 'СКОР', 'Рук'])}
            <h4>🗡️ Холодное оружие</h4>
            ${renderTable(meleeWeapons, 'weapon', gear.weapons, ['Название', 'Тип', 'Урон', 'СКОР'])}
        </div>

        <div id="armorSection" class="gear-section">
            <h4>🛡️ Броня (тело)</h4>
            ${renderArmorTable(armors, 'body', gear.armor.body, ['Название', 'ОС', 'Штраф'])}
            <h4>🛡️ Броня (голова)</h4>
            ${renderArmorTable(armors, 'head', gear.armor.head, ['Название', 'ОС', 'Штраф'])}
            <p class="note">Выберите броню для тела и головы отдельно.</p>
        </div>

        <div id="itemsSection" class="gear-section">
            <h4>🎒 Снаряжение</h4>
            ${renderTable(gearItems, 'item', gear.items, ['Название', 'Категория'])}
        </div>
    `;

    function renderTable(items, type, selectedNames, columns) {
        if (!items.length) return '<p>Нет предметов</p>';
        return `
            <div class="table-wrapper">
                <table class="cyber-table">
                    <thead>
                        <tr><th style="width:30px">✓</th>${columns.map(col => `<th>${col}</th>`).join('')}<th>Цена</th></tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td style="text-align:center">
                                    <input type="checkbox" data-type="${type}" value="${item.name}" data-cost="${item.cost}" ${selectedNames.includes(item.name) ? 'checked' : ''}>
                                 </td>
                                ${columns.map(col => {
                                    if (col === 'Название') return `<td><strong>${item.name}</strong></td>`;
                                    if (col === 'Навык') return `<td>${item.skill || ''}</td>`;
                                    if (col === 'Урон') return `<td>${item.dmg || ''}</td>`;
                                    if (col === 'Маг.') return `<td>${item.mag || ''}</td>`;
                                    if (col === 'СКОР') return `<td>${item.rof || ''}</td>`;
                                    if (col === 'Рук') return `<td>${item.hands || ''}</td>`;
                                    if (col === 'Тип') return `<td>${item.type || ''}</td>`;
                                    if (col === 'ОС') return `<td>${item.sp || ''}</td>`;
                                    if (col === 'Штраф') return `<td>${item.penalty || ''}</td>`;
                                    if (col === 'Категория') return `<td>${item.category || ''}</td>`;
                                    return `<td></td>`;
                                }).join('')}
                                <td>${item.cost} eb</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderArmorTable(items, slot, selectedName, columns) {
        if (!items.length) return '<p>Нет предметов</p>';
        return `
            <div class="table-wrapper">
                <table class="cyber-table">
                    <thead>
                        <tr><th style="width:30px">✓</th>${columns.map(col => `<th>${col}</th>`).join('')}<th>Цена</th></tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td style="text-align:center">
                                    <input type="checkbox" data-type="armor" data-slot="${slot}" value="${item.name}" data-cost="${item.cost}" ${selectedName === item.name ? 'checked' : ''}>
                                 </td>
                                <td><strong>${item.name}</strong></td>
                                <td>${item.sp || ''}</td>
                                <td>${item.penalty || ''}</td>
                                <td>${item.cost} eb</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}