// modules/wizard/wizard-step-style.js
import { gearItems } from '../../data.js';

export function renderStyleStep(data, getItemCost) {
    // Расширенный список стильных вещей
    const styleCatalog = [
        { name: "Куртка Generic Chic", cost: 50, description: "Универсальная куртка" },
        { name: "Куртка Gang Colours", cost: 50, description: "Бандитская расцветка" },
        { name: "Куртка Nomad Leathers", cost: 100, description: "Кожаная куртка кочевника" },
        { name: "Обувь Leisurewear", cost: 50, description: "Удобная обувь" },
        { name: "Зеркальные очки", cost: 20, description: "Стильные очки" },
        { name: "Украшения Bohemian", cost: 100, description: "Богемные украшения" },
        { name: "Техноволосы", cost: 100, description: "Искусственные волосы с подсветкой" },
        { name: "Химкожа", cost: 100, description: "Изменяемый цвет кожи" },
        { name: "Светотату", cost: 100, description: "Светящиеся татуировки" },
        { name: "ЭМИ нить", cost: 10, description: "Серебряные линии на коже" },
        { name: "Изменчивые линзы", cost: 100, description: "Линзы с изменяемым цветом" }
    ];
    // Также добавим из gearItems те, что подходят по смыслу
    const additional = gearItems.filter(i => 
        i.category === "Стиль" || 
        i.name.includes("Куртка") || 
        i.name.includes("Очки") || 
        i.name.includes("Украшения") ||
        i.name.includes("Обувь") ||
        i.name.includes("Стиль")
    );
    const allStyleItems = [...styleCatalog, ...additional];
    // Убираем дубликаты по имени
    const unique = [];
    const names = new Set();
    for (const item of allStyleItems) {
        if (!names.has(item.name)) {
            names.add(item.name);
            unique.push(item);
        }
    }
    const selected = data.styleItems || [];
    let totalCost = 0;
    for (let name of selected) {
        const item = unique.find(i => i.name === name);
        if (item) totalCost += item.cost;
        else totalCost += getItemCost(name);
    }
    const remaining = 800 - totalCost;
    return `
        <h3>✨ Стиль и внешний вид (бюджет: 800 eb)</h3>
        <div class="style-budget">Осталось: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong> eb</div>
        <div class="style-controls">
            <input type="text" id="styleSearch" placeholder="🔍 Поиск предметов...">
        </div>
        <div class="table-wrapper">
            <table class="cyber-table">
                <thead>
                    <tr><th style="width:30px">✓</th><th>Название</th><th>Описание</th><th>Цена</th></tr>
                </thead>
                <tbody>
                    ${unique.map(item => `
                        <tr data-name="${item.name}">
                            <td style="text-align:center">
                                <input type="checkbox" class="style-checkbox" value="${item.name}" data-cost="${item.cost}" ${selected.includes(item.name) ? 'checked' : ''}>
                            </td>
                            <td><strong>${item.name}</strong></td>
                            <td>${item.description || ''}</td>
                            <td>${item.cost} eb</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}