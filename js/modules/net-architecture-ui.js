// modules/net-architecture-ui.js
import { loadCharacter, saveCharacter } from '../storage.js';

const FLOOR_TYPES = {
    PASSWORD: 'password',
    FILE: 'file',
    CONTROL_NODE: 'control_node',
    ICE: 'ice'
};

const TYPE_NAMES = {
    [FLOOR_TYPES.PASSWORD]: '🔒 Пароль',
    [FLOOR_TYPES.FILE]: '📄 Файл',
    [FLOOR_TYPES.CONTROL_NODE]: '🎮 Узел управления',
    [FLOOR_TYPES.ICE]: '💀 Чёрный лёд'
};

const ICE_STATS = {
    "Адская гончая": { perception: 6, reaction: 6, attack: 6, defense: 2, hp: 20, effect: "2d6 урона по мозгу + возгорание" },
    "Аспид": { perception: 4, reaction: 6, attack: 2, defense: 2, hp: 15, effect: "Уничтожает случайную программу" },
    "Блуждающий огонёк": { perception: 4, reaction: 4, attack: 4, defense: 2, hp: 15, effect: "1d6 урона по мозгу, -1 сетевое действие" },
    "Ворон": { perception: 6, reaction: 4, attack: 4, defense: 2, hp: 15, effect: "Делает нецелостной защитную программу + 1d6 урона" },
    "Скорпион": { perception: 2, reaction: 6, attack: 2, defense: 2, hp: 15, effect: "-1d6 к РЕА на час" },
    "Скунс": { perception: 2, reaction: 4, attack: 4, defense: 2, hp: 10, effect: "-2 к подкату" },
    "Лич": { perception: 8, reaction: 2, attack: 6, defense: 2, hp: 25, effect: "-1d6 к ИНТ, РЕФ, ЛВК на час" },
    "Кракен": { perception: 6, reaction: 2, attack: 8, defense: 4, hp: 30, effect: "3d6 урона + блокировка продвижения/отключения на ход" },
    "Великан": { perception: 2, reaction: 2, attack: 8, defense: 4, hp: 25, effect: "3d6 урона + небезопасный выход" },
    "Убийца": { perception: 4, reaction: 8, attack: 6, defense: 2, hp: 20, effect: "4d6 урона программе (если недостаточно – уничтожение)" },
    "Саблезубый": { perception: 8, reaction: 6, attack: 6, defense: 2, hp: 25, effect: "6d6 урона программе (уничтожение)" },
    "Дракон": { perception: 6, reaction: 4, attack: 6, defense: 6, hp: 30, effect: "6d6 урона программе (уничтожение)" }
};

function getRandomFileContent() {
    const files = ["Финансовые отчёты корпорации", "Список сотрудников с допуском", "Чертежи прототипа оружия", "Переписка менеджеров", "Видеозапись с камер наблюдения", "Коды доступа к серверу"];
    return files[Math.floor(Math.random() * files.length)];
}

function getRandomControlNode() {
    const nodes = ["Камеры наблюдения", "Автоматические турели", "Система вентиляции", "Электронные замки дверей", "Лифты", "Система оповещения"];
    return nodes[Math.floor(Math.random() * nodes.length)];
}

function getRandomIceType() {
    return Object.keys(ICE_STATS)[Math.floor(Math.random() * Object.keys(ICE_STATS).length)];
}

function createIceData(iceName) {
    const stats = ICE_STATS[iceName];
    if (!stats) return null;
    return {
        name: iceName,
        perception: stats.perception,
        reaction: stats.reaction,
        attack: stats.attack,
        defense: stats.defense,
        hp: stats.hp,
        maxHp: stats.hp,
        effect: stats.effect,
        isLurking: true,
        inCombat: false
    };
}

