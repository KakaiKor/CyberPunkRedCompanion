// wizard-step-summary.js (исправленная версия)
import { getHP } from '../../utils.js';
import { detailedCyberware } from '../../data.js';

export function renderSummaryStep(data) {
    // Читаем все данные о снаряжении из data.gear (который заполняется на шаге 3)
    const weapons = data.gear?.weapons || [];
    const armorBody = data.gear?.armor?.body || 'нет';
    const armorHead = data.gear?.armor?.head || 'нет';
    const items = data.gear?.items || [];
    const cyberware = data.cyberware || [];
    const styleItems = data.styleItems || [];

    // Производные характеристики
    const body = data.stats?.BODY || 6;
    const will = data.stats?.WILL || 6;
    const emp = data.stats?.EMP || 6;
    const hp = getHP(body, will);
    const severe = Math.ceil(hp / 2);
    const baseHumanity = emp * 10;
    let humanityLoss = 0;
    for (const name of cyberware) {
        const implant = detailedCyberware.find(i => i.name === name);
        if (implant) humanityLoss += parseInt(implant.humanity) || 0;
    }
    const humanity = Math.max(0, baseHumanity - humanityLoss);
    const empFrom = Math.floor(humanity / 10);

    // Рендер характеристик
    const statsHtml = Object.entries(data.stats).map(([k, v]) => `
        <div class="stat-item" data-stat="${k}">
            <span class="stat-name">${k}</span>
            <span class="stat-value">${v}</span>
        </div>
    `).join('');

    // Рендер навыков
    const skillsEntries = Object.entries(data.skills || {}).filter(([_, v]) => v > 0);
    const skillsHtml = skillsEntries.map(([name, level]) => `
        <div class="skill-item">
            <span class="skill-name">${escapeHtml(name)}</span>
            <span class="skill-level">${level}</span>
        </div>
    `).join('');

    // Рендер снаряжения
    const weaponsHtml = weapons.map(w => `<li>🔫 ${escapeHtml(w)}</li>`).join('');
    const cyberHtml = cyberware.map(c => `<li>🦾 ${escapeHtml(c)}</li>`).join('');
    const gearHtml = items.map(i => `<li>📦 ${escapeHtml(i)}</li>`).join('');
    const styleHtml = styleItems.map(s => `<li>✨ ${escapeHtml(s)}</li>`).join('');
    const armorHtml = `
        <li>🛡️ Тело: ${escapeHtml(armorBody)}</li>
        <li>⛑️ Голова: ${escapeHtml(armorHead)}</li>
    `;

    return `
        <h3>📋 Итоговый персонаж</h3>
        <div class="character-card" data-name="${escapeHtml(data.name)}" data-role="${data.role}">
            <div class="character-card-header">
                <div class="character-name">${escapeHtml(data.name)}</div>
                <div class="character-role">${data.role}</div>
            </div>
            <div class="character-card-body">
                <div class="char-section" data-section="stats">
                    <h4>📊 Характеристики</h4>
                    <div class="stats-grid">${statsHtml}</div>
                </div>
                <div class="char-section" data-section="derived">
                    <h4>❤️ Состояние</h4>
                    <div class="derived-stats">
                        <div>ПЗ: ${hp} (тяж. ≤ ${severe})</div>
                        <div data-derived="hp">ПЗ: 
                            <span class="current-hp">${hp}</span> / ${hp}
                            <span class="hp-threshold">(тяж. ≤ ${severe})</span>
                        </div>
                        <div>Спасбросок: ${body}</div>
                        <div>Человечность: ${humanity} (ЭМП = ${empFrom})</div>
                    </div>
                    <div class="combat-buttons">
                        <button class="heal-btn" type="button">💊 Лечение (+${body} ПЗ)</button>
                        <button class="damage-btn" type="button">💥 Урон</button>
                    </div>
                </div>
                <div class="char-section" data-section="skills">
                    <h4>🎯 Навыки</h4>
                    <div class="skills-grid">${skillsHtml || '<p>— нет —</p>'}</div>
                </div>
                <div class="char-section" data-section="notes">
                    <h4>📝 Заметки</h4>
                    <div class="notes-preview">${escapeHtml(data.notes || '— нет —')}</div>
                </div>
                <div class="equipment-grid">
                    <div class="equipment-card">
                        <h5>🛡️ Броня</h5>
                        <ul class="compact">${armorHtml}</ul>
                    </div>
                    <div class="equipment-card">
                        <h5>🔫 Оружие</h5>
                        <ul class="compact">${weaponsHtml || '<li>— нет —</li>'}</ul>
                    </div>
                    <div class="equipment-card">
                        <h5>🦾 Киберимпланты</h5>
                        <ul class="compact">${cyberHtml || '<li>— нет —</li>'}</ul>
                    </div>
                    <div class="equipment-card">
                        <h5>🎒 Снаряжение</h5>
                        <ul class="compact">${gearHtml || '<li>— нет —</li>'}</ul>
                    </div>
                    ${styleItems?.length ? `
                    <div class="equipment-card">
                        <h5>✨ Стиль</h5>
                        <ul class="compact">${styleHtml}</ul>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="summary-actions">
            <button id="exportPngBtn" class="cyber-btn">📸 Сохранить как PNG</button>
        </div>
        <p class="note">Нажмите «Сохранить персонажа», чтобы записать его в хранилище.</p>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}