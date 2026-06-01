export function renderCrit(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>2d6</th><th>Травма</th><th>Эффект</th><th>Быстрая помощь</th><th>Лечение</th></tr></thead><tbody>${data.map(c => `<tr><td>${c.roll}</td><td><strong>${c.name}</strong></td><td>${c.effect}</td><td>${c.quick}</td><td>${c.treat}</td></tr>`).join('')}</tbody></table></div>`;
}