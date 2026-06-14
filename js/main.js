// main.js
import { CharacterWizard } from './modules/wizard.js';
import { TabManager } from './modules/tabs.js';
import { CharacterHelper } from './modules/character-helper.js';
import { HumanityCalculator } from './modules/humanity.js';
import { ExpensesCalc } from './modules/expenses.js';
import { CombatCalculatorUI, DistanceCalculator, InitiativeTracker, GroupInitiative, CombatFormulas } from './modules/combat.js';
import { initTransport } from './modules/transport.js';
import { NPCGenerator, GroupTracker, initGM, MookGenerator, EncounterGenerator, AdvancedContractGenerator, generateNetArchitecture, ScreamSheetGenerator  } from './modules/gm.js';
import { updateAllTables, filterTables, renderFilteredCyberware } from './modules/gear.js';
import { renderRoles } from './modules/roles.js';
import {
    rangedWeapons, meleeWeapons, armors, detailedCyberware, transport,
    streetDrugs, ammoTypes, weaponAttachments, gearItems,
    playerVehicles, addVehicle, saveVehicles, loadVehicles
} from './data.js';
import { saveCharacter, loadCharacter, saveGroup, loadGroup } from './storage.js';
import { allSkills, roleTemplates } from './data/skills-data.js';
// import { NightMarket, TreasureGenerator, IdealShop } from './modules/market.js';
import { renderGear } from './modules/gear.js';
import { ShopUI, InventoryUI } from './modules/market/shop.js';
import { NetrunnerInterface } from './modules/netrunner-interface.js';
import { NetArchitectureUI } from './modules/net-architecture-ui.js';
import { AutoFireUI } from './modules/combat/auto-fire.js';
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
    new AutoFireUI();
    new TabManager();
    // new NightMarket();
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
    // Нетраннер интерфейс
    window.netrunnerInterface = new NetrunnerInterface('netrunnerInterfaceContainer');
    window.netArchUI = new NetArchitectureUI('architectureContainer');
    window.gmVisArchUI = new NetArchitectureUI('gmVisArchitectureContainer');
    // Привязка кнопки генерации архитектуры (в новой вкладке)
    // Привязка кнопок
