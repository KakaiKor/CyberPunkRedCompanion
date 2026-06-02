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
        const selectedCategory = document.getElementById('enemyCategoryFilter')?.value || 'all';
        const templates = this.getEnemyTemplates();

        if (selectedType !== 'all') selectedType = this.normalizeType(selectedType);

        let enemies = [];

        const createByType = (typeKey) => {
            const template = this.getEnemyByType(typeKey, templates);
            return this.createEnemy(template, typeKey);
        };

        const useSpecificType = (selectedType !== 'all' && templates[selectedType]);

        if (useSpecificType) {
            let count = 0;
            if (selectedType === 'mook') count = playerCount;
            else if (selectedType === 'lieutenant') count = Math.max(1, Math.floor(playerCount / 2));
            else if (selectedType === 'miniboss') count = Math.max(1, Math.floor(playerCount / 3));
            else if (selectedType === 'boss') count = 1;
            else count = Math.ceil(playerCount / 2);
            for (let i = 0; i < count; i++) enemies.push(createByType(selectedType));
        } 
        else if (selectedCategory !== 'all') {
            const availableTypes = Object.keys(templates).filter(t => templates[t].threat === selectedCategory);
            const threatGroups = {
                mook: availableTypes.filter(t => templates[t].threat === 'Mook'),
                lieutenant: availableTypes.filter(t => templates[t].threat === 'Lieutenant'),
                miniboss: availableTypes.filter(t => templates[t].threat === 'Mini-Boss'),
                boss: availableTypes.filter(t => templates[t].threat === 'Boss')
            };
            const createWithRole = (role) => {
                const candidates = threatGroups[role];
                if (candidates && candidates.length) {
                    const type = candidates[Math.floor(Math.random() * candidates.length)];
                    return createByType(type);
                }
                if (availableTypes.length) return createByType(availableTypes[0]);
                return createByType('mook');
            };

            if (difficulty === 'easy') {
                for (let i = 0; i < playerCount; i++) enemies.push(createWithRole('mook'));
            } else if (difficulty === 'normal') {
                const lieutenantCount = Math.floor(playerCount / 2);
                for (let i = 0; i < lieutenantCount; i++) enemies.push(createWithRole('lieutenant'));
                for (let i = 0; i < playerCount; i++) enemies.push(createWithRole('mook'));
            } else if (difficulty === 'hard') {
                const minibossCount = Math.floor(playerCount / 3);
                for (let i = 0; i < minibossCount; i++) enemies.push(createWithRole('miniboss'));
                const lieutenantCount = Math.floor(playerCount / 2);
                for (let i = 0; i < lieutenantCount; i++) enemies.push(createWithRole('lieutenant'));
                for (let i = 0; i < playerCount; i++) enemies.push(createWithRole('mook'));
            } else if (difficulty === 'deadly') {
                enemies.push(createWithRole('boss'));
                const eliteCount = Math.floor(playerCount / 2) + 1;
                for (let i = 0; i < eliteCount; i++) enemies.push(createWithRole('lieutenant'));
            }
        } 
        else {
            // Стандартная генерация (Тип: Авто, Категория: Все)
            if (difficulty === 'easy') {
                for (let i = 0; i < playerCount; i++) enemies.push(createByType('mook'));
            } else if (difficulty === 'normal') {
                const lieutenantCount = Math.floor(playerCount / 2);
                for (let i = 0; i < lieutenantCount; i++) enemies.push(createByType('lieutenant'));
                for (let i = 0; i < playerCount; i++) enemies.push(createByType('mook'));
            } else if (difficulty === 'hard') {
                const minibossCount = Math.floor(playerCount / 3);
                for (let i = 0; i < minibossCount; i++) enemies.push(createByType('miniboss'));
                const lieutenantCount = Math.floor(playerCount / 2);
                for (let i = 0; i < lieutenantCount; i++) enemies.push(createByType('lieutenant'));
                for (let i = 0; i < playerCount; i++) enemies.push(createByType('mook'));
            } else if (difficulty === 'deadly') {
                enemies.push(createByType('boss'));
                const eliteCount = Math.floor(playerCount / 2) + 1;
                for (let i = 0; i < eliteCount; i++) enemies.push(createByType('lieutenant'));
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