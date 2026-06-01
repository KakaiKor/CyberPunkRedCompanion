import { rangedWeapons, meleeWeapons, armors, gearItems } from '../../data.js';

export function renderGearStep(data, getItemCost) {
    let totalCost = 0;
    for (let w of data.gear.weapons) totalCost += getItemCost(w);
    if (data.gear.armor.body) totalCost += getItemCost(data.gear.armor.body);
    if (data.gear.armor.head) totalCost += getItemCost(data.gear.armor.head);
    for (let i of data.gear.items) totalCost += getItemCost(i);
    const remainingMain = 2550 - totalCost;
    let styleCost = 0;
    for (let s of data.styleItems) styleCost += getItemCost(s);
    const remainingStyle = 800 - styleCost;

    function renderCheckboxes(items, type, selectedNames) {
        return items.map(item => `
            <label>
                <input type="checkbox" data-type="${type}" value="${item.name}" data-cost="${item.cost}" ${selectedNames.includes(item.name) ? 'checked' : ''}>
                ${item.name} - ${item.cost} eb
            </label>
        `).join('');
    }

    return `
        <h3>Снаряжение (основной бюджет: 2550 eb, стиль: 800 eb)</h3>
        <div class="gear-wizard-grid">
            <div class="gear-category">
                <h4>Оружие</h4>
                ${renderCheckboxes([...rangedWeapons, ...meleeWeapons], 'weapon', data.gear.weapons)}
            </div>
            <div class="gear-category">
                <h4>Броня</h4>
                ${renderCheckboxes(armors, 'armor', [data.gear.armor.body, data.gear.armor.head].filter(Boolean))}
            </div>
            <div class="gear-category">
                <h4>Снаряжение</h4>
                ${renderCheckboxes(gearItems, 'item', data.gear.items)}
            </div>
            <div class="gear-category">
                <h4>Стиль (бюджет 800 eb)</h4>
                ${renderCheckboxes(gearItems, 'style', data.styleItems)}
            </div>
        </div>
        <div class="points-counter">Основной бюджет: <strong class="${remainingMain < 0 ? 'over' : 'ok'}">${remainingMain}</strong> eb</div>
        <div class="points-counter">Стиль бюджет: <strong class="${remainingStyle < 0 ? 'over' : 'ok'}">${remainingStyle}</strong> eb</div>
    `;
}