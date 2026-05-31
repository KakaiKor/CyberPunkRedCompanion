import { getHP } from '../utils.js';
import { initTransport } from './transport.js';

// ========== NPCGenerator (старый) ==========
export class NPCGenerator {
    static generate() {
        const roles = ["Рокербой","Соло","Нетраннер","Техник","Медтех","Медиа","Законник","Менеджер","Фиксер","Кочевник"];
        const names = ["Кибер-Джек","Леди Смерть","Стальной Кулак","Рейвен","Молния","Гроза","Тень","Фантом","Рико","Зара"];
        let role = roles[Math.floor(Math.random()*roles.length)];
        let stats = {};
        ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'].forEach(s=>stats[s]=Math.floor(Math.random()*7)+2);
        let hp = getHP(stats.BODY, stats.WILL);
        let severe = Math.ceil(hp/2);
        let humanity = stats.EMP*10;
        let empFrom = Math.floor(humanity/10);
        let name = names[Math.floor(Math.random()*names.length)] + " " + Math.floor(Math.random()*100);
        let html = `<strong>${name}</strong> (${role})<br>ХАР: ${Object.entries(stats).map(([k,v])=>`${k}=${v}`).join(', ')}<br>ПЗ = ${hp} (тяж. ≤ ${severe}), Спасбросок = ${stats.BODY}<br>Человечность = ${humanity} (ЭМП = ${empFrom})`;
        document.getElementById('npcResult').innerHTML = html;
    }
}

// ========== НОВЫЙ GroupTracker с карточками и чипсами ==========
export class GroupTracker {
    constructor() {
        this.members = [];
        this.load();
        this.render();
        document.getElementById('addMemberBtn')?.addEventListener('click', () => this.addMember());
        document.getElementById('clearGroupBtn')?.addEventListener('click', () => this.clear());
    }

    load() {
        let saved = localStorage.getItem('cpr_group');
        if (saved) this.members = JSON.parse(saved);
    }

    save() {
        localStorage.setItem('cpr_group', JSON.stringify(this.members));
    }

    addMember() {
        let name = document.getElementById('memberName').value.trim() || 'Безымянный';
        let maxHp = parseInt(document.getElementById('memberMaxHp').value);
        if (isNaN(maxHp)) maxHp = 35;
        this.members.push({
            name: name,
            maxHp: maxHp,
            currentHp: maxHp,
            crits: []
        });
        this.save();
        this.render();
        document.getElementById('memberName').value = '';
        document.getElementById('memberMaxHp').value = '';
    }

    clear() {
        this.members = [];
        this.save();
        this.render();
    }

    // Полный список критических травм
    getCritList() {
        return [
            "Оторванная рука", "Оторванная кисть", "Разрыв лёгкого", "Перелом рёбер",
            "Перелом руки", "Инородное тело", "Перелом ноги", "Разрыв мышц",
            "Травма позвоночника", "Раздробленные пальцы", "Оторванная нога",
            "Потеря глаза", "Травма мозга", "Повреждение глаза", "Сотрясение",
            "Перелом челюсти", "Хлыстовая травма шеи", "Трещина черепа",
            "Повреждение уха", "Травма трахеи", "Потеря уха"
        ];
    }

    // Штраф за конкретную травму
    getPenaltyForCrit(critName) {
        const penalties = {
            "Оторванная рука": -1, "Оторванная кисть": -1, "Разрыв лёгкого": -2,
            "Травма позвоночника": -1, "Раздробленные пальцы": -4, "Оторванная нога": -6,
            "Потеря глаза": -4, "Травма мозга": -2, "Повреждение глаза": -2,
            "Сотрясение": -2, "Перелом челюсти": -4, "Хлыстовая травма шеи": -1,
            "Повреждение уха": -2, "Потеря уха": -4, "Перелом ноги": -4,
            "Разрыв мышц": -2, "Перелом руки": 0, "Перелом рёбер": 0,
            "Инородное тело": 0, "Трещина черепа": 0, "Травма трахеи": 0
        };
        return penalties[critName] || 0;
    }

