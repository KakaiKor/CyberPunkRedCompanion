// modules/character-helper.js
import { getHP } from '../utils.js';
import { saveCharacter, loadCharacter } from '../storage.js';
import { detailedCyberware, armors, rangedWeapons, meleeWeapons, gearItems } from '../data.js';
import { rolesData } from '../data/roles-data.js';

export class CharacterHelper {
    constructor() {
        this.buildStatsGrid();
        document.getElementById('randomStatsBtn')?.addEventListener('click', () => this.randomStats());
        document.getElementById('calcCharBtn')?.addEventListener('click', () => this.calcDerived());
        document.getElementById('saveCharBtn')?.addEventListener('click', () => this.save());
        document.getElementById('loadCharBtn')?.addEventListener('click', () => this.load());
        document.getElementById('buildCharCardBtn')?.addEventListener('click', () => this.generateStreetRatCharacter());

        window.addEventListener('characterUpdated', () => this.displaySavedCharacterCard());
    }

    // НОВЫЙ МЕТОД – применяет модификаторы имплантов к базовым характеристикам
    applyCyberwareModifiers(baseStats, cyberwareList) {
    if (!baseStats) return {};
    const result = { ...baseStats };
    const implantModifiers = {
        "Керензиков": { initiative: 2 },
        "Искусственные мышцы и усиленные кости": { BODY: 2, maxBody: 10 },
        "Эндоскелет Сигма": { replaceBody: true, bodyValue: 12 },
        "Эндоскелет Бета": { replaceBody: true, bodyValue: 14 },
        "Роликовая стопа": { movement: 6 },
        // добавьте другие импланты по необходимости
    };
    let bonuses = { BODY: 0, MOVE: 0 };
    let replaceBody = null;
    for (const implant of cyberwareList) {
        const mod = implantModifiers[implant];
        if (mod) {
            if (mod.BODY) bonuses.BODY += mod.BODY;
            if (mod.movement) bonuses.MOVE += mod.movement;
            if (mod.replaceBody) replaceBody = mod;
        }
    }
    if (replaceBody) {
        result.BODY = replaceBody.bodyValue;
    } else {
        let newBody = (baseStats.BODY || 6) + bonuses.BODY;
        if (newBody > 10) newBody = 10;
        result.BODY = newBody;
    }
    let newMove = (baseStats.MOVE || 6) + bonuses.MOVE;
    if (newMove > 10) newMove = 10;
    result.MOVE = newMove;
    return result;
}
    buildStatsGrid() {
        const container = document.getElementById('statsGrid');
        if (!container) return;
        const ids = ['statINT','statREF','statDEX','statTECH','statCOOL','statWILL','statLUCK','statMOVE','statBODY','statEMP'];
        const names = ['ИНТ','РЕФ','ЛВК','ТЕХ','КРУТ','ВОЛЯ','УДЧ','СКО','ТЕЛО','ЭМП'];
        let html = '';
        for (let i = 0; i < ids.length; i++) {
            html += `<label>${names[i]}<br><input type="number" id="${ids[i]}" min="2" max="8" value="6"></label>`;
        }
        container.innerHTML = html;
    }

    randomStats() {
        const ids = ['statINT','statREF','statDEX','statTECH','statCOOL','statWILL','statLUCK','statMOVE','statBODY','statEMP'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = Math.floor(Math.random() * 7) + 2;
        });
        this.calcDerived();
    }

    calcDerived() {
        const bodyEl = document.getElementById('statBODY');
        const willEl = document.getElementById('statWILL');
        const empEl = document.getElementById('statEMP');
        if (!bodyEl || !willEl || !empEl) return;
        const body = parseInt(bodyEl.value);
        const will = parseInt(willEl.value);
        const emp = parseInt(empEl.value);
        const hp = getHP(body, will);
        const severe = Math.ceil(hp / 2);
        const humanity = emp * 10;
        const empFrom = Math.floor(humanity / 10);
        const derivedDiv = document.getElementById('charDerived');
        if (derivedDiv) {
            derivedDiv.innerHTML = `<strong>ПЗ = ${hp}</strong> (тяж. ≤ ${severe})<br>Спасбросок = ${body}<br>Человечность = ${humanity} (ЭМП = ${empFrom})`;
        }
    }

    save() {
        const char = { name: document.getElementById('charName').value, role: document.getElementById('genRole').value };
        const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        stats.forEach(s => char[s] = document.getElementById(`stat${s}`).value);
        saveCharacter(char);
        document.getElementById('charSaveStatus').innerText = 'Сохранено!';
    }

    load() {
        const char = loadCharacter();
        if (char) {
            const nameInp = document.getElementById('charName');
            const roleSel = document.getElementById('genRole');
            if (nameInp) nameInp.value = char.name || '';
            if (roleSel) roleSel.value = char.role || 'Соло';
            const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
            stats.forEach(s => {
                const inp = document.getElementById(`stat${s}`);
                if (inp && char[s] !== undefined) inp.value = char[s];
            });
            this.calcDerived();
            document.getElementById('charSaveStatus').innerText = 'Загружено!';
            this.displaySavedCharacterCard();
        } else {
            document.getElementById('charSaveStatus').innerText = 'Нет сохранений';
        }
    }

    generateStreetRatCharacter() {
        const role = document.getElementById('genRole').value;
        const name = document.getElementById('charName').value.trim() || 'Безымянный';
        const stats = this.generateStatsForRole(role);
        const skills = this.generateSkillsForRole(role);
        const gear = this.generateStartingGear(role);
        const hp = getHP(stats.BODY, stats.WILL);
        const severe = Math.ceil(hp / 2);
        const humanity = stats.EMP * 10;
        const empFrom = Math.floor(humanity / 10);
        const deathSave = stats.BODY;
        this.buildCharacterCard({
            name, role, roleRank: 4, stats, skills, gear, cyberware: [],
            currentHp: hp, maxHp: hp, severe, humanity, empFrom, deathSave, notes: '', avatar: '', money: 1000
        });
        const charData = { name, role, ...stats, money: 1000 };
        saveCharacter(charData);
        document.getElementById('charSaveStatus').innerText = 'Персонаж сгенерирован!';
    }

    generateStatsForRole(role) {
        return { INT:6, REF:6, DEX:6, TECH:6, COOL:6, WILL:6, LUCK:6, MOVE:6, BODY:6, EMP:6 };
    }
    generateSkillsForRole(role) { return {}; }
    generateStartingGear(role) { return { weapons: [], armor: { body: '', head: '' }, items: [], cyberware: [] }; }

    // ========== КАРТОЧКА ПЕРСОНАЖА ==========
    buildCharacterCard(cardData) {
    const { name, role, roleRank = 4, stats, skills, gear, cyberware, currentHp, maxHp, severe, humanity, empFrom, deathSave, notes, avatar = '', money = 0, baseStats = null, ammo  } = cardData;
    const container = document.getElementById('characterCardContainer');
    if (!container) return;
    const cardHtml = this.buildCharacterCardHTML({ name, role, roleRank, stats, skills, gear, cyberware, currentHp, maxHp, severe, humanity, empFrom, deathSave, notes, avatar, money, baseStats, ammo });
    container.innerHTML = cardHtml;
    this.attachCardEventHandlers();
    const editBtn = container.querySelector('.edit-card-btn');
    const syncBtn = container.querySelector('.sync-card-btn');
    if (editBtn) editBtn.addEventListener('click', () => this.enableEditMode(container.querySelector('.character-card')));
    if (syncBtn) syncBtn.addEventListener('click', () => this.syncFromTabs());
}

