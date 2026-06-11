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

export function generateRandomArchitecture(complexity = 'medium') {
    const floorCount = Math.floor(Math.random() * 6) + 4;
    const floors = [];
    const slBase = { easy: 6, medium: 8, hard: 10 }[complexity] || 8;
    
    for (let i = 0; i < floorCount; i++) {
        let type;
        if (i < 2) {
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
        
        floors.push({
            index: i,
            type,
            sl,
            content,
            isResolved: false,
            isActive: (i === 0),
            ice: iceData
        });
    }
    return floors;
}

export class NetArchitectureUI {
    constructor(containerId = 'architectureContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.architecture = null;
        this.currentFloor = 0;
        this.initiativeQueue = [];
        this.currentTurn = null;
        this.netActionsRemaining = 0;
        this.isCombat = false;
        this.init();

        window.addEventListener('characterUpdated', () => {
            this.render();
        });
    }

    init() {
        this.renderEmpty();
        document.getElementById('genArchitectureBtn')?.addEventListener('click', () => this.generateNew());
        document.getElementById('resetArchitectureBtn')?.addEventListener('click', () => this.reset());
    }

    // === Проверка: является ли персонаж нетраннером ===
    checkIsNetrunner() {
        const char = loadCharacter();
        if (!char) {
            alert("⚠️ Персонаж не найден. Создайте или загрузите персонажа.");
            return false;
        }
        if (char.role !== "Нетраннер") {
            alert("⚠️ Только персонаж-нетраннер может использовать архитектуру сети и сетевое взаимодействие. Создайте или переключитесь на нетраннера.");
            return false;
        }
        return true;
    }

    checkCharacterExists() {
        const char = loadCharacter();
        if (!char || !char.name) {
            alert("⚠️ Персонаж не найден! Сначала создайте персонажа (вкладка «Персонаж» → «Создать персонажа» или заполните имя и роль).");
            return false;
        }
        return true;
    }

    // === Получение ранга интерфейса (ролевого навыка) ===
    getInterfaceRank() {
        const char = loadCharacter();
        if (!char) return 0;
        if (char.role !== "Нетраннер") return 0;
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
        if (currentHp === undefined) {
            currentHp = maxHp;
        }
        return { current: currentHp, max: maxHp, exists: true };
    }

    applyDamageToCharacter(damage) {
        if (!this.checkCharacterExists()) return false;
        
        const char = loadCharacter();
        const hp = this.getCharacterHP();
        let newCurrent = Math.max(0, hp.current - damage);
        char.currentHp = newCurrent;
        if (char.maxHp === undefined) {
            char.maxHp = hp.max;
        }
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
        if (!floor.ice) {
            floor.ice = createIceData("Адская гончая");
        }
        floor.content = `${floor.ice.name} (ЦЕЛ ${floor.ice.hp})`;
    }

    generateNew() {
        if (!this.checkIsNetrunner()) return;
        this.architecture = generateRandomArchitecture('medium');
        this.currentFloor = 0;
        this.resetCombatState();
        this.render();
    }

    generateWithComplexity(complexity = 'medium') {
        if (!this.checkIsNetrunner()) return;
        this.architecture = generateRandomArchitecture(complexity);
        this.currentFloor = 0;
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
        this.container.innerHTML = '<p>Нажмите «Сгенерировать архитектуру», чтобы начать (только для нетраннера).</p>';
    }

    moveUp() {
        if (!this.checkIsNetrunner()) return;
        if (this.currentFloor > 0) {
            this.currentFloor--;
            this.render();
        } else {
            alert("Вы на первом этаже, выше нельзя.");
        }
    }

    moveDown() {
        if (!this.checkIsNetrunner()) return;
        if (this.currentFloor + 1 < this.architecture.length) {
            const nextFloor = this.architecture[this.currentFloor + 1];
            if (!nextFloor.isResolved) {
                this.currentFloor++;
                this.render();
            } else {
                alert("Этот этаж уже пройден, но вы можете вернуться на него.");
                this.currentFloor++;
                this.render();
            }
        } else {
            alert("Вы на последнем этаже, ниже нельзя.");
        }
    }

    // === Программы и бонусы ===
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
        let bonuses = {
            backdoor: 0,
            pathfinder: 0,
            cloak: 0,
            reaction: 0,
            damageReduction: 0,
            shieldActive: false,
            flakActive: false
        };
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

    // === Боевые механики ===
    async iceAttack(floorIndex, isFreeAttack = false) {
        const floor = this.architecture[floorIndex];
        if (!floor || floor.type !== FLOOR_TYPES.ICE) return;
        this.ensureIceData(floor);
        const ice = floor.ice;
        if (!ice) return;

        if (!this.checkCharacterExists()) return;

        const interfaceRank = this.getInterfaceRank();
        const bonuses = this.getActiveProgramBonuses();

        const iceRoll = this.rollDice(1, 10);
        const playerRoll = this.rollDice(1, 10);
        const iceResult = ice.attack + iceRoll;
        const playerResult = interfaceRank + playerRoll + (bonuses.reaction || 0);

        let damage = 0;
        if (ice.effect.includes('2d6')) damage = this.rollDice(2, 6);
        else if (ice.effect.includes('3d6')) damage = this.rollDice(3, 6);
        else if (ice.effect.includes('1d6')) damage = this.rollDice(1, 6);
        else damage = this.rollDice(2, 6);

        if (bonuses.damageReduction) {
            const oldDamage = damage;
            damage = Math.max(1, damage - bonuses.damageReduction);
            if (damage !== oldDamage) {
                alert(`🛡️ Доспехи снизили урон с ${oldDamage} до ${damage}.`);
            }
        }

        if (bonuses.shieldActive && iceResult > playerResult) {
            alert(`🛡️ Щит заблокировал урон от ${ice.name}!`);
            this.deactivateShield();
            if (!isFreeAttack && this.isCombat) {
                this.nextTurn();
            }
            return;
        }

        if (iceResult > playerResult) {
            alert(`❄️ ${ice.name} атакует! Урон: ${damage} по мозгу.`);
            this.applyDamageToCharacter(damage);
        } else {
            alert(`🛡️ Вы уклонились от атаки ${ice.name}.`);
        }

        if (!isFreeAttack && this.isCombat) {
            this.nextTurn();
        }
    }

    async useDischarge(floorIndex) {
        if (!this.checkIsNetrunner()) return;
        if (this.netActionsRemaining < 1) {
            alert("Недостаточно сетевых действий!");
            return;
        }
        const floor = this.architecture[floorIndex];
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
                this.checkAndAdvance(floorIndex);
                this.endCombatOnFloor(floorIndex);
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

    async useEscape(floorIndex) {
        if (!this.checkIsNetrunner()) return;
        if (this.netActionsRemaining < 1) {
            alert("Недостаточно сетевых действий!");
            return;
        }
        const floor = this.architecture[floorIndex];
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
            if (this.currentFloor > 0) {
                this.currentFloor--;
                this.architecture[this.currentFloor].isActive = true;
                this.architecture[floorIndex].isActive = false;
                this.endCombatOnFloor(floorIndex);
                this.render();
            }
        } else {
            alert(`❌ Не удалось ускользнуть. ${ice.name} атакует!`);
            await this.iceAttack(floorIndex, false);
        }
        this.netActionsRemaining--;
        this.render();
    }

    async useProgram(floorIndex, programName) {
        if (!this.checkIsNetrunner()) return;
        if (this.netActionsRemaining < 1) {
            alert("Недостаточно сетевых действий!");
            return;
        }
        const floor = this.architecture[floorIndex];
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
                this.endCombatOnFloor(floorIndex);
                this.checkAndAdvance(floorIndex);
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

    async enterFloorWithIce(floorIndex) {
        if (!this.checkIsNetrunner()) return;
        const floor = this.architecture[floorIndex];
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
                await this.iceAttack(floorIndex, true);
            } else {
                alert(`Вы заметили ${ice.name} первым.`);
            }
        }
        this.initiativeQueue = [];
        this.initiativeQueue.unshift({ type: 'ice', floorIndex: floorIndex });
        this.initiativeQueue.unshift({ type: 'player' });
        this.isCombat = true;
        this.currentTurn = this.initiativeQueue[0];
        if (this.currentTurn.type === 'player') {
            this.netActionsRemaining = this.getNetActionsPerTurn();
        } else {
            this.netActionsRemaining = 0;
            await this.iceAttack(floorIndex, false);
        }
        this.render();
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
            this.iceAttack(this.currentTurn.floorIndex, false);
        }
    }

    endCombatOnFloor(floorIndex) {
        this.initiativeQueue = this.initiativeQueue.filter(e => !(e.type === 'ice' && e.floorIndex === floorIndex));
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

    async resolvePassword(idx) {
        if (!this.checkIsNetrunner()) return;
        const floor = this.architecture[idx];
        const interfaceRank = this.getInterfaceRank();
        const bonuses = this.getActiveProgramBonuses();
        const roll = this.rollDice(1,10);
        const result = interfaceRank + roll + (bonuses.backdoor || 0);
        const required = floor.sl || 8;
        if (result >= required) {
            floor.isResolved = true;
            alert(`Успех! Интерфейс ${interfaceRank} + d10(${roll}) + бонус ${bonuses.backdoor} = ${result} >= ${required}. Пароль взломан.`);
            this.checkAndAdvance(idx);
        } else {
            alert(`Провал! Интерфейс ${interfaceRank} + d10(${roll}) + бонус ${bonuses.backdoor} = ${result} < ${required}.`);
        }
        this.render();
    }
    
    readFile(idx) {
        if (!this.checkIsNetrunner()) return;
        const floor = this.architecture[idx];
        alert(`Вы прочитали файл:\n${floor.content}`);
        floor.isResolved = true;
        this.checkAndAdvance(idx);
        this.render();
    }
    
    controlNode(idx) {
        if (!this.checkIsNetrunner()) return;
        const floor = this.architecture[idx];
        alert(`Вы взяли под контроль узел: ${floor.content}. Теперь вы можете управлять этой системой.`);
        floor.isResolved = true;
        this.checkAndAdvance(idx);
        this.render();
    }
    
    fightIce(idx) {
        if (!this.checkIsNetrunner()) return;
        const floor = this.architecture[idx];
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
        if (this.isCombat && this.initiativeQueue.some(e => e.type === 'ice' && e.floorIndex === idx)) {
            alert("Вы уже в бою с этим льдом!");
            return;
        }
        this.enterFloorWithIce(idx);
    }
    
    checkAndAdvance(idx) {
        if (this.architecture[idx].isResolved && idx === this.currentFloor) {
            if (idx + 1 < this.architecture.length) {
                this.currentFloor++;
                this.architecture[this.currentFloor].isActive = true;
                alert(`Вы спускаетесь на этаж ${this.currentFloor + 1}`);
                const nextFloor = this.architecture[this.currentFloor];
                if (nextFloor.type === FLOOR_TYPES.ICE && !nextFloor.isResolved) {
                    this.ensureIceData(nextFloor);
                }
                this.render();
            } else {
                alert('🏆 Вы достигли дна архитектуры! Можете оставить вирус или отключиться.');
                this.render();
            }
        } else {
            this.render();
        }
    }

    render() {
        if (!this.architecture || !this.architecture.length) {
            this.renderEmpty();
            return;
        }
        const hpData = this.getCharacterHP();
        const hasCharacter = hpData.exists;
        const hpText = hasCharacter ? `${hpData.current} / ${hpData.max}` : "❌ Нет персонажа";
        const interfaceRank = this.getInterfaceRank();
        const netActions = this.getNetActionsPerTurn();
        
        let html = `<div class="architecture-nav">
                        <button class="nav-up" ${this.currentFloor === 0 ? 'disabled' : ''}>▲ Вверх</button>
                        <span>Этаж ${this.currentFloor+1} / ${this.architecture.length}</span>
                        <button class="nav-down" ${this.currentFloor+1 >= this.architecture.length ? 'disabled' : ''}>▼ Вниз</button>
                    </div>`;
        html += `<div class="architecture-floors">`;
        for (let i = 0; i < this.architecture.length; i++) {
            const floor = this.architecture[i];
            const isActive = (i === this.currentFloor);
            const statusClass = floor.isResolved ? 'resolved' : (isActive ? 'active' : 'locked');
            html += `<div class="floor-card ${statusClass}" data-index="${i}">
                        <div class="floor-number">Этаж ${i+1}</div>
                        <div class="floor-type">${TYPE_NAMES[floor.type]}</div>
                        <div class="floor-content">${this.escapeHtml(floor.content)}</div>`;
            if (isActive && !floor.isResolved) {
                if (floor.type === FLOOR_TYPES.ICE) {
                    if (!this.isCombat || !this.initiativeQueue.some(e => e.type === 'ice' && e.floorIndex === i)) {
                        html += `<div class="floor-actions"><button class="action-fight" data-index="${i}">⚔️ Вступить в бой</button></div>`;
                    } else {
                        const attackingPrograms = this.getActiveAttackPrograms();
                        let programSelectHtml = '<select class="program-select" data-floor-index="' + i + '">';
                        programSelectHtml += '<option value="">-- Выберите программу --</option>';
                        attackingPrograms.forEach(p => {
                            programSelectHtml += `<option value="${this.escapeHtml(p.name)}" data-atk="${p.atk || 0}">${this.escapeHtml(p.name)} (АТК ${p.atk || 0})</option>`;
                        });
                        programSelectHtml += '</select>';
                        html += `<div class="floor-actions combat-actions">
                                    <button class="action-discharge" data-index="${i}">⚡ Разряд (1 действие)</button>
                                    <button class="action-escape" data-index="${i}">🌀 Подкат (1 действие)</button>
                                    <div class="program-action">
                                        ${programSelectHtml}
                                        <button class="action-program-use" data-index="${i}">💾 Применить (1 дейст.)</button>
                                    </div>
                                </div>`;
                    }
                } else if (floor.type === FLOOR_TYPES.PASSWORD) {
                    html += `<div class="floor-actions"><button class="action-backdoor" data-index="${i}">🔓 Взломать</button></div>`;
                } else if (floor.type === FLOOR_TYPES.FILE) {
                    html += `<div class="floor-actions"><button class="action-read" data-index="${i}">📖 Прочитать</button></div>`;
                } else if (floor.type === FLOOR_TYPES.CONTROL_NODE) {
                    html += `<div class="floor-actions"><button class="action-control" data-index="${i}">🎮 Захватить</button></div>`;
                }
            }
            if (floor.isResolved) html += `<div class="floor-resolved">✅ Преодолён</div>`;
            html += `</div>`;
        }
        html += `</div>`;
        if (this.isCombat) {
            html += `<div class="combat-panel">
                        <h4>⚔️ Сетевой бой</h4>
                        <div>🎭 Интерфейс (ранг): ${interfaceRank} | Сетевых действий: ${netActions}</div>
                        <div>❤️ Здоровье: ${hpText}</div>
                        <div>Очередь: ${this.initiativeQueue.map(e => e.type === 'player' ? 'Вы' : `Лёд (этаж ${e.floorIndex+1})`).join(' → ')}</div>
                        <div>Текущий ход: ${this.currentTurn?.type === 'player' ? 'Вы' : `Чёрный лёд`}</div>
                        <div>Сетевых действий осталось: ${this.netActionsRemaining}</div>
                    </div>`;
        } else {
            html += `<div class="combat-panel"><div>🎭 Интерфейс (ранг): ${interfaceRank} | Сетевых действий: ${netActions}</div><div>❤️ Здоровье: ${hpText}</div></div>`;
        }
        this.container.innerHTML = html;
        this.attachEvents();
    }
    
    attachEvents() {
        const upBtn = this.container.querySelector('.nav-up');
        const downBtn = this.container.querySelector('.nav-down');
        if (upBtn) upBtn.addEventListener('click', () => this.moveUp());
        if (downBtn) downBtn.addEventListener('click', () => this.moveDown());

        document.querySelectorAll('.action-backdoor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                this.resolvePassword(idx);
            });
        });
        document.querySelectorAll('.action-read').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                this.readFile(idx);
            });
        });
        document.querySelectorAll('.action-control').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                this.controlNode(idx);
            });
        });
        document.querySelectorAll('.action-fight').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                this.fightIce(idx);
            });
        });
        document.querySelectorAll('.action-discharge').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                this.useDischarge(idx);
            });
        });
        document.querySelectorAll('.action-escape').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                this.useEscape(idx);
            });
        });
        document.querySelectorAll('.action-program-use').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                const select = this.container.querySelector(`.program-select[data-floor-index="${idx}"]`);
                if (!select) return;
                const programName = select.value;
                if (!programName) {
                    alert("Выберите программу.");
                    return;
                }
                this.useProgram(idx, programName);
            });
        });
    }
    
    exportToJSON() {
        if (!this.architecture) return null;
        const data = {
            architecture: this.architecture,
            currentFloor: this.currentFloor,
            timestamp: Date.now()
        };
        return JSON.stringify(data, null, 2);
    }
    
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.architecture && Array.isArray(data.architecture)) {
                this.architecture = data.architecture;
                this.architecture.forEach((floor, idx) => {
                    floor.isResolved = false;
                    floor.isActive = false;
                    if (floor.type === FLOOR_TYPES.ICE) {
                        this.ensureIceData(floor);
                    }
                });
                this.currentFloor = 0;
                if (this.architecture.length > 0) this.architecture[0].isActive = true;
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