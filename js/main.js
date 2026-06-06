// main.js
import { CharacterWizard } from './modules/wizard.js';
import { TabManager } from './modules/tabs.js';
import { CharacterHelper } from './modules/character-helper.js';
import { HumanityCalculator } from './modules/humanity.js';
import { ExpensesCalc } from './modules/expenses.js';
import { CombatCalculatorUI, DistanceCalculator, InitiativeTracker, GroupInitiative, CombatFormulas } from './modules/combat.js';
import { initTransport } from './modules/transport.js';
import { NPCGenerator, GroupTracker, initGM, MookGenerator, EncounterGenerator, AdvancedContractGenerator, generateSimpleContract, generateNetArchitecture, ScreamSheetGenerator  } from './modules/gm.js';
import { updateAllTables, filterTables, renderFilteredCyberware } from './modules/gear.js';
import { renderRoles } from './modules/roles.js';
import {
    rangedWeapons, meleeWeapons, armors, detailedCyberware, transport,
    streetDrugs, ammoTypes, weaponAttachments, gearItems,
    playerVehicles, addVehicle, saveVehicles, loadVehicles
} from './data.js';
import { saveCharacter, loadCharacter, saveGroup, loadGroup } from './storage.js';
import { allSkills, roleTemplates } from './data/skills-data.js';
import { NightMarket, TreasureGenerator, IdealShop } from './modules/market.js';
import { renderGear } from './modules/gear.js';

// ========== Глобальные функции для экспорта/импорта ==========
function exportAllData() {
    const data = {
        characters: loadCharacter(),
        group: loadGroup(),
        vehicles: playerVehicles,
        version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cyberpunk_red_backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
}

function importAllData(file) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.characters) saveCharacter(data.characters);
            if (data.group) saveGroup(data.group);
            if (data.vehicles) {
                playerVehicles.length = 0;
                playerVehicles.push(...data.vehicles);
                saveVehicles();
            }
            alert('Данные импортированы!');
            location.reload();
        } catch (err) {
            alert('Ошибка импорта');
        }
    };
    reader.readAsText(file);
}

function addRangedWeapon() {
    let newWeapon = { name: prompt("Название:") || "Новое", skill: prompt("Навык:") || "Короткоствольное", dmg: prompt("Урон:") || "2d6", mag: parseInt(prompt("Магазин:")||"10"), rof: parseInt(prompt("СКОР:")||"2"), hands: parseInt(prompt("Рук:")||"1"), conceal: prompt("Скрыть (да/нет):")||"да", cost: parseInt(prompt("Цена:")||"100"), notes: "" };
    rangedWeapons.push(newWeapon);
    updateAllTables();
}
function addMeleeWeapon() {
    let newWeapon = { name: prompt("Название:") || "Новое", type: prompt("Тип (лёгкое/среднее/тяжёлое):") || "среднее", dmg: prompt("Урон:") || "2d6", rof: parseInt(prompt("СКОР:")||"2"), conceal: prompt("Скрыть (да/нет):")||"нет", cost: parseInt(prompt("Цена:")||"50") };
    meleeWeapons.push(newWeapon);
    updateAllTables();
}
function addArmor() {
    let newArmor = { name: prompt("Название:") || "Новая броня", sp: parseInt(prompt("ОС:")||"7"), penalty: parseInt(prompt("Штраф:")||"0"), cost: parseInt(prompt("Цена:")||"50") };
    armors.push(newArmor);
    updateAllTables();
}
function addCyberware() {
    let newCyber = { name: prompt("Название:"), type: prompt("Тип (стилевые/нейро/оптика/аудио/внутренние/внешние/конечности/боргирование):")||"стилевые", install: prompt("Установка (ТЦ/Клиника/Больница):")||"ТЦ", effect: prompt("Эффект:")||"", cost: parseInt(prompt("Цена:")||"100"), humanity: prompt("ПЧ:")||"0", notes: "" };
    detailedCyberware.push(newCyber);
    updateAllTables();
}

