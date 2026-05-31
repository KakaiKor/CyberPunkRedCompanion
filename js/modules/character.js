import { getHP } from '../utils.js';
import { saveCharacter, loadCharacter } from '../storage.js';

export class CharacterHelper {
    constructor() {
        this.buildStatsGrid();
        document.getElementById('randomStatsBtn')?.addEventListener('click', () => this.randomStats());
        document.getElementById('calcCharBtn')?.addEventListener('click', () => this.calcDerived());
        document.getElementById('saveCharBtn')?.addEventListener('click', () => this.save());
        document.getElementById('loadCharBtn')?.addEventListener('click', () => this.load());
        document.getElementById('buildCharCardBtn')?.addEventListener('click', () => this.generateStreetRatCharacter());
    }
    
    buildStatsGrid() {
        const container = document.getElementById('statsGrid');
        if (!container) return;
        const ids = ['statINT','statREF','statDEX','statTECH','statCOOL','statWILL','statLUCK','statMOVE','statBODY','statEMP'];
        const names = ['ИНТ','РЕФ','ЛВК','ТЕХ','КРУТ','ВОЛЯ','УДЧ','СКО','ТЕЛО','ЭМП'];
        let html = '';
        for (let i = 0; i < ids.length; i++) {
            html += `<label>${names[i]}<br><input type="number" id="${ids[i]}" min="2" max="8" value="6"></label>`;
        }
        container.innerHTML = html;
    }
    
    randomStats() {
        const ids = ['statINT','statREF','statDEX','statTECH','statCOOL','statWILL','statLUCK','statMOVE','statBODY','statEMP'];
        ids.forEach(id => document.getElementById(id).value = Math.floor(Math.random() * 7) + 2);
        this.calcDerived();
    }
    
    calcDerived() {
        const body = parseInt(document.getElementById('statBODY').value);
        const will = parseInt(document.getElementById('statWILL').value);
        const emp = parseInt(document.getElementById('statEMP').value);
        const hp = getHP(body, will);
        const severe = Math.ceil(hp / 2);
        const humanity = emp * 10;
        const empFrom = Math.floor(humanity / 10);
        document.getElementById('charDerived').innerHTML = `<strong>ПЗ = ${hp}</strong> (тяж. ≤ ${severe})<br>Спасбросок = ${body}<br>Человечность = ${humanity} (ЭМП = ${empFrom})`;
    }
    
    save() {
        const char = { name: document.getElementById('charName').value, role: document.getElementById('genRole').value };
        const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        stats.forEach(s => char[s] = document.getElementById(`stat${s}`).value);
        saveCharacter(char);
        document.getElementById('charSaveStatus').innerText = 'Сохранено!';
    }
    
    load() {
        const char = loadCharacter();
        if (char) {
            document.getElementById('charName').value = char.name || '';
            document.getElementById('genRole').value = char.role || 'Соло';
            const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
            stats.forEach(s => { if (char[s]) document.getElementById(`stat${s}`).value = char[s]; });
            this.calcDerived();
            document.getElementById('charSaveStatus').innerText = 'Загружено!';
        } else {
            document.getElementById('charSaveStatus').innerText = 'Нет сохранений';
        }
    }

    // ========== ГЕНЕРАЦИЯ ПЕРСОНАЖА "УЛИЧНАЯ КРЫСА" ==========
    generateStreetRatCharacter() {
        const role = document.getElementById('genRole').value;
        const name = document.getElementById('charName').value.trim() || 'Безымянный';
        const stats = this.generateStatsForRole(role);
        const skills = this.generateSkillsForRole(role);
        const gear = this.generateStartingGear(role);
        const hp = getHP(stats.BODY, stats.WILL);
        const severe = Math.ceil(hp / 2);
        const humanity = stats.EMP * 10;
        const empFrom = Math.floor(humanity / 10);
        const deathSave = stats.BODY;
        this.buildCharacterCard(name, role, stats, skills, gear, hp, severe, humanity, empFrom, deathSave);
        const charData = { name, role, ...stats };
        saveCharacter(charData);
        document.getElementById('charSaveStatus').innerText = 'Персонаж сгенерирован!';
    }
    