// Генерация архитектуры с ответвлениями
export function generateRandomArchitecture(complexity = 'medium') {
    const slBase = { easy: 6, medium: 8, hard: 10 }[complexity] || 8;
    
    let totalFloors = 0;
    for (let i = 0; i < 3; i++) totalFloors += Math.floor(Math.random() * 6) + 1;
    totalFloors = Math.min(totalFloors, 18);
    
    let branchCount = 0;
    while (Math.random() < 0.4 && branchCount < 5) branchCount++;
    
    let mainFloors = Math.max(2, Math.floor(totalFloors * 0.6));
    let remaining = totalFloors - mainFloors;
    const branchFloorCounts = new Array(branchCount).fill(1);
    remaining -= branchCount;
    for (let i = 0; i < remaining && branchCount > 0; i++) branchFloorCounts[i % branchCount]++;
    
    const generateFloor = (index, branchInfo = null) => {
        let type;
        if (index < 2 && !branchInfo) {
            type = Math.random() < 0.7 ? FLOOR_TYPES.PASSWORD : FLOOR_TYPES.FILE;
        } else {
            const r = Math.random();
            if (r < 0.4) type = FLOOR_TYPES.PASSWORD;
            else if (r < 0.6) type = FLOOR_TYPES.FILE;
            else if (r < 0.75) type = FLOOR_TYPES.CONTROL_NODE;
            else type = FLOOR_TYPES.ICE;
        }
        
        let sl = slBase;
        let content = '';
        let iceData = null;
        
        switch (type) {
            case FLOOR_TYPES.PASSWORD:
                sl = slBase + Math.floor(Math.random() * 4);
                content = `Сложность: ${sl}`;
                break;
            case FLOOR_TYPES.FILE:
                content = `Файл: ${getRandomFileContent()}`;
                break;
            case FLOOR_TYPES.CONTROL_NODE:
                sl = slBase + Math.floor(Math.random() * 3);
                content = `Управляет: ${getRandomControlNode()}`;
                break;
            case FLOOR_TYPES.ICE:
                const iceName = getRandomIceType();
                iceData = createIceData(iceName);
                content = `${iceName} (ЦЕЛ ${iceData.hp})`;
                break;
        }
        
        return {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
            index,
            type,
            sl,
            content,
            isResolved: false,
            ice: iceData,
            branch: branchInfo
        };
    };
    
    const main = [];
    for (let i = 0; i < mainFloors; i++) main.push(generateFloor(i));
    
    const branches = [];
    let globalIndex = mainFloors;
    for (let b = 0; b < branchCount; b++) {
        const attachAt = Math.floor(Math.random() * (mainFloors - 1)) + 1;
        const branchFloors = [];
        for (let i = 0; i < branchFloorCounts[b]; i++) {
            const floor = generateFloor(globalIndex + i, { branchId: b, attachAt });
            floor.isActive = false;
            floor.isResolved = false;
            branchFloors.push(floor);
        }
        branches.push({
            id: b,
            attachAt: attachAt,
            floors: branchFloors
        });
        globalIndex += branchFloorCounts[b];
    }
    
    return { main, branches, totalFloors, complexity };
}

export class NetArchitectureUI {
    constructor(containerId = 'architectureContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.architecture = null;
        this.currentBranch = null;      // null = основная ветка, иначе id ответвления
        this.currentFloorIndex = 0;     // индекс внутри текущей ветки
        this.initiativeQueue = [];
        this.currentTurn = null;
        this.netActionsRemaining = 0;
        this.isCombat = false;
        this.init();

        window.addEventListener('characterUpdated', () => this.render());
    }
    // Добавить в класс NetArchitectureUI

renderMinimap() {
    if (!this.architecture || !this.architecture.main) return '';
    
    const mainFloors = this.architecture.main;
    const branches = this.architecture.branches || [];
    
    let html = `<div class="minimap">
                    <h4>🗺️ Архитектура сети (схема)</h4>
                    <div class="minimap-main">`;
    
    // Рендер основной ветки
    for (let i = 0; i < mainFloors.length; i++) {
        const floor = mainFloors[i];
        const isCurrent = (this.currentBranch === null && this.currentFloorIndex === i);
        const isResolved = floor.isResolved;
        const isIce = floor.type === FLOOR_TYPES.ICE;
        
        let icon = '📄';
        if (floor.type === FLOOR_TYPES.PASSWORD) icon = '🔒';
        else if (floor.type === FLOOR_TYPES.CONTROL_NODE) icon = '🎮';
        else if (floor.type === FLOOR_TYPES.ICE) icon = '💀';
        
        let statusClass = '';
        if (isCurrent) statusClass = 'current';
        else if (isResolved) statusClass = 'resolved';
        else if (isIce && !isResolved) statusClass = 'ice';
        
        html += `<div class="minimap-node ${statusClass}" data-type="main" data-index="${i}" title="${floor.type}">
                    <span class="minimap-icon">${icon}</span>
                </div>`;
        
        // Разделитель между этажами (кроме последнего)
        if (i < mainFloors.length - 1) html += `<div class="minimap-connector">│</div>`;
    }
    
    html += `</div>`;
    
    // Рендер ответвлений (каждое в отдельном блоке)
    for (const branch of branches) {
        const attachFloor = mainFloors[branch.attachAt];
        if (!attachFloor) continue;
        
        html += `<div class="minimap-branch" style="margin-left: 40px;">
                    <div class="minimap-branch-label">↳ Ответвление от этажа ${branch.attachAt+1}</div>
                    <div class="minimap-branch-floors">`;
        
        for (let i = 0; i < branch.floors.length; i++) {
            const floor = branch.floors[i];
            const isCurrent = (this.currentBranch === branch.id && this.currentFloorIndex === i);
            const isResolved = floor.isResolved;
            const isIce = floor.type === FLOOR_TYPES.ICE;
            
            let icon = '📄';
            if (floor.type === FLOOR_TYPES.PASSWORD) icon = '🔒';
            else if (floor.type === FLOOR_TYPES.CONTROL_NODE) icon = '🎮';
            else if (floor.type === FLOOR_TYPES.ICE) icon = '💀';
            
            let statusClass = '';
            if (isCurrent) statusClass = 'current';
            else if (isResolved) statusClass = 'resolved';
            else if (isIce && !isResolved) statusClass = 'ice';
            
            html += `<div class="minimap-node ${statusClass}" data-type="branch" data-branch="${branch.id}" data-index="${i}" title="${floor.type}">
                        <span class="minimap-icon">${icon}</span>
                    </div>`;
            if (i < branch.floors.length - 1) html += `<div class="minimap-connector">│</div>`;
        }
        html += `</div></div>`;
    }
    
    html += `</div>`;
    return html;
}
    init() {
        this.renderEmpty();
        document.getElementById('genArchitectureBtn')?.addEventListener('click', () => this.generateNew());
        document.getElementById('resetArchitectureBtn')?.addEventListener('click', () => this.reset());
    }