function fillIpTable() {
    const tbody = document.getElementById('ipTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let level = 1; level <= 10; level++) {
        const normalCost = level * 20;
        const advancedCost = level * 40;
        const roleCost = level * 60;
        const row = `<tr><td>${level}</td><td>${normalCost}</td><td>${advancedCost}</td><td>${roleCost}</td></tr>`;
        tbody.innerHTML += row;
    }
}
function calculateIp() {
    const type = document.getElementById('ipSkillType').value;
    const current = parseInt(document.getElementById('currentLevel').value) || 0;
    const target = parseInt(document.getElementById('targetLevel').value) || 0;
    if (target <= current) { document.getElementById('ipResult').innerHTML = '<span style="color:#ff3c5f;">Целевой уровень должен быть выше текущего.</span>'; return; }
    let cost = 0;
    for (let lvl = current + 1; lvl <= target; lvl++) {
        if (type === 'normal') cost += lvl * 20;
        else if (type === 'advanced') cost += lvl * 40;
        else cost += lvl * 60;
    }
    document.getElementById('ipResult').innerHTML = `<strong>Стоимость повышения с ${current} до ${target}:</strong> ${cost} IP`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateAllTables();
    fillIpTable();

    new TabManager();
    new NightMarket();
    window.groupTracker = new GroupTracker();
    new DistanceCalculator();
    window.initTracker = new InitiativeTracker();
    new CombatCalculatorUI();
    new HumanityCalculator();
    window.groupInitiative = new GroupInitiative();
    initTransport();
    initGM();   // ЕДИНСТВЕННЫЙ ВЫЗОВ (импортирован из gm.js)
    window.wizard = new CharacterWizard();
    renderRoles();
    new CombatFormulas();
    window.characterHelper = new CharacterHelper();
    // new CharacterWizard();

    document.getElementById('calcExpensesBtn')?.addEventListener('click', () => ExpensesCalc.calc());
    document.getElementById('generateTreasureBtn')?.addEventListener('click', () => TreasureGenerator.generate());
    document.getElementById('exportDataBtn')?.addEventListener('click', exportAllData);
    document.getElementById('importDataBtn')?.addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput')?.addEventListener('change', e => { if (e.target.files[0]) importAllData(e.target.files[0]); });
    document.getElementById('resetAllDataBtn')?.addEventListener('click', () => { if (confirm('Сбросить все данные?')) { localStorage.clear(); location.reload(); } });
    document.getElementById('globalSearch')?.addEventListener('input', (e) => filterTables(e.target.value.toLowerCase()));
    document.getElementById('clearSearch')?.addEventListener('click', () => { document.getElementById('globalSearch').value = ''; filterTables(''); });
    document.getElementById('cyberFilter')?.addEventListener('change', () => renderFilteredCyberware());
    document.getElementById('addRangedWeaponBtn')?.addEventListener('click', addRangedWeapon);
    document.getElementById('addMeleeWeaponBtn')?.addEventListener('click', addMeleeWeapon);
    document.getElementById('addArmorBtn')?.addEventListener('click', addArmor);
    document.getElementById('addCyberBtn')?.addEventListener('click', addCyberware);
    document.getElementById('calculateIpBtn')?.addEventListener('click', calculateIp);


// ========== ФИЛЬТРАЦИЯ СНАРЯЖЕНИЯ ==========
const gearSearch = document.getElementById('gearSearchInput');
const clearGearBtn = document.getElementById('clearGearSearchBtn');
const gearContainer = document.getElementById('gear-table');

console.log('gearSearch found:', gearSearch);
console.log('gearContainer found:', gearContainer);
console.log('renderGear:', renderGear);
console.log('gearItems length:', gearItems?.length);

if (gearSearch && gearContainer && renderGear && gearItems) {
    const updateGearTable = () => {
        const term = gearSearch.value.trim().toLowerCase();
        if (term === "") {
            gearContainer.innerHTML = renderGear(gearItems);
        } else {
            const filtered = gearItems.filter(item => {
                return item.name.toLowerCase().includes(term) ||
                       (item.category && item.category.toLowerCase().includes(term)) ||
                       (item.description && item.description.toLowerCase().includes(term)) ||
                       (item.effect && item.effect.toLowerCase().includes(term));
            });
            gearContainer.innerHTML = renderGear(filtered);
        }
    };
    
    gearContainer.innerHTML = renderGear(gearItems);
    gearSearch.addEventListener('input', updateGearTable);
    
    if (clearGearBtn) {
        clearGearBtn.addEventListener('click', () => {
            gearSearch.value = '';
            updateGearTable();
        });
    }
}
    const toggleThemeBtn = document.getElementById('toggleThemeBtn');
    if (toggleThemeBtn) {
        if (localStorage.getItem('cyberpunkTheme') === 'true') {
            document.body.classList.add('cyberpunk-theme');
            toggleThemeBtn.textContent = '🎨 Обычная тема';
        }
        toggleThemeBtn.addEventListener('click', () => {
            document.body.classList.toggle('cyberpunk-theme');
            const isActive = document.body.classList.contains('cyberpunk-theme');
            localStorage.setItem('cyberpunkTheme', isActive);
            toggleThemeBtn.textContent = isActive ? '🎨 Обычная тема' : '🎨 Cyberpunk Theme';
        });
    }
    // Модальное окно конструктора
const wizardModal = document.getElementById('wizardModal');
const openModalBtn = document.getElementById('openWizardModalBtn');
const closeModalBtns = document.querySelectorAll('#closeWizardModalBtn, #closeWizardModalFooterBtn');

if (openModalBtn && wizardModal) {
    openModalBtn.addEventListener('click', () => {
        wizardModal.style.display = 'flex';
        // Если конструктор уже инициализирован, обновляем отображение шага
        if (window.wizard && window.wizard.renderStep) {
            window.wizard.renderStep();
        }
    });
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            wizardModal.style.display = 'none';
        });
    });
    wizardModal.addEventListener('click', (e) => {
        if (e.target === wizardModal) wizardModal.style.display = 'none';
    });
}
    const terminalCode = document.getElementById('terminalCode');
    if (terminalCode) {
        const messages = [
            "> Инициализация Cyberpunk RED Companion...",
            "> Загрузка модулей: ХАР, Навыки, Снаряжение...",
            "> Подключение к базе данных киберимплантов...",
            "> Калибровка генератора случайных встреч...",
            "> Система готова. Добро пожаловать, эджраннер!",
            "> Введите команду или используйте интерфейс выше."
        ];
        let lineIndex = 0, charIndex = 0, currentLine = '', isPrinting = false;
        function printNextChar() {
            if (lineIndex >= messages.length) {
                terminalCode.innerHTML = '<span class="blink">█</span>';
                return;
            }
            if (!isPrinting) {
                isPrinting = true;
                currentLine = messages[lineIndex];
                charIndex = 0;
                terminalCode.innerHTML = '';
            }
            if (charIndex < currentLine.length) {
                terminalCode.innerHTML += currentLine[charIndex];
                charIndex++;
                setTimeout(printNextChar, 40 + Math.random() * 30);
            } else {
                terminalCode.innerHTML += '<br>';
                lineIndex++;
                isPrinting = false;
                setTimeout(printNextChar, 200);
            }
        }
        setTimeout(printNextChar, 500);

        const terminalHeader = document.getElementById('terminalHeader');
        const terminalBody = document.getElementById('terminalBody');
        const terminalToggle = document.getElementById('terminalToggle');
        if (terminalHeader && terminalBody && terminalToggle) {
            terminalHeader.addEventListener('click', (e) => {
                if (e.target !== terminalToggle) {
                    terminalBody.classList.toggle('collapsed');
                    terminalToggle.textContent = terminalBody.classList.contains('collapsed') ? '+' : '−';
                }
            });
            terminalToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                terminalBody.classList.toggle('collapsed');
                terminalToggle.textContent = terminalBody.classList.contains('collapsed') ? '+' : '−';
            });
        }
    }
 // ========== РЕДАКТОР ХАРАКТЕРИСТИК И НАВЫКОВ (вкладка ХАР & Навыки) ==========
