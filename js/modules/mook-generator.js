// modules/mook-generator.js
export class MookGenerator {
    static generate() {
        const playerCount = parseInt(document.getElementById('playerCount').value) || 4;
        const difficulty = document.getElementById('encounterDifficulty').value;
        let enemies = [];
        if (difficulty === 'easy') {
            for (let i = 0; i < playerCount; i++) enemies.push(this.createMook('Шестёрка', 25, 8, 7, 4));
        } else if (difficulty === 'normal') {
            const lieutenantCount = Math.floor(playerCount / 2);
            for (let i = 0; i < lieutenantCount; i++) enemies.push(this.createMook('Лейтенант', 35, 12, 11, 5));
            for (let i = 0; i < playerCount; i++) enemies.push(this.createMook('Шестёрка', 25, 8, 7, 4));
        } else if (difficulty === 'hard') {
            enemies.push(this.createMook('Мини-босс', 50, 16, 13, 6));
            const lieutenantCount = Math.floor(playerCount / 2);
            for (let i = 0; i < lieutenantCount; i++) enemies.push(this.createMook('Лейтенант', 35, 12, 11, 5));
            for (let i = 0; i < playerCount; i++) enemies.push(this.createMook('Шестёрка', 25, 8, 7, 4));
        } else if (difficulty === 'deadly') {
            enemies.push(this.createMook('Босс (киберпсих)', 80, 20, 15, 8));
            const eliteCount = Math.floor(playerCount / 2) + 1;
            for (let i = 0; i < eliteCount; i++) enemies.push(this.createMook('Элитный лейтенант', 45, 14, 12, 6));
        }
        this.renderEnemies(enemies);
    }
    static createMook(type, hp, attackBonus, armor, ref) {
        const names = { 'Шестёрка':['Бустер','Громила','Шестёрка','Бандит','Мусорщик'], 'Лейтенант':['Капитан','Лейтенант','Офицер','Ветеран'], 'Мини-босс':['Хавк','Брут','Снайпер','Штурмовик'], 'Босс (киберпсих)':['Киберпсих','Мясник','Безумный боец','Сломанный'], 'Элитный лейтенант':['Элитный соло','Кибернизированный убийца','Штурмовой офицер'] };
        const nameList = names[type] || ['Противник'];
        const name = nameList[Math.floor(Math.random()*nameList.length)] + " " + (Math.floor(Math.random()*100)+1);
        const body = Math.floor(attackBonus / 2) + 4;
        const will = body;
        const hpValue = hp;
        const severe = Math.ceil(hpValue / 2);
        const initBonus = ref;
        const armorSp = armor;
        return { name, type, hp: hpValue, severe, attackBonus, initBonus, armor: armorSp, body, will, ref };
    }
    static renderEnemies(enemies) {
        const container = document.getElementById('mookResult');
        if (!container) return;
        if (enemies.length === 0) { container.innerHTML = '<p>Нет врагов.</p>'; return; }
        let html = '<div class="mook-grid">';
        enemies.forEach((e, idx) => {
            html += `
                <div class="mook-card" data-idx="${idx}">
                    <div class="mook-header"><strong>${e.name}</strong> <span class="mook-type">${e.type}</span></div>
                    <div class="mook-stats"><div>❤️ ПЗ: ${e.hp} (тяж. ≤ ${e.severe})</div><div>⚔️ Атака: +${e.attackBonus}</div><div>🛡️ ОС брони: ${e.armor}</div><div>⚡ Инициатива: +${e.initBonus}</div></div>
                    <div class="mook-controls"><label>ПЗ: <input type="number" class="mook-hp" value="${e.hp}" step="1"></label><button class="remove-mook-btn" data-idx="${idx}">🗑️ Удалить</button></div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
        document.querySelectorAll('.mook-hp').forEach((input, i) => {
            input.addEventListener('change', (e) => {
                const newHp = parseInt(e.target.value);
                if (!isNaN(newHp)) {
                    const card = e.target.closest('.mook-card');
                    const severeSpan = card.querySelector('.mook-stats div:first-child');
                    const severe = Math.ceil(newHp / 2);
                    severeSpan.innerHTML = `❤️ ПЗ: ${newHp} (тяж. ≤ ${severe})`;
                }
            });
        });
        document.querySelectorAll('.remove-mook-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                const card = e.target.closest('.mook-card');
                if (card) card.remove();
            });
        });
    }
}