    // === Проверки ===
    checkCharacterExists() {
        const char = loadCharacter();
        if (!char || !char.name) {
            alert("⚠️ Персонаж не найден! Сначала создайте персонажа (вкладка «Персонаж» → «Создать персонажа» или заполните имя и роль).");
            return false;
        }
        return true;
    }

    getInterfaceRank() {
        const char = loadCharacter();
        if (!char) return 4;
        return char.interfaceRank || char.roleRank || 4;
    }

    getNetActionsPerTurn() {
        const rank = this.getInterfaceRank();
        if (rank >= 10) return 5;
        if (rank >= 7) return 4;
        if (rank >= 4) return 3;
        return 2;
    }

    computeMaxHp(body, will) {
        const avg = (body + will) / 2;
        return 10 + Math.ceil(avg) * 5;
    }

    getCharacterHP() {
        const char = loadCharacter();
        if (!char) return { current: 0, max: 0, exists: false };
        let maxHp = char.maxHp;
        let currentHp = char.currentHp;
        if (maxHp === undefined) {
            const body = char.baseStats?.BODY ?? char.BODY ?? 6;
            const will = char.baseStats?.WILL ?? char.WILL ?? 6;
            maxHp = this.computeMaxHp(body, will);
        }
        if (currentHp === undefined) currentHp = maxHp;
        return { current: currentHp, max: maxHp, exists: true };
    }

    applyDamageToCharacter(damage) {
        if (!this.checkCharacterExists()) return false;
        const char = loadCharacter();
        const hp = this.getCharacterHP();
        let newCurrent = Math.max(0, hp.current - damage);
        char.currentHp = newCurrent;
        if (char.maxHp === undefined) char.maxHp = hp.max;
        saveCharacter(char);
        this.render();
        if (newCurrent <= 0) {
            alert("💀 Персонаж потерял сознание! Нетраннинг прерван.");
            this.reset();
            return false;
        }
        window.dispatchEvent(new Event('characterUpdated'));
        return true;
    }

    rollDice(count, sides) {
        let total = 0;
        for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
        return total;
    }

