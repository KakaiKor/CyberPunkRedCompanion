// modules/net-architecture-ui.js
import { loadCharacter } from '../storage.js';
import { generateNetArchitecture } from './gm.js'; // используем существующий генератор, но он простой, мы сделаем свой

// Классы этажей
const FLOOR_TYPES = {
    PASSWORD: 'password',
    FILE: 'file',
    CONTROL_NODE: 'control_node',
    ICE: 'ice'
};

// Названия для отображения
const TYPE_NAMES = {
    [FLOOR_TYPES.PASSWORD]: '🔒 Пароль',
    [FLOOR_TYPES.FILE]: '📄 Файл',
    [FLOOR_TYPES.CONTROL_NODE]: '🎮 Узел управления',
    [FLOOR_TYPES.ICE]: '💀 Чёрный лёд'
};

// Генерация случайной архитектуры (количество этажей, типы, сложность)
export function generateRandomArchitecture(complexity = 'medium') {
    const floorCount = Math.floor(Math.random() * 6) + 4; // от 4 до 9 этажей
    const floors = [];
    const slBase = { easy: 6, medium: 8, hard: 10 }[complexity] || 8;
    
    for (let i = 0; i < floorCount; i++) {
        // Первые 2 этажа – чаще пароли/файлы, глубокие – чёрный лёд
        let type;
        if (i < 2) {
            type = Math.random() < 0.7 ? FLOOR_TYPES.PASSWORD : FLOOR_TYPES.FILE;
        } else {
            const r = Math.random();
            if (r < 0.4) type = FLOOR_TYPES.PASSWORD;
            else if (r < 0.6) type = FLOOR_TYPES.FILE;
            else if (r < 0.8) type = FLOOR_TYPES.CONTROL_NODE;
            else type = FLOOR_TYPES.ICE;
        }
        
        let sl = slBase;
        let content = '';
        let isResolved = false;
        
        switch (type) {
            case FLOOR_TYPES.PASSWORD:
                sl = slBase + Math.floor(Math.random() * 4); // СЛ 6-12
                content = `Сложность: ${sl}`;
                break;
            case FLOOR_TYPES.FILE:
                content = `Файл содержит: ${getRandomFileContent()}`;
                break;
            case FLOOR_TYPES.CONTROL_NODE:
                sl = slBase + Math.floor(Math.random() * 3);
                content = `Управляет: ${getRandomControlNode()}`;
                break;
            case FLOOR_TYPES.ICE:
                sl = slBase + Math.floor(Math.random() * 6);
                content = `Чёрный лёд: ${getRandomIceType()} (СЛ ${sl})`;
                break;
        }
        
        floors.push({
            index: i,
            type,
            sl,
            content,
            isResolved: false,
            isActive: i === 0 // первый этаж активен по умолчанию
        });
    }
    return floors;
}

function getRandomFileContent() {
    const files = [
        "Финансовые отчёты корпорации",
        "Список сотрудников с допуском",
        "Чертежи прототипа оружия",
        "Переписка менеджеров",
        "Видеозапись с камер наблюдения",
        "Коды доступа к серверу"
    ];
    return files[Math.floor(Math.random() * files.length)];
}

function getRandomControlNode() {
    const nodes = [
        "Камеры наблюдения",
        "Автоматические турели",
        "Система вентиляции",
        "Электронные замки дверей",
        "Лифты",
        "Система оповещения"
    ];
    return nodes[Math.floor(Math.random() * nodes.length)];
}

function getRandomIceType() {
    const ices = [
        "Адская гончая", "Аспид", "Блуждающий огонёк", "Ворон",
        "Скорпион", "Скунс", "Лич", "Кракен"
    ];
    return ices[Math.floor(Math.random() * ices.length)];
}

export class NetArchitectureUI {
    constructor(containerId = 'architectureContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.architecture = null;
        this.currentFloor = 0;
        this.init();
    }
    
    init() {
        this.renderEmpty();
        document.getElementById('genArchitectureBtn')?.addEventListener('click', () => this.generateNew());
        document.getElementById('resetArchitectureBtn')?.addEventListener('click', () => this.reset());
    }
    
    generateNew() {
        this.architecture = generateRandomArchitecture('medium');
        this.currentFloor = 0;
        this.render();
    }
    
    reset() {
        this.architecture = null;
        this.renderEmpty();
    }
    
    renderEmpty() {
        this.container.innerHTML = '<p>Нажмите «Сгенерировать архитектуру», чтобы начать.</p>';
    }
    