    // Генерация ХАР по таблицам из книги (стр. 74-78)
    generateStatsForRole(role) {
        const roll = Math.floor(Math.random() * 10) + 1; // 1d10
        const templates = {
            "Рокербой": [
                [7,6,5,6,8,7,7,3,8,2], [7,7,7,7,6,7,7,5,8,3], [8,5,7,7,6,7,7,5,8,4], [5,7,7,6,8,7,7,5,8,3],
                [7,7,6,8,7,6,5,5,8,3], [8,7,5,7,7,6,5,6,8,4], [7,5,7,7,8,6,7,6,8,3], [6,5,7,7,7,8,7,6,8,4],
                [8,9,3,5,5,6,7,8,7,5], [4,5,6,5,8,8,7,6,4,7]
            ],
            "Соло": [
                [6,7,7,3,8,6,5,5,6,5], [7,8,6,3,6,6,7,5,6,6], [8,7,4,7,7,6,7,8,5,4], [6,4,6,4,7,6,5,7,6,5],
                [7,6,5,7,6,7,6,5,6,7], [6,7,7,6,8,4,6,7,6,7], [7,7,6,5,7,6,6,7,7,6], [7,7,8,7,8,7,5,6,6,5],
                [4,9,7,7,6,4,6,6,6,5], [6,6,8,5,6,6,5,6,6,5]
            ],
            "Нетраннер": [
                [5,8,7,7,4,8,7,7,4,2], [5,6,7,5,8,3,8,7,5,5], [6,8,6,6,4,7,6,7,4,4], [7,7,7,5,8,5,5,5,5,5],
                [5,5,7,8,7,3,7,5,6,6], [6,6,7,7,5,5,5,6,6,6], [7,6,7,7,6,5,7,7,6,6], [5,7,7,7,6,5,7,6,5,5],
                [7,7,6,7,6,3,6,5,6,5], [7,8,6,6,4,7,7,5,6,6]
            ],
            "Техник": [
                [6,7,7,8,4,4,5,7,6,2], [7,6,7,7,5,5,3,7,5,3], [6,5,7,5,7,4,7,7,4,7], [7,4,7,7,5,5,6,7,4,6],
                [6,6,7,7,7,4,5,6,7,5], [5,6,4,7,6,7,5,5,5,5], [6,7,5,7,7,7,4,6,7,5], [7,5,5,7,7,5,6,7,6,5],
                [6,6,7,7,5,4,6,5,4,6], [7,5,6,7,5,5,7,6,5,5]
            ],
            "Медтех": [
                [7,5,6,7,5,3,8,5,5,2], [7,7,7,4,6,7,7,3,6,5], [5,5,8,5,3,8,5,7,8,4], [8,6,8,6,5,6,7,5,7,4],
                [7,6,7,5,8,5,6,6,5,6], [7,5,7,5,8,5,6,7,5,6], [7,6,5,6,7,6,5,6,5,6], [6,7,6,5,6,6,5,6,5,6],
                [7,6,6,5,6,6,5,5,5,6], [5,6,6,5,6,6,5,5,5,6]
            ],
            "Медиа": [
                [6,6,5,5,8,7,5,7,5,2], [8,7,7,3,6,6,5,6,5,6], [6,7,5,5,6,8,5,5,7,4], [7,5,6,5,7,6,5,6,5,5],
                [6,6,7,5,6,7,6,6,5,6], [7,5,6,5,7,6,6,6,5,6], [8,5,5,6,7,6,7,6,5,6], [7,5,6,6,7,6,6,6,5,6],
                [7,6,6,6,7,6,5,6,5,6], [5,6,6,6,7,6,5,6,5,6]
            ],
            "Законник": [
                [5,6,7,5,7,8,5,6,5,6], [6,6,6,5,6,8,5,7,5,5], [7,7,7,5,6,7,5,6,5,5], [6,6,6,5,8,5,7,6,5,6],
                [6,6,6,5,7,6,7,6,5,6], [6,6,6,5,8,7,6,6,5,5], [8,7,5,6,7,6,5,6,5,6], [5,6,5,6,7,6,6,6,5,6],
                [5,6,6,6,7,6,6,5,5,6], [6,6,6,5,7,6,5,6,5,5]
            ],
            "Менеджер": [
                [8,5,5,3,8,6,6,5,5,2], [8,6,6,4,7,7,5,7,5,3], [7,6,3,8,6,4,5,8,5,4], [8,5,6,4,7,5,6,5,5,4],
                [7,5,6,5,7,7,5,7,5,3], [6,5,7,6,7,5,7,6,5,4], [7,6,5,7,7,5,6,6,5,4], [6,7,5,5,6,6,6,5,5,5],
                [7,6,5,6,7,6,7,5,5,5], [5,5,6,6,7,6,5,6,5,5]
            ],
            "Фиксер": [
                [8,5,7,4,6,5,8,5,5,2], [8,5,5,6,7,8,7,5,5,3], [7,6,6,5,4,6,6,5,5,4], [6,8,5,6,5,7,6,6,5,5],
                [7,6,6,6,6,7,6,5,5,5], [5,6,6,6,6,6,6,5,5,5], [7,6,6,6,7,5,6,5,5,5], [6,6,5,5,7,6,6,5,5,5],
                [7,6,5,6,7,6,6,5,5,5], [5,6,5,6,6,5,6,5,5,5]
            ],
            "Кочевник": [
                [6,6,8,3,6,7,6,6,4,2], [5,7,6,8,8,8,7,5,4,3], [8,6,3,8,6,5,6,5,4,4], [8,7,4,8,7,6,7,5,5,4],
                [5,8,6,6,7,5,6,6,5,4], [6,7,8,6,7,5,7,6,5,4], [8,7,6,5,7,5,7,6,5,4], [5,5,7,6,6,6,6,5,5,4],
                [7,6,5,6,7,5,6,5,5,5], [5,6,7,4,7,8,7,7,4,4]
            ]
        };
        const template = templates[role];
        if (!template) return {};
        const statsRow = template[roll-1];
        return {
            INT: statsRow[0], REF: statsRow[1], DEX: statsRow[2], TECH: statsRow[3],
            COOL: statsRow[4], WILL: statsRow[5], LUCK: statsRow[6], MOVE: statsRow[7],
            BODY: statsRow[8], EMP: statsRow[9]
        };
    }
    
