// main.js
import { CharacterWizard } from './modules/wizard.js';
import { TabManager } from './modules/tabs.js';
import { CharacterHelper } from './modules/character-helper.js';
import { HumanityCalculator } from './modules/humanity.js';
import { ExpensesCalc } from './modules/expenses.js';
import { IdealCharacterBuilder } from './modules/ideal-builder.js';
import { CombatCalculatorUI, DistanceCalculator, InitiativeTracker, GroupInitiative, CombatFormulas } from './modules/combat.js';
import { initTransport } from './modules/transport.js';
import { NPCGenerator, GroupTracker, initGM, MookGenerator, EncounterGenerator, AdvancedContractGenerator, generateSimpleContract, generateNetArchitecture } from './modules/gm.js';
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

// Функции добавления новых предметов (остаются в main.js)
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

// Заполнение таблицы стоимости IP
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
    // Первичный рендеринг таблиц
    updateAllTables();
    fillIpTable();

    // Инициализация основных модулей
    new TabManager();
    new CharacterHelper();
    new NightMarket();
    window.groupTracker = new GroupTracker();
    new DistanceCalculator();
    window.initTracker = new InitiativeTracker();
    new CombatCalculatorUI();
    new HumanityCalculator();
    window.groupInitiative = new GroupInitiative();
    window.idealBuilder = new IdealCharacterBuilder();
    window.idealShop = new IdealShop();
    initTransport();
    // Инициализация GM-модулей
    initGM(); // эта функция должна быть определена где-то (например, в отдельном модуле) или мы вызовем отдельные инициализаторы
    // Альтернативно – вызовем каждую инициализацию вручную, если нет единого initGM.
    // Для простоты создадим небольшую функцию initGM прямо здесь, если она не экспортируется из gm.js.
    // В старом gm.js была функция initGM. Сейчас её нет, поэтому создадим временную.
    function initGM() {
        // NPC
        document.getElementById('generateNpcBtn')?.addEventListener('click', () => NPCGenerator.generate());
        // Простой контракт
        const simpleContractBtn = document.getElementById('genContractBtn');
        if (simpleContractBtn) {
            simpleContractBtn.addEventListener('click', generateSimpleContract);
        }
        // Продвинутый контракт
        const advancedContractBtn = document.getElementById('generateAdvancedContractBtn');
        if (advancedContractBtn) {
            advancedContractBtn.addEventListener('click', () => AdvancedContractGenerator.generate());
        }
        const copyContractBtn = document.getElementById('copyContractBtn');
        if (copyContractBtn) {
            copyContractBtn.addEventListener('click', () => AdvancedContractGenerator.copyToClipboard());
        }
        // Киберпсихоз
        const psychoBtn = document.getElementById('calcPsychoBtn');
        if (psychoBtn) {
            psychoBtn.addEventListener('click', () => checkCyberpsychosis());
        }
        // Архитектура сети
        const netBtn = document.getElementById('genNetArchBtn');
        if (netBtn) {
            netBtn.addEventListener('click', generateNetArchitecture);
        }
        // Мобы
        const mookBtn = document.getElementById('generateMooksBtn');
        if (mookBtn) {
            mookBtn.addEventListener('click', () => MookGenerator.generate());
        }
        // Случайные встречи
        const encounterBtn = document.getElementById('generateEncounterBtn');
        if (encounterBtn) {
            encounterBtn.addEventListener('click', () => EncounterGenerator.generate());
        }
    }
    initGM();

    renderRoles();
    new CombatFormulas();
    new CharacterWizard();

    // Обработчики кнопок
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

    // Тема
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

    // Терминал
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

    // Синхронизация активных подпанелей (для корректного отображения при загрузке)
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
});