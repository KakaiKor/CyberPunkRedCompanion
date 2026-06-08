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

        <div id="armorSection" class="gear-section" style="display: none;">
            <h4>🛡️ Броня (тело)</h4>
            ${renderTable(armors, 'armorBody', [gear.armor.body], ['Название', 'ОС', 'Штраф'])}
            <h4>🛡️ Броня (голова)</h4>
            ${renderTable(armors, 'armorHead', [gear.armor.head], ['Название', 'ОС', 'Штраф'])}
            <p class="note">Выберите броню для тела и головы отдельно.</p>
        </div>

        <div id="itemsSection" class="gear-section" style="display: none;">
            <h4>🎒 Снаряжение</h4>
            ${renderGearTable(gearItems, 'item', gear.items, ['Название', 'Категория', 'Описание', 'Эффект'])}
        </div>
    `;

    // Функция для простых таблиц (оружие, броня) – без описаний
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

    // Функция для снаряжения – с описанием и эффектом
    function renderGearTable(items, type, selectedNames, columns) {
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
                                <td><strong>${item.name}</strong></td>
                                <td>${item.category || ''}</td>
                                <td>${item.description || '—'}</td>
                                <td>${item.effect || '—'}</td>
                                <td>${item.cost} eb</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    // После того как отрисованы радиокнопки брони
const updateArmorData = () => {
    const body = document.querySelector('#armorSection input[data-slot="body"]:checked')?.value || '';
    const head = document.querySelector('#armorSection input[data-slot="head"]:checked')?.value || '';
    data.gear.armor = { body, head };
};
// Навесить обработчики на все радиокнопки
document.querySelectorAll('#armorSection input[data-slot="body"], #armorSection input[data-slot="head"]')
    .forEach(radio => radio.addEventListener('change', updateArmorData));
// Также при загрузке шага восстановить checked из data.gear.armor, если оно есть
if (data.gear?.armor?.body) {
    const radioToCheck = document.querySelector(`#armorSection input[data-slot="body"][value="${data.gear.armor.body}"]`);
    if (radioToCheck) radioToCheck.checked = true;
}
if (data.gear?.armor?.head) {
    const radioToCheck = document.querySelector(`#armorSection input[data-slot="head"][value="${data.gear.armor.head}"]`);
    if (radioToCheck) radioToCheck.checked = true;
}
}