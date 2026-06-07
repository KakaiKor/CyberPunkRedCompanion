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
        // ВСТАВЬТЕ ВАШ ПОЛНЫЙ КОД (ОБЪЕКТ templates)
        // Он у вас есть в старом файле. Для краткости я его пропускаю.
        // Если его нет – скопируйте из предыдущей версии character-helper.js.
        // Эта функция возвращает объект с характеристиками.
        return { INT:6, REF:6, DEX:6, TECH:6, COOL:6, WILL:6, LUCK:6, MOVE:6, BODY:6, EMP:6 };
    }

    generateSkillsForRole(role) {
        // ВСТАВЬТЕ ВАШ ПОЛНЫЙ КОД (ОБЪЕКТ templates)
        return {};
    }

    generateStartingGear(role) {
        // ВСТАВЬТЕ ВАШ ПОЛНЫЙ КОД
        return { weapons: [], armor: { body: '', head: '' }, items: [], cyberware: [] };
    }

    // ========== ОСНОВНЫЕ МЕТОДЫ ДЛЯ КАРТОЧКИ ==========
    buildCharacterCard(cardData) {
        const { name, role, roleRank = 4, stats, skills, gear, cyberware, currentHp, maxHp, severe, humanity, empFrom, deathSave, notes, avatar = '', money = 0 } = cardData;
        const container = document.getElementById('characterCardContainer');
        if (!container) return;
        const cardHtml = this.buildCharacterCardHTML({ name, role, roleRank, stats, skills, gear, cyberware, currentHp, maxHp, severe, humanity, empFrom, deathSave, notes, avatar, money });
        container.innerHTML = cardHtml;
        this.attachCardEventHandlers();
        const editBtn = container.querySelector('.edit-card-btn');
        const syncBtn = container.querySelector('.sync-card-btn');
        if (editBtn) editBtn.addEventListener('click', () => this.enableEditMode(container.querySelector('.character-card')));
        if (syncBtn) syncBtn.addEventListener('click', () => this.syncFromTabs());
    }

    buildCharacterCardHTML({ name, role, roleRank = 4, stats, skills, gear, cyberware = [], currentHp, maxHp, severe, humanity, empFrom, deathSave, notes, avatar = '', money = 0 }) {
        stats = stats || {};
        skills = skills || {};
        gear = gear || { weapons: [], armor: { body: '', head: '' }, items: [] };
        cyberware = cyberware || [];

        // Характеристики (упрощённо, без модификаторов имплантов, для краткости)
        const statsHtml = Object.entries(stats).map(([k, v]) => `<div class="stat-item" data-stat="${k}"><span class="stat-name">${k}</span><span class="stat-value">${v}</span></div>`).join('');
        const skillsHtml = Object.entries(skills).filter(([_, v]) => v > 0).map(([k, v]) => `<div class="skill-item" data-skill="${k}"><span class="skill-name">${this.escapeHtml(k)}</span><span class="skill-level">${v}</span></div>`).join('');
        const weaponsHtml = (gear.weapons || []).map(w => `<li>${this.escapeHtml(w)}</li>`).join('');
        const cyberHtml = (cyberware || []).map(c => `<li>🦾 ${this.escapeHtml(c)}</li>`).join('');
        const gearHtmlItems = (gear.items || []).map(g => `<li>📦 ${this.escapeHtml(g)}</li>`).join('');
        const bodyArmorInfo = armors.find(a => a.name === gear.armor?.body);
        const headArmorInfo = armors.find(a => a.name === gear.armor?.head);
        const armorHtml = `<li>🛡️ Тело: ${this.escapeHtml(gear.armor?.body || 'нет')}${bodyArmorInfo ? ` (ОС ${bodyArmorInfo.sp}, штраф ${bodyArmorInfo.penalty})` : ''}</li><li>⛑️ Голова: ${this.escapeHtml(gear.armor?.head || 'нет')}${headArmorInfo ? ` (ОС ${headArmorInfo.sp}, штраф ${headArmorInfo.penalty})` : ''}</li>`;
        const notesHtml = `<div class="char-section" data-section="notes"><h4>📝 Заметки</h4><div class="notes-preview">${this.escapeHtml(notes) || '— нет —'}</div></div>`;

        const derivedStatsHtml = `
    <div data-derived="hp">ПЗ: <span class="current-hp">${currentHp}</span> / ${maxHp} <span class="hp-threshold">(тяж. ≤ ${severe})</span></div>
    <div data-derived="deathSave">Спасбросок: ${deathSave}</div>
    <div data-derived="money">💰 Деньги: <span class="char-money">${money}</span> eb</div>
    <div data-derived="humanity">Человечность: ${humanity} (ЭМП = ${empFrom})</div>
`;

        const roleInfo = rolesData.find(r => r.name === role);
        const roleSkillHtml = `<div class="role-skill-badge"><span class="role-skill-name">${roleInfo ? roleInfo.skill : '—'}</span><span class="role-skill-rank">${roleRank ? ` (ранг ${roleRank})` : ''}</span></div>`;
        const avatarHtml = avatar ? `<div class="avatar-container"><img src="${avatar}" class="character-avatar" alt="avatar"></div>` : '';

        return `
            <div class="character-card" data-name="${this.escapeHtml(name)}" data-role="${role}">
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
                    <div class="char-section" data-section="stats"><h4>📊 Характеристики</h4><div class="stats-grid">${statsHtml}</div></div>
                    <div class="char-section" data-section="derived"><h4>❤️ Состояние</h4><div class="derived-stats">${derivedStatsHtml}</div><div class="combat-buttons"><button class="heal-btn">💊 Лечение (+${stats.BODY || 6} ПЗ)</button><button class="damage-btn">💥 Урон</button></div></div>
                    <div class="char-section" data-section="skills"><h4>🎯 Навыки</h4><div class="skills-grid">${skillsHtml || '<p>— нет —</p>'}</div></div>
                    ${notesHtml}
                    <div class="equipment-grid">
                        <div class="equipment-card"><h5>🛡️ Броня</h5><ul>${armorHtml}</ul></div>
                        <div class="equipment-card"><h5>🔫 Оружие</h5><ul>${weaponsHtml || '<li>— нет —</li>'}</ul></div>
                        <div class="equipment-card"><h5>🦾 Киберимпланты</h5><ul>${cyberHtml || '<li>— нет —</li>'}</ul></div>
                        <div class="equipment-card"><h5>🎒 Снаряжение</h5><ul>${gearHtmlItems || '<li>— нет —</li>'}</ul></div>
                    </div>
                </div>
                <div class="corner top-left"></div><div class="corner top-right"></div><div class="corner bottom-left"></div><div class="corner bottom-right"></div>
            </div>
        `;
    }

    displaySavedCharacterCard() {
        const char = loadCharacter();
         console.log('displaySavedCharacterCard: загруженный char.money =', char?.money);
        if (!char) return;
        const stats = {
            INT: char.INT || 6, REF: char.REF || 6, DEX: char.DEX || 6,
            TECH: char.TECH || 6, COOL: char.COOL || 6, WILL: char.WILL || 6,
            LUCK: char.LUCK || 6, MOVE: char.MOVE || 6, BODY: char.BODY || 6, EMP: char.EMP || 6
        };
        const skills = char.skills || {};
        const gear = char.gear || { weapons: [], armor: { body: '', head: '' }, items: [] };
        const cyberware = char.cyberware || [];
        const body = stats.BODY, will = stats.WILL, emp = stats.EMP;
        let maxHp = getHP(body, will);
        let currentHp = char.currentHp;
        if (!currentHp || currentHp < 1 || currentHp > maxHp) currentHp = maxHp;
        const severe = Math.ceil(maxHp / 2);
        let humanityLoss = 0;
        for (const name of cyberware) {
            const implant = detailedCyberware.find(i => i.name === name);
            if (implant) humanityLoss += parseInt(implant.humanity) || 0;
        }
        const humanity = Math.max(0, emp * 10 - humanityLoss);
        const empFrom = Math.floor(humanity / 10);
        const deathSave = body;
        const money = char.money !== undefined ? char.money : 0;
        this.buildCharacterCard({
            name: char.name || 'Безымянный',
            role: char.role || 'Без роли',
            roleRank: char.roleRank || 4,
            stats,
            skills,
            gear,
            cyberware,
            currentHp,
            maxHp,
            severe,
            humanity,
            empFrom,
            deathSave,
            notes: char.notes || '',
            avatar: char.avatar || '',
            money
        });
    }

    exportCharacterToJSON() {
        const char = loadCharacter();
        if (!char) {
            alert('Нет сохранённого персонажа');
            return;
        }
        const dataStr = JSON.stringify(char, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${char.name || 'character'}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
                const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
                stats.forEach(s => { if (char[s] === undefined) char[s] = 6; });
                saveCharacter(char);
                const nameInp = document.getElementById('charName');
                const roleSel = document.getElementById('genRole');
                if (nameInp) nameInp.value = char.name;
                if (roleSel) roleSel.value = char.role;
                stats.forEach(s => {
                    const inp = document.getElementById(`stat${s}`);
                    if (inp) inp.value = char[s];
                });
                if (document.getElementById('statBODY')) this.calcDerived();
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

    // ========== РЕДАКТИРОВАНИЕ КАРТОЧКИ ==========
    enableEditMode(card) {
    console.log('=== enableEditMode ===');
    const nameSpan = card.querySelector('[data-field="name"]');
    const roleSpan = card.querySelector('[data-field="role"]');
    if (!nameSpan || !roleSpan) return;
    
    // Имя не редактируется (оставляем как есть)
    // const currentName = nameSpan.innerText;
    // nameSpan.innerHTML = `<input type="text" class="edit-input" value="${this.escapeHtml(currentName)}">`;
    const currentRole = roleSpan.innerText;
    roleSpan.innerHTML = `<select class="edit-select">${this.getRoleOptions(currentRole)}</select>`;
    
    // Характеристики
    card.querySelectorAll('.stat-item').forEach(item => {
        const statNameElem = item.querySelector('.stat-name');
        const statValueElem = item.querySelector('.stat-value');
        if (statNameElem && statValueElem) {
            const statName = statNameElem.innerText;
            const statValue = statValueElem.innerText;
            statValueElem.outerHTML = `<input type="number" class="edit-stat" data-stat="${statName}" value="${statValue}" min="2" max="8">`;
        }
    });
    
    // Навыки
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
    
    // ДЕНЬГИ – не пересоздаём, если уже есть поле ввода
    const existingEditMoney = card.querySelector('.edit-money');
    if (existingEditMoney) {
        console.log('enableEditMode: поле .edit-money уже существует, пропускаем');
    } else {
        const moneySpan = card.querySelector('.char-money');
        console.log('enableEditMode: moneySpan =', moneySpan);
        if (moneySpan) {
            let currentMoney = parseInt(moneySpan.innerText);
            if (isNaN(currentMoney)) currentMoney = 0;
            console.log('enableEditMode: currentMoney =', currentMoney);
            moneySpan.innerHTML = `<input type="number" class="edit-money" value="${currentMoney}" min="0" step="100" style="width:100px">`;
        } else {
            console.warn('enableEditMode: .char-money не найден, деньги не будут редактироваться');
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
        });
    }

    attachRemoveListener(li) {
        const removeBtn = li.querySelector('.remove-item');
        if (removeBtn) removeBtn.addEventListener('click', () => li.remove());
    }

   disableEditMode(card) {
    console.log('=== disableEditMode ===');
    const existingChar = loadCharacter() || {};
    console.log('existingChar.money =', existingChar.money);
    
    // Имя (не редактируется)
    const cardDiv = card.closest('.character-card');
    let newName = cardDiv?.getAttribute('data-name') || 'Безымянный';
    if (!newName || newName === 'Безымянный') {
        newName = card.querySelector('.character-name')?.innerText || 'Безымянный';
    }
    
    // Роль
    const roleSelect = card.querySelector('[data-field="role"] select');
    const newRole = roleSelect ? roleSelect.value : "Соло";
    
    // Характеристики и навыки
    const newStats = {};
    card.querySelectorAll('.edit-stat').forEach(input => {
        const statName = input.dataset.stat;
        newStats[statName] = parseInt(input.value) || 6;
    });
    const newSkills = {};
    card.querySelectorAll('.edit-skill').forEach(input => {
        const skillName = input.dataset.skill;
        newSkills[skillName] = parseInt(input.value) || 0;
    });
    
    // Снаряжение (без изменений)
    const newGear = { weapons: [], cyberware: [], gear: [], armor: { body: '', head: '' } };
    card.querySelectorAll('[data-weapons-list] li').forEach(li => {
        let text = li.innerText.replace('✖', '').trim();
        if (text.startsWith('🔫')) text = text.substring(1).trim();
        if (text) newGear.weapons.push(text);
    });
    card.querySelectorAll('[data-cyber-list] li').forEach(li => {
        let text = li.innerText.replace('✖', '').trim();
        if (text.startsWith('🦾')) text = text.substring(1).trim();
        if (text) newGear.cyberware.push(text);
    });
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
    
    // ПЗ
    const editHp = card.querySelector('.edit-hp');
    let newHp = null;
    if (editHp) newHp = parseInt(editHp.value);
    
    // ДЕНЬГИ – с логами
    let newMoney = existingChar.money !== undefined ? existingChar.money : 0;
    const editMoney = card.querySelector('.edit-money');
    console.log('disableEditMode: editMoney =', editMoney);
    if (editMoney) {
        const rawValue = editMoney.value.trim();
        console.log('disableEditMode: rawValue =', rawValue);
        if (rawValue !== "") {
            const val = parseInt(rawValue);
            if (!isNaN(val) && val >= 0) {
                newMoney = val;
                console.log('disableEditMode: newMoney установлено в', newMoney);
            } else {
                console.warn('disableEditMode: некорректное значение', rawValue);
            }
        } else {
            console.warn('disableEditMode: поле пустое');
        }
    } else {
        console.warn('disableEditMode: editMoney не найден');
    }
    
    // Производные
    const body = newStats.BODY || 6;
    const will = newStats.WILL || 6;
    const emp = newStats.EMP || 6;
    const hp = getHP(body, will);
    const severe = Math.ceil(hp / 2);
    let humanityLoss = 0;
    for (const name of newGear.cyberware) {
        const implant = detailedCyberware.find(i => i.name === name);
        if (implant) humanityLoss += parseInt(implant.humanity) || 0;
    }
    const humanity = Math.max(0, emp * 10 - humanityLoss);
    const empFrom = Math.floor(humanity / 10);
    const deathSave = body;
    
    const notesDiv = card.querySelector('.notes-preview');
    const newNotes = notesDiv ? notesDiv.innerText : '';
    
    const charData = {
        ...existingChar,
        name: newName,
        role: newRole,
        roleRank: 4,
        ...newStats,
        skills: newSkills,
        gear: newGear,
        cyberware: newGear.cyberware,
        style: existingChar.style || [],
        lifestyle: existingChar.lifestyle || "100",
        housing: existingChar.housing || "500",
        notes: newNotes,
        money: newMoney,
        currentHp: newHp !== null ? newHp : (existingChar.currentHp || hp)
    };
    
    console.log('Сохраняемый charData.money =', charData.money);
    saveCharacter(charData);
    if (window.shopUI) window.shopUI.render();
    if (window.inventoryUI) window.inventoryUI.render();
    this.displaySavedCharacterCard();
    
    if (newHp !== null) {
        const hpSpan = document.querySelector('.current-hp');
        if (hpSpan) hpSpan.innerText = newHp;
    }
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
}