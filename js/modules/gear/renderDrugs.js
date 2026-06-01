export function renderDrugs(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Длительность</th><th>Эффект</th><th>Побочный эффект</th><th>Цена</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.name}</td><td>${d.duration}</td><td>${d.effect}</td><td>${d.sideEffect}</td><td>${d.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}