// modules/gm/npc-generator.js
import { NPC_TEMPLATES } from '../../data/npc-templates.js';

export class NPCGenerator {
    static getTemplates() {
        return NPC_TEMPLATES;
    }

    static generate() {
        const selectedType = document.getElementById('npcTypeFilter')?.value || 'all';
        const templates = this.getTemplates();
        let types = [];
        if (selectedType === 'all') {
            types = Object.keys(templates).filter(key => {
                const template = templates[key];
                return template.threat !== 'legendary';
            });
            console.log('NPCGenerator: доступные типы (без legendary):', types);
        } else {
            types = [selectedType];
        }
        if (types.length === 0) {
            console.warn('Нет доступных шаблонов для генерации NPC');
            const container = document.getElementById('npcResult');
            if (container) container.innerHTML = '<p>Нет доступных NPC для генерации</p>';
            return;
        }
        const randomType = types[Math.floor(Math.random() * types.length)];
        const template = templates[randomType];
        
        // Страховка: если вдруг template всё же legendary, перегенерируем
        if (template.threat === 'legendary') {
            console.warn('Попытка генерации legendary NPC, повторяем');
            return this.generate();
        }
        
        let role = "Неизвестно";
        if (template.roles && template.roles.length) {
            role = template.roles[Math.floor(Math.random() * template.roles.length)];
        }
        
        const firstNames = ["Джек", "Майк", "Кира", "Сара", "Виктор", "Елена", "Маркус", "Зоя", "Иван", "Ли", "Алекс", "Джейн", "Стив", "Ника", "Оскар", "Рико", "Мия", "Джей"];
        const lastNames = ["Смит", "Джонсон", "Ли", "Ким", "Браун", "Гарсия", "Мюллер", "Дюбуа", "Ива诺夫", "Чжан", "Коэн", "Судзуки", "О'Коннор", "Дюваль"];
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        
        const npc = {
            id: Date.now() + Math.random(),
            name: name,
            role: role,
            template: template,
            type: randomType,
            currentHp: template.derived.hp,
            currentArmor: { head: template.armor.head, body: template.armor.body }
        };
        this.render(npc);
    }

    static render(npc) {
        const container = document.getElementById('npcResult');
        if (!container) return;
        const t = npc.template;
        const hpPercent = (npc.currentHp / t.derived.hp) * 100;
        const threatClass = t.threat ? t.threat.toLowerCase() : 'unknown';
        
        container.innerHTML = `
            <div class="npc-card" data-id="${npc.id}" data-threat="${threatClass}">
                <div class="npc-header">
                    <span class="npc-name">${npc.name}</span>
                    <div class="npc-badges">
                        <span class="npc-role">${npc.role}</span>
                        <span class="npc-threat">${t.threat}</span>
                    </div>
                </div>
                <div class="npc-stats">
                    <div class="hp-text">
                        <span>❤️ ПЗ</span>
                        <span><input type="number" class="npc-hp" value="${npc.currentHp}" step="1" style="width:70px"> / ${t.derived.hp}</span>
                    </div>
                    <div class="hp-progress-container">
                        <div class="hp-progress-fill" style="width: ${hpPercent}%;"></div>
                    </div>
                    <div class="armor-info">
                        <span class="armor-badge"><i class="fas fa-hard-hat"></i> Голова: <input type="number" class="npc-armor-head" value="${npc.currentArmor.head}" step="1" style="width:60px"> ОС</span>
                        <span class="armor-badge"><i class="fas fa-vest"></i> Тело: <input type="number" class="npc-armor-body" value="${npc.currentArmor.body}" step="1" style="width:60px"> ОС</span>
                    </div>
                    <details>
                        <summary>📊 Характеристики</summary>
                        <div class="stats-grid-compact">
                            ${Object.entries(t.stats).map(([k, v]) => `<span><strong>${k}</strong> ${v}</span>`).join('')}
                        </div>
                    </details>
                    <details>
                        <summary>🎯 Навыки (Баз)</summary>
                        <div class="skills-list-compact">
                            ${Object.entries(t.skills).map(([k, v]) => `<span><strong>${k}</strong> +${v}</span>`).join('')}
                        </div>
                    </details>
                    <div class="equipment-list"><i class="fas fa-gun"></i> <strong>Оружие:</strong> ${t.weapons.join(', ')}</div>
                    <div class="equipment-list"><i class="fas fa-box"></i> <strong>Снаряжение:</strong> ${t.gear.join(', ') || '—'}</div>
                    ${t.cyberware.length ? `<div class="equipment-list"><i class="fas fa-microchip"></i> <strong>Импланты:</strong> ${t.cyberware.join(', ')}</div>` : ''}
                    <div class="npc-description"><i class="fas fa-comment"></i> ${t.description}</div>
                </div>
                <div class="npc-controls">
                    <button class="regenerate-npc-btn">🎲 Сгенерировать другого</button>
                </div>
            </div>
        `;

        const regenBtn = container.querySelector('.regenerate-npc-btn');
        regenBtn.addEventListener('click', () => this.generate());
        
        const hpInput = container.querySelector('.npc-hp');
        const armorHead = container.querySelector('.npc-armor-head');
        const armorBody = container.querySelector('.npc-armor-body');
        
        hpInput.addEventListener('change', (e) => {
            const newHp = parseInt(e.target.value);
            if (!isNaN(newHp)) {
                npc.currentHp = newHp;
                const fill = container.querySelector('.hp-progress-fill');
                if (fill) {
                    const percent = (newHp / t.derived.hp) * 100;
                    fill.style.width = `${percent}%`;
                }
            }
        });
        armorHead.addEventListener('change', (e) => { npc.currentArmor.head = parseInt(e.target.value) || 0; });
        armorBody.addEventListener('change', (e) => { npc.currentArmor.body = parseInt(e.target.value) || 0; });
    }
}

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