    ensureIceData(floor) {
        if (!floor || floor.type !== FLOOR_TYPES.ICE) return;
        if (floor.ice && floor.ice.name && floor.ice.isLurking !== undefined) return;
        const match = floor.content.match(/^([^\(]+)/);
        if (match) {
            const iceName = match[1].trim();
            floor.ice = createIceData(iceName);
        }
        if (!floor.ice) floor.ice = createIceData("Адская гончая");
        floor.content = `${floor.ice.name} (ЦЕЛ ${floor.ice.hp})`;
    }

    // === Генерация и сброс ===
    generateNew() {
        this.architecture = generateRandomArchitecture('medium');
        this.currentBranch = null;
        this.currentFloorIndex = 0;
        this.resetCombatState();
        this.render();
    }

    generateWithComplexity(complexity = 'medium') {
        this.architecture = generateRandomArchitecture(complexity);
        this.currentBranch = null;
        this.currentFloorIndex = 0;
        this.resetCombatState();
        this.render();
    }

    reset() {
        this.architecture = null;
        this.resetCombatState();
        this.renderEmpty();
    }

    resetCombatState() {
        this.initiativeQueue = [];
        this.currentTurn = null;
        this.netActionsRemaining = 0;
        this.isCombat = false;
    }

    renderEmpty() {
        this.container.innerHTML = '<p>Нажмите «Сгенерировать архитектуру», чтобы начать.</p>';
    }

    // === Навигация по веткам ===
    getCurrentFloors() {
        if (this.currentBranch === null) return this.architecture?.main || [];
        const branch = this.architecture?.branches?.find(b => b.id === this.currentBranch);
        return branch?.floors || [];
    }

    getCurrentFloor() {
        const floors = this.getCurrentFloors();
        return floors[this.currentFloorIndex];
    }

    isFirstFloor() {
        const idx = this.currentFloorIndex;
        return idx === 0;
    }

    isLastFloor() {
        const floors = this.getCurrentFloors();
        return this.currentFloorIndex === floors.length - 1;
    }

    getLocationString() {
        if (this.currentBranch === null) {
            return `Основная ветка | Этаж ${this.currentFloorIndex+1} / ${this.architecture.main.length}`;
        } else {
            const branch = this.architecture.branches.find(b => b.id === this.currentBranch);
            return `Ответвление (от этажа ${branch.attachAt+1}) | Этаж ${this.currentFloorIndex+1} / ${branch.floors.length}`;
        }
    }

    moveNext() {
        const floors = this.getCurrentFloors();
        if (this.currentFloorIndex + 1 < floors.length) {
            this.currentFloorIndex++;
            this.render();
        } else {
            alert("Вы достигли конца ветки.");
        }
    }

    movePrev() {
        if (this.currentFloorIndex > 0) {
            this.currentFloorIndex--;
            this.render();
        } else {
            alert("Вы в начале ветки.");
        }
    }

    enterBranch(branchId) {
        const branch = this.architecture.branches.find(b => b.id === branchId);
        if (branch && branch.attachAt === this.currentFloorIndex && this.currentBranch === null) {
            this.currentBranch = branchId;
            this.currentFloorIndex = 0;
            this.render();
        }
    }

    exitToMain() {
        if (this.currentBranch !== null) {
            const branch = this.architecture.branches.find(b => b.id === this.currentBranch);
            this.currentBranch = null;
            this.currentFloorIndex = branch.attachAt;
            this.render();
        }
    }

    // === Поиск этажа по ID ===
    findFloorById(floorId) {
        const allFloors = [...this.architecture.main];
        for (const branch of this.architecture.branches) allFloors.push(...branch.floors);
        return allFloors.find(f => f.id === floorId);
    }

    // === Взаимодействие с этажами ===
    async resolvePassword(floorId) {
        const floor = this.findFloorById(floorId);
        if (!floor) return;
        const interfaceRank = this.getInterfaceRank();
        const bonuses = this.getActiveProgramBonuses();
        const roll = this.rollDice(1,10);
        const result = interfaceRank + roll + (bonuses.backdoor || 0);
        const required = floor.sl || 8;
        if (result >= required) {
            floor.isResolved = true;
            alert(`Успех! Интерфейс ${interfaceRank} + d10(${roll}) + бонус ${bonuses.backdoor} = ${result} >= ${required}. Пароль взломан.`);
            this.checkAndAdvance(floorId);
        } else {
            alert(`Провал! Интерфейс ${interfaceRank} + d10(${roll}) + бонус ${bonuses.backdoor} = ${result} < ${required}.`);
        }
        this.render();
    }
    
    readFile(floorId) {
        const floor = this.findFloorById(floorId);
        if (!floor) return;
        alert(`Вы прочитали файл:\n${floor.content}`);
        floor.isResolved = true;
        this.checkAndAdvance(floorId);
        this.render();
    }
    
    controlNode(floorId) {
        const floor = this.findFloorById(floorId);
        if (!floor) return;
        alert(`Вы взяли под контроль узел: ${floor.content}. Теперь вы можете управлять этой системой.`);
        floor.isResolved = true;
        this.checkAndAdvance(floorId);
        this.render();
    }
    
    fightIce(floorId) {
        const floor = this.findFloorById(floorId);
        if (!floor || floor.type !== FLOOR_TYPES.ICE) {
            alert("Это не чёрный лёд.");
            return;
        }
        if (floor.isResolved) {
            alert("Этот лёд уже уничтожен.");
            return;
        }
        this.ensureIceData(floor);
        if (!floor.ice) {
            alert("Не удалось создать данные о чёрном льде.");
            return;
        }
        this.enterFloorWithIce(floorId);
    }
    
    async enterFloorWithIce(floorId) {
        const floor = this.findFloorById(floorId);
        if (!floor || floor.type !== FLOOR_TYPES.ICE || floor.isResolved) return;
        this.ensureIceData(floor);
        const ice = floor.ice;
        if (!ice) {
            alert("Ошибка: не удалось создать данные о чёрном льде.");
            return;
        }
        const interfaceRank = this.getInterfaceRank();
        const bonuses = this.getActiveProgramBonuses();
        if (ice.isLurking) {
            const playerRoll = this.rollDice(1,10);
            const iceRoll = this.rollDice(1,10);
            const playerResult = interfaceRank + playerRoll + (bonuses.reaction || 0);
            const iceReaction = ice.reaction + iceRoll;
            if (iceReaction > playerResult) {
                alert(`⚠️ ${ice.name} затаился и атакует первым!`);
                await this.iceAttack(floorId, true);
            } else {
                alert(`Вы заметили ${ice.name} первым.`);
            }
        }
        this.initiativeQueue = [];
        this.initiativeQueue.unshift({ type: 'ice', floorId: floorId });
        this.initiativeQueue.unshift({ type: 'player' });
        this.isCombat = true;
        this.currentTurn = this.initiativeQueue[0];
        if (this.currentTurn.type === 'player') {
            this.netActionsRemaining = this.getNetActionsPerTurn();
        } else {
            this.netActionsRemaining = 0;
            await this.iceAttack(floorId, false);
        }
        this.render();
    }

    async iceAttack(floorId, isFreeAttack = false) {
        const floor = this.findFloorById(floorId);
        if (!floor || floor.type !== FLOOR_TYPES.ICE) return;
        this.ensureIceData(floor);
        const ice = floor.ice;
        if (!ice) return;
        if (!this.checkCharacterExists()) return;

        const interfaceRank = this.getInterfaceRank();
        const bonuses = this.getActiveProgramBonuses();
        const iceRoll = this.rollDice(1,10);
        const playerRoll = this.rollDice(1,10);
        const iceResult = ice.attack + iceRoll;
        const playerResult = interfaceRank + playerRoll + (bonuses.reaction || 0);

        let damage = 0;
        if (ice.effect.includes('2d6')) damage = this.rollDice(2,6);
        else if (ice.effect.includes('3d6')) damage = this.rollDice(3,6);
        else if (ice.effect.includes('1d6')) damage = this.rollDice(1,6);
        else damage = this.rollDice(2,6);

        if (bonuses.damageReduction) {
            const oldDamage = damage;
            damage = Math.max(1, damage - bonuses.damageReduction);
            if (damage !== oldDamage) alert(`🛡️ Доспехи снизили урон с ${oldDamage} до ${damage}.`);
        }

        if (bonuses.shieldActive && iceResult > playerResult) {
            alert(`🛡️ Щит заблокировал урон от ${ice.name}!`);
            this.deactivateShield();
            if (!isFreeAttack && this.isCombat) this.nextTurn();
            return;
        }

        if (iceResult > playerResult) {
            alert(`❄️ ${ice.name} атакует! Урон: ${damage} по мозгу.`);
            this.applyDamageToCharacter(damage);
        } else {
            alert(`🛡️ Вы уклонились от атаки ${ice.name}.`);
        }
        if (!isFreeAttack && this.isCombat) this.nextTurn();
    }

    async useDischarge(floorId) {
        if (this.netActionsRemaining < 1) {
            alert("Недостаточно сетевых действий!");
            return;
        }
        const floor = this.findFloorById(floorId);
        if (!floor || floor.type !== FLOOR_TYPES.ICE) return;
        this.ensureIceData(floor);
        const ice = floor.ice;
        if (!ice) return;
        const interfaceRank = this.getInterfaceRank();
        const playerRoll = this.rollDice(1,10);
        const iceRoll = this.rollDice(1,10);
        const playerResult = interfaceRank + playerRoll;
        const iceDefense = ice.defense + iceRoll;
        if (playerResult > iceDefense) {
            const damage = this.rollDice(1,6);
            ice.hp -= damage;
            alert(`⚡ Разряд нанёс ${damage} урона ${ice.name}. Осталось ЦЕЛ: ${ice.hp}`);
            if (ice.hp <= 0) {
                alert(`✅ ${ice.name} уничтожен!`);
                floor.isResolved = true;
                this.checkAndAdvance(floorId);
                this.endCombatOnFloor(floorId);
                this.render();
                return;
            }
        } else {
            alert(`❌ Разряд не попал.`);
        }
        this.netActionsRemaining--;
        this.render();
        if (this.netActionsRemaining === 0) this.nextTurn();
    }

    async useEscape(floorId) {
        if (this.netActionsRemaining < 1) {
            alert("Недостаточно сетевых действий!");
            return;
        }
        const floor = this.findFloorById(floorId);
        if (!floor || floor.type !== FLOOR_TYPES.ICE) return;
        this.ensureIceData(floor);
        const ice = floor.ice;
        if (!ice) return;
        const interfaceRank = this.getInterfaceRank();
        const playerRoll = this.rollDice(1,10);
        const iceRoll = this.rollDice(1,10);
        const playerResult = interfaceRank + playerRoll;
        const icePerception = ice.perception + iceRoll;
        if (playerResult > icePerception) {
            alert(`🌀 Вы ускользнули от ${ice.name} на предыдущий этаж.`);
            this.movePrev();
            this.endCombatOnFloor(floorId);
            this.render();
        } else {
            alert(`❌ Не удалось ускользнуть. ${ice.name} атакует!`);
            await this.iceAttack(floorId, false);
        }
        this.netActionsRemaining--;
        this.render();
    }

    async useProgram(floorId, programName) {
        if (this.netActionsRemaining < 1) {
            alert("Недостаточно сетевых действий!");
            return;
        }
        const floor = this.findFloorById(floorId);
        if (!floor || floor.type !== FLOOR_TYPES.ICE) return;
        this.ensureIceData(floor);
        const ice = floor.ice;
        if (!ice) return;
        const program = this.getActivePrograms().find(p => p.name === programName && p.type === 'атакующая');
        if (!program) {
            alert("Программа не найдена или не является атакующей.");
            return;
        }
        const interfaceRank = this.getInterfaceRank();
        const playerRoll = this.rollDice(1,10);
        const iceRoll = this.rollDice(1,10);
        const playerResult = interfaceRank + (program.atk || 0) + playerRoll;
        const iceDefense = ice.defense + iceRoll;
        if (playerResult > iceDefense) {
            let damage = 0;
            if (program.damage) {
                const [count, sides] = program.damage.split('d').map(Number);
                damage = this.rollDice(count, sides);
            } else {
                damage = this.rollDice(2,6);
            }
            ice.hp -= damage;
            alert(`💾 ${program.name} нанёс ${damage} урона ${ice.name}. Осталось ЦЕЛ: ${ice.hp}`);
            if (ice.hp <= 0) {
                alert(`✅ ${ice.name} уничтожен!`);
                floor.isResolved = true;
                this.endCombatOnFloor(floorId);
                this.checkAndAdvance(floorId);
                this.render();
                return;
            }
        } else {
            alert(`❌ Программа ${program.name} не попала.`);
        }
        this.netActionsRemaining--;
        this.render();
        if (this.netActionsRemaining === 0) this.nextTurn();
    }

    nextTurn() {
        if (!this.initiativeQueue.length) return;
        const current = this.initiativeQueue.shift();
        this.initiativeQueue.push(current);
        this.currentTurn = this.initiativeQueue[0];
        if (this.currentTurn.type === 'player') {
            this.netActionsRemaining = this.getNetActionsPerTurn();
            this.render();
            this.updateActionButtons(true);
        } else if (this.currentTurn.type === 'ice') {
            this.netActionsRemaining = 0;
            this.render();
            this.updateActionButtons(false);
            this.iceAttack(this.currentTurn.floorId, false);
        }
    }

    endCombatOnFloor(floorId) {
        this.initiativeQueue = this.initiativeQueue.filter(e => !(e.type === 'ice' && e.floorId === floorId));
        if (this.initiativeQueue.length === 0) {
            this.isCombat = false;
            this.currentTurn = null;
        } else {
            this.currentTurn = this.initiativeQueue[0];
        }
    }

    updateActionButtons(enable) {
        const btns = this.container.querySelectorAll('.action-discharge, .action-escape, .action-program-use');
        btns.forEach(btn => {
            if (enable) btn.removeAttribute('disabled');
            else btn.setAttribute('disabled', 'disabled');
        });
    }

    checkAndAdvance(floorId) {
        const currentFloor = this.getCurrentFloor();
        if (currentFloor && currentFloor.id === floorId && currentFloor.isResolved) {
            if (!this.isLastFloor()) {
                this.moveNext();
            } else {
                alert('🏆 Вы достигли дна архитектуры! Можете оставить вирус или отключиться.');
                this.render();
            }
        }
    }

    // === Программы ===
    getActivePrograms() {
        const char = loadCharacter();
        if (!char?.cyberdeck?.programs) return [];
        return char.cyberdeck.programs.filter(p => p.active);
    }

    getActiveAttackPrograms() {
        const programs = this.getActivePrograms().filter(p => p.type === 'атакующая');
        if (programs.length === 0) {
            return [{
                name: "Меч (тестовая)",
                type: "атакующая",
                atk: 1,
                damage: "3d6",
                effect: "Тестовая программа, наносит 3d6 урона"
            }];
        }
        return programs;
    }

    getActiveProgramBonuses() {
        const active = this.getActivePrograms();
        let bonuses = { backdoor: 0, pathfinder: 0, cloak: 0, reaction: 0, damageReduction: 0, shieldActive: false, flakActive: false };
        for (let p of active) {
            if (p.name === "Червь") bonuses.backdoor += 2;
            if (p.name === "Увидимся") bonuses.pathfinder += 2;
            if (p.name === "Ластик") bonuses.cloak += 2;
            if (p.name === "Быстрый Гонзалес") bonuses.reaction += 2;
            if (p.name === "Доспехи") bonuses.damageReduction = 4;
            if (p.name === "Щит") bonuses.shieldActive = true;
            if (p.name === "Зенитный огонь") bonuses.flakActive = true;
        }
        return bonuses;
    }

    deactivateShield() {
        const char = loadCharacter();
        if (!char?.cyberdeck?.programs) return;
        const shieldProg = char.cyberdeck.programs.find(p => p.name === "Щит" && p.active);
        if (shieldProg) {
            shieldProg.active = false;
            saveCharacter(char);
            if (window.netrunnerInterface) window.netrunnerInterface.render();
            window.dispatchEvent(new Event('characterUpdated'));
        }
    }

    // === Рендер ===
    renderFloorCard(floor) {
        if (!floor) return '<div class="floor-card error">Ошибка: этаж не найден</div>';
        const statusClass = floor.isResolved ? 'resolved' : 'active';
        let html = `<div class="floor-card ${statusClass}" data-id="${floor.id}">
                        <div class="floor-number">Этаж ${(floor.index !== undefined ? floor.index+1 : '?')}</div>
                        <div class="floor-type">${TYPE_NAMES[floor.type]}</div>
                        <div class="floor-content">${this.escapeHtml(floor.content)}</div>`;
        if (!floor.isResolved) {
            if (floor.type === FLOOR_TYPES.ICE) {
                if (!this.isCombat || !this.initiativeQueue.some(e => e.type === 'ice' && e.floorId === floor.id)) {
                    html += `<div class="floor-actions"><button class="action-fight" data-id="${floor.id}">⚔️ Вступить в бой</button></div>`;
                } else {
                    const attackingPrograms = this.getActiveAttackPrograms();
                    let programSelectHtml = '<select class="program-select" data-id="' + floor.id + '">';
                    programSelectHtml += '<option value="">-- Выберите программу --</option>';
                    attackingPrograms.forEach(p => {
                        programSelectHtml += `<option value="${this.escapeHtml(p.name)}" data-atk="${p.atk || 0}">${this.escapeHtml(p.name)} (АТК ${p.atk || 0})</option>`;
                    });
                    programSelectHtml += '</select>';
                    html += `<div class="floor-actions combat-actions">
                                <button class="action-discharge" data-id="${floor.id}">⚡ Разряд (1 действие)</button>
                                <button class="action-escape" data-id="${floor.id}">🌀 Подкат (1 действие)</button>
                                <div class="program-action">
                                    ${programSelectHtml}
                                    <button class="action-program-use" data-id="${floor.id}">💾 Применить (1 дейст.)</button>
                                </div>
                            </div>`;
                }
            } else if (floor.type === FLOOR_TYPES.PASSWORD) {
                html += `<div class="floor-actions"><button class="action-backdoor" data-id="${floor.id}">🔓 Взломать</button></div>`;
            } else if (floor.type === FLOOR_TYPES.FILE) {
                html += `<div class="floor-actions"><button class="action-read" data-id="${floor.id}">📖 Прочитать</button></div>`;
            } else if (floor.type === FLOOR_TYPES.CONTROL_NODE) {
                html += `<div class="floor-actions"><button class="action-control" data-id="${floor.id}">🎮 Захватить</button></div>`;
            }
        }
        if (floor.isResolved) html += `<div class="floor-resolved">✅ Преодолён</div>`;
        html += `</div>`;
        return html;
    }

    renderCombatPanel(hpText, interfaceRank, netActions) {
        if (this.isCombat) {
            return `<div class="combat-panel">
                        <h4>⚔️ Сетевой бой</h4>
                        <div>🎭 Интерфейс (ранг): ${interfaceRank} | Сетевых действий: ${netActions}</div>
                        <div>❤️ Здоровье: ${hpText}</div>
                        <div>Очередь: ${this.initiativeQueue.map(e => e.type === 'player' ? 'Вы' : `Лёд`).join(' → ')}</div>
                        <div>Текущий ход: ${this.currentTurn?.type === 'player' ? 'Вы' : `Чёрный лёд`}</div>
                        <div>Сетевых действий осталось: ${this.netActionsRemaining}</div>
                    </div>`;
        } else {
            return `<div class="combat-panel"><div>🎭 Интерфейс (ранг): ${interfaceRank} | Сетевых действий: ${netActions}</div><div>❤️ Здоровье: ${hpText}</div></div>`;
        }
    }

    render() {
        if (!this.architecture || !this.architecture.main?.length) {
            this.renderEmpty();
            return;
        }
        const currentFloor = this.getCurrentFloor();
        if (!currentFloor) {
            this.renderEmpty();
            return;
        }
        const hpData = this.getCharacterHP();
        const hpText = hpData.exists ? `${hpData.current} / ${hpData.max}` : "❌ Нет персонажа";
        const interfaceRank = this.getInterfaceRank();
        const netActions = this.getNetActionsPerTurn();
        
        let html = `<div class="architecture-nav">
                        <button class="nav-prev" ${this.isFirstFloor() ? 'disabled' : ''}>◀ Назад</button>
                        <span>${this.getLocationString()}</span>
                        <button class="nav-next" ${this.isLastFloor() ? 'disabled' : ''}>Вперёд ▶</button>
                    </div>`;
        html += this.renderFloorCard(currentFloor);
        html += this.renderMinimap();
        if (this.currentBranch === null) {
            const branchesHere = this.architecture.branches.filter(b => b.attachAt === this.currentFloorIndex);
            if (branchesHere.length) {
                html += `<div class="branches-section">
                            <h4>🔀 Ответвления:</h4>
                            <div class="branch-buttons">`;
                for (const branch of branchesHere) {
                    html += `<button class="enter-branch" data-branch="${branch.id}">📂 Войти в ответвление (${branch.floors.length} эт.)</button>`;
                }
                html += `</div></div>`;
            }
        }
        
        if (this.currentBranch !== null) {
            html += `<div class="exit-branch-section">
                        <button class="exit-branch">⬅ Вернуться на основной путь</button>
                     </div>`;
        }
        
        html += this.renderCombatPanel(hpText, interfaceRank, netActions);
        this.container.innerHTML = html;
        this.attachEvents();
    }
    
    attachEvents() {
        const prevBtn = this.container.querySelector('.nav-prev');
        const nextBtn = this.container.querySelector('.nav-next');
        if (prevBtn) prevBtn.addEventListener('click', () => this.movePrev());
        if (nextBtn) nextBtn.addEventListener('click', () => this.moveNext());
        
        this.container.querySelectorAll('.enter-branch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const branchId = parseInt(btn.dataset.branch);
                this.enterBranch(branchId);
            });
        });
        
        const exitBtn = this.container.querySelector('.exit-branch');
        if (exitBtn) exitBtn.addEventListener('click', () => this.exitToMain());
        
        // Обработчики действий с этажами (по id)
        this.container.querySelectorAll('.action-backdoor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorId = btn.dataset.id;
                this.resolvePassword(floorId);
            });
        });
        this.container.querySelectorAll('.action-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorId = btn.dataset.id;
                this.readFile(floorId);
            });
        });
        this.container.querySelectorAll('.action-control').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorId = btn.dataset.id;
                this.controlNode(floorId);
            });
        });
        this.container.querySelectorAll('.action-fight').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorId = btn.dataset.id;
                this.fightIce(floorId);
            });
        });
        this.container.querySelectorAll('.action-discharge').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorId = btn.dataset.id;
                this.useDischarge(floorId);
            });
        });
        this.container.querySelectorAll('.action-escape').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorId = btn.dataset.id;
                this.useEscape(floorId);
            });
        });
        this.container.querySelectorAll('.action-program-use').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorId = btn.dataset.id;
                const select = this.container.querySelector(`.program-select[data-id="${floorId}"]`);
                if (!select) return;
                const programName = select.value;
                if (!programName) {
                    alert("Выберите программу.");
                    return;
                }
                this.useProgram(floorId, programName);
            });
        });
        this.container.querySelectorAll('.minimap-node').forEach(node => {
    node.addEventListener('click', () => {
        const type = node.dataset.type;
        const index = parseInt(node.dataset.index);
        if (type === 'main') {
            // Переключиться на основную ветку
            this.currentBranch = null;
            this.currentFloorIndex = index;
            this.render();
        } else if (type === 'branch') {
            const branchId = parseInt(node.dataset.branch);
            this.currentBranch = branchId;
            this.currentFloorIndex = index;
            this.render();
        }
    });
});
    }
    
    exportToJSON() {
        if (!this.architecture) return null;
        const data = {
            architecture: this.architecture,
            currentBranch: this.currentBranch,
            currentFloorIndex: this.currentFloorIndex,
            timestamp: Date.now()
        };
        return JSON.stringify(data, null, 2);
    }
    
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.architecture && data.architecture.main && Array.isArray(data.architecture.main)) {
                this.architecture = data.architecture;
                this.currentBranch = data.currentBranch !== undefined ? data.currentBranch : null;
                this.currentFloorIndex = data.currentFloorIndex || 0;
                // Сброс флагов боя
                this.resetCombatState();
                this.render();
                return true;
            }
        } catch(e) {
            console.error('Ошибка импорта архитектуры', e);
        }
        return false;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
}