const gmVisGen = document.getElementById('gmVisGenBtn');
if (gmVisGen) {
    gmVisGen.addEventListener('click', () => {
        const complexity = document.getElementById('gmVisComplexity')?.value || 'medium';
        window.gmVisArchUI.generateWithComplexity(complexity);
    });
}
// Разборка – закрытие модалки
const closeConfrontationBtns = document.querySelectorAll('#closeConfrontationModalBtn, #closeConfrontationModalFooterBtn');
closeConfrontationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('confrontationModal').style.display = 'none';
    });
});
const rollBtn = document.getElementById('rollConfrontationBtn');
if (rollBtn && window.characterHelper) {
    rollBtn.addEventListener('click', () => window.characterHelper.performConfrontation());
}
// Реакция NPC – закрытие модалки
const closeReactionBtns = document.querySelectorAll('#closeReactionModalBtn, #closeReactionModalFooterBtn');
closeReactionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('reactionModal').style.display = 'none';
    });
});
const rollReactionBtn = document.getElementById('rollReactionBtn');
if (rollReactionBtn && window.characterHelper) {
    rollReactionBtn.addEventListener('click', () => window.characterHelper.checkNPCReaction());
}
const gmVisReset = document.getElementById('gmVisResetBtn');
if (gmVisReset) {
    gmVisReset.addEventListener('click', () => window.gmVisArchUI.reset());
}
const gmVisExport = document.getElementById('gmVisExportBtn');
if (gmVisExport) {
    gmVisExport.addEventListener('click', () => {
        const json = window.gmVisArchUI.exportToJSON();
        if (json) {
            const blob = new Blob([json], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `gm_vis_architecture_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        }
    });
}

const gmVisImportBtn = document.getElementById('gmVisImportBtn');
const gmVisImportInput = document.getElementById('gmVisImportInput');
if (gmVisImportBtn && gmVisImportInput) {
    gmVisImportBtn.addEventListener('click', () => gmVisImportInput.click());
    gmVisImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                window.gmVisArchUI.importFromJSON(ev.target.result);
                gmVisImportInput.value = '';
            };
            reader.readAsText(file);
        }
    });
}
    const genArchBtn = document.getElementById('genNetArchBtn');
    if (genArchBtn) {
    genArchBtn.addEventListener('click', () => generateNetArchitecture());
    }

    window.shopUI = new ShopUI();
    window.inventoryUI = new InventoryUI();
    window.playerNetArchUI = new NetArchitectureUI('netrunnerArchitectureContainer');

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

// Привязываем кнопки импорта и сброса в разделе "Нетраннинг → Архитектура сети"
const importArchBtn = document.getElementById('netrunnerImportArchitectureBtn');
const importArchInput = document.getElementById('netrunnerImportArchitectureInput');
const resetArchBtn = document.getElementById('netrunnerResetArchitectureBtn');

if (importArchBtn && importArchInput) {
    importArchBtn.addEventListener('click', () => importArchInput.click());
    importArchInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const success = window.playerNetArchUI.importFromJSON(ev.target.result);
                if (success) {
                    alert('Архитектура загружена. Можно приступать к нетраннингу!');
                } else {
                    alert('Ошибка: неверный формат JSON.');
                }
                importArchInput.value = '';
            };
            reader.readAsText(file);
        }
    });
}

if (resetArchBtn) {
    resetArchBtn.addEventListener('click', () => {
        window.playerNetArchUI.reset();
    });
}
const savedArch = localStorage.getItem('player_net_architecture');
if (savedArch && window.playerNetArchUI) {
    window.playerNetArchUI.importFromJSON(savedArch);
}
// При изменении архитектуры сохранять в localStorage
window.addEventListener('architectureUpdated', (e) => {
    if (e.detail && e.detail.architecture) {
        localStorage.setItem('player_net_architecture', JSON.stringify(e.detail));
    }
});
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
    currentCharacter = { baseStats: { INT:6, REF:6, DEX:6, TECH:6, COOL:6, WILL:6, LUCK:6, MOVE:6, BODY:6, EMP:6 }, skills: {} };
}
// Функция обновления редактора характеристик
function loadStatsEditor() {
    const char = loadCharacter();
    if (!char) return;
    const baseStats = char.baseStats || {
        INT: char.INT||6, REF: char.REF||6, DEX: char.DEX||6,
        TECH: char.TECH||6, COOL: char.COOL||6, WILL: char.WILL||6,
        LUCK: char.LUCK||6, MOVE: char.MOVE||6, BODY: char.BODY||6, EMP: char.EMP||6
    };
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    let html = '';
    stats.forEach(stat => {
        const value = baseStats[stat] || 6;
        html += `<label>${stat}: <input type="number" id="stat_${stat}" min="2" max="8" value="${value}"></label>`;
    });
    statsGrid.innerHTML = html;
}
loadStatsEditor();


// Сохранение характеристик
saveStatsBtn?.addEventListener('click', () => {
    const char = loadCharacter();
    if (!char) return;
    if (!char.baseStats) {
        char.baseStats = {
            INT: char.INT||6, REF: char.REF||6, DEX: char.DEX||6,
            TECH: char.TECH||6, COOL: char.COOL||6, WILL: char.WILL||6,
            LUCK: char.LUCK||6, MOVE: char.MOVE||6, BODY: char.BODY||6, EMP: char.EMP||6
        };
    }
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    stats.forEach(stat => {
        const input = document.getElementById(`stat_${stat}`);
        if (input) char.baseStats[stat] = parseInt(input.value) || 6;
    });
    // Пересчитываем модифицированные для обратной совместимости
    const modified = window.characterHelper.applyCyberwareModifiers(char.baseStats, char.cyberware || []);
    stats.forEach(stat => { char[stat] = modified[stat]; });
    saveCharacter(char);
    if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    alert('Характеристики сохранены');
});

// Случайные характеристики
randomStatsEditorBtn?.addEventListener('click', () => {
    const char = loadCharacter();
    if (!char) return;
    if (!char.baseStats) char.baseStats = {};
    const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    stats.forEach(stat => {
        const val = Math.floor(Math.random() * 7) + 2;
        char.baseStats[stat] = val;
        const input = document.getElementById(`stat_${stat}`);
        if (input) input.value = val;
    });
    const modified = window.characterHelper.applyCyberwareModifiers(char.baseStats, char.cyberware || []);
    stats.forEach(stat => { char[stat] = modified[stat]; });
    saveCharacter(char);
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
        // terminalInput.focus();
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
            // terminalInput.focus();
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
document.getElementById('netrunner-help').innerHTML = `
<div class="card">
     <h3>📖 Полное руководство по нетраннингу (Cyberpunk RED)</h3>
            <p class="note">Этот раздел объясняет основы игры за нетраннера: кибердеку, программы, сетевые действия, бой с чёрным льдом и тактику.</p>
            
            <!-- 1. Основные понятия -->
            <details open>
                <summary>🎓 1. Основные понятия</summary>
                <div class="help-section">
                    <div class="concept-grid">
                        <div class="concept-card">
                            <div class="concept-icon">🖥️</div>
                            <div class="concept-title">Кибердека</div>
                            <div class="concept-desc">Твой главный инструмент. Имеет слоты для программ (обычно 7).<br><strong>Стандартная кибердека:</strong> 7 слотов, цена 500eb.</div>
                        </div>
                        <div class="concept-card">
                            <div class="concept-icon">⚡</div>
                            <div class="concept-title">Интерфейс (ролевой навык)</div>
                            <div class="concept-desc">
                                Определяет, сколько <strong>сетевых действий</strong> за ход:
                                <ul class="compact-list">
                                    <li>Ранг 1–3 → 2 действия</li>
                                    <li>Ранг 4–6 → 3 действия</li>
                                    <li>Ранг 7–9 → 4 действия</li>
                                    <li>Ранг 10 → 5 действий</li>
                                </ul>
                            </div>
                        </div>
                        <div class="concept-card">
                            <div class="concept-icon">🧠</div>
                            <div class="concept-title">Архитектура сети</div>
                            <div class="concept-desc">"Подземелье" из этажей: пароль, файл, узел управления или чёрный лёд. Цель — достичь дна.</div>
                        </div>
                    </div>
                </div>
            </details>
            
            <!-- 2. Способности интерфейса -->
            <details>
                <summary>⚙️ 2. Способности интерфейса (сетевые действия)</summary>
                <div class="help-section">
                    <div class="abilities-grid">
                        <div class="ability-card"><div class="ability-icon">🔓</div><div class="ability-name">Бэкдор</div><div class="ability-desc">Взлом пароля: Интерфейс + 1d10 против СЛ.</div></div>
                        <div class="ability-card"><div class="ability-icon">🌀</div><div class="ability-name">Подкат</div><div class="ability-desc">Побег: Интерфейс + 1d10 против ВСП льда + 1d10.</div></div>
                        <div class="ability-card"><div class="ability-icon">⚡</div><div class="ability-name">Разряд</div><div class="ability-desc">Атака 1d6: Интерфейс + 1d10 против ЗАЩ льда + 1d10.</div></div>
                        <div class="ability-card"><div class="ability-icon">🗺️</div><div class="ability-name">Следопыт</div><div class="ability-desc">Раскрывает типы этажей впереди.</div></div>
                        <div class="ability-card"><div class="ability-icon">🔍</div><div class="ability-name">Идентификация</div><div class="ability-desc">Определяет содержимое файла.</div></div>
                        <div class="ability-card"><div class="ability-icon">🎮</div><div class="ability-name">Контроль</div><div class="ability-desc">Захват узла (камеры, турели).</div></div>
                        <div class="ability-card"><div class="ability-icon">💾</div><div class="ability-name">Вирус</div><div class="ability-desc">Оставляет вирус на дне архитектуры.</div></div>
                        <div class="ability-card"><div class="ability-icon">👻</div><div class="ability-name">Плащ</div><div class="ability-desc">Скрывает следы.</div></div>
                        <div class="ability-card"><div class="ability-icon">📡</div><div class="ability-name">Сканер</div><div class="ability-desc">Находит точки доступа (мясное действие).</div></div>
                    </div>
                    <p class="note"><em>Реализовано:</em> Бэкдор, Разряд, Подкат, Контроль (заглушка), Чтение файла.</p>
                </div>
            </details>
            
            <!-- 3. Программы -->
            <details>
                <summary>💾 3. Программы</summary>
                <div class="help-section">
                    <div class="program-types-grid">
                        <div class="program-type-card attack"><div class="type-icon">⚔️</div><div class="type-name">Атакующие</div><div class="type-desc">Бросок: <strong>Интерфейс + АТК + d10</strong> против ЗАЩ цели.</div></div>
                        <div class="program-type-card defense"><div class="type-icon">🛡️</div><div class="type-name">Защитные</div><div class="type-desc">Снижают урон или блокируют эффекты (Доспехи, Щит).</div></div>
                        <div class="program-type-card boost"><div class="type-icon">⚡</div><div class="type-name">Усиливающие</div><div class="type-desc">Пассивные бонусы: Червь (+2 к бэкдору), Быстрый Гонзалес (+2 к реакции).</div></div>
                        <div class="program-type-card ice"><div class="type-icon">💀</div><div class="type-name">Чёрный лёд</div><div class="type-desc">Занимают 2 слота, могут быть запущены как атакующие или затаившиеся.</div></div>
                    </div>
                    <div class="how-to-use">
                        <h4>🎮 Как использовать программы</h4>
                        <ol><li>Установи в кибердеку (вкладка «Кибердека и программы»).</li><li>Активируй (зелёный индикатор).</li><li>В бою выбери атакующую программу из списка и нажми «Применить».</li><li>Защитные и усиливающие работают автоматически.</li></ol>
                    </div>
                </div>
            </details>
            
            <!-- 4. Бой с чёрным льдом -->
            <details>
                <summary>⚔️ 4. Бой с чёрным льдом</summary>
                <div class="help-section">
                    <div class="combat-steps">
                        <div class="step-card"><div class="step-number">1</div><div class="step-title">Вход на этаж</div><div class="step-desc">Проверка реакции: Интерфейс + 1d10 против РЕА льда + 1d10. Если лёд выигрывает – бесплатный удар.</div></div>
                        <div class="step-card"><div class="step-number">2</div><div class="step-title">Очередь инициативы</div><div class="step-desc">Вы и лёд ходите по очереди. В твой ход – N сетевых действий (2–5).</div></div>
                        <div class="step-card"><div class="step-number">3</div><div class="step-title">Твой ход</div><div class="step-desc">Разряд (1д6), атакующая программа (1 действие) или Подкат (побег на этаж выше).</div></div>
                        <div class="step-card"><div class="step-number">4</div><div class="step-title">Ход льда</div><div class="step-desc">Автоматическая атака, урон от 1d6 до 3d6 напрямую по ПЗ (броня не помогает).</div></div>
                        <div class="step-card"><div class="step-number">5</div><div class="step-title">Завершение</div><div class="step-desc">Бой до уничтожения льда (ЦЕЛ ≤ 0) или побега.</div></div>
                    </div>
                    <h4>📊 Примеры льда</h4>
                    <div class="ice-stats-grid">
                        <div class="ice-card"><span class="ice-name">Адская гончая</span> <span>РЕА 6, АТК 6, ЗАЩ 2, ЦЕЛ 20, 2d6</span></div>
                        <div class="ice-card"><span class="ice-name">Аспид</span> <span>РЕА 6, АТК 2, ЗАЩ 2, ЦЕЛ 15, уничтожает программу</span></div>
                        <div class="ice-card"><span class="ice-name">Кракен</span> <span>РЕА 2, АТК 8, ЗАЩ 4, ЦЕЛ 30, 3d6</span></div>
                    </div>
                </div>
            </details>
            
            <!-- 5. Тактические советы -->
            <details>
                <summary>🎯 5. Тактические советы</summary>
                <div class="help-section">
                    <div class="tips-grid">
                        <div class="tip-card"><div class="tip-icon">🛡️</div><div class="tip-text">Всегда имей активную «Доспехи» – урон -4.</div></div>
                        <div class="tip-card"><div class="tip-icon">🔰</div><div class="tip-text">«Щит» спасёт от первого удара, но после срабатывания активируй заново.</div></div>
                        <div class="tip-card"><div class="tip-icon">⚔️</div><div class="tip-text">Атакующие программы с высоким АТК (например, «Меч») надёжнее Разряда.</div></div>
                        <div class="tip-card"><div class="tip-icon">🌀</div><div class="tip-text">При низком здоровье используй Подкат – вернёшься позже.</div></div>
                        <div class="tip-card"><div class="tip-icon">💾</div><div class="tip-text">Перед входом в архитектуру сохрани персонажа.</div></div>
                        <div class="tip-card"><div class="tip-icon">⏱️</div><div class="tip-text">Следи за сетевыми действиями – при 0 нельзя атаковать до следующего хода.</div></div>
                    </div>
                </div>
            </details>
            
            <!-- 6. Что уже работает -->
            <details>
                <summary>🔧 6. Интерфейс помощника (готовый функционал)</summary>
                <div class="help-section">
                    <div class="features-grid">
                        <div class="feature-item">✅ Генерация случайной архитектуры (GM и игрок)</div>
                        <div class="feature-item">✅ Визуальное отображение этажей (пароль, файл, узел, лёд)</div>
                        <div class="feature-item">✅ Бой с чёрным льдом (очередь, Разряд, Подкат)</div>
                        <div class="feature-item">✅ Атакующие программы (выбор из списка, урон)</div>
                        <div class="feature-item">✅ Защитные программы (Доспехи, Щит)</div>
                        <div class="feature-item">✅ Усиливающие программы (бонус к бэкдору и реакции)</div>
                        <div class="feature-item">✅ Экспорт/импорт архитектуры через JSON</div>
                        <div class="feature-item">✅ Синхронизация здоровья с персонажем</div>
                    </div>
                    <p class="note">🔄 В разработке: Вирусы, Плащ, Следопыт, Идентификация, полноценные демоны, узлы с турелями.</p>
                </div>
            </details>
            
            <div class="help-footer">
                <p>📖 <strong>Источник:</strong> Cyberpunk RED Core Rulebook, глава «Нетраннинг» (стр. 195–218).</p>
                <p>💡 <strong>Совет:</strong> Экспериментируй с тестовой архитектурой – урон не сохраняется, если персонаж не сохранён.</p>
            </div>
        </div>
    `;
    // ========== СПРАВКА ПО ФИЗИЧЕСКОМУ БОЮ ==========
document.getElementById('combat-help').innerHTML = `
<div class="card">
    <h3>📖 Полное руководство по физическому бою (Cyberpunk RED)</h3>
    <p class="note">В этом разделе собраны основные правила дальнего и рукопашного боя, укрытий, критических травм и тактики.</p>

    <!-- 1. Основы боя -->
    <details open>
        <summary>⚔️ 1. Основы боя</summary>
        <div class="help-section">
            <div class="concept-grid">
                <div class="concept-card">
                    <div class="concept-icon">⏱️</div>
                    <div class="concept-title">Инициатива</div>
                    <div class="concept-desc">РЕФ + 1d10. Порядок действий от большего к меньшему. Переброс при равных значениях.</div>
                </div>
                <div class="concept-card">
                    <div class="concept-icon">🏃</div>
                    <div class="concept-title">Действие перемещения</div>
                    <div class="concept-desc">За ход можно переместиться на <strong>СКО × 2 метра</strong> (или СКО клеток).</div>
                </div>
                <div class="concept-card">
                    <div class="concept-icon">⚡</div>
                    <div class="concept-title">Действие атаки</div>
                    <div class="concept-desc">Одно действие = одна атака. Оружие со СКОР 2 позволяет атаковать дважды.</div>
                </div>
            </div>
        </div>
    </details>

    <!-- 2. Дальнобойный бой -->
    <details>
        <summary>🏹 2. Дальнобойный бой</summary>
        <div class="help-section">
            <div class="formula-card">
                <strong>Проверка атаки:</strong> РЕФ + навык оружия + 1d10<br>
                <strong>Сложность (СЛ):</strong> определяется по таблице дистанции для вашего оружия.<br>
                <strong>Уклонение:</strong> если РЕФ цели ≥ 8, она может попытаться уклониться: ЛВК + Уклонение + 1d10. При успехе атака считается промахом.
            </div>
            <div class="combat-types">
                <div class="combat-type-card"><strong>🎯 Прицельная атака</strong> – штраф –8 к проверке, но особый эффект (голова: урон ×2, нога: перелом, рука: роняет предмет).</div>
                <div class="combat-type-card"><strong>🔥 Автоогонь</strong> – расход 10 патронов, проверка навыка «Автоогонь». Урон = 2d6 × (превышение СЛ), не более ×3 (ПП) или ×4 (винтовка).</div>
                <div class="combat-type-card"><strong>💥 Взрывчатка</strong> – зона 10×10 м, все цели получают урон. Можно попытаться уклониться при РЕФ ≥ 8.</div>
                <div class="combat-type-card"><strong>🔫 Подавляющий огонь</strong> – 10 патронов, все цели в пределах 25 м должны пройти ВОЛЯ+Концентрация против РЕФ+Автоогонь, иначе тратят действие на укрытие.</div>
            </div>
        </div>
    </details>

    <!-- 3. Рукопашный бой -->
    <details>
        <summary>👊 3. Рукопашный бой</summary>
        <div class="help-section">
            <div class="formula-card">
                <strong>Проверка атаки:</strong> ЛВК + навык (Драка, Холодное оружие или Боевые искусства) + 1d10<br>
                <strong>Защита:</strong> ЛВК + Уклонение + 1d10<br>
                <strong>Особенность холодного оружия:</strong> игнорирует половину ОС брони цели (округляя вверх).
            </div>
            <div class="combat-types">
                <div class="combat-type-card"><strong>🥊 Драка</strong> – урон зависит от ТЕЛО (1d6 при ТЕЛО≤4, 2d6 при 5‑6, 3d6 при 7‑10, 4d6 при 11+). Киберрука даёт минимум 2d6.</div>
                <div class="combat-type-card"><strong>🤼 Захват</strong> – ЛВК+Драка против ЛВК+Драка. При успехе цель считается захваченной (штраф –2 ко всем действиям).</div>
                <div class="combat-type-card"><strong>🫧 Удушение</strong> – действие в захвате, наносит урон, равный ТЕЛО, напрямую по ПЗ (броня игнорируется).</div>
                <div class="combat-type-card"><strong>💪 Бросок</strong> – действие в захвате, цель падает ничком и получает урон, равный ТЕЛО.</div>
                <div class="combat-type-card"><strong>🥋 Боевые искусства</strong> – специальные приёмы (айкидо, карате, дзюдо, тхэквондо). Пример: «Обезоруживание» или «Удар ломающий кости».</div>
            </div>
        </div>
    </details>

    <!-- 4. Укрытия и броня -->
    <details>
        <summary>🛡️ 4. Укрытия и броня</summary>
        <div class="help-section">
            <div class="concept-grid">
                <div class="concept-card">
                    <div class="concept-title">Типы укрытий</div>
                    <div class="concept-desc">Сталь (50 ПЗ), камень (40), пулестекло (30), бетон (25), дерево (20).</div>
                </div>
                <div class="concept-card">
                    <div class="concept-title">Щиты</div>
                    <div class="concept-desc">Пуленепробиваемый щит: 10 ПЗ, занимает руку. Живой щит – использует захваченного противника.</div>
                </div>
                <div class="concept-card">
                    <div class="concept-title">Броня</div>
                    <div class="concept-desc">Каждый раз при получении урона ОС брони снижается на 1 (пока не починят). Тяжёлая броня даёт штрафы к РЕФ, ЛВК, СКО.</div>
                </div>
            </div>
        </div>
    </details>

    <!-- 5. Урон и состояния -->
    <details>
        <summary>💔 5. Урон и состояния ранений</summary>
        <div class="help-section">
            <div class="status-table">
                <table class="cyber-table">
                    <thead><tr><th>Состояние</th><th>Порог ПЗ</th><th>Эффект</th></tr></thead>
                    <tbody>
                        <tr><td>Лёгкое ранение</td><td>Меньше максимума</td><td>Нет штрафов</td></tr>
                        <tr><td>Тяжёлое ранение</td><td>≤ половины ПЗ</td><td>–2 ко всем действиям</td></tr>
                        <tr><td>Смертельное ранение</td><td>≤ 0 ПЗ</td><td>–4 ко всем действиям, –6 к СКО, спасбросок в начале каждого хода</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="formula-card">
                <strong>Спасбросок от смерти:</strong> 1d10 < ТЕЛО. При выпадении 10 – провал. Каждый бросок увеличивает штраф на +1. После стабилизации сбрасывается.
            </div>
            <p class="note"><strong>Критические травмы:</strong> возникают, когда при броске урона выпало 2 или более шестёрок. Бросьте 2d6 по таблице «Тело» или «Голова» (в зависимости от зоны). Травма наносит дополнительные 5 урона напрямую по ПЗ.</p>
        </div>
    </details>

    <!-- 6. Тактические советы -->
    <details>
        <summary>🎯 6. Тактические советы</summary>
        <div class="help-section">
            <div class="tips-grid">
                <div class="tip-card"><div class="tip-icon">🛡️</div><div class="tip-text">Всегда ищите укрытие – оно может спасти жизнь.</div></div>
                <div class="tip-card"><div class="tip-icon">🎲</div><div class="tip-text">Не забывайте о модификаторах: темнота, дым, укрытие дают штрафы.</div></div>
                <div class="tip-card"><div class="tip-icon">⚔️</div><div class="tip-text">Используйте подавляющий огонь, чтобы заставить врагов спрятаться.</div></div>
                <div class="tip-card"><div class="tip-icon">🧠</div><div class="tip-text">При низком здоровье лучше отступить и стабилизироваться.</div></div>
                <div class="tip-card"><div class="tip-icon">🔫</div><div class="tip-text">Автоогонь эффективен на средней дистанции, где СЛ минимальна.</div></div>
            </div>
        </div>
    </details>

    <!-- 7. Что уже реализовано в помощнике -->
    <details>
        <summary>🔧 7. Реализованные функции в помощнике</summary>
        <div class="help-section">
            <div class="features-grid">
                <div class="feature-item">✅ Калькулятор ПЗ, урона, критических травм</div>
                <div class="feature-item">✅ Трекер инициативы (индивидуальной и групповой)</div>
                <div class="feature-item">✅ Таблица дистанций для всех типов оружия</div>
                <div class="feature-item">✅ Автоматический огонь с расчётом урона и критических травм</div>
                <div class="feature-item">✅ Калькулятор атаки с возможностью учёта уклонения</div>
                <div class="feature-item">✅ Таблицы критических травм (тело и голова)</div>
                <div class="feature-item">✅ Генератор врагов (mooks, лейтенанты, боссы)</div>
            </div>
            <p class="note">🔄 В ближайших планах: автоматическое применение критических травм к цели, полноценная симуляция боя с очередью ходов.</p>
        </div>
    </details>

    <div class="help-footer">
        <p>📖 <strong>Источник:</strong> Cyberpunk RED Core Rulebook, глава «Перестрелка в пятницу вечером» (стр. 167–194).</p>
        <p>💡 <strong>Совет:</strong> Используйте генератор врагов (GM → Пушечное мясо) для быстрого создания противников.</p>
    </div>
</div>
`;
});