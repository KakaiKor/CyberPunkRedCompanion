// modules/gm/mook-generator.js
import { NPC_TEMPLATES } from '../../data/npc-templates.js';

export class MookGenerator {
    static getEnemyTemplates() {
        return NPC_TEMPLATES;
    }

    static getEnemyByType(type, templates) {
        const template = templates[type];
        if (!template) {
            console.warn(`Тип ${type} не найден, использую mook`);
            return templates.mook;
        }
        return template;
    }

    static createEnemy(template, typeKey) {
        return {
            id: Date.now() + Math.random(),
            name: `${template.name} ${Math.floor(Math.random() * 100) + 1}`,
            type: typeKey,
            threat: template.threat,
            stats: template.stats,
            skills: template.skills,
            derived: template.derived,
            armor: template.armor,
            weapons: template.weapons,
            gear: template.gear,
            cyberware: template.cyberware,
            description: template.description,
            currentHp: template.derived.hp,
            currentArmor: { head: template.armor.head, body: template.armor.body },
        };
    }

    static normalizeType(type) {
        const synonyms = { grunt: 'mook', elite: 'lieutenant' };
        return synonyms[type] || type;
    }

    static generate() {
        const playerCount = parseInt(document.getElementById('playerCount')?.value) || 4;
        const difficulty = document.getElementById('encounterDifficulty')?.value || 'normal';
        let selectedType = document.getElementById('enemyTypeFilter')?.value || 'all';
        const templates = this.getEnemyTemplates();

        if (selectedType !== 'all') selectedType = this.normalizeType(selectedType);

        let enemies = [];

        const createByType = (typeKey) => {
            const template = this.getEnemyByType(typeKey, templates);
            return this.createEnemy(template, typeKey);
        };

        const useSpecificType = (selectedType !== 'all' && templates[selectedType]);

        // ========== 1. Выбран конкретный тип врага ==========
        if (useSpecificType) {
            let count = 0;
            if (selectedType === 'mook') count = playerCount;
            else if (selectedType === 'lieutenant') count = Math.max(1, Math.floor(playerCount / 2));
            else if (selectedType === 'miniboss') count = Math.max(1, Math.floor(playerCount / 3));
            else if (selectedType === 'boss') count = 1;
            else if (selectedType === 'legendary') count = 1;  // <-- ДОБАВЛЕНО
            else count = Math.ceil(playerCount / 2);
            for (let i = 0; i < count; i++) enemies.push(createByType(selectedType));
        }
        // ========== 2. Стандартная генерация (Тип: Авто) ==========
        else {
            if (difficulty === 'easy') {
                for (let i = 0; i < playerCount; i++) enemies.push(createByType('mook'));
            }
            else if (difficulty === 'normal') {
                const lieutenantCount = Math.floor(playerCount / 2);
                for (let i = 0; i < lieutenantCount; i++) enemies.push(createByType('lieutenant'));
                for (let i = 0; i < playerCount; i++) enemies.push(createByType('mook'));
            }
            else if (difficulty === 'hard') {
                enemies.push(createByType('miniboss'));
                const lieutenantCount = Math.max(1, Math.floor(playerCount / 2));
                for (let i = 0; i < lieutenantCount; i++) enemies.push(createByType('lieutenant'));
            }
            else if (difficulty === 'deadly') {
                enemies.push(createByType('boss'));
                const lieutenantCount = Math.floor(playerCount / 2) + 1;
                for (let i = 0; i < lieutenantCount; i++) enemies.push(createByType('lieutenant'));
            }
            else if (difficulty === 'legendary') {
                // Создаём одного легендарного врага (Адам Смэшер)
                enemies.push(createByType('adam_smasher'));
            }
        }

        this.enemies = enemies;
        this.render();
    }

    static render() {
        const container = document.getElementById('mookResult');
        if (!container) {
            console.error('Контейнер mookResult не найден');
            return;
        }
        if (!this.enemies || this.enemies.length === 0) {
            container.innerHTML = '<p>У Меня нет врагов, но я всегда могу их <strong>создать</strong></p>';
            return;
        }
        let html = '<div class="mook-grid">';
        this.enemies.forEach((e, idx) => {
            html += `
                <div class="mook-card" data-idx="${idx}">
                    <div class="mook-header">
                        <strong>${e.name}</strong>
                        <span class="mook-type">${e.threat}</span>
                    </div>
                    <div class="mook-stats">
                        <div class="mook-hp-armor">
                            <label>❤️ ПЗ: <input type="number" class="mook-hp" value="${e.currentHp}" step="1" style="width:70px"> / ${e.derived.hp}</label>
                            <label>🛡️ ОС голова: <input type="number" class="mook-armor-head" value="${e.currentArmor.head}" step="1" style="width:60px"></label>
                            <label>🛡️ ОС тело: <input type="number" class="mook-armor-body" value="${e.currentArmor.body}" step="1" style="width:60px"></label>
                        </div>
                        <details>
                            <summary>📊 Характеристики</summary>
                            <div class="stats-grid-compact">
                                ${Object.entries(e.stats).map(([k, v]) => `<span><strong>${k}</strong> ${v}</span>`).join('')}
                            </div>
                        </details>
                        <details>
                            <summary>🎯 Навыки (Баз)</summary>
                            <div class="skills-list-compact">
                                ${Object.entries(e.skills).map(([k, v]) => `<span><strong>${k}</strong> +${v}</span>`).join('')}
                            </div>
                        </details>
                        <div>🔫 Оружие: ${e.weapons.join(', ')}</div>
                        <div>🎒 Снаряжение: ${e.gear.join(', ') || '—'}</div>
                        ${e.cyberware.length ? `<div>🧠 Киберимпланты: ${e.cyberware.join(', ')}</div>` : ''}
                    </div>
                    <div class="mook-controls">
                        <button class="remove-mook-btn" data-idx="${idx}">🗑️ Удалить</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

        // Обработчики для редактирования ПЗ и ОС
        document.querySelectorAll('.mook-hp').forEach((input, i) => {
            input.addEventListener('change', (e) => {
                const newHp = parseInt(e.target.value);
                if (!isNaN(newHp) && this.enemies[i]) this.enemies[i].currentHp = newHp;
            });
        });
        document.querySelectorAll('.mook-armor-head').forEach((input, i) => {
            input.addEventListener('change', (e) => {
                const newArmor = parseInt(e.target.value);
                if (!isNaN(newArmor) && this.enemies[i]) this.enemies[i].currentArmor.head = newArmor;
            });
        });
        document.querySelectorAll('.mook-armor-body').forEach((input, i) => {
            input.addEventListener('change', (e) => {
                const newArmor = parseInt(e.target.value);
                if (!isNaN(newArmor) && this.enemies[i]) this.enemies[i].currentArmor.body = newArmor;
            });
        });
        document.querySelectorAll('.remove-mook-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                this.enemies.splice(idx, 1);
                this.render();
            });
        });
    }
}
// Диапазоны для будущей вариативности (пока не используются)
export const STAT_RANGES = {
    Mook: {
        REF: [5, 7], BODY: [4, 6], стрельба: [7, 9], броня: [6, 8], урон: "2d6"
    },
    Lieutenant: {
        REF: [7, 9], BODY: [6, 8], стрельба: [10, 12], броня: [10, 12], урон: "3d6"
    },
    'Mini-Boss': {
        REF: [9, 11], BODY: [8, 10], стрельба: [12, 14], броня: [12, 15], урон: "4d6"
    },
    Boss: {
        REF: [11, 13], BODY: [10, 12], стрельба: [14, 16], броня: [14, 18], урон: "4d6+"
    }
};