    render() {
        if (!this.architecture || !this.architecture.length) {
            this.renderEmpty();
            return;
        }
        
        let html = `<div class="architecture-floors">`;
        for (let i = 0; i < this.architecture.length; i++) {
            const floor = this.architecture[i];
            const isAccessible = i <= this.currentFloor;
            const isActive = i === this.currentFloor;
            const statusClass = floor.isResolved ? 'resolved' : (isActive ? 'active' : 'locked');
            
            html += `
                <div class="floor-card ${statusClass}" data-index="${i}">
                    <div class="floor-number">Этаж ${i + 1}</div>
                    <div class="floor-type">${TYPE_NAMES[floor.type]}</div>
                    <div class="floor-content">${floor.content}</div>
                    ${isActive && !floor.isResolved ? `
                        <div class="floor-actions">
                            ${floor.type === FLOOR_TYPES.PASSWORD ? `<button class="action-backdoor" data-index="${i}">🔓 Взломать (бэкдор)</button>` : ''}
                            ${floor.type === FLOOR_TYPES.FILE ? `<button class="action-read" data-index="${i}">📖 Прочитать файл</button>` : ''}
                            ${floor.type === FLOOR_TYPES.CONTROL_NODE ? `<button class="action-control" data-index="${i}">🎮 Взять под контроль</button>` : ''}
                            ${floor.type === FLOOR_TYPES.ICE ? `<button class="action-fight" data-index="${i}">⚔️ Сразиться</button>` : ''}
                        </div>
                    ` : ''}
                    ${floor.isResolved ? `<div class="floor-resolved">✅ Преодолён</div>` : ''}
                </div>
            `;
        }
        html += `</div>`;
        this.container.innerHTML = html;
        this.attachEvents();
    }
    
    attachEvents() {
        // Кнопки взаимодействия
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
    }
    
    async resolvePassword(idx) {
        const floor = this.architecture[idx];
        const char = loadCharacter();
        const interfaceRank = char?.interfaceRank || 4;
        const roll = Math.floor(Math.random() * 10) + 1; // d10
        const result = interfaceRank + roll;
        const required = floor.sl || 8;
        
        if (result >= required) {
            floor.isResolved = true;
            alert(`Успех! Интерфейс ${interfaceRank} + d10(${roll}) = ${result} >= ${required}. Пароль взломан.`);
            this.checkAndAdvance(idx);
        } else {
            alert(`Провал! Интерфейс ${interfaceRank} + d10(${roll}) = ${result} < ${required}. Чёрный лёд атакует! (пока заглушка)`);
        }
        this.render();
    }
    
    readFile(idx) {
        const floor = this.architecture[idx];
        alert(`Вы прочитали файл:\n${floor.content}`);
        floor.isResolved = true;
        this.checkAndAdvance(idx);
        this.render();
    }
    
    controlNode(idx) {
        const floor = this.architecture[idx];
        alert(`Вы взяли под контроль узел: ${floor.content}. Теперь вы можете управлять этой системой в мясном пространстве.`);
        floor.isResolved = true;
        this.checkAndAdvance(idx);
        this.render();
    }
    
    fightIce(idx) {
        const floor = this.architecture[idx];
        alert(`Бой с чёрным льдом (${floor.content}) пока не реализован. Заглушка.`);
        // Временно: просто преодолеваем (для теста)
        if (confirm('Применить временное "победа"?')) {
            floor.isResolved = true;
            this.checkAndAdvance(idx);
            this.render();
        }
    }
    generateWithComplexity(complexity = 'medium') {
    this.architecture = generateRandomArchitecture(complexity);
    this.currentFloor = 0;
    this.render();
}

    generateNew() {
    this.generateWithComplexity('medium');
    }
    checkAndAdvance(idx) {
        // Если текущий этаж преодолён и он последний в очереди – открываем следующий
        if (this.architecture[idx].isResolved && idx === this.currentFloor) {
            if (idx + 1 < this.architecture.length) {
                this.currentFloor++;
                alert(`Вы спускаетесь на этаж ${this.currentFloor + 1}`);
            } else {
                alert('🏆 Вы достигли дна архитектуры! Можете оставить вирус или отключиться.');
            }
        }
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
                // Сбрасываем флаги решения и активности (архитектура как новая)
                this.architecture.forEach((floor, idx) => {
                    floor.isResolved = false;
                    floor.isActive = false;
                });
                this.currentFloor = 0;
                if (this.architecture.length > 0) {
                    this.architecture[0].isActive = true;
                }
                this.render();
                return true;
            }
        } catch(e) {
            console.error('Ошибка импорта архитектуры', e);
        }
        return false;
    }
}