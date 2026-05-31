import { TabManager } from './modules/tabs.js';
import { CharacterHelper, HumanityCalculator, ExpensesCalc, IdealCharacterBuilder } from './modules/character.js';
import { CombatCalculatorUI, DistanceCalculator, InitiativeTracker, GroupInitiative, CombatFormulas } from './modules/combat.js';
import { NightMarket, TreasureGenerator, IdealShop } from './modules/market.js';
import { initTransport } from './modules/transport.js';
import { NPCGenerator, GroupTracker, initGM } from './modules/gm.js';
import { updateAllTables, filterTables } from './modules/gear.js';
import { rangedWeapons, meleeWeapons, armors, detailedCyberware, transport, streetDrugs, ammoTypes, weaponAttachments, gearItems, playerVehicles, addVehicle, saveVehicles, loadVehicles } from './data.js';
import { saveCharacter, loadCharacter, saveGroup, loadGroup } from './storage.js';
import { renderRoles } from './modules/roles.js';
// ========== Глобальные функции для экспорта/импорта ==========
function exportAllData() {
    const data = { characters: loadCharacter(), group: loadGroup(), vehicles: playerVehicles, version: '1.0' };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
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
            if(data.characters) saveCharacter(data.characters);
            if(data.group) saveGroup(data.group);
            if(data.vehicles) { playerVehicles.length=0; playerVehicles.push(...data.vehicles); saveVehicles(); }
            alert('Данные импортированы!');
            location.reload();
        } catch(err) { alert('Ошибка импорта'); }
    };
    reader.readAsText(file);
}

// ========== CRUD для добавления предметов ==========
function addRangedWeapon() {
    let newWeapon = { name: prompt("Название:")||"Новое", skill: prompt("Навык:")||"Короткоствольное", dmg: prompt("Урон:")||"2d6", mag: parseInt(prompt("Магазин:")||"10"), rof: parseInt(prompt("СКОР:")||"2"), hands: parseInt(prompt("Рук:")||"1"), conceal: prompt("Скрыть (да/нет):")||"да", cost: parseInt(prompt("Цена:")||"100"), notes: "" };
    rangedWeapons.push(newWeapon);
    updateAllTables();
}
function addMeleeWeapon() {
    let newWeapon = { name: prompt("Название:")||"Новое", type: prompt("Тип (лёгкое/среднее/тяжёлое):")||"среднее", dmg: prompt("Урон:")||"2d6", rof: parseInt(prompt("СКОР:")||"2"), conceal: prompt("Скрыть (да/нет):")||"нет", cost: parseInt(prompt("Цена:")||"50") };
    meleeWeapons.push(newWeapon);
    updateAllTables();
}
function addArmor() {
    let newArmor = { name: prompt("Название:")||"Новая броня", sp: parseInt(prompt("ОС:")||"7"), penalty: parseInt(prompt("Штраф:")||"0"), cost: parseInt(prompt("Цена:")||"50") };
    armors.push(newArmor);
    updateAllTables();
}
function addCyberware() {
    let newCyber = { name: prompt("Название:"), type: prompt("Тип (стилевые/нейро/оптика/аудио/внутренние/внешние/конечности/боргирование):")||"стилевые", install: prompt("Установка (ТЦ/Клиника/Больница):")||"ТЦ", effect: prompt("Эффект:")||"", cost: parseInt(prompt("Цена:")||"100"), humanity: prompt("ПЧ:")||"0", notes: "" };
    detailedCyberware.push(newCyber);
    updateAllTables();
}

// ========== Инициализация ==========
document.addEventListener('DOMContentLoaded', () => {
    updateAllTables();
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
    initGM();
    renderRoles();
    new CombatFormulas();
    document.getElementById('calcExpensesBtn')?.addEventListener('click', () => ExpensesCalc.calc());
    document.getElementById('generateTreasureBtn')?.addEventListener('click', () => TreasureGenerator.generate());
    document.getElementById('exportDataBtn')?.addEventListener('click', exportAllData);
    document.getElementById('importDataBtn')?.addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput')?.addEventListener('change', e => { if(e.target.files[0]) importAllData(e.target.files[0]); });
    document.getElementById('resetAllDataBtn')?.addEventListener('click', () => { if(confirm('Сбросить все данные?')) { localStorage.clear(); location.reload(); } });
    document.getElementById('globalSearch')?.addEventListener('input', (e) => filterTables(e.target.value.toLowerCase()));
    document.getElementById('clearSearch')?.addEventListener('click', () => { document.getElementById('globalSearch').value = ''; filterTables(''); });
    document.getElementById('cyberFilter')?.addEventListener('change', () => { if(document.getElementById('cyber-detailed-table')) updateAllTables(); });
    document.getElementById('addRangedWeaponBtn')?.addEventListener('click', addRangedWeapon);
    document.getElementById('addMeleeWeaponBtn')?.addEventListener('click', addMeleeWeapon);
    document.getElementById('addArmorBtn')?.addEventListener('click', addArmor);
    document.getElementById('addCyberBtn')?.addEventListener('click', addCyberware);
    // ========== КИБЕРПАНК-ТЕРМИНАЛ С ЭФФЕКТОМ ПЕЧАТИ ==========
function initTerminal() {
    const terminalCode = document.getElementById('terminalCode');
    if (!terminalCode) return;
    
    const messages = [
        "> Инициализация Cyberpunk RED Companion...",
        "> Загрузка модулей: ХАР, Навыки, Снаряжение...",
        "> Подключение к базе данных киберимплантов...",
        "> Калибровка генератора случайных встреч...",
        "> Система готова. Добро пожаловать, эджраннер!",
        "> Введите команду или используйте интерфейс выше."
    ];
    
    let lineIndex = 0;
    let charIndex = 0;
    let currentLine = '';
    let isPrinting = false;
    
    function printNextChar() {
        if (lineIndex >= messages.length) {
            // После всех сообщений оставляем мигающий курсор
            terminalCode.innerHTML = '<span class="blink">█</span>';
            return;
        }
        
        if (!isPrinting) {
            isPrinting = true;
            currentLine = messages[lineIndex];
            charIndex = 0;
            terminalCode.innerHTML = ''; // очищаем перед новой строкой
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
    
    // Запускаем печать через небольшую задержку
    setTimeout(printNextChar, 500);
    
    // Сворачивание/разворачивание терминала
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
// Переключение киберпанк-темы
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
if (toggleThemeBtn) {
    // Проверяем сохранённое состояние
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

initTerminal();
});