import { getHP } from '../utils.js';
import { initTransport } from './transport.js';

// ========== NPCGenerator ==========
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

// ========== GroupTracker ==========
export class GroupTracker {
    constructor() {
        this.members = [];
        this.load();
        this.render();
        document.getElementById('addMemberBtn')?.addEventListener('click', () => this.addMember());
        document.getElementById('clearGroupBtn')?.addEventListener('click', () => this.clear());
    }
    load() { let saved = localStorage.getItem('cpr_group'); if (saved) this.members = JSON.parse(saved); }
    save() { localStorage.setItem('cpr_group', JSON.stringify(this.members)); }
    addMember() {
        let name = document.getElementById('memberName').value.trim() || 'Безымянный';
        let maxHp = parseInt(document.getElementById('memberMaxHp').value);
        if (isNaN(maxHp)) maxHp = 35;
        this.members.push({ name, maxHp, currentHp: maxHp, crits: [] });
        this.save(); this.render();
        document.getElementById('memberName').value = ''; document.getElementById('memberMaxHp').value = '';
    }
    clear() { this.members = []; this.save(); this.render(); }
    getCritList() { return ["Оторванная рука","Оторванная кисть","Разрыв лёгкого","Перелом рёбер","Перелом руки","Инородное тело","Перелом ноги","Разрыв мышц","Травма позвоночника","Раздробленные пальцы","Оторванная нога","Потеря глаза","Травма мозга","Повреждение глаза","Сотрясение","Перелом челюсти","Хлыстовая травма шеи","Трещина черепа","Повреждение уха","Травма трахеи","Потеря уха"]; }
    getPenaltyForCrit(critName) {
        const penalties = { "Оторванная рука":-1,"Оторванная кисть":-1,"Разрыв лёгкого":-2,"Травма позвоночника":-1,"Раздробленные пальцы":-4,"Оторванная нога":-6,"Потеря глаза":-4,"Травма мозга":-2,"Повреждение глаза":-2,"Сотрясение":-2,"Перелом челюсти":-4,"Хлыстовая травма шеи":-1,"Повреждение уха":-2,"Потеря уха":-4,"Перелом ноги":-4,"Разрыв мышц":-2 };
        return penalties[critName] || 0;
    }
    calculateTotalPenalty(member) {
        let total = 0;
        if (member.currentHp <= Math.floor(member.maxHp / 2)) total -= 2;
        if (member.currentHp <= 0) total -= 4;
        for (let crit of member.crits) total += this.getPenaltyForCrit(crit);
        return total;
    }
    escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }
    render() {
        const container = document.getElementById('groupList');
        if (!container) return;
        if (this.members.length === 0) { container.innerHTML = '<p>Группа пуста. Добавьте персонажей.</p>'; return; }
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
                        <div class="crits-chips-container">`;
            const allCrits = this.getCritList();
            for (let crit of allCrits) {
                const active = member.crits.includes(crit);
                html += `<button type="button" class="crit-chip ${active ? 'active' : ''}" data-crit="${this.escapeHtml(crit)}">${this.escapeHtml(crit)}</button>`;
            }
            html += `</div></div></div>`;
        });
        html += '</div>';
        container.innerHTML = html;
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
        document.querySelectorAll('.remove-member').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                if (!isNaN(idx) && this.members[idx]) { this.members.splice(idx,1); this.save(); this.render(); }
            });
        });
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
                if (index === -1) member.crits.push(critName);
                else member.crits.splice(index,1);
                this.save();
                this.render();
            });
        });
    }
}

// ========== Генератор контрактов (упрощённый) ==========
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

// ========== Киберпсихоз ==========
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

// ========== Архитектура сети ==========
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

// ========== Генератор врагов ==========
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

// ========== Генератор случайных встреч ==========
export class EncounterGenerator {
    static generate() {
        const time = document.getElementById('encounterTime').value;
        const zone = document.getElementById('encounterZone').value;
        const roll = Math.floor(Math.random() * 100) + 1;
        let encounter = null;
        if (zone === 'corporate') encounter = this.getCorporateEncounter(roll, time);
        else if (zone === 'moderate') encounter = this.getModerateEncounter(roll, time);
        else encounter = { type: "Обычная встреча", description: "Ничего особенного.", threat: "Нет" };
        if (!encounter) { document.getElementById('encounterResult').innerHTML = '<div class="info-block error">Ошибка генерации</div>'; return; }
        this.renderEncounter(encounter, roll);
    }
    static getCorporateEncounter(roll, time) {
        if (time === 'day') {
            if (roll <=5) return { type:"Местная полиция", description:"Патруль из 2-3 офицеров.", threat:"Низкая" };
            if (roll <=11) return { type:"Корпоративная охрана", description:"Охранники в лёгком арморджеке.", threat:"Низкая" };
            return { type:"Обычные прохожие", description:"Ничего примечательного.", threat:"Нет" };
        } else return { type:"Вечерняя прогулка", description:"Город затихает.", threat:"Нет" };
    }
    static getModerateEncounter(roll, time) {
        if (time === 'day') {
            if (roll <=5) return { type:"Полиция", description:"Патруль проверяет документы.", threat:"Низкая" };
            return { type:"Местные жители", description:"Люди спешат по делам.", threat:"Нет" };
        } else return { type:"Вечер", description:"Улицы пустеют.", threat:"Нет" };
    }
    static renderEncounter(encounter, roll) {
        const threatColor = { 'Нет':'#9aa4bf','Низкая':'#4caf50','Средняя':'#ffc107','Высокая':'#ff9800','Очень высокая':'#ff3c5f' };
        const html = `
            <div class="encounter-card">
                <div class="encounter-header">
                    <div class="encounter-type">${encounter.type}</div>
                    <div class="encounter-threat" style="color:${threatColor[encounter.threat] || '#9aa4bf'}">🎯 Угроза: ${encounter.threat}</div>
                </div>
                <div class="encounter-description">${encounter.description}</div>
                <div class="encounter-roll">🎲 Результат броска: ${roll}</div>
            </div>
            <div class="button-group"><button id="rerollEncounterBtn" class="cyber-btn">🎲 Перебросить</button></div>
        `;
        document.getElementById('encounterResult').innerHTML = html;
        document.getElementById('rerollEncounterBtn')?.addEventListener('click', () => this.generate());
    }
}

// ========== ПРОДВИНУТЫЙ ГЕНЕРАТОР КОНТРАКТОВ ==========
export class AdvancedContractGenerator {
    static generate() {
        const difficulty = document.getElementById('contractDifficulty').value;
        let chosenType = document.getElementById('contractType').value;
        if (chosenType === 'random') {
            const types = ['extraction','elimination','protection','theft','sabotage','transport','espionage','psyop'];
            chosenType = types[Math.floor(Math.random() * types.length)];
        }
        const contract = this.buildContract(chosenType, difficulty);
        this.renderContract(contract);
        return contract;
    }
    static buildContract(type, difficulty) {
        const clients = {
            extraction: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Trauma Team", "Медиа-корпорация", "Частный коллекционер"],
            elimination: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Семья Скив", "Якудза", "Ревнивый супруг"],
            protection: ["Корпорация Arasaka", "Militech", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Trauma Team", "Медиа-корпорация", "Богатый бизнесмен", "Учёный Biotechnica", "Свидетель"],
            theft: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Хакер-одиночка", "Конкурирующий фиксер", "Музей"],
            sabotage: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Эко-террористы", "Недовольный менеджер"],
            transport: ["Корпорация Arasaka", "Militech", "Фиксер Хорнет", "Кочевники Альдекальдо", "Контрабандисты", "Криминальный синдикат", "Докер", "Гуманитарная организация"],
            espionage: ["Корпорация Arasaka", "Militech", "Правительство НСША", "Европейский союз", "Неосоветы", "Конкурирующая корпорация", "Иностранное посольство"],
            psyop: ["Корпорация Arasaka", "Militech", "Правительство НСША", "Медиа-корпорация", "Политическая партия", "Культ", "Психоотряд"]
        };
        const targets = {
            extraction: ["похищенного учёного", "свидетеля", "ценный прототип", "члена семьи", "предателя", "имплант с данными", "заложника"],
            elimination: ["корпоративного шпиона", "лидера банды", "предателя", "свидетеля", "цель из списка", "конкурента", "киберпсиха"],
            protection: ["VIP-персону", "караван с грузом", "объект", "свидетеля", "тайник с уликами", "базу повстанцев"],
            theft: ["файлы данных", "прототип", "артефакт", "финансовые отчёты", "чертежи", "пароль", "ключ-карту"],
            sabotage: ["лабораторию", "склад оружия", "серверную", "транспортный узел", "энергоблок", "завод", "систему безопасности"],
            transport: ["деликатный груз", "контрабанду", "гуманитарную помощь", "ценный антиквариат", "партию имплантов", "образцы ДНК"],
            espionage: ["секретные планы", "коды доступа", "список агентов", "компромат", "архивы переписки", "дипломатические документы"],
            psyop: ["распространить слух", "дезинформацию", "компромат на политика", "манипуляцию общественным мнением", "спровоцировать конфликт"]
        };
        const complications = {
            easy: [],
            medium: ["сжатые сроки", "неполная информация", "нейтральная территория"],
            hard: ["утечка информации", "конкурирующая команда", "двойной агент", "система безопасности"],
            deadly: ["предательство заказчика", "засада", "вмешательство третьей стороны", "временная бомба", "ненадёжное снаряжение"]
        };
        const twists = [
            "Цель знает о покушении и подготовилась",
            "Заказчик планирует избавиться от команды после выполнения",
            "Данные, которые вы украли, содержат вирус",
            "Груз – живой, и он не хочет ехать",
            "На объекте уже работает другая команда",
            "Цель оказывается старым другом",
            "В процессе выясняется, что заказчик – корпорация, а цель – правительство"
        ];
        const rewardBase = { easy: 500, medium: 1000, hard: 2000, deadly: 4000 };
        const reward = rewardBase[difficulty] + Math.floor(Math.random() * 500);
        const clientList = clients[type] || clients.extraction;
        const client = clientList[Math.floor(Math.random() * clientList.length)];
        const targetList = targets[type] || targets.extraction;
        const target = targetList[Math.floor(Math.random() * targetList.length)];
        const complicationList = complications[difficulty];
        const hasComplication = Math.random() > 0.5;
        const complication = hasComplication && complicationList.length ? complicationList[Math.floor(Math.random() * complicationList.length)] : null;
        const hasTwist = Math.random() > 0.7;
        const twist = hasTwist ? twists[Math.floor(Math.random() * twists.length)] : null;
        let description = "";
        switch(type) {
            case 'extraction': description = `Заказчик ${client} нанимает команду для извлечения ${target}. Цель находится на охраняемом объекте. Оплата: ${reward} eb.`; break;
            case 'elimination': description = `Заказчик ${client} требует ликвидировать ${target}. Цель хорошо охраняется. Оплата: ${reward} eb.`; break;
            case 'protection': description = `Заказчик ${client} нанимает команду для охраны ${target}. Угроза: возможное нападение. Оплата: ${reward} eb.`; break;
            case 'theft': description = `Заказчик ${client} поручает кражу ${target}. Охрана усилена. Оплата: ${reward} eb.`; break;
            case 'sabotage': description = `Заказчик ${client} нанимает команду для саботажа ${target}. Необходимо минимизировать следы. Оплата: ${reward} eb.`; break;
            case 'transport': description = `Заказчик ${client} нуждается в перевозке ${target}. Маршрут опасен. Оплата: ${reward} eb.`; break;
            case 'espionage': description = `Заказчик ${client} требует добыть ${target}. Операция секретная. Оплата: ${reward} eb.`; break;
            case 'psyop': description = `Заказчик ${client} поручает психологическую операцию: ${target}. Цель – повлиять на общественное мнение. Оплата: ${reward} eb.`; break;
        }
        if (complication) description += ` Осложнение: ${complication}.`;
        if (twist) description += ` Неожиданный поворот: ${twist}.`;
        return { type, client, target, difficulty, reward, complication, twist, description };
    }
    static renderContract(contract) {
        const container = document.getElementById('advancedContractResult');
        if (!container) return;
        const html = `
            <div class="contract-card">
                <div class="contract-header">
                    <div class="contract-type">${this.translateType(contract.type)}</div>
                    <div class="contract-difficulty">${this.translateDifficulty(contract.difficulty)}</div>
                </div>
                <div class="contract-description">${contract.description}</div>
                <div class="contract-details">
                    <div><strong>Заказчик:</strong> ${contract.client}</div>
                    <div><strong>Цель:</strong> ${contract.target}</div>
                    <div><strong>Награда:</strong> ${contract.reward} eb</div>
                    ${contract.complication ? `<div><strong>Осложнение:</strong> ${contract.complication}</div>` : ''}
                    ${contract.twist ? `<div><strong>Поворот:</strong> ${contract.twist}</div>` : ''}
                </div>
            </div>
        `;
        container.innerHTML = html;
    }
    static translateType(type) {
        const map = { extraction: "Извлечение", elimination: "Устранение", protection: "Охрана", theft: "Кража данных", sabotage: "Саботаж", transport: "Перевозка груза", espionage: "Шпионаж", psyop: "Психологическая операция" };
        return map[type] || type;
    }
    static translateDifficulty(diff) {
        const map = { easy: "Лёгкая", medium: "Средняя", hard: "Тяжёлая", deadly: "Смертельная" };
        return map[diff] || diff;
    }
    static copyToClipboard() {
        const container = document.getElementById('advancedContractResult');
        if (!container || !container.innerText) return;
        const text = container.innerText;
        navigator.clipboard.writeText(text).then(() => alert('Контракт скопирован в буфер обмена!'));
    }
}

// ========== Инициализация GM-инструментов ==========
export function initGM() {
    document.getElementById('generateNpcBtn')?.addEventListener('click', () => NPCGenerator.generate());
    document.getElementById('genContractBtn')?.addEventListener('click', generateContract);
    document.getElementById('calcPsychoBtn')?.addEventListener('click', checkCyberpsychosis);
    document.getElementById('genNetArchBtn')?.addEventListener('click', generateNetArchitecture);
    document.getElementById('generateMooksBtn')?.addEventListener('click', () => MookGenerator.generate());
    document.getElementById('generateEncounterBtn')?.addEventListener('click', () => EncounterGenerator.generate());
    document.getElementById('generateAdvancedContractBtn')?.addEventListener('click', () => AdvancedContractGenerator.generate());
    document.getElementById('copyContractBtn')?.addEventListener('click', () => AdvancedContractGenerator.copyToClipboard());
    initTransport();
}