const statsGrid = document.getElementById('statsGridEditor');
const skillsContainer = document.getElementById('skillsListEditor');
const saveStatsBtn = document.getElementById('saveStatsBtn');
const randomStatsEditorBtn = document.getElementById('randomStatsEditorBtn');
const saveSkillsBtn = document.getElementById('saveSkillsBtn');
const resetSkillsBtn = document.getElementById('resetSkillsBtn');
const skillsSearch = document.getElementById('skillsSearchEditor');
const skillsPointsSpan = document.getElementById('skillsPointsRemaining');

// Загрузка текущего персонажа
let currentCharacter = loadCharacter();
if (!currentCharacter) {
    // Создаём заглушку, если нет персонажа
    currentCharacter = { stats: { INT:6, REF:6, DEX:6, TECH:6, COOL:6, WILL:6, LUCK:6, MOVE:6, BODY:6, EMP:6 }, skills: {} };
}

// Функция обновления редактора характеристик
function loadStatsEditor() {
    if (!currentCharacter) return;
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    let html = '';
    stats.forEach(stat => {
        const value = currentCharacter[stat] || 6;
        html += `<label>${stat}: <input type="number" id="stat_${stat}" min="2" max="8" value="${value}"></label>`;
    });
    statsGrid.innerHTML = html;
}
loadStatsEditor();