    generateSkillsForRole(role) {
        const templates = {
            "Рокербой": { "Атлетика":2, "Драка":6, "Концентрация":2, "Общение":2, "Образование":2, "Уклонение":6, "Первая помощь":6, "Проницательность":6, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":4, "Восприятие":2, "Убеждение":6, "Скрытность":2, "Композиция":6, "Короткоствольное оружие":6, "Холодное оружие":6, "Уход за собой":4, "Опыт на улицах":6, "Гардероб и стиль":4 },
            "Соло": { "Атлетика":2, "Драка":2, "Концентрация":2, "Общение":2, "Образование":2, "Уклонение":6, "Первая помощь":6, "Проницательность":2, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":2, "Восприятие":6, "Убеждение":2, "Скрытность":2, "Автоогонь":6, "Короткоствольное оружие":6, "Допрос":6, "Холодное оружие":6, "Сопротивление пыткам/наркотикам":6, "Длинноствольное оружие":6, "Тактика":6 },
            "Нетраннер": { "Атлетика":2, "Драка":2, "Концентрация":2, "Общение":2, "Образование":6, "Уклонение":6, "Первая помощь":2, "Проницательность":2, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":2, "Восприятие":2, "Убеждение":2, "Скрытность":6, "Основы техники":6, "Скрытие/обнаружение объекта":6, "Криптография":6, "Кибертехника":6, "Электроника/безопасность":6, "Поиск информации":6, "Наука (выбери 1)":6 },
            "Техник": { "Атлетика":2, "Драка":2, "Концентрация":2, "Общение":2, "Образование":6, "Уклонение":6, "Первая помощь":6, "Проницательность":2, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":2, "Восприятие":2, "Убеждение":2, "Скрытность":2, "Основы техники":6, "Кибертехника":6, "Электроника/безопасность":6, "Автомеханика":6, "Длинноствольное оружие":6, "Оружейная техника":6, "Наука (выбери 1)":6 },
            "Медтех": { "Атлетика":2, "Драка":2, "Концентрация":2, "Общение":6, "Образование":6, "Уклонение":6, "Первая помощь":2, "Проницательность":6, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":2, "Восприятие":2, "Убеждение":2, "Скрытность":2, "Основы техники":6, "Кибертехника":4, "Парамедицина":6, "Дедукция":6, "Сопротивление пыткам/наркотикам":4, "Наука (выбери 1)":6, "Длинноствольное оружие":6 },
            "Медиа": { "Атлетика":2, "Драка":2, "Концентрация":2, "Общение":6, "Образование":2, "Уклонение":6, "Первая помощь":2, "Проницательность":6, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":6, "Восприятие":6, "Убеждение":6, "Скрытность":2, "Взяточничество":6, "Композиция":6, "Дедукция":6, "Короткоствольное оружие":6, "Поиск информации":4, "Выслеживание":6, "Торговля":6 },
            "Законник": { "Атлетика":2, "Драка":6, "Концентрация":2, "Общение":6, "Образование":2, "Уклонение":6, "Первая помощь":2, "Проницательность":2, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":2, "Восприятие":2, "Убеждение":2, "Скрытность":2, "Автоогонь":6, "Криминология":6, "Дедукция":6, "Короткоствольное оружие":6, "Допрос":6, "Длинноствольное оружие":6, "Чтение по губам":4 },
            "Менеджер": { "Атлетика":2, "Драка":2, "Концентрация":2, "Общение":6, "Образование":6, "Уклонение":6, "Первая помощь":2, "Проницательность":6, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":2, "Восприятие":2, "Убеждение":6, "Скрытность":2, "Бухгалтерия":6, "Бюрократия":6, "Бизнес":6, "Дедукция":6, "Допрос":6, "Длинноствольное оружие":6, "Уход за собой":4 },
            "Фиксер": { "Атлетика":2, "Драка":2, "Концентрация":2, "Общение":6, "Образование":2, "Уклонение":6, "Первая помощь":2, "Проницательность":6, "Язык (Уличный сленг)":4, "Знание района (Твой дом)":6, "Восприятие":2, "Убеждение":4, "Скрытность":2, "Взяточничество":6, "Бизнес":6, "Фальсификация":6, "Дедукция":6, "Короткоствольное оружие":6, "Чтение по губам":6, "Торговля":6 },
            "Кочевник": { "Атлетика":2, "Драка":6, "Концентрация":2, "Общение":2, "Образование":2, "Уклонение":6, "Первая помощь":6, "Проницательность":2, "Язык (Уличный сленг)":2, "Знание района (Твой дом)":2, "Восприятие":4, "Убеждение":2, "Скрытность":6, "Обращение с животными":6, "Вождение":6, "Короткоствольное оружие":6, "Взлом замков":4, "Опыт на улицах":6, "Выживание в дикой местности":6, "Торговля":6 }
        };
        return templates[role] || {};
    }
    
    generateStartingGear(role) {
        const weapons = {
            "Рокербой": ["Очень тяжёлый пистолет", "Тяжёлое холодное оружие"],
            "Соло": ["Штурмовая винтовка", "Очень тяжёлый пистолет", "Тяжёлое холодное оружие"],
            "Нетраннер": ["Очень тяжёлый пистолет"],
            "Техник": ["Дробовик"],
            "Медтех": ["Дробовик"],
            "Медиа": ["Тяжёлый пистолет"],
            "Законник": ["Тяжёлый пистолет"],
            "Менеджер": ["Очень тяжёлый пистолет"],
            "Фиксер": ["Тяжёлый пистолет", "Лёгкое холодное оружие"],
            "Кочевник": ["Тяжёлый пистолет", "Тяжёлое холодное оружие"]
        };
        const armor = { body: "Лёгкий арморджек", head: "Лёгкий арморджек" };
        const cyberware = {
            "Рокербой": ["Диктофон", "Химкожа", "Техноволосы", "Биомонитор"],
            "Соло": ["Нейролинк", "Интерфейсный разъём", "Киберглаз", "Микрооптика"],
            "Нетраннер": ["Нейролинк", "Интерфейсный разъём", "Киберглаз", "Назальные фильтры"],
            "Техник": ["Рука-мультитул", "Кибераудио", "Внутренний агент"],
            "Медтех": ["Киберглаз", "Назальные фильтры"],
            "Медиа": ["Усиленный слух", "Набор кибераудио", "Светотату"],
            "Законник": ["Набор кибераудио", "Внутренний агент", "Связыватель токсинов"],
            "Менеджер": ["Набор кибераудио", "Внутренний агент", "Подкожный карман"],
            "Фиксер": ["Набор кибераудио", "Анализатор голосового напряжения", "Подкожный карман"],
            "Кочевник": ["Интерфейсный разъём", "Нейролинк", "Когти"]
        };
        return {
            weapons: weapons[role] || [],
            armor: armor,
            cyberware: cyberware[role] || [],
            gear: ["Агент", "Сумка медтеха", "Фонарь", "Набор личной гигиены"]
        };
    }
    
    // Построение карточки персонажа с возможностью редактирования
    buildCharacterCard(name, role, stats, skills, gear, hp, severe, humanity, empFrom, deathSave) {
        const container = document.getElementById('characterCardContainer');
        const cardHtml = this.buildCharacterCardHTML(name, role, stats, skills, gear, hp, severe, humanity, empFrom, deathSave);
        container.innerHTML = cardHtml;
        this.attachCardEventHandlers();
        const editBtn = container.querySelector('.edit-card-btn');
        const syncBtn = container.querySelector('.sync-card-btn');
        if (editBtn) editBtn.addEventListener('click', () => this.enableEditMode(container.querySelector('.character-card')));
        if (syncBtn) syncBtn.addEventListener('click', () => this.syncFromTabs());
    }
    
    buildCharacterCardHTML(name, role, stats, skills, gear, hp, severe, humanity, empFrom, deathSave) {
        const statsHtml = Object.entries(stats).map(([k,v]) => `<div class="stat-item" data-stat="${k}"><span class="stat-name">${k}</span><span class="stat-value">${v}</span></div>`).join('');
        const skillsHtml = Object.entries(skills).map(([k,v]) => `<div class="skill-item" data-skill="${k}"><span class="skill-name">${this.escapeHtml(k)}</span><span class="skill-level">${v}</span></div>`).join('');
        const weaponsHtml = gear.weapons.map((w, idx) => `<li data-weapon-idx="${idx}">🔫 ${this.escapeHtml(w)}</li>`).join('');
        const cyberHtml = gear.cyberware.map((c, idx) => `<li data-cyber-idx="${idx}">🦾 ${this.escapeHtml(c)}</li>`).join('');
        const gearHtmlItems = gear.gear.map((g, idx) => `<li data-gear-idx="${idx}">📦 ${this.escapeHtml(g)}</li>`).join('');
        const armorHtml = `<li data-armor-body>🛡️ Тело: ${this.escapeHtml(gear.armor.body)}</li><li data-armor-head>⛑️ Голова: ${this.escapeHtml(gear.armor.head)}</li>`;
        return `
            <div class="character-card" data-name="${name}" data-role="${role}">
                <div class="character-card-header">
                    <div class="character-name" data-field="name">${this.escapeHtml(name)}</div>
                    <div class="character-role" data-field="role">${role}</div>
                    <div class="card-actions">
                        <button class="edit-card-btn" title="Редактировать">✏️</button>
                        <button class="sync-card-btn" title="Синхронизировать с вкладками">🔄</button>
                        <button class="close-card-btn" id="closeCardBtn">✖</button>
                    </div>
                </div>
                <div class="character-card-body">
                    <div class="char-section" data-section="stats">
                        <h4>📊 Характеристики</h4>
                        <div class="stats-grid" data-stats-container>${statsHtml}</div>
                    </div>
                    <div class="char-section" data-section="derived">
                        <h4>❤️ Состояние</h4>
                        <div class="derived-stats">
                            <div data-derived="hp">ПЗ: <span class="current-hp">${hp}</span> / ${hp} <span class="hp-threshold">(тяж. ≤ ${severe})</span></div>
                            <div data-derived="deathSave">Спасбросок: ${deathSave}</div>
                            <div data-derived="humanity">Человечность: ${humanity} (ЭМП = ${empFrom})</div>
                        </div>
                        <div class="combat-buttons">
                            <button class="heal-btn">💊 Лечение (+${stats.BODY} ПЗ)</button>
                            <button class="damage-btn">💥 Урон</button>
                        </div>
                    </div>
                    <div class="char-section" data-section="skills">
                        <h4>🎯 Навыки</h4>
                        <div class="skills-grid" data-skills-container>${skillsHtml}</div>
                    </div>
                    <div class="equipment-grid" data-equipment>
                        <div class="equipment-card" data-type="armor">
                            <h5>🛡️ Броня</h5>
                            <ul class="compact" data-armor-list>${armorHtml || '<li>— нет —</li>'}</ul>
                        </div>
                        <div class="equipment-card" data-type="weapons">
                            <h5>🔫 Оружие</h5>
                            <ul class="compact" data-weapons-list>${weaponsHtml || '<li>— нет —</li>'}</ul>
                        </div>
                        <div class="equipment-card" data-type="cyberware">
                            <h5>🦾 Киберимпланты</h5>
                            <ul class="compact" data-cyber-list>${cyberHtml || '<li>— нет —</li>'}</ul>
                        </div>
                        <div class="equipment-card" data-type="gear">
                            <h5>🎒 Снаряжение</h5>
                            <ul class="compact" data-gear-list>${gearHtmlItems || '<li>— нет —</li>'}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    enableEditMode(card) {
        const nameSpan = card.querySelector('[data-field="name"]');
        const roleSpan = card.querySelector('[data-field="role"]');
        const currentName = nameSpan.innerText;
        const currentRole = roleSpan.innerText;
        nameSpan.innerHTML = `<input type="text" class="edit-input" value="${this.escapeHtml(currentName)}">`;
        roleSpan.innerHTML = `<select class="edit-select">${this.getRoleOptions(currentRole)}</select>`;
        card.querySelectorAll('.stat-item').forEach(item => {
            const statName = item.querySelector('.stat-name').innerText;
            const statValue = item.querySelector('.stat-value').innerText;
            item.querySelector('.stat-value').outerHTML = `<input type="number" class="edit-stat" data-stat="${statName}" value="${statValue}" min="2" max="8">`;
        });
        card.querySelectorAll('.skill-item').forEach(item => {
            const skillName = item.querySelector('.skill-name').innerText;
            const skillLevel = item.querySelector('.skill-level').innerText;
            item.innerHTML = `<span class="skill-name">${skillName}</span><input type="number" class="edit-skill" data-skill="${skillName}" value="${skillLevel}" min="0" max="10">`;
        });
        this.makeEquipmentEditable(card);
        const editBtn = card.querySelector('.edit-card-btn');
        editBtn.textContent = '💾 Сохранить';
        editBtn.classList.add('save-card-btn');
        editBtn.classList.remove('edit-card-btn');
        const oldHandler = editBtn._clickHandler;
        if (oldHandler) editBtn.removeEventListener('click', oldHandler);
        const saveHandler = () => this.disableEditMode(card);
        editBtn.addEventListener('click', saveHandler);
        editBtn._clickHandler = saveHandler;
    }
    
    getRoleOptions(selectedRole) {
        const roles = ["Рокербой","Соло","Нетраннер","Техник","Медтех","Медиа","Законник","Менеджер","Фиксер","Кочевник"];
        return roles.map(r => `<option value="${r}" ${r === selectedRole ? 'selected' : ''}>${r}</option>`).join('');
    }
    
    makeEquipmentEditable(card) {
        const sections = ['weapons', 'cyber', 'gear', 'armor'];
        sections.forEach(section => {
            let listContainer;
            if (section === 'weapons') listContainer = card.querySelector('[data-weapons-list]');
            else if (section === 'cyber') listContainer = card.querySelector('[data-cyber-list]');
            else if (section === 'gear') listContainer = card.querySelector('[data-gear-list]');
            else if (section === 'armor') listContainer = card.querySelector('[data-armor-list]');
            if (!listContainer) return;
            const addBtn = document.createElement('button');
            addBtn.textContent = '+ Добавить';
            addBtn.className = 'add-item-btn';
            addBtn.addEventListener('click', () => {
                const newItem = prompt(`Введите название нового предмета (${section}):`);
                if (newItem) {
                    const newLi = document.createElement('li');
                    if (section === 'weapons') newLi.innerHTML = `🔫 ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    else if (section === 'cyber') newLi.innerHTML = `🦾 ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    else if (section === 'gear') newLi.innerHTML = `📦 ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    else if (section === 'armor') {
                        if (newItem.startsWith('Тело:')) newLi.innerHTML = `🛡️ ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                        else newLi.innerHTML = `⛑️ ${this.escapeHtml(newItem)} <button class="remove-item">✖</button>`;
                    }
                    listContainer.appendChild(newLi);
                    this.attachRemoveListener(newLi);
                }
            });
            listContainer.parentElement.appendChild(addBtn);
            listContainer.querySelectorAll('li').forEach(li => {
                if (!li.querySelector('.remove-item')) {
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '✖';
                    removeBtn.className = 'remove-item';
                    li.appendChild(removeBtn);
                    this.attachRemoveListener(li);
                }
            });
        });
    }
    
    attachRemoveListener(li) {
        const removeBtn = li.querySelector('.remove-item');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => li.remove());
        }
    }
    
    disableEditMode(card) {
        const newName = card.querySelector('[data-field="name"] input').value;
        const newRole = card.querySelector('[data-field="role"] select').value;
        const newStats = {};
        card.querySelectorAll('.edit-stat').forEach(input => {
            const statName = input.dataset.stat;
            newStats[statName] = parseInt(input.value) || 6;
        });
        const newSkills = {};
        card.querySelectorAll('.edit-skill').forEach(input => {
            const skillName = input.dataset.skill;
            newSkills[skillName] = parseInt(input.value) || 0;
        });
        const newGear = {
            weapons: [],
            cyberware: [],
            gear: [],
            armor: { body: '', head: '' }
        };
        card.querySelectorAll('[data-weapons-list] li').forEach(li => {
            let text = li.innerText.replace('✖', '').trim();
            if (text.startsWith('🔫')) text = text.substring(1).trim();
            if (text) newGear.weapons.push(text);
        });
        card.querySelectorAll('[data-cyber-list] li').forEach(li => {
            let text = li.innerText.replace('✖', '').trim();
            if (text.startsWith('🦾')) text = text.substring(1).trim();
            if (text) newGear.cyberware.push(text);
        });
        card.querySelectorAll('[data-gear-list] li').forEach(li => {
            let text = li.innerText.replace('✖', '').trim();
            if (text.startsWith('📦')) text = text.substring(1).trim();
            if (text) newGear.gear.push(text);
        });
        card.querySelectorAll('[data-armor-list] li').forEach(li => {
            let text = li.innerText.replace('✖', '').trim();
            if (text.includes('Тело:')) newGear.armor.body = text.replace('🛡️', '').trim();
            else if (text.includes('Голова:')) newGear.armor.head = text.replace('⛑️', '').trim();
        });
        const body = newStats.BODY || 6;
        const will = newStats.WILL || 6;
        const emp = newStats.EMP || 6;
        const hp = getHP(body, will);
        const severe = Math.ceil(hp / 2);
        const humanity = emp * 10;
        const empFrom = Math.floor(humanity / 10);
        const deathSave = body;
        const charData = { name: newName, role: newRole, ...newStats };
        saveCharacter(charData);
        this.buildCharacterCard(newName, newRole, newStats, newSkills, newGear, hp, severe, humanity, empFrom, deathSave);
    }
    
    syncFromTabs() {
        const name = document.getElementById('charName').value || 'Безымянный';
        const role = document.getElementById('genRole').value;
        const stats = {
            INT: parseInt(document.getElementById('statINT').value) || 6,
            REF: parseInt(document.getElementById('statREF').value) || 6,
            DEX: parseInt(document.getElementById('statDEX').value) || 6,
            TECH: parseInt(document.getElementById('statTECH').value) || 6,
            COOL: parseInt(document.getElementById('statCOOL').value) || 6,
            WILL: parseInt(document.getElementById('statWILL').value) || 6,
            LUCK: parseInt(document.getElementById('statLUCK').value) || 6,
            MOVE: parseInt(document.getElementById('statMOVE').value) || 6,
            BODY: parseInt(document.getElementById('statBODY').value) || 6,
            EMP: parseInt(document.getElementById('statEMP').value) || 6
        };
        let skills = {};
        if (window.idealBuilder && typeof window.idealBuilder.getCurrentSkills === 'function') {
            skills = window.idealBuilder.getCurrentSkills();
        } else {
            skills = { "Атлетика":2, "Восприятие":2, "Драка":2, "Уклонение":2 };
        }
        let gear = { weapons: [], cyberware: [], gear: [], armor: { body: "Лёгкий арморджек", head: "Лёгкий арморджек" } };
        if (window.idealShop && window.idealShop.cart) {
            window.idealShop.cart.forEach(item => {
                if (item.category === 'ranged' || item.category === 'melee') gear.weapons.push(item.item);
                else if (item.category === 'cyber') gear.cyberware.push(item.item);
                else if (item.category === 'gear' || item.category === 'style') gear.gear.push(item.item);
                else if (item.category === 'armor') {
                    if (!gear.armor.body) gear.armor.body = item.item;
                    else if (!gear.armor.head) gear.armor.head = item.item;
                }
            });
        }
        const hp = getHP(stats.BODY, stats.WILL);
        const severe = Math.ceil(hp / 2);
        const humanity = stats.EMP * 10;
        const empFrom = Math.floor(humanity / 10);
        const deathSave = stats.BODY;
        this.buildCharacterCard(name, role, stats, skills, gear, hp, severe, humanity, empFrom, deathSave);
    }
    
    attachCardEventHandlers() {
        const healBtn = document.querySelector('.heal-btn');
        const damageBtn = document.querySelector('.damage-btn');
        const closeBtn = document.getElementById('closeCardBtn');
        if (healBtn) {
            healBtn.addEventListener('click', () => {
                const hpSpan = document.querySelector('.current-hp');
                let current = parseInt(hpSpan.innerText);
                const maxHp = parseInt(hpSpan.innerText.split('/')[1].trim());
                const body = parseInt(document.querySelector('.stats-grid .stat-item[data-stat="BODY"] .stat-value')?.innerText) || 6;
                const newHp = Math.min(current + body, maxHp);
                hpSpan.innerText = `${newHp}`;
            });
        }
        if (damageBtn) {
            damageBtn.addEventListener('click', () => {
                let dmg = prompt('Введите урон:');
                if (dmg !== null) {
                    const hpSpan = document.querySelector('.current-hp');
                    let current = parseInt(hpSpan.innerText);
                    let maxHp = parseInt(hpSpan.innerText.split('/')[1].trim());
                    let newHp = current - parseInt(dmg);
                    if (newHp < 0) newHp = 0;
                    hpSpan.innerText = `${newHp}`;
                    const severe = Math.ceil(maxHp / 2);
                    if (newHp <= severe && newHp > 0) alert(`⚠️ Тяжёлое ранение! Штраф -2 ко всем действиям.`);
                    if (newHp <= 0) alert(`💀 Смертельное ранение! Требуется спасбросок.`);
                }
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('characterCardContainer').innerHTML = '';
            });
        }
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
}

// ========== ОСТАЛЬНЫЕ КЛАССЫ (без изменений) ==========
export class HumanityCalculator {
    constructor() {
        this.curr = 60;
        this.pending = 0;
        this.updateUI();
        document.getElementById('currentHumanity')?.addEventListener('input', (e) => {
            this.curr = parseInt(e.target.value) || 0;
            this.updateUI();
        });
        document.getElementById('rollHumanityBtn')?.addEventListener('click', () => this.roll());
        document.getElementById('applyHumanityBtn')?.addEventListener('click', () => this.apply());
        document.getElementById('implantSelect')?.addEventListener('change', () => {
            this.pending = 0;
            this.updateUI();
        });
    }
    updateUI() {
        document.getElementById('humanityResult').innerHTML = `Текущая ЧЕЛ: ${this.curr} → ЭМП = ${Math.floor(this.curr / 10)}<br>Ожидает потери: ${this.pending || 'нет'}`;
    }
    roll() {
        const val = parseInt(document.getElementById('implantSelect').value);
        if (val === 14) {
            let r = 0; for (let i=0;i<4;i++) r += Math.floor(Math.random()*4)+1;
            this.pending = r;
            document.getElementById('humanityResult').innerHTML = `Бросок 4d6 = ${r}. Потеря ${r}. Нажмите "Применить".`;
        } else if (val === 7 || val === 3) {
            const r = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
            this.pending = r;
            document.getElementById('humanityResult').innerHTML = `Бросок 2d6 = ${r}. Потеря ${r}.`;
        } else {
            this.pending = 0;
            document.getElementById('humanityResult').innerHTML = 'ПЧ = 0, потери нет.';
        }
    }
    apply() {
        if (this.pending) {
            this.curr -= this.pending;
            if (this.curr < 0) this.curr = 0;
            document.getElementById('currentHumanity').value = this.curr;
            this.updateUI();
            this.pending = 0;
        } else {
            document.getElementById('humanityResult').innerHTML = 'Сначала бросьте ПЧ.';
        }
    }
}

export class ExpensesCalc {
    static calc() {
        const lifestyle = parseInt(document.getElementById('lifestyleSelect').value);
        const housing = parseInt(document.getElementById('housingSelect').value);
        const total = lifestyle + housing;
        document.getElementById('expensesResult').innerHTML = `Месячные расходы: <strong>${total} eb</strong><br>(еда: ${lifestyle} eb, жильё: ${housing} eb)`;
    }
}

// Полный список навыков для идеал-конструктора
const allSkills = [
    { name:"Восприятие", stat:"ИНТ", costMult:1, base:true },
    { name:"Скрытность", stat:"ЛВК", costMult:1, base:true },
    { name:"Выслеживание", stat:"ИНТ", costMult:1, base:false },
    { name:"Сопротивление пыткам/наркотикам", stat:"ВОЛЯ", costMult:1, base:false },
    { name:"Концентрация", stat:"ВОЛЯ", costMult:1, base:true },
    { name:"Танец", stat:"ЛВК", costMult:1, base:false },
    { name:"Чтение по губам", stat:"ИНТ", costMult:1, base:false },
    { name:"Скрытие/обнаружение объекта", stat:"ИНТ", costMult:1, base:false },
    { name:"Акробатика", stat:"ЛВК", costMult:1, base:false },
    { name:"Атлетика", stat:"ЛВК", costMult:1, base:true },
    { name:"Выносливость", stat:"ВОЛЯ", costMult:1, base:false },
    { name:"Верховая езда", stat:"РЕФ", costMult:1, base:false },
    { name:"Вождение", stat:"РЕФ", costMult:1, base:false },
    { name:"Пилотирование", stat:"РЕФ", costMult:2, base:false },
    { name:"Судовождение", stat:"РЕФ", costMult:1, base:false },
    { name:"Азартные игры", stat:"ИНТ", costMult:1, base:false },
    { name:"Бизнес", stat:"ИНТ", costMult:1, base:false },
    { name:"Бухгалтерия", stat:"ИНТ", costMult:1, base:false },
    { name:"Бюрократия", stat:"ИНТ", costMult:1, base:false },
    { name:"Выживание в дикой местности", stat:"ИНТ", costMult:1, base:false },
    { name:"Дедукция", stat:"ИНТ", costMult:1, base:false },
    { name:"Знание района", stat:"ИНТ", costMult:1, base:true },
    { name:"Композиция", stat:"ИНТ", costMult:1, base:false },
    { name:"Криминология", stat:"ИНТ", costMult:1, base:false },
    { name:"Криптография", stat:"ИНТ", costMult:1, base:false },
    { name:"Наука", stat:"ИНТ", costMult:1, base:false },
    { name:"Образование", stat:"ИНТ", costMult:1, base:true },
    { name:"Обращение с животными", stat:"ИНТ", costMult:1, base:false },
    { name:"Поиск информации", stat:"ИНТ", costMult:1, base:false },
    { name:"Тактика", stat:"ИНТ", costMult:1, base:false },
    { name:"Язык (родной)", stat:"ИНТ", costMult:1, base:true },
    { name:"Боевые искусства", stat:"ЛВК", costMult:2, base:false },
    { name:"Драка", stat:"ЛВК", costMult:1, base:true },
    { name:"Уклонение", stat:"ЛВК", costMult:1, base:true },
    { name:"Холодное оружие", stat:"ЛВК", costMult:1, base:false },
    { name:"Актёрское мастерство", stat:"КРУТ", costMult:1, base:false },
    { name:"Игра на инструменте", stat:"ТЕХ", costMult:1, base:false },
    { name:"Автоогонь", stat:"РЕФ", costMult:2, base:false },
    { name:"Длинноствольное оружие", stat:"РЕФ", costMult:1, base:false },
    { name:"Короткоствольное оружие", stat:"РЕФ", costMult:1, base:false },
    { name:"Луки и арбалеты", stat:"РЕФ", costMult:1, base:false },
    { name:"Тяжёлое оружие", stat:"РЕФ", costMult:2, base:false },
    { name:"Взяточничество", stat:"КРУТ", costMult:1, base:false },
    { name:"Гардероб и стиль", stat:"КРУТ", costMult:1, base:false },
    { name:"Допрос", stat:"КРУТ", costMult:1, base:false },
    { name:"Общение", stat:"ЭМП", costMult:1, base:true },
    { name:"Опыт на улицах", stat:"КРУТ", costMult:1, base:false },
    { name:"Проницательность", stat:"ЭМП", costMult:1, base:true },
    { name:"Торговля", stat:"КРУТ", costMult:1, base:false },
    { name:"Убеждение", stat:"КРУТ", costMult:1, base:true },
    { name:"Уход за собой", stat:"КРУТ", costMult:1, base:false },
    { name:"Авиатехника", stat:"ТЕХ", costMult:1, base:false },
    { name:"Автомеханика", stat:"ТЕХ", costMult:1, base:false },
    { name:"Взлом замков", stat:"ТЕХ", costMult:1, base:false },
    { name:"Взрывотехника", stat:"ТЕХ", costMult:2, base:false },
    { name:"Живопись/рисование/скульптура", stat:"ТЕХ", costMult:1, base:false },
    { name:"Карманная кража", stat:"ТЕХ", costMult:1, base:false },
    { name:"Кибертехника", stat:"ТЕХ", costMult:1, base:false },
    { name:"Оружейная техника", stat:"ТЕХ", costMult:1, base:false },
    { name:"Основы техники", stat:"ТЕХ", costMult:1, base:false },
    { name:"Парамедицина", stat:"ТЕХ", costMult:2, base:false },
    { name:"Первая помощь", stat:"ТЕХ", costMult:1, base:true },
    { name:"Судоремонт", stat:"ТЕХ", costMult:1, base:false },
    { name:"Фальсификация", stat:"ТЕХ", costMult:1, base:false },
    { name:"Фотография/видео", stat:"ТЕХ", costMult:1, base:false },
    { name:"Электроника/безопасность", stat:"ТЕХ", costMult:2, base:false }
];

const roleTemplates = {
    "Рокербой": { "Композиция":6, "Игра на инструменте":6, "Убеждение":6, "Общение":6, "Гардероб и стиль":4, "Опыт на улицах":6 },
    "Соло": { "Автоогонь":6, "Короткоствольное оружие":6, "Холодное оружие":6, "Длинноствольное оружие":6, "Уклонение":6, "Тактика":6, "Сопротивление пыткам/наркотикам":6 },
    "Нетраннер": { "Основы техники":6, "Кибертехника":4, "Электроника/безопасность":6, "Криптография":6, "Поиск информации":6, "Скрытность":6 },
    "Техник": { "Основы техники":6, "Кибертехника":6, "Электроника/безопасность":6, "Оружейная техника":6, "Автомеханика":6, "Взлом замков":4 },
    "Медтех": { "Первая помощь":6, "Парамедицина":6, "Кибертехника":4, "Основы техники":4, "Наука":6, "Сопротивление пыткам/наркотикам":4 },
    "Медиа": { "Композиция":6, "Поиск информации":6, "Общение":6, "Допрос":6, "Фотография/видео":4, "Опыт на улицах":6 },
    "Законник": { "Криминология":6, "Допрос":6, "Короткоствольное оружие":6, "Убеждение":6, "Выслеживание":6, "Тактика":6 },
    "Менеджер": { "Бизнес":6, "Бухгалтерия":6, "Бюрократия":6, "Убеждение":6, "Взяточничество":6, "Тактика":4 },
    "Фиксер": { "Торговля":6, "Опыт на улицах":6, "Взяточничество":6, "Убеждение":6, "Фальсификация":6 },
    "Кочевник": { "Вождение":6, "Автомеханика":6, "Выживание в дикой местности":6, "Длинноствольное оружие":6, "Скрытность":6 }
};

export class IdealCharacterBuilder {
    constructor() {
        this.stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        this.init();
        this.getCurrentSkills = this.getCurrentSkills.bind(this);
    }
    init() {
        this.buildStatsGrid();
        this.buildSkillsGrid();
        this.attachEvents();
    }
    buildStatsGrid() {
        const container = document.getElementById('idealStatsGrid');
        if (!container) return;
        const names = ['ИНТ','РЕФ','ЛВК','ТЕХ','КРУТ','ВОЛЯ','УДЧ','СКО','ТЕЛО','ЭМП'];
        let html = '';
        for (let i = 0; i < this.stats.length; i++) {
            html += `<label>${names[i]}<br><input type="number" id="idealStat${this.stats[i]}" min="2" max="8" value="6"></label>`;
        }
        container.innerHTML = html;
        this.updateStatsRemaining();
    }
    updateStatsRemaining() {
        let total = 0;
        for (let s of this.stats) total += parseInt(document.getElementById(`idealStat${s}`).value) || 2;
        const remaining = 62 - total;
        document.getElementById('idealStatsPoints').innerHTML = remaining;
        return remaining >= 0;
    }
    buildSkillsGrid() {
    const container = document.getElementById('idealSkillsList');
    if (!container) return;
    
    // Управляющие элементы (роль, рекомендации, поиск)
    const controlHtml = `
        <div class="skills-controls">
            <div class="role-row">
                <label>Роль для рекомендации: 
                    <select id="idealRoleSelect">
                        <option value="Рокербой">Рокербой</option><option value="Соло">Соло</option>
                        <option value="Нетраннер">Нетраннер</option><option value="Техник">Техник</option>
                        <option value="Медтех">Медтех</option><option value="Медиа">Медиа</option>
                        <option value="Законник">Законник</option><option value="Менеджер">Менеджер</option>
                        <option value="Фиксер">Фиксер</option><option value="Кочевник">Кочевник</option>
                    </select>
                </label>
                <button type="button" id="applyRecommendedSkillsBtn">✨ Применить рекомендованные</button>
                <button type="button" id="copySkillsBtn" class="copy-skills-btn">📋 Копировать список навыков</button>
            </div>
            <div class="search-row">
                <input type="text" id="skillsSearchInput" placeholder="🔍 Поиск по названию навыка...">
            </div>
        </div>
    `;
    container.innerHTML = controlHtml;
    
    // Контейнер для всех навыков (сетка)
    const skillsGrid = document.createElement('div');
    skillsGrid.className = 'skills-grid-modern';
    container.appendChild(skillsGrid);
    
    // Группируем навыки по категориям (как было)
    const categories = this.groupSkillsByCategory();
    
    for (const [category, skills] of Object.entries(categories)) {
        const categorySection = document.createElement('div');
        categorySection.className = 'skills-category-modern';
        categorySection.innerHTML = `
            <div class="category-header-modern" data-category="${category}">
                <span class="category-toggle-modern">▶</span> <strong>${category}</strong> <span class="skill-count">(${skills.length})</span>
            </div>
            <div class="category-body-modern" style="display: none;">
                <div class="skills-grid-modern-inner"></div>
            </div>
        `;
        skillsGrid.appendChild(categorySection);
        
        const innerGrid = categorySection.querySelector('.skills-grid-modern-inner');
        skills.forEach(skill => {
            const defaultValue = skill.base ? 2 : 0;
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-card-modern';
            skillCard.setAttribute('data-skill-name', skill.name);
            skillCard.innerHTML = `
                <div class="skill-name-modern">${skill.name}</div>
                <div class="skill-stat-modern">${skill.stat}</div>
                <div class="skill-x2-modern">${skill.costMult === 2 ? '×2' : ''}</div>
                <input type="number" class="skill-level-modern" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="10" value="${defaultValue}" step="1">
            `;
            innerGrid.appendChild(skillCard);
        });
        
        // Привязываем обработчики изменения уровня
        innerGrid.querySelectorAll('.skill-level-modern').forEach(input => {
            input.addEventListener('input', () => this.updateSkillRemaining());
        });
        innerGrid.style.display = 'grid';
innerGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr)';
innerGrid.style.gap = '8px';
    }
    
    // Обработчики для раскрытия категорий
    document.querySelectorAll('.category-header-modern').forEach(header => {
        header.addEventListener('click', () => {
            const body = header.parentElement.querySelector('.category-body-modern');
            const toggle = header.querySelector('.category-toggle-modern');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                toggle.textContent = '▼';
            } else {
                body.style.display = 'none';
                toggle.textContent = '▶';
            }
        });
    });
    
    // Поиск
    document.getElementById('skillsSearchInput')?.addEventListener('input', () => this.filterSkillsModern());
    document.getElementById('applyRecommendedSkillsBtn')?.addEventListener('click', () => {
        const role = document.getElementById('idealRoleSelect').value;
        this.applyRecommendedSkills(role);
    });
    document.getElementById('copySkillsBtn')?.addEventListener('click', () => this.copySkillsToClipboard());
    
    this.updateSkillRemaining();
}
    getCurrentSkills() {
        const skills = {};
        document.querySelectorAll('#idealSkillsList .skill-row').forEach(row => {
            const name = row.querySelector('td:first-child')?.innerText;
            const level = row.querySelector('.skill-level')?.value;
            if (name && level) {
                skills[name] = parseInt(level) || 0;
            }
        });
        return skills;
    }
    groupSkillsByCategory() {
        const categories = {
            "Восприятие": [],
            "Физические": [],
            "Управление": [],
            "Образование": [],
            "Рукопашные": [],
            "Творческие": [],
            "Дальний бой": [],
            "Социальные": [],
            "Технические": []
        };
        const map = {
            "Восприятие": ["Восприятие","Скрытность","Выслеживание","Сопротивление пыткам/наркотикам","Концентрация","Танец","Чтение по губам","Скрытие/обнаружение объекта"],
            "Физические": ["Акробатика","Атлетика","Выносливость"],
            "Управление": ["Верховая езда","Вождение","Пилотирование","Судовождение"],
            "Образование": ["Азартные игры","Бизнес","Бухгалтерия","Бюрократия","Выживание в дикой местности","Дедукция","Знание района","Композиция","Криминология","Криптография","Наука","Образование","Обращение с животными","Поиск информации","Тактика","Язык (родной)"],
            "Рукопашные": ["Боевые искусства","Драка","Уклонение","Холодное оружие"],
            "Творческие": ["Актёрское мастерство","Игра на инструменте"],
            "Дальний бой": ["Автоогонь","Длинноствольное оружие","Короткоствольное оружие","Луки и арбалеты","Тяжёлое оружие"],
            "Социальные": ["Взяточничество","Гардероб и стиль","Допрос","Общение","Опыт на улицах","Проницательность","Торговля","Убеждение","Уход за собой"],
            "Технические": ["Авиатехника","Автомеханика","Взлом замков","Взрывотехника","Живопись/рисование/скульптура","Карманная кража","Кибертехника","Оружейная техника","Основы техники","Парамедицина","Первая помощь","Судоремонт","Фальсификация","Фотография/видео","Электроника/безопасность"]
        };
        for (const skill of allSkills) {
            let placed = false;
            for (const [cat, names] of Object.entries(map)) {
                if (names.includes(skill.name)) {
                    categories[cat].push(skill);
                    placed = true;
                    break;
                }
            }
            if (!placed) categories["Образование"].push(skill);
        }
        for (const cat in categories) if (categories[cat].length === 0) delete categories[cat];
        return categories;
    }
    renderCategoryTable(category, skills) {
    const tbodyId = `skills-tbody-${category.replace(/\s/g, '')}`;
    const container = document.getElementById(tbodyId);
    if (!container) return;

    // Создаём таблицу с правильными классами
    const table = document.createElement('table');
    table.className = 'cyber-table skills-table';   // ВАЖНО: добавили skills-table
    table.innerHTML = `
        <thead>
            <tr><th>Навык</th><th>ХАР</th><th>×2</th><th>Уровень</th></tr>
        </thead>
        <tbody id="${tbodyId}"></tbody>
    `;
    
    // Обёртка для горизонтальной прокрутки
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    wrapper.appendChild(table);
    
    // Вставляем вместо старого содержимого
    const oldContainer = container.parentElement?.querySelector(`#${tbodyId}`)?.parentElement?.parentElement;
    if (oldContainer && oldContainer.classList.contains('category-body')) {
        // Очищаем category-body и добавляем wrapper
        oldContainer.innerHTML = '';
        oldContainer.appendChild(wrapper);
    } else {
        // Запасной вариант: просто вставляем wrapper в нужное место
        const targetDiv = document.querySelector(`#skills-tbody-${category.replace(/\s/g, '')}`)?.closest('.category-body');
        if (targetDiv) {
            targetDiv.innerHTML = '';
            targetDiv.appendChild(wrapper);
        }
    }
    
    // Заполняем строки
    const newTbody = table.querySelector('tbody');
    skills.forEach(skill => {
        const defaultValue = skill.base ? 2 : 0;
        const row = document.createElement('tr');
        row.className = 'skill-row';
        row.setAttribute('data-skill-name', skill.name);
        row.innerHTML = `
            <td>${skill.name}</td>
            <td>${skill.stat}</td>
            <td>${skill.costMult === 2 ? 'да' : 'нет'}</td>
            <td><input type="number" class="skill-level" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="10" value="${defaultValue}" step="1"></td>
        `;
        newTbody.appendChild(row);
    });
    
    // Перепривязываем события
    newTbody.querySelectorAll('.skill-level').forEach(input => {
        input.addEventListener('input', () => this.updateSkillRemaining());
    });
}
    filterSkillsModern() {
    const term = document.getElementById('skillsSearchInput').value.toLowerCase();
    const allCards = document.querySelectorAll('.skill-card-modern');
    allCards.forEach(card => {
        const name = card.querySelector('.skill-name-modern')?.innerText.toLowerCase() || '';
        if (name.includes(term)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    // Показываем категории, в которых есть видимые карточки
    document.querySelectorAll('.skills-category-modern').forEach(cat => {
        const visibleCards = Array.from(cat.querySelectorAll('.skill-card-modern')).some(c => c.style.display !== 'none');
        const body = cat.querySelector('.category-body-modern');
        const toggle = cat.querySelector('.category-toggle-modern');
        if (visibleCards && body.style.display === 'none') {
            body.style.display = 'block';
            if (toggle) toggle.textContent = '▼';
        } else if (!visibleCards && body.style.display === 'block') {
            body.style.display = 'none';
            if (toggle) toggle.textContent = '▶';
        }
    });
}
    applyRecommendedSkills(role) {
    const template = roleTemplates[role];
    if (!template) return;
    
    // Сброс всех навыков до базовых (2 для базовых, 0 для остальных)
    document.querySelectorAll('.skill-level-modern').forEach(input => {
        const skillName = input.dataset.skill;
        const skill = allSkills.find(s => s.name === skillName);
        const defaultValue = (skill && skill.base) ? 2 : 0;
        input.value = defaultValue;
    });
    
    // Установка рекомендованных значений
    for (const [skillName, level] of Object.entries(template)) {
        const input = document.querySelector(`.skill-level-modern[data-skill="${skillName}"]`);
        if (input && level <= 10) input.value = level;
    }
    
    // Проверка базовых навыков (минимум 2)
    for (const skill of allSkills) {
        if (skill.base) {
            const input = document.querySelector(`.skill-level-modern[data-skill="${skill.name}"]`);
            if (input && parseInt(input.value) < 2) input.value = 2;
        }
    }
    
    this.updateSkillRemaining();
    alert(`Рекомендованные навыки для ${role} применены.`);
}
    copySkillsToClipboard() {
    let text = "Навыки персонажа:\n";
    document.querySelectorAll('.skill-card-modern').forEach(card => {
        const name = card.querySelector('.skill-name-modern')?.innerText;
        const input = card.querySelector('.skill-level-modern');
        if (name && input) {
            const level = input.value;
            if (level != 0) text += `${name}: ${level}\n`;
        }
    });
    navigator.clipboard.writeText(text).then(() => alert("Список навыков скопирован в буфер обмена!"));
}
    updateSkillRemaining() {
    let total = 0;
    document.querySelectorAll('.skill-level-modern').forEach(input => {
        const level = parseInt(input.value) || 0;
        const costMult = parseInt(input.dataset.cost) || 1;
        total += level * costMult;
    });
    const remaining = 86 - total;
    document.getElementById('idealSkillPoints').innerHTML = remaining;
    return remaining >= 0;
}
    attachEvents() {
        document.getElementById('idealStatsGrid')?.addEventListener('input', () => this.updateStatsRemaining());
        document.getElementById('calcIdealStatsBtn')?.addEventListener('click', () => this.calcDerived());
        document.getElementById('randomIdealStatsBtn')?.addEventListener('click', () => this.randomizeStats());
    }
    randomizeStats() {
        const statIds = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        let total = 0;
        for (let s of statIds) {
            let val = Math.floor(Math.random() * 7) + 2;
            document.getElementById(`idealStat${s}`).value = val;
            total += val;
        }
        this.updateStatsRemaining();
        if (total > 62) alert(`Сумма ХАР = ${total} (максимум 62). Уменьшите значения.`);
        else if (total < 62) alert(`Сумма ХАР = ${total}. Осталось ${62 - total} очков.`);
        else alert(`Сумма ХАР = 62. Идеально!`);
    }
    calcDerived() {
        const body = parseInt(document.getElementById('idealStatBODY').value);
        const will = parseInt(document.getElementById('idealStatWILL').value);
        const emp = parseInt(document.getElementById('idealStatEMP').value);
        const hp = getHP(body, will);
        const severe = Math.ceil(hp / 2);
        const humanity = emp * 10;
        const empFrom = Math.floor(humanity / 10);
        document.getElementById('idealDerived').innerHTML = `<strong>ПЗ = ${hp}</strong> (тяж. ≤ ${severe})<br>Спасбросок = ${body}<br>Человечность = ${humanity} (ЭМП = ${empFrom})`;
        if (!this.updateStatsRemaining()) alert("Превышение очков ХАР (максимум 62)");
        if (!this.updateSkillRemaining()) alert("Превышение очков навыков (максимум 86)");
        }
        
}