    calculateTotalPenalty(member) {
        let total = 0;
        // штраф от порога ПЗ
        if (member.currentHp <= Math.floor(member.maxHp / 2)) total -= 2;
        if (member.currentHp <= 0) total -= 4;
        // штрафы от травм
        for (let crit of member.crits) {
            total += this.getPenaltyForCrit(crit);
        }
        return total;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    render() {
        const container = document.getElementById('groupList');
        if (!container) return;

        if (this.members.length === 0) {
            container.innerHTML = '<p>Группа пуста. Добавьте персонажей.</p>';
            return;
        }

        let html = '<div class="group-members">';
        this.members.forEach((member, idx) => {
            const penalty = this.calculateTotalPenalty(member);
            html += `
                <div class="member-card" data-member-index="${idx}">
                    <div class="member-header">
                        <div class="member-name">${this.escapeHtml(member.name)}</div>
                        <div class="member-stats">
                            <label>ПЗ: <input type="number" value="${member.currentHp}" data-field="hp" class="member-hp-input" data-idx="${idx}"></label>
                            <span class="member-penalty">Штраф: ${penalty}</span>
                            <button class="remove-member" data-idx="${idx}">✖</button>
                        </div>
                    </div>
                    <div class="member-crits">
                        <div class="crits-label">Критические травмы:</div>
                        <div class="crits-chips-container">
            `;
            const allCrits = this.getCritList();
            for (let crit of allCrits) {
                const active = member.crits.includes(crit);
                html += `<button type="button" class="crit-chip ${active ? 'active' : ''}" data-crit="${this.escapeHtml(crit)}">${this.escapeHtml(crit)}</button>`;
            }
            html += `
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

        // Обработчики для полей ввода ПЗ
        document.querySelectorAll('.member-hp-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                let val = parseInt(e.target.value);
                if (!isNaN(val) && this.members[idx]) {
                    this.members[idx].currentHp = val;
                    this.save();
                    this.render();
                }
            });
        });

        // Обработчики для кнопок удаления члена группы
        document.querySelectorAll('.remove-member').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                if (!isNaN(idx) && this.members[idx]) {
                    this.members.splice(idx, 1);
                    this.save();
                    this.render();
                }
            });
        });

        // Обработчики для чипсов травм
        document.querySelectorAll('.crit-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const memberCard = chip.closest('.member-card');
                if (!memberCard) return;
                const memberIdx = parseInt(memberCard.dataset.memberIndex);
                if (isNaN(memberIdx) || !this.members[memberIdx]) return;
                const critName = chip.dataset.crit;
                const member = this.members[memberIdx];
                const index = member.crits.indexOf(critName);
                if (index === -1) {
                    member.crits.push(critName);
                    chip.classList.add('active');
                } else {
                    member.crits.splice(index, 1);
                    chip.classList.remove('active');
                }
                this.save();
                // перерисовываем только штраф и состояние чипсов без полной перерисовки
                const penaltySpan = memberCard.querySelector('.member-penalty');
                if (penaltySpan) penaltySpan.innerText = `Штраф: ${this.calculateTotalPenalty(member)}`;
                // Можно также обновить активность чипсов, но классы уже изменены
            });
        });
    }
}

// ========== Остальные GM-инструменты (без изменений) ==========
function generateContract() {
    const types = ["Извлечение","Устранение","Охрана","Кража данных","Саботаж","Перевозка груза","Шпионаж","Психологическая операция"];
    const clients = ["Корпорация Arasaka","Корпорация Militech","Банда Мальстрём","Банда Тигриные когти","Фиксер Хорнет","Частное лицо","Правительство НСША","Кочевники Альдекальдо","Trauma Team","Медиа-корпорация"];
    const complicationsList = ["Засада","Предательство","Конкурирующая команда","Неверная информация","Сложная цель","Временной лимит","Свидетель"];
    let type = types[Math.floor(Math.random()*types.length)];
    let client = clients[Math.floor(Math.random()*clients.length)];
    let complications = [];
    let numComp = Math.floor(Math.random()*3);
    for(let i=0;i<numComp;i++) { let comp = complicationsList[Math.floor(Math.random()*complicationsList.length)]; if(!complications.includes(comp)) complications.push(comp); }
    let basePay = { "Извлечение":2000,"Устранение":3000,"Охрана":1500,"Кража данных":2500,"Саботаж":2000,"Перевозка груза":1000,"Шпионаж":4000,"Психологическая операция":3500 }[type]||2000;
    let pay = basePay + complications.length*500;
    document.getElementById('contractResult').innerHTML = `<strong>📋 Контракт: ${type}</strong><br><strong>Заказчик:</strong> ${client}<br><strong>Оплата:</strong> ${pay} eb<br><strong>Осложнения:</strong> ${complications.length?complications.join(', '):'Нет'}<br><button id="refreshContractBtn" class="reset-btn" style="margin-top:10px;">🔄 Новый контракт</button>`;
    document.getElementById('refreshContractBtn')?.addEventListener('click', generateContract);
}

function checkCyberpsychosis() {
    let name = document.getElementById('psychoName').value||'Персонаж';
    let humanity = parseInt(document.getElementById('psychoHumanity').value);
    if(isNaN(humanity)) { document.getElementById('psychoResult').innerHTML = '<span style="color:#ff3c5f;">Введите значение человечности (ЧЕЛ)</span>'; return; }
    let emp = Math.floor(humanity/10);
    let stage;
    if(emp>=3) stage = { state:"✅ Норма — стабилен", effect:"Нет особых эффектов" };
    else if(emp===2) stage = { state:"⚠️ Пограничное расстройство", effect:"Цинизм, холодность" };
    else if(emp===1) stage = { state:"⚠️ Тяжёлая степень", effect:"Почти полная потеря эмпатии" };
    else stage = { state:"💀 КИБЕРПСИХОЗ", effect:"Персонаж переходит под контроль ГМ!" };
    document.getElementById('psychoResult').innerHTML = `<strong>${name}</strong><br>🧠 Человечность: ${humanity} → ЭМП = ${emp}<br>📊 Состояние: ${stage.state}<br>🎭 Эффект: ${stage.effect}`;
}

function generateNetArchitecture() {
    const complexity = parseInt(document.getElementById('netComplexity')?.value)||1;
    const slValues = [6,8,10,12];
    const sl = slValues[complexity];
    const floorsCount = Math.floor(Math.random()*6)+3;
    let floors = [];
    for(let i=0;i<floorsCount;i++) {
        let type;
        if(i<2) { const types = ["Пароль","Файл","Узел управления","Блуждающий огонёк","Скорпион"]; type = types[Math.floor(Math.random()*types.length)]; }
        else { const types = ["Пароль","Файл","Узел управления","Адская гончая","Аспид","Скорпион","Блуждающий огонёк","Убийца"]; type = types[Math.floor(Math.random()*types.length)]; }
        let floorHtml = `<strong>Этаж ${i+1}</strong>: ${type}`;
        if(type==="Пароль" || type==="Файл" || type==="Узел управления") floorHtml += ` (СЛ ${sl})`;
        else floorHtml += ` (Чёрный лёд)`;
        floors.push(floorHtml);
    }
    document.getElementById('netArchResult').innerHTML = `<strong>🌐 Архитектура сети (${floorsCount} этажей)</strong><br>Сложность: СЛ ${sl}<br>${floors.map(f=>`• ${f}`).join('<br>')}<button id="refreshNetArchBtn" class="reset-btn" style="margin-top:10px;">🔄 Новая архитектура</button>`;
    document.getElementById('refreshNetArchBtn')?.addEventListener('click', generateNetArchitecture);
}

// ========== Генератор врагов (пушечное мясо) ==========
class MookGenerator {
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
        const names = {
            'Шестёрка': ['Бустер','Громила','Шестёрка','Бандит','Мусорщик'],
            'Лейтенант': ['Капитан','Лейтенант','Офицер','Ветеран'],
            'Мини-босс': ['Хавк','Брут','Снайпер','Штурмовик'],
            'Босс (киберпсих)': ['Киберпсих','Мясник','Безумный боец','Сломанный'],
            'Элитный лейтенант': ['Элитный соло','Кибернизированный убийца','Штурмовой офицер']
        };
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
// ========== Генератор случайных встреч ==========
class EncounterGenerator {
    static generate() {
        const time = document.getElementById('encounterTime').value;
        const zone = document.getElementById('encounterZone').value;

        // 1. Базовый результат броска (d100)
        const roll = Math.floor(Math.random() * 100) + 1;
        
        // 2. Получаем данные о встрече
        let encounter = null;
        if (zone === 'corporate') {
            encounter = this.getCorporateEncounter(roll, time);
        } else if (zone === 'moderate') {
            encounter = this.getModerateEncounter(roll, time);
        } else if (zone === 'combat') {
            encounter = this.getCombatEncounter(roll, time);
        } else if (zone === 'hot') {
            encounter = this.getHotEncounter(roll, time);
        }

        if (!encounter) {
            document.getElementById('encounterResult').innerHTML = '<div class="info-block error">Ошибка: не удалось сгенерировать встречу</div>';
            return;
        }

        // 3. Отображаем результат
        this.renderEncounter(encounter, roll);
    }

    // Встречи для Корпоративной зоны (из книги, стр. 419)
    static getCorporateEncounter(roll, time) {
        if (time === 'day') {
            if (roll <= 5) return { type: "Местная полиция", description: "Патруль из 2-3 офицеров. Вооружены штурмовыми винтовками, в кевларовой броне. Могут остановить для проверки документов.", threat: "Низкая" };
            if (roll <= 11) return { type: "Корпоративная охрана", description: "Охранники из местной корпорации в лёгком арморджеке, с ПП. Считают, что вам здесь не место.", threat: "Низкая" };
            if (roll <= 13) return { type: "Техники", description: "Ремонтная бригада с дробовиками, в кевларовых жилетах. Чинят городскую инфраструктуру.", threat: "Низкая" };
            if (roll <= 17) return { type: "Частный детектив", description: "Вооружён очень тяжёлым пистолетом и дубинкой. Следит за кем-то или прессует информатора.", threat: "Средняя" };
            if (roll <= 20) return { type: "Корпораты", description: "Сотрудники местной фирмы, ловят такси. Имеют при себе средние пистолеты.", threat: "Низкая" };
            return { type: "Обычные прохожие", description: "Ничего примечательного. Люди спешат по своим делам.", threat: "Нет" };
        } else if (time === 'evening') {
            if (roll <= 5) return { type: "Городская полиция", description: "Патруль из 2-3 офицеров в среднем арморджеке, вооружены штурмовыми винтовками.", threat: "Средняя" };
            if (roll <= 11) return { type: "Корпоративная охрана", description: "Охранники в тяжёлом арморджеке, с тяжёлыми ПП. Усиленное патрулирование.", threat: "Средняя" };
            if (roll <= 13) return { type: "Корпоративные техники", description: "Техники с телохранителями. Чинят дорогую технику или грузят ящики в AV-4.", threat: "Средняя" };
            if (roll <= 17) return { type: "Частный детектив", description: "Вооружён очень тяжёлым пистолетом и мачете. Может остановить вас с вопросами.", threat: "Средняя" };
            if (roll <= 20) return { type: "Корпораты", description: "Идут к станции маглева. С собой одноразовые полимерники.", threat: "Низкая" };
            return { type: "Вечерние прохожие", description: "Город затихает, но жизнь продолжается.", threat: "Нет" };
        } else { // night
            if (roll <= 10) return { type: "Городская полиция", description: "Патруль с штурмовыми винтовками с интерфейсом умного оружия. Подозрительно относятся к ночным гулякам.", threat: "Высокая" };
            if (roll <= 22) return { type: "Корпоративная охрана", description: "Охранники с тяжёлыми ПП с интерфейсом умного оружия. Нервные, готовые к стрельбе.", threat: "Высокая" };
            if (roll <= 24) return { type: "Частный детектив", description: "Вооружённый детектив. Может быть в засаде или слежке.", threat: "Средняя" };
            if (roll <= 25) return { type: "Медиа", description: "Съёмочная группа, ищущая сюжет. Могут решить, что сюжет — это вы.", threat: "Низкая" };
            if (roll <= 29) return { type: "Хромеры", description: "Фанаты хроматик рока, после концерта ищут драки.", threat: "Средняя" };
            if (roll <= 39) return { type: "Команда бегущих по грани", description: "Готовят ограбление или другую операцию. Могут предложить долю.", threat: "Высокая" };
            if (roll <= 42) return { type: "Trauma Team", description: "AV-4 садится на место недавней перестрелки. Могут принять вас за участника.", threat: "Высокая" };
            if (roll <= 45) return { type: "Рейнджер", description: "Законник с помощником охотятся на банду. Могут позвать на помощь.", threat: "Средняя" };
            return { type: "Ночная тишина", description: "Улицы пустынны и опасны.", threat: "Нет" };
        }
    }

    // Встречи для Умеренной зоны (из книги, стр. 419-420)
    static getModerateEncounter(roll, time) {
        if (time === 'day') {
            if (roll <= 5) return { type: "Местная полиция", description: "Патруль копов проверяет документы у подозрительных лиц.", threat: "Низкая" };
            if (roll <= 11) return { type: "Корпоративная охрана", description: "Охранники патрулируют территорию, прогоняют нежелательных лиц.", threat: "Низкая" };
            if (roll <= 13) return { type: "Техники", description: "Чинят уличное оборудование или дороги.", threat: "Низкая" };
            if (roll <= 17) return { type: "Частный детектив", description: "Ведёт слежку или разговаривает с информатором.", threat: "Низкая" };
            if (roll <= 20) return { type: "Корпораты", description: "Сотрудники корпораций, могут быть с охраной.", threat: "Низкая" };
            if (roll <= 27) return { type: "Местные жители", description: "Обычные люди, спешащие по делам.", threat: "Нет" };
            if (roll <= 32) return { type: "Восстановители", description: "Ремонтируют здания или инфраструктуру.", threat: "Низкая" };
            if (roll <= 37) return { type: "Медиа", description: "Съёмочная группа, снимает репортаж.", threat: "Низкая" };
            if (roll <= 41) return { type: "Частный детектив", description: "Работает под прикрытием.", threat: "Низкая" };
            if (roll <= 46) return { type: "Trauma Team", description: "AV-4 забирает раненых.", threat: "Средняя" };
            if (roll <= 57) return { type: "Мусорщики", description: "Роются в мусорных баках в поисках ценного хлама.", threat: "Низкая" };
            if (roll <= 63) return { type: "Кочевники", description: "Группа кочевников, возможно, ищет драки.", threat: "Средняя" };
            if (roll <= 70) return { type: "Банда бустеров", description: "Низкоуровневые панки, ищут лёгкую добычу.", threat: "Средняя" };
            if (roll <= 76) return { type: "Уличные панки", description: "Смэшхэды, ищут деньги на дозу.", threat: "Средняя" };
            if (roll <= 82) return { type: "Культисты", description: "Отступники проповедуют о конце света.", threat: "Низкая" };
            if (roll <= 88) return { type: "Кочевнический грузовик", description: "Кочевники чинят сломавшийся грузовик.", threat: "Низкая" };
            if (roll <= 94) return { type: "Банда бустеров", description: "Железные прицелы — опытные бойцы с имплантами.", threat: "Высокая" };
            if (roll <= 100) return { type: "Крупный преступник", description: "Серьёзная операция синдиката. Соло разгружают контрабанду.", threat: "Очень высокая" };
            return { type: "Обычный день", description: "Ничего особенного не происходит.", threat: "Нет" };
        } else {
            // Вечерние и ночные встречи для умеренной зоны
            return this.getCorporateEncounter(roll, time);
        }
    }

    // Встречи для Боевой зоны (из книги, стр. 421-422)
    static getCombatEncounter(roll, time) {
        if (time === 'day') {
            if (roll <= 5) return { type: "Городская полиция", description: "Патруль в среднем арморджеке, вооружены штурмовыми винтовками.", threat: "Средняя" };
            if (roll <= 11) return { type: "Корпоративная охрана", description: "Охранники в тяжёлом арморджеке, с тяжёлыми ПП.", threat: "Средняя" };
            if (roll <= 13) return { type: "Корпоративные техники", description: "Техники с телохранителями, чинят дорогую технику.", threat: "Средняя" };
            if (roll <= 17) return { type: "Частный детектив", description: "Вооружён очень тяжёлым пистолетом и мачете.", threat: "Средняя" };
            if (roll <= 20) return { type: "Корпораты", description: "Сотрудники корпораций, с ними бандиты.", threat: "Средняя" };
            if (roll <= 25) return { type: "Рокербои", description: "Группа рокеров идёт на концерт, с ними соло-телохранители.", threat: "Низкая" };
            if (roll <= 30) return { type: "Медиа", description: "Съёмочная группа, снимает репортаж.", threat: "Низкая" };
            if (roll <= 33) return { type: "Вампиры филармонии", description: "Банда пранкеров, готовят очередной розыгрыш.", threat: "Низкая" };
            if (roll <= 40) return { type: "Местный подросток", description: "Подросток, сбежавший из дома, попал в беду.", threat: "Нет" };
            if (roll <= 46) return { type: "Бродячие нетраннеры", description: "Взламывают архитектуру сети небольшого офиса.", threat: "Средняя" };
            if (roll <= 52) return { type: "Кочевники", description: "Поддатые кочевники в среднем арморджеке, ищут драки.", threat: "Высокая" };
            if (roll <= 58) return { type: "Уличные панки", description: "Смэшхэды, вооружены ножами и дубинками.", threat: "Средняя" };
            if (roll <= 63) return { type: "Trauma Team", description: "AV-4 забирает раненых.", threat: "Средняя" };
            if (roll <= 69) return { type: "Хромеры", description: "Фанаты хроматик рока, лезут в драку.", threat: "Средняя" };
            if (roll <= 72) return { type: "Команда соло", description: "Наёмные убийцы, могут убрать свидетелей.", threat: "Высокая" };
            if (roll <= 77) return { type: "Железные прицелы (усиленные)", description: "Опытные бойцы с автоматическим оружием и имплантами.", threat: "Очень высокая" };
            if (roll <= 83) return { type: "Команда соло (серые операции)", description: "Профессионалы с умным оружием и продвинутыми имплантами.", threat: "Очень высокая" };
            if (roll <= 90) return { type: "Пираньи", description: "Банда с усиленными рефлексами.", threat: "Высокая" };
            if (roll <= 93) return { type: "Крупная криминальная операция", description: "Семья Скагаттия разгружает наркотики. Киберизированные соло.", threat: "Очень высокая" };
            if (roll <= 100) return { type: "Перестрелка", description: "Вы вваливаетесь в разборку между Мальстрём и Легионом Красного хрома.", threat: "Очень высокая" };
            return { type: "Обычный день", description: "Ничего особенного не происходит.", threat: "Нет" };
        } else {
            // Вечерние и ночные встречи для боевой зоны
            return this.getCorporateEncounter(roll, time);
        }
    }

    // Встречи для Горячей зоны (из книги, стр. 423-425)
    static getHotEncounter(roll, time) {
        // Аналогично боевой зоне, но с более опасными результатами
        return this.getCombatEncounter(roll, time);
    }

    static renderEncounter(encounter, roll) {
        const threatColor = {
            'Нет': '#9aa4bf',
            'Низкая': '#4caf50',
            'Средняя': '#ffc107',
            'Высокая': '#ff9800',
            'Очень высокая': '#ff3c5f'
        };
        
        const html = `
            <div class="encounter-card">
                <div class="encounter-header">
                    <div class="encounter-type">${encounter.type}</div>
                    <div class="encounter-threat" style="color: ${threatColor[encounter.threat] || '#9aa4bf'}">
                        🎯 Угроза: ${encounter.threat}
                    </div>
                </div>
                <div class="encounter-description">${encounter.description}</div>
                <div class="encounter-roll">🎲 Результат броска: ${roll}</div>
            </div>
            <div class="button-group">
                <button id="rerollEncounterBtn" class="cyber-btn">🎲 Перебросить</button>
            </div>
        `;
        document.getElementById('encounterResult').innerHTML = html;
        
        // Обработчик для кнопки переброса
        document.getElementById('rerollEncounterBtn')?.addEventListener('click', () => this.generate());
    }
}
// ========== Калькулятор развития (IP) ==========
function calculateIPCost(current, target, type) {
    if (current >= target) return 0;
    const costMapNormal = { 1:20,2:40,3:60,4:80,5:100,6:120,7:140,8:160,9:180,10:200 };
    const costMapHard = { 1:40,2:80,3:120,4:160,5:200,6:240,7:280,8:320,9:360,10:400 };
    const costMapRole = { 1:60,2:120,3:180,4:240,5:300,6:360,7:420,8:480,9:540,10:600 };
    let costMap = costMapNormal;
    if (type === 'hard') costMap = costMapHard;
    if (type === 'role') costMap = costMapRole;
    let total = 0;
    for (let i = current+1; i <= target; i++) total += costMap[i];
    return total;
}

function renderIPTable() {
    const container = document.getElementById('ipTableWrapper');
    if (!container) return;
    const normal = [20,40,60,80,100,120,140,160,180,200];
    const hard = [40,80,120,160,200,240,280,320,360,400];
    const role = [60,120,180,240,300,360,420,480,540,600];
    let html = `<table class="cyber-table"><thead><tr><th>Уровень</th><th>Обычный</th><th>Сложный (×2)</th><th>Ролевой</th></tr></thead><tbody>`;
    for (let i = 1; i <= 10; i++) {
        html += `<tr><td>${i}</td><td>${normal[i-1]}</td><td>${hard[i-1]}</td><td>${role[i-1]}</td></tr>`;
    }
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function updateIPCalculator() {
    const type = document.getElementById('ipSkillType').value;
    let current = parseInt(document.getElementById('currentLevel').value);
    let target = parseInt(document.getElementById('targetLevel').value);
    if (isNaN(current)) current = 0;
    if (isNaN(target)) target = 0;
    if (current < 0 || current > 10 || target < 0 || target > 10) {
        document.getElementById('ipResult').innerHTML = '<span style="color:#ff3c5f;">⚠️ Уровни должны быть от 0 до 10</span>';
        return;
    }
    if (target <= current) {
        document.getElementById('ipResult').innerHTML = '<span class="note">🎯 Целевой уровень не выше текущего. Стоимость = 0 IP.</span>';
        return;
    }
    const cost = calculateIPCost(current, target, type);
    document.getElementById('ipResult').innerHTML = `<strong>💰 Стоимость повышения с ${current} до ${target}:</strong> ${cost} IP`;
}
// ========== Инициализация всех GM-инструментов ==========
export function initGM() {
    document.getElementById('generateNpcBtn')?.addEventListener('click', () => NPCGenerator.generate());
    document.getElementById('genContractBtn')?.addEventListener('click', generateContract);
    document.getElementById('calcPsychoBtn')?.addEventListener('click', checkCyberpsychosis);
    document.getElementById('genNetArchBtn')?.addEventListener('click', generateNetArchitecture);
    document.getElementById('generateMooksBtn')?.addEventListener('click', () => MookGenerator.generate());
    document.getElementById('generateEncounterBtn')?.addEventListener('click', () => EncounterGenerator.generate());  // 👈 Новая строка
    initTransport();
    document.getElementById('generateMooksBtn')?.addEventListener('click', () => MookGenerator.generate());
    document.getElementById('generateEncounterBtn')?.addEventListener('click', () => EncounterGenerator.generate());
    document.getElementById('calcIPBtn')?.addEventListener('click', updateIPCalculator);
    renderIPTable(); // заполняем таблицу
    initTransport();
}