// Сохранение характеристик
saveStatsBtn?.addEventListener('click', () => {
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    stats.forEach(stat => {
        const input = document.getElementById(`stat_${stat}`);
        if (input) currentCharacter[stat] = parseInt(input.value) || 6;
    });
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    alert('Характеристики сохранены');
});

// Случайные характеристики
randomStatsEditorBtn?.addEventListener('click', () => {
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    stats.forEach(stat => {
        const val = Math.floor(Math.random() * 7) + 2;
        currentCharacter[stat] = val;
        const input = document.getElementById(`stat_${stat}`);
        if (input) input.value = val;
    });
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    alert('Случайные характеристики сохранены');
});

// Загрузка навыков в редактор
function loadSkillsEditor() {
    if (!currentCharacter) return;
    const allSkillsList = allSkills; // из skills-data.js
    const mandatorySkills = [
        "Атлетика", "Драка", "Концентрация", "Общение", "Образование",
        "Уклонение", "Первая помощь", "Проницательность", "Язык (родной)",
        "Знание района", "Восприятие", "Убеждение", "Скрытность"
    ];
    const userSkills = currentCharacter.skills || {};
    // Рассчитываем потраченные очки
    let spent = 0;
    for (let skill of allSkillsList) {
        const level = userSkills[skill.name] ?? (skill.base ? 2 : 0);
        spent += level * (skill.costMult || 1);
    }
    const remaining = 86 - spent;
    if (skillsPointsSpan) skillsPointsSpan.innerText = remaining;

    let html = '<div class="skills-grid-editor">';
    for (let skill of allSkillsList) {
        const level = userSkills[skill.name] ?? (skill.base ? 2 : 0);
        const isMandatory = mandatorySkills.includes(skill.name);
        const mandatoryMark = isMandatory ? ' *' : '';
        html += `
            <div class="skill-editor-item" data-skill="${skill.name}">
                <span class="skill-editor-name">${skill.name}${mandatoryMark}</span>
                <span class="skill-editor-stat">${skill.stat}</span>
                <span class="skill-editor-cost">${skill.costMult === 2 ? '×2' : ''}</span>
                <input type="number" class="skill-editor-level" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="6" value="${level}" step="1">
            </div>
        `;
    }
    html += '</div>';
    skillsContainer.innerHTML = html;

    // Привязываем события к полям ввода для пересчёта остатка
    const inputs = document.querySelectorAll('.skill-editor-level');
    inputs.forEach(inp => {
        inp.addEventListener('input', () => {
            let total = 0;
            document.querySelectorAll('.skill-editor-level').forEach(input => {
                const skillName = input.dataset.skill;
                const val = parseInt(input.value) || 0;
                const costMult = parseInt(input.dataset.cost) || 1;
                total += val * costMult;
            });
            if (skillsPointsSpan) skillsPointsSpan.innerText = 86 - total;
        });
    });
}
loadSkillsEditor();

// Сохранение навыков
saveSkillsBtn?.addEventListener('click', () => {
    const newSkills = {};
    document.querySelectorAll('.skill-editor-level').forEach(inp => {
        const skillName = inp.dataset.skill;
        let val = parseInt(inp.value) || 0;
        if (val < 0) val = 0;
        if (val > 6) val = 6;
        newSkills[skillName] = val;
    });
    currentCharacter.skills = newSkills;
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    alert('Навыки сохранены');
    loadSkillsEditor(); // обновить отображение остатка
});

