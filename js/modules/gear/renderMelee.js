export function renderMelee(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Тип</th><th>Урон</th><th>СКОР</th><th>Скрыть</th><th>Цена</th></tr></thead><tbody>${data.map(w => `<tr><td>${w.name}</td><td>${w.type}</td><td>${w.dmg}</td><td>${w.rof}</td><td>${w.conceal}</td><td>${w.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}