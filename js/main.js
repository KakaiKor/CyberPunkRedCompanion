// main.js
import { CharacterWizard } from './modules/wizard.js';
import { TabManager } from './modules/tabs.js';
import { CharacterHelper } from './modules/character-helper.js';
import { HumanityCalculator } from './modules/humanity.js';
import { ExpensesCalc } from './modules/expenses.js';
import { IdealCharacterBuilder } from './modules/ideal-builder.js';
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
    initGM();   // ЕДИНСТВЕННЫЙ ВЫЗОВ (импортирован из gm.js)

    renderRoles();
    new CombatFormulas();
    new CharacterWizard();

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
});