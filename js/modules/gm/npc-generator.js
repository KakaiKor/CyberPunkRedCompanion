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
            types = Object.keys(templates);
        } else {
            types = [selectedType];
        }
        const randomType = types[Math.floor(Math.random() * types.length)];
        const template = templates[randomType];
        
        // Выбираем случайную роль из массива
        let role = "Неизвестно";
        if (template.roles && template.roles.length) {
            role = template.roles[Math.floor(Math.random() * template.roles.length)];
        }
        
        // Генерация имени
        const firstNames = ["Джек", "Майк", "Кира", "Сара", "Виктор", "Елена", "Маркус", "Зоя", "Иван", "Ли", "Алекс", "Джейн", "Стив", "Ника", "Оскар", "Рико", "Мия", "Джей"];
        const lastNames = ["Смит", "Джонсон", "Ли", "Ким", "Браун", "Гарсия", "Мюллер", "Дюбуа", "Иванов", "Чжан", "Коэн", "Судзуки", "О'Коннор", "Дюваль"];
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
        container.innerHTML = `
            <div class="npc-card" data-id="${npc.id}">
                <div class="npc-header">
                    <span class="npc-name">${npc.name}</span>
                    <div class="npc-badges">
                        <span class="npc-role">${npc.role}</span>
                        <span class="npc-threat">${t.threat}</span>
                    </div>
                </div>
                <div class="npc-stats">
                    <div class="npc-hp-armor">
                        <label>❤️ ПЗ: <input type="number" class="npc-hp" value="${npc.currentHp}" step="1" style="width:70px"> / ${t.derived.hp}</label>
                        <label>🛡️ ОС голова: <input type="number" class="npc-armor-head" value="${npc.currentArmor.head}" step="1" style="width:60px"></label>
                        <label>🛡️ ОС тело: <input type="number" class="npc-armor-body" value="${npc.currentArmor.body}" step="1" style="width:60px"></label>
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
                    <div>🔫 Оружие: ${t.weapons.join(', ')}</div>
                    <div>🎒 Снаряжение: ${t.gear.join(', ') || '—'}</div>
                    ${t.cyberware.length ? `<div>🧠 Киберимпланты: ${t.cyberware.join(', ')}</div>` : ''}
                    <div class="npc-description">📝 ${t.description}</div>
                </div>
                <div class="npc-controls">
                    <button class="regenerate-npc-btn">🎲 Сгенерировать другого</button>
                </div>
            </div>
        `;

        // Обработчики (редактирование ПЗ, брони, регенерация)
        const regenBtn = container.querySelector('.regenerate-npc-btn');
        regenBtn.addEventListener('click', () => this.generate());
        const hpInput = container.querySelector('.npc-hp');
        const armorHead = container.querySelector('.npc-armor-head');
        const armorBody = container.querySelector('.npc-armor-body');
        hpInput.addEventListener('change', (e) => { npc.currentHp = parseInt(e.target.value) || 0; });
        armorHead.addEventListener('change', (e) => { npc.currentArmor.head = parseInt(e.target.value) || 0; });
        armorBody.addEventListener('change', (e) => { npc.currentArmor.body = parseInt(e.target.value) || 0; });
    }
}