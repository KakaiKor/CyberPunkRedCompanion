import { detailedCyberware } from '../../data.js';

export function renderCyberwareStep(data) {
    let totalCost = 0;
    for (let item of data.cyberware) {
        const found = detailedCyberware.find(c => c.name === item);
        if (found) totalCost += found.cost;
    }
    const remaining = 2550 - totalCost;
    return `
        <h3>Киберимпланты (бюджет: 2550 eb)</h3>
        <div class="cyber-wizard-list">
            ${detailedCyberware.map(cyber => `
                <label class="cyber-option">
                    <input type="checkbox" value="${cyber.name}" data-cost="${cyber.cost}" ${data.cyberware.includes(cyber.name) ? 'checked' : ''}>
                    ${cyber.name} - ${cyber.cost} eb (ПЧ: ${cyber.humanity})
                </label>
            `).join('')}
        </div>
        <div class="points-counter">Осталось денег: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong> eb</div>
    `;
}