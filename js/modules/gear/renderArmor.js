export function renderArmor(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>ОС</th><th>Штраф</th><th>Цена</th></tr></thead><tbody>${data.map(a => `<tr><td>${a.name}</td><td>${a.sp}</td><td>${a.penalty}</td><td>${a.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}