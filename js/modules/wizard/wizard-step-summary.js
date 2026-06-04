import { getHP } from '../../utils.js';
import { detailedCyberware } from '../../data.js';
import { armors } from '../../data.js';


export function renderSummaryStep(data) {
    // Прямое чтение из DOM (самый свежий вариант)
    let weapons = [];
    let armorBody = 'нет';
    let armorHead = 'нет';
    let items = [];

    try {
        weapons = Array.from(document.querySelectorAll('#weaponsSection input[type="checkbox"]:checked')).map(cb => cb.value);
        armorBody = document.querySelector('#armorSection input[data-slot="body"]:checked')?.value || 'нет';
        armorHead = document.querySelector('#armorSection input[data-slot="head"]:checked')?.value || 'нет';
        items = Array.from(document.querySelectorAll('#itemsSection input[type="checkbox"]:checked')).map(cb => cb.value);
        console.log('Снаряжение из DOM:', { weapons, armorBody, armorHead, items });
    } catch(e) {
        console.warn('Ошибка чтения из DOM', e);
    }

    // Если DOM не дал результатов (например, из-за ошибки), подхватываем из data.gear (резервная копия)
    if ((!weapons || weapons.length === 0) && data.gear?.weapons?.length) {
        weapons = data.gear.weapons;
        console.log('Взяли оружие из data.gear');
    }
    if ((armorBody === 'нет' || !armorBody) && data.gear?.armor?.body) {
        armorBody = data.gear.armor.body;
        console.log('Взяли броню тела из data.gear');
    }
    if ((armorHead === 'нет' || !armorHead) && data.gear?.armor?.head) {
        armorHead = data.gear.armor.head;
        console.log('Взяли броню головы из data.gear');
    }
    if ((!items || items.length === 0) && data.gear?.items?.length) {
        items = data.gear.items;
        console.log('Взяли снаряжение из data.gear');
    }

    const body = data.stats?.BODY || 6;
    const will = data.stats?.WILL || 6;
    const emp = data.stats?.EMP || 6;
    const hp = getHP(body, will);
    const severe = Math.ceil(hp / 2);
    const baseHumanity = emp * 10;
    let humanityLoss = 0;
    for (const name of (data.cyberware || [])) {
        const implant = detailedCyberware.find(i => i.name === name);
        if (implant) humanityLoss += parseInt(implant.humanity) || 0;
    }
    const humanity = Math.max(0, baseHumanity - humanityLoss);
    const empFrom = Math.floor(humanity / 10);

    const statsHtml = Object.entries(data.stats).map(([k, v]) => `
        <div class="stat-item" data-stat="${k}">
            <span class="stat-name">${k}</span>
            <span class="stat-value">${v}</span>
        </div>
    `).join('');

    const skillsEntries = Object.entries(data.skills || {}).filter(([_, v]) => v > 0);
    const skillsHtml = skillsEntries.map(([name, level]) => `
        <div class="skill-item">
            <span class="skill-name">${escapeHtml(name)}</span>
            <span class="skill-level">${level}</span>
        </div>
    `).join('');

    const weaponsHtml = weapons.map(w => `<li>🔫 ${escapeHtml(w)}</li>`).join('');
    const cyberHtml = (data.cyberware || []).map(c => `<li>🦾 ${escapeHtml(c)}</li>`).join('');
    const gearHtml = items.map(i => `<li>📦 ${escapeHtml(i)}</li>`).join('');
    const styleHtml = (data.styleItems || []).map(s => `<li>✨ ${escapeHtml(s)}</li>`).join('');
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
                    ${data.styleItems?.length ? `
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