buildCharacterCardHTML({ name, role, roleRank, stats, skills, gear, cyberware, currentHp, maxHp, severe, humanity, empFrom, deathSave, notes, avatar, money, baseStats, ammo = [] }) {
    const baseStatsAttr = baseStats ? JSON.stringify(baseStats) : '';
        stats = stats || {};
        skills = skills || {};
        gear = gear || { weapons: [], armor: { body: '', head: '' }, items: [] };
        cyberware = cyberware || [];

        const implantModifiers = {
            "Керензиков": { initiative: 2, display: "+2 к инициативе" },
            "Сандевистан": { initiativeTemporary: "Активация: +3 к инициативе на 1 минуту", display: "Временное ускорение" },
            "Прицельный модуль": { perception: 1, display: "+1 к прицельным выстрелам" },
            "Улучшение изображения": { perception: 2, display: "+2 к Восприятию, чтению по губам" },
            "Усиленный слух": { perception: 2, display: "+2 к Восприятию (слух)" },
            "Анализатор голосового напряжения": { perception: 2, display: "+2 к Проницательности и Допросу (детектор лжи)" },
            "Искусственные мышцы и усиленные кости": { BODY: 2, maxBody: 10, display: "+2 к ТЕЛО (макс. 10)" },
            "Усиленные антитела": { recovery: "ТЕЛО×2 ПЗ в день", display: "Регенерация (ТЕЛО×2 ПЗ/день)" },
            "Связыватели токсинов": { resistance: 2, display: "+2 к Сопротивлению пыткам/наркотикам" },
            "Жабры": { special: "дыхание под водой", display: "Дыхание под водой" },
            "Назальные фильтры": { special: "иммунитет к газам", display: "Иммунитет к газам" },
            "Эндоскелет Сигма": { replaceBody: true, bodyValue: 12, display: "ТЕЛО = 12" },
            "Эндоскелет Бета": { replaceBody: true, bodyValue: 14, display: "ТЕЛО = 14" },
            "Подкожная броня": { armor: 11, display: "ОС 11 на тело и голову" },
            "Плетёная кожа": { armor: 7, special: "Регенерирует 1 ОС в день", display: "ОС 7 + регенерация брони" },
            "Роликовая стопа": { movement: 6, display: "+6 м к бегу" }
        };

        let bonuses = { BODY: 0, initiative: 0, resistance: 0 };
        let extraEffects = [];
        let replaceBody = null;
        for (const implant of cyberware) {
            const mod = implantModifiers[implant];
            if (mod) {
                if (mod.BODY) bonuses.BODY += mod.BODY;
                if (mod.initiative) bonuses.initiative += mod.initiative;
                if (mod.resistance) bonuses.resistance += mod.resistance;
                if (mod.replaceBody) {
                    if (!replaceBody || mod.bodyValue > replaceBody.value) {
                        replaceBody = { value: mod.bodyValue, display: mod.display };
                    }
                }
                if (mod.display) extraEffects.push(mod.display);
            }
        }
        let bodyBase = stats.BODY || 6;
        let bodyDisplay, bodyBonusText;
        if (replaceBody) {
            bodyDisplay = replaceBody.value;
            bodyBonusText = ` (замена: ${replaceBody.display})`;
        } else {
            bodyDisplay = bodyBase + bonuses.BODY;
            const maxBody = 10;
            if (bodyDisplay > maxBody) bodyDisplay = maxBody;
            bodyBonusText = bonuses.BODY !== 0 ? ` (база ${bodyBase} +${bonuses.BODY} от имплантов)` : '';
        }

        const statsHtml = Object.entries(stats).map(([k, v]) => {
            if (k === 'BODY' && (replaceBody || bonuses.BODY !== 0)) {
                return `<div class="stat-item" data-stat="${k}"><span class="stat-name">${k}</span><span class="stat-value">${bodyDisplay}${bodyBonusText}</span></div>`;
            }
            return `<div class="stat-item" data-stat="${k}"><span class="stat-name">${k}</span><span class="stat-value">${v}</span></div>`;
        }).join('');

        const skillsHtml = Object.entries(skills).filter(([_, v]) => v > 0).map(([k, v]) => `
            <div class="skill-item" data-skill="${k}">
                <span class="skill-name">${this.escapeHtml(k)}</span>
                <span class="skill-level">${v}</span>
            </div>
        `).join('');

        const getWeaponDetails = (weaponName) => {
            const ranged = rangedWeapons.find(w => w.name === weaponName);
            if (ranged) {
                return { type: 'ranged', skill: ranged.skill, dmg: ranged.dmg, mag: ranged.mag, rof: ranged.rof, hands: ranged.hands, conceal: ranged.conceal === 'да', notes: ranged.notes };
            }
            const melee = meleeWeapons.find(w => w.name === weaponName);
            if (melee) {
                return { type: 'melee', kind: melee.type, dmg: melee.dmg, rof: melee.rof, conceal: melee.conceal === 'да' };
            }
            return null;
        };
        const weaponsHtml = (gear.weapons || []).map((w, idx) => {
    const details = getWeaponDetails(w);
    let statsWeapon = '';
    if (details) {
        if (details.type === 'ranged') {
            statsWeapon = `<span class="weapon-stat">${details.skill}</span> <span class="weapon-stat">${details.dmg}</span> <span class="weapon-stat">Маг.: ${details.mag}</span> <span class="weapon-stat">СКОР: ${details.rof}</span> <span class="weapon-stat">Рук.: ${details.hands}</span> <span class="weapon-stat">Скрыт.: ${details.conceal ? 'да' : 'нет'}</span>${details.notes ? `<span class="weapon-stat">${details.notes}</span>` : ''}`;
        } else {
            statsWeapon = `<span class="weapon-stat">${details.kind}</span> <span class="weapon-stat">${details.dmg}</span> <span class="weapon-stat">СКОР: ${details.rof}</span> <span class="weapon-stat">Скрыт.: ${details.conceal ? 'да' : 'нет'}</span>`;
        }
    } else {
        statsWeapon = `<span class="weapon-stat">(данные не найдены)</span>`;
    }
    return `<li data-weapon-idx="${idx}" class="weapon-item"><div class="weapon-header"><strong class="weapon-name">${this.escapeHtml(w)}</strong></div><div class="weapon-stats">${statsWeapon}</div></li>`;
}).join('');

        const cyberHtml = (cyberware || []).map((c, idx) => `<li data-cyber-idx="${idx}">🦾 ${this.escapeHtml(c)}</li>`).join('');
        const gearHtmlItems = (gear.items || []).map((g, idx) => `<li data-gear-idx="${idx}">📦 ${this.escapeHtml(g)}</li>`).join('');
        // const ammo = cardData.ammo || [];
        const ammoList = this.getAmmoFromChar(ammo);
let ammoHtml = '';
if (ammoList.length > 0) {
    ammoHtml = `
        <div class="equipment-card" data-type="ammo">
            <h5>💣 Боеприпасы</h5>
            <ul class="compact" data-ammo-list>
                ${ammoList.map(a => {
                    // Пытаемся определить тип патронов из названия
                    let typeHint = '';
                    if (a.name.toLowerCase().includes('пистолет')) typeHint = ' (пистолетные)';
                    else if (a.name.toLowerCase().includes('винтовочн')) typeHint = ' (винтовочные)';
                    else if (a.name.toLowerCase().includes('дробь')) typeHint = ' (дробь)';
                    else if (a.name.toLowerCase().includes('средний пистолет')) typeHint = ' (средний)';
                    else if (a.name.toLowerCase().includes('тяжёлый пистолет')) typeHint = ' (тяжёлый)';
                    else if (a.name.toLowerCase().includes('очень тяжёлый')) typeHint = ' (оч. тяжёлый)';
                    
                    // Показываем количество с единицей измерения "шт."
                    let qtyText = `${a.quantity} шт.`;
                    if (a.quantity === 1) qtyText = '1 шт.';
                    
                    return `<li data-ammo-name="${this.escapeHtml(a.name)}" data-ammo-qty="${a.quantity}">🔸 ${this.escapeHtml(a.name)}${typeHint}: ${qtyText}</li>`;
                }).join('')}
            </ul>
        </div>
    `;
}
        const bodyArmorInfo = armors.find(a => a.name === gear.armor?.body);
        const headArmorInfo = armors.find(a => a.name === gear.armor?.head);
        const armorHtml = `<li>🛡️ Тело: ${this.escapeHtml(gear.armor?.body || 'нет')}${bodyArmorInfo ? ` (ОС ${bodyArmorInfo.sp}, штраф ${bodyArmorInfo.penalty})` : ''}</li><li>⛑️ Голова: ${this.escapeHtml(gear.armor?.head || 'нет')}${headArmorInfo ? ` (ОС ${headArmorInfo.sp}, штраф ${headArmorInfo.penalty})` : ''}</li>`;
        const notesHtml = `<div class="char-section" data-section="notes"><h4>📝 Заметки</h4><div class="notes-preview">${this.escapeHtml(notes) || '— нет —'}</div></div>`;

        let derivedStatsHtml = `
            <div data-derived="hp">ПЗ: <span class="current-hp">${currentHp}</span> / ${maxHp} <span class="hp-threshold">(тяж. ≤ ${severe})</span></div>
            <div data-derived="deathSave">Спасбросок: ${deathSave}</div>
            <div data-derived="money">💰 Деньги: <span class="char-money">${isNaN(money) ? 0 : money}</span> eb</div>
        `;
        if (bonuses.initiative !== 0) derivedStatsHtml += `<div>Инициатива: ${stats.REF} + ${bonuses.initiative} (от имплантов)</div>`;
        derivedStatsHtml += `<div data-derived="humanity">Человечность: ${humanity} (ЭМП = ${empFrom})</div>`;
        if (extraEffects.length) derivedStatsHtml += `<div class="implant-effects">✨ Эффекты имплантов: ${extraEffects.join(', ')}</div>`;

        const roleInfo = rolesData.find(r => r.name === role);
        const roleSkillHtml = `<div class="role-skill-badge"><span class="role-skill-name">${roleInfo ? roleInfo.skill : '—'}</span><span class="role-skill-rank">${roleRank ? ` (ранг ${roleRank})` : ''}</span></div>`;
        const avatarHtml = avatar ? `<div class="avatar-container"><img src="${avatar}" class="character-avatar" alt="avatar"></div>` : '';

        return `
            <div class="character-card" data-name="${this.escapeHtml(name)}" data-role="${role}" data-base-stats='${baseStatsAttr}'>
                <div class="character-card-header">
                    ${avatarHtml}
                    <div class="character-name" data-field="name">${this.escapeHtml(name)}</div>
                    <div class="character-role" data-field="role">${role}</div>
                    ${roleSkillHtml}
                    <div class="card-actions">
                        <button class="edit-card-btn" title="Редактировать">✏️</button>
                        <button class="sync-card-btn" title="Синхронизировать с вкладками">🔄</button>
                        <button class="close-card-btn" id="closeCardBtn">✖</button>
                    </div>
                </div>
                <div class="character-card-body">
                    <div class="char-section" data-section="stats">
                        <h4>📊 Характеристики</h4>
                        <div class="stats-grid" data-stats-container>${statsHtml}</div>
                    </div>
                    <div class="char-section" data-section="derived">
                        <h4>❤️ Состояние</h4>
                        <div class="derived-stats">${derivedStatsHtml}</div>
                        <div class="combat-buttons">
                            <button class="heal-btn">💊 Лечение (+${stats.BODY || 6} ПЗ)</button>
                            <button class="damage-btn">💥 Урон</button>
                        </div>
                    </div>
                    <div class="char-section" data-section="skills">
                        <h4>🎯 Навыки</h4>
                        <div class="skills-grid" data-skills-container>${skillsHtml || '<p>— нет —</p>'}</div>
                    </div>
                    ${notesHtml}
                    <div class="equipment-grid" data-equipment>
                        <div class="equipment-card" data-type="armor">
                            <h5>🛡️ Броня</h5>
                            <ul class="compact" data-armor-list>${armorHtml}</ul>
                        </div>
                        <div class="equipment-card" data-type="weapons">
                            <h5>🔫 Оружие</h5>
                            <ul class="compact" data-weapons-list>${weaponsHtml || '<li>— нет —</li>'}</ul>
                        </div>
                        <div class="equipment-card" data-type="cyberware">
                            <h5>🦾 Киберимпланты</h5>
                            <ul class="compact" data-cyber-list>${cyberHtml || '<li>— нет —</li>'}</ul>
                        </div>
                        <div class="equipment-card" data-type="gear">
                            <h5>🎒 Снаряжение</h5>
                            <ul class="compact" data-gear-list>${gearHtmlItems || '<li>— нет —</li>'}</ul>
                        </div>
                        ${ammoHtml}
                    </div>
                </div>
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
            </div>
        `;
    }

    displaySavedCharacterCard() {
    let char = loadCharacter();
    if (!char) return;
    
    // Если нет baseStats, создаём из текущих характеристик
    if (!char.baseStats) {
        char.baseStats = {
            INT: char.INT || 6, REF: char.REF || 6, DEX: char.DEX || 6,
            TECH: char.TECH || 6, COOL: char.COOL || 6, WILL: char.WILL || 6,
            LUCK: char.LUCK || 6, MOVE: char.MOVE || 6, BODY: char.BODY || 6, EMP: char.EMP || 6
        };
        saveCharacter(char);
    }
    
    // === ГАРАНТИРУЕМ НАЛИЧИЕ ПЗ ===
    if (!char.maxHp || !char.currentHp) {
        const body = char.baseStats.BODY || 6;
        const will = char.baseStats.WILL || 6;
        const maxHp = getHP(body, will);
        char.maxHp = maxHp;
        char.currentHp = char.currentHp !== undefined ? char.currentHp : maxHp;
        saveCharacter(char);
    }
    
    // === ДЛЯ НЕТРАННЕРА: создаём кибердеку и интерфейс, если их нет ===
    if (char.role === "Нетраннер") {
        if (!char.cyberdeck) {
            char.cyberdeck = { slots: 7, programs: [] };
            saveCharacter(char);
        }
        if (char.interfaceRank === undefined) {
            char.interfaceRank = char.roleRank || 4;
            saveCharacter(char);
        }
    } else {
        if (char.interfaceRank === undefined) char.interfaceRank = 0;
    }
    // ===============================================================
    
    const baseStats = char.baseStats;
    const cyberware = char.cyberware || [];
    const modifiedStats = this.applyCyberwareModifiers(baseStats, cyberware);
    
    // Объединяем: отображаем модифицированные, но для редактирования будем использовать baseStats
    const statsForDisplay = { ...modifiedStats };
    delete statsForDisplay._initiativeBonus;
    delete statsForDisplay._extraEffects;
    
    const gear = char.gear || { weapons: [], armor: { body: '', head: '' }, items: [] };
    const skills = char.skills || {};
    const body = modifiedStats.BODY, will = baseStats.WILL, emp = baseStats.EMP;
    const maxHp = char.maxHp;
    let currentHp = char.currentHp;
    const severe = Math.ceil(maxHp / 2);
    let humanityLoss = 0;
    for (const name of cyberware) {
        const implant = detailedCyberware.find(i => i.name === name);
        if (implant) humanityLoss += parseInt(implant.humanity) || 0;
    }
    const humanity = Math.max(0, emp * 10 - humanityLoss);
    const empFrom = Math.floor(humanity / 10);
    const deathSave = body;
    const money = char.money !== undefined && !isNaN(char.money) ? char.money : 0;
    if (char.role === "Нетраннер") {
    if (char.interfaceRank === undefined) {
        char.interfaceRank = char.roleRank || 4;
        saveCharacter(char);
    }
} else {
    char.interfaceRank = 0;
}
    this.buildCharacterCard({
        name: char.name || 'Безымянный',
        role: char.role || 'Без роли',
        roleRank: char.roleRank || 4,
        stats: statsForDisplay,
        baseStats: baseStats,
        skills, gear, cyberware, currentHp, maxHp, severe,
        humanity, empFrom, deathSave,
        notes: char.notes || '', avatar: char.avatar || '', money,
        ammo: char.ammo || []
    });
}

    exportCharacterToJSON() {
        const char = loadCharacter();
        if (!char) { alert('Нет сохранённого персонажа'); return; }
        const dataStr = JSON.stringify(char, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${char.name || 'character'}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    importCharacterFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const char = JSON.parse(e.target.result);
                if (!char.name) char.name = 'Безымянный';
                if (!char.role) char.role = 'Соло';
                if (char.roleRank === undefined) char.roleRank = 4;
                if (!char.skills) char.skills = {};
                if (!char.cyberware) char.cyberware = [];
                if (!char.gear) char.gear = { weapons: [], armor: { body: '', head: '' }, items: [] };
                if (!char.style) char.style = [];
                if (!char.lifestyle) char.lifestyle = "100";
                if (!char.housing) char.housing = "500";
                if (!char.notes) char.notes = "";
                if (!char.avatar) char.avatar = "";
                if (char.money === undefined) char.money = 1000;
                if (!char.baseStats) {
                    char.baseStats = {
                        INT: char.INT || 6, REF: char.REF || 6, DEX: char.DEX || 6,
                        TECH: char.TECH || 6, COOL: char.COOL || 6, WILL: char.WILL || 6,
                        LUCK: char.LUCK || 6, MOVE: char.MOVE || 6, BODY: char.BODY || 6, EMP: char.EMP || 6
                    };
                }
                ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'].forEach(s => delete char[s]);
                saveCharacter(char);
                const nameInp = document.getElementById('charName');
                const roleSel = document.getElementById('genRole');
                if (nameInp) nameInp.value = char.name;
                if (roleSel) roleSel.value = char.role;
                this.displaySavedCharacterCard();
                if (window.shopUI) window.shopUI.render();
                if (window.inventoryUI) window.inventoryUI.render();
                alert('Персонаж импортирован!');
            } catch (err) {
                console.error('Ошибка разбора JSON:', err);
                alert('Ошибка разбора JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    enableEditMode(card) {
    const char = loadCharacter();
    if (!char) return;
    
    // Базовые характеристики – берём из сохранённого персонажа
    const baseStats = char.baseStats || {
        INT: char.INT || 6, REF: char.REF || 6, DEX: char.DEX || 6,
        TECH: char.TECH || 6, COOL: char.COOL || 6, WILL: char.WILL || 6,
        LUCK: char.LUCK || 6, MOVE: char.MOVE || 6, BODY: char.BODY || 6, EMP: char.EMP || 6
    };
    
    const nameSpan = card.querySelector('[data-field="name"]');
    const roleSpan = card.querySelector('[data-field="role"]');
    if (!nameSpan || !roleSpan) return;
    const currentRole = roleSpan.innerText;
    roleSpan.innerHTML = `<select class="edit-select">${this.getRoleOptions(currentRole)}</select>`;
    
    // Характеристики – используем baseStats
    card.querySelectorAll('.stat-item').forEach(item => {
        const statNameElem = item.querySelector('.stat-name');
        if (statNameElem) {
            const statName = statNameElem.innerText;
            const baseValue = baseStats[statName] || 6;
            const valueSpan = item.querySelector('.stat-value');
            if (valueSpan) {
                valueSpan.outerHTML = `<input type="number" class="edit-stat" data-stat="${statName}" value="${baseValue}" min="2" max="8">`;
            }
        }
    });
    
    // Навыки (без изменений)
    card.querySelectorAll('.skill-item').forEach(item => {
        const skillNameElem = item.querySelector('.skill-name');
        const skillLevelElem = item.querySelector('.skill-level');
        if (skillNameElem && skillLevelElem) {
            const skillName = skillNameElem.innerText;
            const skillLevel = skillLevelElem.innerText;
            item.innerHTML = `<span class="skill-name">${skillName}</span><input type="number" class="edit-skill" data-skill="${skillName}" value="${skillLevel}" min="0" max="10">`;
        }
    });
    
    // ПЗ
    const hpDiv = card.querySelector('.derived-stats div:first-child');
    if (hpDiv) {
        const match = hpDiv.innerText.match(/ПЗ:\s*(\d+)\s*\/\s*(\d+)/);
        if (match) {
            const current = match[1];
            const max = match[2];
            hpDiv.innerHTML = `<label>ПЗ: <input type="number" class="edit-hp" value="${current}" min="0" max="${max}" style="width:70px"> / ${max}</label>`;
        }
    }
    
    // Деньги
    const existingEditMoney = card.querySelector('.edit-money');
    if (!existingEditMoney) {
        const moneySpan = card.querySelector('.char-money');
        if (moneySpan) {
            let currentMoney = parseInt(moneySpan.innerText);
            if (isNaN(currentMoney)) currentMoney = 0;
            moneySpan.innerHTML = `<input type="number" class="edit-money" value="${currentMoney}" min="0" step="100" style="width:100px">`;
        }
    }
    
    this.makeEquipmentEditable(card);
    const editBtn = card.querySelector('.edit-card-btn');
    if (editBtn) {
        editBtn.textContent = '💾 Сохранить';
        editBtn.classList.add('save-card-btn');
        editBtn.classList.remove('edit-card-btn');
        const oldHandler = editBtn._clickHandler;
        if (oldHandler) editBtn.removeEventListener('click', oldHandler);
        const saveHandler = () => this.disableEditMode(card);
        editBtn.addEventListener('click', saveHandler);
        editBtn._clickHandler = saveHandler;
    }
}

    getRoleOptions(selectedRole) {
        const roles = ["Рокербой","Соло","Нетраннер","Техник","Медтех","Медиа","Законник","Менеджер","Фиксер","Кочевник"];
        return roles.map(r => `<option value="${r}" ${r === selectedRole ? 'selected' : ''}>${r}</option>`).join('');
    }

    makeEquipmentEditable(card) {
        const sections = ['weapons', 'cyber', 'gear', 'armor'];
        sections.forEach(section => {
            let listContainer;
            if (section === 'weapons') listContainer = card.querySelector('[data-weapons-list]');
            else if (section === 'cyber') listContainer = card.querySelector('[data-cyber-list]');
            else if (section === 'gear') listContainer = card.querySelector('[data-gear-list]');
            else if (section === 'armor') listContainer = card.querySelector('[data-armor-list]');
            if (!listContainer) return;
            const addBtn = document.createElement('button');
            addBtn.textContent = '+ Добавить';
            addBtn.className = 'add-item-btn';
            addBtn.addEventListener('click', () => {
                const newItem = prompt(`Введите название нового предмета (${section}):`);
                if (newItem) {
                    const newLi = document.createElement('li');
                    if (section === 'weapons') newLi.innerHTML = `🔫 ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    else if (section === 'cyber') newLi.innerHTML = `🦾 ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    else if (section === 'gear') newLi.innerHTML = `📦 ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    else if (section === 'armor') {
                        if (newItem.startsWith('Тело:')) newLi.innerHTML = `🛡️ ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                        else newLi.innerHTML = `⛑️ ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    }
                    listContainer.appendChild(newLi);
                    this.attachRemoveListener(newLi);
                }
            });
            listContainer.parentElement.appendChild(addBtn);
            listContainer.querySelectorAll('li').forEach(li => {
                if (!li.querySelector('.remove-item')) {
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '✖';
                    removeBtn.className = 'remove-item';
                    li.appendChild(removeBtn);
                    this.attachRemoveListener(li);
                }
            });
            // Добавляем кнопку для боеприпасов
const ammoContainer = card.querySelector('[data-ammo-list]');
if (ammoContainer) {
    const addAmmoBtn = document.createElement('button');
    addAmmoBtn.textContent = '+ Добавить боеприпасы';
    addAmmoBtn.className = 'add-item-btn';
    addAmmoBtn.addEventListener('click', () => {
        const newItem = prompt('Введите боеприпасы (например, "Базовые пистолетные патроны x50"):');
        if (newItem) {
            const char = loadCharacter();
            if (char && char.ammo) {
                char.ammo.push(newItem);
                saveCharacter(char);
                this.displaySavedCharacterCard();
            }
        }
    });
    ammoContainer.parentElement.appendChild(addAmmoBtn);

    // Добавляем кнопки удаления для каждого боеприпаса
    ammoContainer.querySelectorAll('li').forEach(li => {
        if (!li.querySelector('.remove-ammo')) {
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✖';
            removeBtn.className = 'remove-ammo';
            removeBtn.style.marginLeft = '8px';
            removeBtn.style.background = 'none';
            removeBtn.style.border = 'none';
            removeBtn.style.color = '#ff3c5f';
            removeBtn.style.cursor = 'pointer';
            removeBtn.addEventListener('click', () => {
                const ammoName = li.getAttribute('data-ammo-name');
                if (ammoName && confirm(`Удалить все боеприпасы типа "${ammoName}"?`)) {
                    const char = loadCharacter();
                    if (char && char.ammo) {
                        char.ammo = char.ammo.filter(item => {
                            const parsed = this.getAmmoFromChar([item])[0];
                            return parsed.name !== ammoName;
                        });
                        saveCharacter(char);
                        this.displaySavedCharacterCard();
                    }
                }
            });
            li.appendChild(removeBtn);
        }
    });
}
        });
    }

    attachRemoveListener(li) {
        const removeBtn = li.querySelector('.remove-item');
        if (removeBtn) removeBtn.addEventListener('click', () => li.remove());
    }

    disableEditMode(card) {
    const existingChar = loadCharacter() || {};
    // Получаем новые базовые характеристики из полей ввода
    const newBaseStats = { ...(existingChar.baseStats || {}) };
    card.querySelectorAll('.edit-stat').forEach(input => {
        const statName = input.dataset.stat;
        newBaseStats[statName] = parseInt(input.value) || 6;
    });
    
    // Получаем остальные данные из карточки
    const cardDiv = card.closest('.character-card');
    let newName = cardDiv?.getAttribute('data-name') || 'Безымянный';
    if (!newName || newName === 'Безымянный') {
        newName = card.querySelector('.character-name')?.innerText || 'Безымянный';
    }
    const roleSelect = card.querySelector('[data-field="role"] select');
    const newRole = roleSelect ? roleSelect.value : "Соло";
    
    const newSkills = {};
    card.querySelectorAll('.edit-skill').forEach(input => {
        const skillName = input.dataset.skill;
        newSkills[skillName] = parseInt(input.value) || 0;
    });
    
    // Снаряжение (кроме имплантов – их мы не трогаем, чтобы не потерять)
    const newGear = { weapons: [], cyberware: [], gear: [], armor: { body: '', head: '' } };
    card.querySelectorAll('[data-weapons-list] li').forEach(li => {
        let text = li.innerText.replace('✖', '').trim();
        if (text.startsWith('🔫')) text = text.substring(1).trim();
        if (text) newGear.weapons.push(text);
    });
    // Собираем боеприпасы из редактируемой карточки
    const newAmmo = [];
    card.querySelectorAll('[data-ammo-list] li').forEach(li => {
        const name = li.getAttribute('data-ammo-name');
        const qty = li.getAttribute('data-ammo-qty');
        if (name && qty) {
            newAmmo.push(`${name} × ${qty}`);
        }
    });
    // Импланты берём из existingChar, а не из карточки
    newGear.cyberware = existingChar.cyberware || [];
    card.querySelectorAll('[data-gear-list] li').forEach(li => {
        let text = li.innerText.replace('✖', '').trim();
        if (text.startsWith('📦')) text = text.substring(1).trim();
        if (text) newGear.gear.push(text);
    });
    card.querySelectorAll('[data-armor-list] li').forEach(li => {
        let text = li.innerText.replace('✖', '').trim();
        if (text.includes('Тело:')) newGear.armor.body = text.replace('🛡️', '').trim();
        else if (text.includes('Голова:')) newGear.armor.head = text.replace('⛑️', '').trim();
    });
    
    const editHp = card.querySelector('.edit-hp');
    let newHp = null;
    if (editHp) newHp = parseInt(editHp.value);
    
    let newMoney = existingChar.money !== undefined && !isNaN(existingChar.money) ? existingChar.money : 0;
    const editMoney = card.querySelector('.edit-money');
    if (editMoney) {
        const rawValue = editMoney.value.trim();
        if (rawValue !== "") {
            const val = parseInt(rawValue);
            if (!isNaN(val) && val >= 0) newMoney = val;
        }
    }
    
    const notesDiv = card.querySelector('.notes-preview');
    const newNotes = notesDiv ? notesDiv.innerText : '';
    
    // Используем старый список имплантов (existingChar.cyberware)
    const cyberwareList = existingChar.cyberware || [];
    const modifiedStats = this.applyCyberwareModifiers(newBaseStats, cyberwareList);
    
    const charData = {
        ...existingChar,
        name: newName,
        role: newRole,
        roleRank: existingChar.roleRank || 4,
        baseStats: newBaseStats,
        // Обновляем поля для обратной совместимости
        INT: modifiedStats.INT,
        REF: modifiedStats.REF,
        DEX: modifiedStats.DEX,
        TECH: modifiedStats.TECH,
        COOL: modifiedStats.COOL,
        WILL: modifiedStats.WILL,
        LUCK: modifiedStats.LUCK,
        MOVE: modifiedStats.MOVE,
        BODY: modifiedStats.BODY,
        EMP: modifiedStats.EMP,
        skills: newSkills,
        gear: newGear,
        cyberware: cyberwareList,
        style: existingChar.style || [],
        lifestyle: existingChar.lifestyle || "100",
        housing: existingChar.housing || "500",
        notes: newNotes,
        money: newMoney,
        currentHp: newHp !== null ? newHp : (existingChar.currentHp || getHP(modifiedStats.BODY, modifiedStats.WILL)),
        ammo: newAmmo
    };
    saveCharacter(charData);
    if (window.shopUI) window.shopUI.render();
    if (window.inventoryUI) window.inventoryUI.render();
    this.displaySavedCharacterCard();
}

    syncFromTabs() {
        const name = document.getElementById('charName').value || 'Безымянный';
        const role = document.getElementById('genRole').value;
        const stats = {
            INT: parseInt(document.getElementById('statINT').value) || 6,
            REF: parseInt(document.getElementById('statREF').value) || 6,
            DEX: parseInt(document.getElementById('statDEX').value) || 6,
            TECH: parseInt(document.getElementById('statTECH').value) || 6,
            COOL: parseInt(document.getElementById('statCOOL').value) || 6,
            WILL: parseInt(document.getElementById('statWILL').value) || 6,
            LUCK: parseInt(document.getElementById('statLUCK').value) || 6,
            MOVE: parseInt(document.getElementById('statMOVE').value) || 6,
            BODY: parseInt(document.getElementById('statBODY').value) || 6,
            EMP: parseInt(document.getElementById('statEMP').value) || 6
        };
        let skills = {};
        if (window.idealBuilder && typeof window.idealBuilder.getCurrentSkills === 'function') {
            skills = window.idealBuilder.getCurrentSkills();
        } else {
            skills = { "Атлетика":2, "Восприятие":2, "Драка":2, "Уклонение":2 };
        }
        let gear = { weapons: [], cyberware: [], gear: [], armor: { body: "Лёгкий арморджек", head: "Лёгкий арморджек" } };
        if (window.idealShop && window.idealShop.cart) {
            window.idealShop.cart.forEach(item => {
                if (item.category === 'ranged' || item.category === 'melee') gear.weapons.push(item.item);
                else if (item.category === 'cyber') gear.cyberware.push(item.item);
                else if (item.category === 'gear' || item.category === 'style') gear.gear.push(item.item);
                else if (item.category === 'armor') {
                    if (!gear.armor.body) gear.armor.body = item.item;
                    else if (!gear.armor.head) gear.armor.head = item.item;
                }
            });
        }
        const body = stats.BODY, will = stats.WILL, emp = stats.EMP;
        const maxHp = getHP(body, will);
        const severe = Math.ceil(maxHp / 2);
        let humanityLoss = 0;
        for (const name of gear.cyberware) {
            const implant = detailedCyberware.find(i => i.name === name);
            if (implant) humanityLoss += parseInt(implant.humanity) || 0;
        }
        const humanity = Math.max(0, emp * 10 - humanityLoss);
        const empFrom = Math.floor(humanity / 10);
        const deathSave = body;
        this.buildCharacterCard({
            name, role, roleRank: 4, stats, skills, gear, cyberware: gear.cyberware,
            currentHp: maxHp, maxHp, severe, humanity, empFrom, deathSave, notes: '', avatar: '', money: 0
        });
    }

    attachCardEventHandlers() {
        const healBtn = document.querySelector('.heal-btn');
        const damageBtn = document.querySelector('.damage-btn');
        const closeBtn = document.getElementById('closeCardBtn');
        if (healBtn) {
            healBtn.addEventListener('click', () => {
                const hpSpan = document.querySelector('.current-hp');
                const maxHpSpan = document.querySelector('.derived-stats div:first-child');
                if (!hpSpan || !maxHpSpan) return;
                const match = maxHpSpan.innerText.match(/\d+\s*\/\s*(\d+)/);
                if (!match) return;
                const max = parseInt(match[1]);
                let current = parseInt(hpSpan.innerText);
                const body = parseInt(document.querySelector('.stats-grid .stat-item[data-stat="BODY"] .stat-value')?.innerText) || 6;
                const newHp = Math.min(current + body, max);
                hpSpan.innerText = newHp;
                const char = loadCharacter();
                if (char) {
                    char.currentHp = newHp;
                    saveCharacter(char);
                }
                window.dispatchEvent(new Event('characterUpdated'));
            });
        }
        if (damageBtn) {
    damageBtn.addEventListener('click', () => {
        const dmg = prompt('Введите урон:');
        if (dmg === null) return;
        const hpSpan = document.querySelector('.current-hp');
        const maxHpSpan = document.querySelector('.derived-stats div:first-child');
        if (!hpSpan || !maxHpSpan) return;
        const match = maxHpSpan.innerText.match(/\d+\s*\/\s*(\d+)/);
        if (!match) return;
        const max = parseInt(match[1]);
        let current = parseInt(hpSpan.innerText);
        let newHp = Math.max(0, current - parseInt(dmg));
        hpSpan.innerText = newHp;
        const severe = Math.ceil(max / 2);
        if (newHp <= severe && newHp > 0) alert('⚠️ Тяжёлое ранение! Штраф -2 ко всем действиям.');
        if (newHp <= 0) alert('💀 Смертельное ранение! Требуется спасбросок.');
        const char = loadCharacter();
        if (char) {
            char.currentHp = newHp;
            saveCharacter(char);
        }
        // 👇 ДОБАВЬТЕ ЭТУ СТРОКУ
        window.dispatchEvent(new Event('characterUpdated'));
    });
}
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('characterCardContainer').innerHTML = '';
            });
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }

    // Возвращает массив объектов { name, quantity } из массива ammo
getAmmoFromChar(ammoArray) {
    if (!ammoArray || !ammoArray.length) return [];
    const ammoMap = new Map();
    for (const item of ammoArray) {
        let name = item;
        let quantity = 1;
        // Парсим "Базовые пистолетные патроны x50" или "Базовые пистолетные патроны 50"
        const match = item.match(/(.+)x(\d+)$/i) || item.match(/(.+)\s+(\d+)$/);
        if (match) {
            name = match[1].trim();
            quantity = parseInt(match[2]);
        } else {
            // Если нет числа, считаем 1
            name = item;
            quantity = 1;
        }
        const key = name.toLowerCase();
        if (ammoMap.has(key)) {
            ammoMap.get(key).quantity += quantity;
        } else {
            ammoMap.set(key, { name: name, quantity: quantity });
        }
    }
    return Array.from(ammoMap.values());
}
}