// Сброс навыков до базовых (2 для базовых, 0 для остальных)
resetSkillsBtn?.addEventListener('click', () => {
    const defaultSkills = {};
    for (let skill of allSkills) {
        defaultSkills[skill.name] = skill.base ? 2 : 0;
    }
    currentCharacter.skills = defaultSkills;
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    loadSkillsEditor();
    alert('Навыки сброшены до базовых');
});

// Поиск по навыкам
skillsSearch?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.skill-editor-item').forEach(item => {
        const name = item.querySelector('.skill-editor-name')?.innerText.toLowerCase() || '';
        item.style.display = name.includes(term) ? '' : 'none';
    });
});   
    // ========== ТЕРМИНАЛ: АНИМАЦИЯ С ВОЗМОЖНОСТЬЮ ПРОПУСКА ==========
const terminalOutput = document.getElementById('terminalOutput');
const terminalInput = document.getElementById('terminalInput');
const terminalBody = document.getElementById('terminalBody');

if (terminalOutput && terminalInput) {
    const bootMessages = [
        "Инициализация Cyberpunk RED Companion...",
        "Загрузка модулей: ХАР, Навыки, Снаряжение...",
        "Подключение к базе данных киберимплантов...",
        "Калибровка генератора случайных встреч...",
        "Система готова. Добро пожаловать, эджраннер!"
    ];
    let msgIndex = 0;
    let charIndex = 0;
    let currentMsg = '';
    let lineDiv = null;
    let animationActive = true;
    let timeouts = [];

    // Очищаем вывод
    terminalOutput.innerHTML = '';
// ========== РЕДАКТОР ХАРАКТЕРИСТИК И НАВЫКОВ (синхронизация) ==========
let currentCharacter = loadCharacter();
if (!currentCharacter) {
    currentCharacter = { INT:6, REF:6, DEX:6, TECH:6, COOL:6, WILL:6, LUCK:6, MOVE:6, BODY:6, EMP:6, skills: {} };
}

function refreshStatsAndSkillsEditor() {
    currentCharacter = loadCharacter();
    if (!currentCharacter) {
        currentCharacter = { INT:6, REF:6, DEX:6, TECH:6, COOL:6, WILL:6, LUCK:6, MOVE:6, BODY:6, EMP:6, skills: {} };
    }
    loadStatsEditor();
    loadSkillsEditor();
}

function loadStatsEditor() {
    const statsGrid = document.getElementById('statsGridEditor');
    if (!statsGrid) return;
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    let html = '';
    stats.forEach(stat => {
        const value = currentCharacter[stat] || 6;
        html += `<label>${stat}: <input type="number" id="stat_${stat}" min="2" max="8" value="${value}"></label>`;
    });
    statsGrid.innerHTML = html;
}

function loadSkillsEditor() {
    const container = document.getElementById('skillsListEditor');
    if (!container) return;
    const allSkillsList = allSkills; // из skills-data.js
    const mandatorySkills = [
        "Атлетика", "Драка", "Концентрация", "Общение", "Образование",
        "Уклонение", "Первая помощь", "Проницательность", "Язык (родной)",
        "Знание района", "Восприятие", "Убеждение", "Скрытность"
    ];
    const userSkills = currentCharacter.skills || {};
    let spent = 0;
    for (let skill of allSkillsList) {
        const level = userSkills[skill.name] ?? (skill.base ? 2 : 0);
        spent += level * (skill.costMult || 1);
    }
    const remaining = 86 - spent;
    const remainingSpan = document.getElementById('skillsPointsRemaining');
    if (remainingSpan) remainingSpan.innerText = remaining;

    let html = '<div class="skills-grid-editor">';
    for (let skill of allSkillsList) {
        const level = userSkills[skill.name] ?? (skill.base ? 2 : 0);
        const isMandatory = mandatorySkills.includes(skill.name);
        const mandatoryMark = isMandatory ? ' *' : '';
        html += `
            <div class="skill-editor-item" data-skill="${skill.name}">
                <span class="skill-editor-name">${skill.name}${mandatoryMark}</span>
                <span class="skill-editor-stat">${skill.stat}</span>
                <span class="skill-editor-cost">${skill.costMult === 2 ? '×2' : ''}</span>
                <input type="number" class="skill-editor-level" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="6" value="${level}" step="1">
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;

    document.querySelectorAll('.skill-editor-level').forEach(inp => {
        inp.addEventListener('input', () => {
            let total = 0;
            document.querySelectorAll('.skill-editor-level').forEach(input => {
                const val = parseInt(input.value) || 0;
                const cost = parseInt(input.dataset.cost) || 1;
                total += val * cost;
            });
            if (remainingSpan) remainingSpan.innerText = 86 - total;
        });
    });
}

// При переключении на вкладку "ХАР & Навыки" обновляем
const charStatsTab = document.querySelector('.sub-tab-btn[data-sub="char-stats"]');
if (charStatsTab) {
    charStatsTab.addEventListener('click', refreshStatsAndSkillsEditor);
}

// Сохранение характеристик
document.getElementById('saveStatsBtn')?.addEventListener('click', () => {
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    stats.forEach(stat => {
        const input = document.getElementById(`stat_${stat}`);
        if (input) currentCharacter[stat] = parseInt(input.value) || 6;
    });
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    refreshStatsAndSkillsEditor(); // синхронизация
    alert('Характеристики сохранены');
});

// Случайные характеристики
document.getElementById('randomStatsEditorBtn')?.addEventListener('click', () => {
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    stats.forEach(stat => {
        const val = Math.floor(Math.random() * 7) + 2;
        currentCharacter[stat] = val;
        const input = document.getElementById(`stat_${stat}`);
        if (input) input.value = val;
    });
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    refreshStatsAndSkillsEditor();
    alert('Случайные характеристики сохранены');
});

// Сохранение навыков
document.getElementById('saveSkillsBtn')?.addEventListener('click', () => {
    const newSkills = {};
    document.querySelectorAll('.skill-editor-level').forEach(inp => {
        const skillName = inp.dataset.skill;
        let val = parseInt(inp.value) || 0;
        if (val < 0) val = 0;
        if (val > 6) val = 6;
        newSkills[skillName] = val;
    });
    currentCharacter.skills = newSkills;
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    refreshStatsAndSkillsEditor();
    alert('Навыки сохранены');
});

// Сброс навыков до базовых
document.getElementById('resetSkillsBtn')?.addEventListener('click', () => {
    const defaultSkills = {};
    for (let skill of allSkills) {
        defaultSkills[skill.name] = skill.base ? 2 : 0;
    }
    currentCharacter.skills = defaultSkills;
    saveCharacter(currentCharacter);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    refreshStatsAndSkillsEditor();
    alert('Навыки сброшены до базовых');
});

// Поиск по навыкам
document.getElementById('skillsSearchEditor')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.skill-editor-item').forEach(item => {
        const name = item.querySelector('.skill-editor-name')?.innerText.toLowerCase() || '';
        item.style.display = name.includes(term) ? '' : 'none';
    });
});

// Дополнительная синхронизация: после сохранения персонажа из визарда (модалка закрывается)
// Вызов refreshStatsAndSkillsEditor() нужно добавить туда, где вызывается window.characterHelper.displaySavedCharacterCard()
// Например, в конце saveCharacter в wizard-core.js, или в main.js после открытия/закрытия модалки.
// Для простоты, добавим observer на изменение localStorage (не рекомендуется, но можно)
// Но лучше всего добавить вызов refreshStatsAndSkillsEditor() в обработчик закрытия модалки.

// Уже в коде есть событие закрытия модального окна (closeWizardModalBtn и т.д.)
// Добавим туда вызов refreshStatsAndSkillsEditor()
const modalCloseBtns = document.querySelectorAll('#closeWizardModalBtn, #closeWizardModalFooterBtn');
modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        refreshStatsAndSkillsEditor();
    });
});
// Также при открытии модалки (если нужно, можно обновить, но не обязательно)
    // Функция остановки анимации и показа финальной строки
    function skipAnimation() {
        if (!animationActive) return;
        animationActive = false;
        // Очищаем все запланированные таймеры
        timeouts.forEach(t => clearTimeout(t));
        timeouts = [];
        // Удаляем текущую анимируемую строку, если она есть
        if (lineDiv && lineDiv.parentNode) lineDiv.remove();
        // Выводим финальную строку
        const readyLine = document.createElement('div');
        readyLine.className = 'terminal-line';
        readyLine.innerText = '> Система готова. Введите "help" для списка команд.';
        terminalOutput.appendChild(readyLine);
        terminalInput.disabled = false;
        terminalInput.focus();
    }

    // Функция анимации
    function animateLoading() {
        if (!animationActive) return;
        if (msgIndex >= bootMessages.length) {
            // Анимация завершена естественным путём
            const readyLine = document.createElement('div');
            readyLine.className = 'terminal-line';
            readyLine.innerText = '> Система готова. Введите "help" для списка команд.';
            terminalOutput.appendChild(readyLine);
            terminalInput.disabled = false;
            terminalInput.focus();
            animationActive = false;
            return;
        }
        if (!lineDiv) {
            lineDiv = document.createElement('div');
            lineDiv.className = 'terminal-line';
            terminalOutput.appendChild(lineDiv);
        }
        if (charIndex === 0) {
            currentMsg = bootMessages[msgIndex];
            lineDiv.innerText = '> ';
        }
        if (charIndex < currentMsg.length) {
            lineDiv.innerText += currentMsg[charIndex];
            charIndex++;
            const timer = setTimeout(animateLoading, 40 + Math.random() * 30);
            timeouts.push(timer);
        } else {
            msgIndex++;
            charIndex = 0;
            if (msgIndex < bootMessages.length) {
                const timer = setTimeout(() => {
                    if (!animationActive) return;
                    if (lineDiv) lineDiv.innerText = '> ';
                    animateLoading();
                }, 400);
                timeouts.push(timer);
            } else {
                const timer = setTimeout(animateLoading, 400);
                timeouts.push(timer);
            }
        }
    }

    // Запускаем анимацию
    animateLoading();
    terminalInput.disabled = true;

    // События для пропуска анимации
    const skipHandler = () => skipAnimation();
    document.addEventListener('keydown', skipHandler);
    if (terminalBody) {
        terminalBody.addEventListener('click', skipHandler);
    }
    // Также можно скипнуть по фокусу на поле ввода (но оно пока disabled)
    // После скипа убираем обработчики
    const originalSkipAnimation = skipAnimation;
    window.skipAnimation = function() {
        skipAnimation();
        document.removeEventListener('keydown', skipHandler);
        if (terminalBody) terminalBody.removeEventListener('click', skipHandler);
    };

    // Функция добавления строки (остаётся)
    function addTerminalLine(text, isError = false) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        if (isError) line.classList.add('terminal-error');
        line.innerText = text;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // Обработчик команд (без изменений)
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim();
            if (cmd === '') return;
            addTerminalLine(`> ${cmd}`);
            terminalInput.value = '';

            const args = cmd.split(' ');
            const command = args[0].toLowerCase();

            switch (command) {
                case 'help':
                    addTerminalLine('Доступные команды:');
                    addTerminalLine('  help           - показать справку');
                    addTerminalLine('  clear          - очистить экран');
                    addTerminalLine('  roll [dice]    - бросить кубики (например, roll 2d6)');
                    addTerminalLine('  theme [dark|cyber] - сменить тему (dark/cyber)');
                    addTerminalLine('  stats          - показать текущего персонажа');
                    addTerminalLine('  cyberware      - список имплантов');
                    addTerminalLine('  weapons        - список оружия');
                    addTerminalLine('  date           - текущая дата в мире Cyberpunk');
                    break;
                case 'clear':
                    terminalOutput.innerHTML = '';
                    break;
                case 'roll':
                    if (args.length < 2) {
                        addTerminalLine('Ошибка: укажите кубики, например: roll 2d6', true);
                    } else {
                        const dice = args[1];
                        const [count, sides] = dice.split('d').map(Number);
                        if (isNaN(count) || isNaN(sides)) {
                            addTerminalLine('Ошибка: неверный формат. Пример: roll 2d6', true);
                        } else {
                            let total = 0;
                            let rolls = [];
                            for (let i = 0; i < count; i++) {
                                const r = Math.floor(Math.random() * sides) + 1;
                                rolls.push(r);
                                total += r;
                            }
                            addTerminalLine(`🎲 Результат: ${rolls.join(', ')} → сумма = ${total}`);
                        }
                    }
                    break;
                case 'theme':
                    if (args[1] === 'cyber') {
                        document.body.classList.add('cyberpunk-theme');
                        localStorage.setItem('cyberpunkTheme', 'true');
                        addTerminalLine('Тема изменена на Cyberpunk');
                    } else if (args[1] === 'dark') {
                        document.body.classList.remove('cyberpunk-theme');
                        localStorage.setItem('cyberpunkTheme', 'false');
                        addTerminalLine('Тема изменена на Dark');
                    } else {
                        addTerminalLine('Используйте: theme dark или theme cyber', true);
                    }
                    break;
                case 'stats':
                    const savedChar = loadCharacter();
                    if (savedChar && savedChar.name) {
                        addTerminalLine(`Имя: ${savedChar.name}`);
                        addTerminalLine(`Роль: ${savedChar.role}`);
                        addTerminalLine(`ХАР: INT=${savedChar.INT} REF=${savedChar.REF} DEX=${savedChar.DEX} ...`);
                    } else {
                        addTerminalLine('Персонаж не загружен. Создайте его в конструкторе.', true);
                    }
                    break;
                case 'cyberware':
                    if (typeof detailedCyberware !== 'undefined' && detailedCyberware.length) {
                        addTerminalLine(`Всего имплантов: ${detailedCyberware.length}`);
                        addTerminalLine('Первые 5: ' + detailedCyberware.slice(0,5).map(c => c.name).join(', ') + '...');
                    } else {
                        addTerminalLine('Нет данных об имплантах');
                    }
                    break;
                case 'weapons':
                    if (typeof rangedWeapons !== 'undefined' && rangedWeapons.length) {
                        addTerminalLine(`Всего дальнобойных: ${rangedWeapons.length}`);
                        addTerminalLine(`Пример: ${rangedWeapons[0].name} (${rangedWeapons[0].dmg})`);
                    } else {
                        addTerminalLine('Нет данных об оружии');
                    }
                    break;
                case 'date':
                    const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
                    const day = Math.floor(Math.random() * 28) + 1;
                    const month = months[Math.floor(Math.random() * 12)];
                    const year = 2077 + Math.floor(Math.random() * 5);
                    addTerminalLine(`📅 Сегодня: ${day} ${month} ${year} (Найт-Сити)`);
                    break;
                default:
                    addTerminalLine(`Неизвестная команда: ${command}. Введите "help".`, true);
            }
        }
    });

    // Фокус на поле ввода при клике (после скипа оно станет enabled)
    if (terminalBody) {
        terminalBody.addEventListener('click', () => {
            if (!terminalInput.disabled) terminalInput.focus();
        });
    }
}    
    function syncActiveSubPane() {
        const activeMain = document.querySelector('.main-pane.active');
        if (!activeMain) return;
        const activeSubBtn = activeMain.querySelector('.sub-tab-btn.active');
        if (!activeSubBtn) return;
        const targetId = activeSubBtn.getAttribute('data-sub');
        const targetPane = document.getElementById(targetId);
        if (!targetPane) return;
        activeMain.querySelectorAll('.sub-pane').forEach(pane => pane.classList.remove('active'));
        targetPane.classList.add('active');
    }
    syncActiveSubPane();
    // ========== МОДАЛЬНОЕ ОКНО CHANGELOG ==========
const changelogBtn = document.getElementById('changelogBtn');
const changelogModal = document.getElementById('changelogModal');
if (changelogBtn && changelogModal) {
    const openModal = () => { changelogModal.style.display = 'flex'; };
    const closeModal = () => { changelogModal.style.display = 'none'; };
    changelogBtn.addEventListener('click', openModal);
    document.getElementById('changelogCloseBtn')?.addEventListener('click', closeModal);
    document.getElementById('changelogCloseBtn2')?.addEventListener('click', closeModal);
    changelogModal.addEventListener('click', (e) => {
        if (e.target === changelogModal) closeModal();
    });
}
// Экспорт/импорт JSON
const exportJsonBtn = document.getElementById('exportCharJsonBtn');
const importJsonBtn = document.getElementById('importCharJsonBtn');
const importJsonInput = document.getElementById('importCharJsonInput');

if (exportJsonBtn && window.characterHelper) {
    exportJsonBtn.addEventListener('click', () => window.characterHelper.exportCharacterToJSON());
}
if (importJsonBtn && importJsonInput && window.characterHelper) {
    importJsonBtn.addEventListener('click', () => importJsonInput.click());
    importJsonInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            window.characterHelper.importCharacterFromJSON(e.target.files[0]);
            importJsonInput.value = '';
        }
    });
}
});