export function renderAmmo(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Тип</th><th>Эффект</th><th>Цена</th></tr></thead><tbody>${data.map(a => `<tr><td>${a.name}</td><td>${a.effect}</td><td>${a.cost}</td></tr>`).join('')}</tbody></table></div>`;
}