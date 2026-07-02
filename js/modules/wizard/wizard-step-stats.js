export function renderStatsStep(data) {
    const STAT_NAMES = {
        INT: 'ИНТ',
        REF: 'РЕФ',
        DEX: 'ЛВК',
        TECH: 'ТЕХ',
        COOL: 'КРУТ',
        WILL: 'ВОЛЯ',
        LUCK: 'УДЧ',
        MOVE: 'СКО',
        BODY: 'ТЕЛО',
        EMP: 'ЭМП'
    };
    const stats = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
    let total = 0;
    for (let s of stats) total += data.stats[s];
    const remaining = 62 - total;
    return `
        <h3>Характеристики (очков: 62)</h3>
        <div class="stats-wizard-grid">
            ${stats.map(s => `<label>${STAT_NAMES[s]}: <input type="number" class="stat-input" data-stat="${s}" min="2" max="8" value="${data.stats[s]}"></label>`).join('')}
        </div>
        <div class="points-counter">Осталось очков: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong></div>
        <button id="randomStatsWizardBtn" class="cyber-btn">🎲 Случайные ХАР</button>
    `;
}