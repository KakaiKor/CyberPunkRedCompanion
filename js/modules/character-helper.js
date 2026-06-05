// modules/character-helper.js
import { getHP } from '../utils.js';
import { saveCharacter, loadCharacter } from '../storage.js';
import { detailedCyberware, armors, rangedWeapons, meleeWeapons, gearItems } from '../data.js';
import { rolesData } from '../data/roles-data.js';

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
        const ids = ['statINT', 'statREF', 'statDEX', 'statTECH', 'statCOOL', 'statWILL', 'statLUCK', 'statMOVE', 'statBODY', 'statEMP'];
        const names = ['ИНТ', 'РЕФ', 'ЛВК', 'ТЕХ', 'КРУТ', 'ВОЛЯ', 'УДЧ', 'СКО', 'ТЕЛО', 'ЭМП'];
        let html = '';
        for (let i = 0; i < ids.length; i++) {
            html += `<label>${names[i]}<br><input type="number" id="${ids[i]}" min="2" max="8" value="6"></label>`;
        }
        container.innerHTML = html;
    }

    randomStats() {
        const ids = ['statINT', 'statREF', 'statDEX', 'statTECH', 'statCOOL', 'statWILL', 'statLUCK', 'statMOVE', 'statBODY', 'statEMP'];
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
        const stats = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
        stats.forEach(s => char[s] = document.getElementById(`stat${s}`).value);
        saveCharacter(char);
        document.getElementById('charSaveStatus').innerText = 'Сохранено!';
    }

    load() {
        const char = loadCharacter();
        if (char) {
            document.getElementById('charName').value = char.name || '';
            document.getElementById('genRole').value = char.role || 'Соло';
            const stats = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
            stats.forEach(s => { if (char[s]) document.getElementById(`stat${s}`).value = char[s]; });
            this.calcDerived();
            document.getElementById('charSaveStatus').innerText = 'Загружено!';
        } else {
            document.getElementById('charSaveStatus').innerText = 'Нет сохранений';
        }
    }

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
        this.buildCharacterCard({
    name, role, roleRank: 4, stats, skills, gear, cyberware: [],
    hp, severe, humanity, empFrom, deathSave, notes: ''
});
        const charData = { name, role, ...stats };
        saveCharacter(charData);
        document.getElementById('charSaveStatus').innerText = 'Персонаж сгенерирован!';
    }

    generateStatsForRole(role) {
        const roll = Math.floor(Math.random() * 10) + 1;
        const templates = {
            "Рокербой": [[7, 6, 5, 6, 8, 7, 7, 3, 8, 2], [7, 7, 7, 7, 6, 7, 7, 5, 8, 3], [8, 5, 7, 7, 6, 7, 7, 5, 8, 4], [5, 7, 7, 6, 8, 7, 7, 5, 8, 3], [7, 7, 6, 8, 7, 6, 5, 5, 8, 3], [8, 7, 5, 7, 7, 6, 5, 6, 8, 4], [7, 5, 7, 7, 8, 6, 7, 6, 8, 3], [6, 5, 7, 7, 7, 8, 7, 6, 8, 4], [8, 9, 3, 5, 5, 6, 7, 8, 7, 5], [4, 5, 6, 5, 8, 8, 7, 6, 4, 7]],
            "Соло": [[6, 7, 7, 3, 8, 6, 5, 5, 6, 5], [7, 8, 6, 3, 6, 6, 7, 5, 6, 6], [8, 7, 4, 7, 7, 6, 7, 8, 5, 4], [6, 4, 6, 4, 7, 6, 5, 7, 6, 5], [7, 6, 5, 7, 6, 7, 6, 5, 6, 7], [6, 7, 7, 6, 8, 4, 6, 7, 6, 7], [7, 7, 6, 5, 7, 6, 6, 7, 7, 6], [7, 7, 8, 7, 8, 7, 5, 6, 6, 5], [4, 9, 7, 7, 6, 4, 6, 6, 6, 5], [6, 6, 8, 5, 6, 6, 5, 6, 6, 5]],
            "Нетраннер": [[5, 8, 7, 7, 4, 8, 7, 7, 4, 2], [5, 6, 7, 5, 8, 3, 8, 7, 5, 5], [6, 8, 6, 6, 4, 7, 6, 7, 4, 4], [7, 7, 7, 5, 8, 5, 5, 5, 5, 5], [5, 5, 7, 8, 7, 3, 7, 5, 6, 6], [6, 6, 7, 7, 5, 5, 5, 6, 6, 6], [7, 6, 7, 7, 6, 5, 7, 7, 6, 6], [5, 7, 7, 7, 6, 5, 7, 6, 5, 5], [7, 7, 6, 7, 6, 3, 6, 5, 6, 5], [7, 8, 6, 6, 4, 7, 7, 5, 6, 6]],
            "Техник": [[6, 7, 7, 8, 4, 4, 5, 7, 6, 2], [7, 6, 7, 7, 5, 5, 3, 7, 5, 3], [6, 5, 7, 5, 7, 4, 7, 7, 4, 7], [7, 4, 7, 7, 5, 5, 6, 7, 4, 6], [6, 6, 7, 7, 7, 4, 5, 6, 7, 5], [5, 6, 4, 7, 6, 7, 5, 5, 5, 5], [6, 7, 5, 7, 7, 7, 4, 6, 7, 5], [7, 5, 5, 7, 7, 5, 6, 7, 6, 5], [6, 6, 7, 7, 5, 4, 6, 5, 4, 6], [7, 5, 6, 7, 5, 5, 7, 6, 5, 5]],
            "Медтех": [[7, 5, 6, 7, 5, 3, 8, 5, 5, 2], [7, 7, 7, 4, 6, 7, 7, 3, 6, 5], [5, 5, 8, 5, 3, 8, 5, 7, 8, 4], [8, 6, 8, 6, 5, 6, 7, 5, 7, 4], [7, 6, 7, 5, 8, 5, 6, 6, 5, 6], [7, 5, 7, 5, 8, 5, 6, 7, 5, 6], [7, 5, 5, 6, 7, 6, 5, 6, 5, 6], [6, 7, 6, 5, 6, 6, 5, 6, 5, 6], [7, 6, 6, 5, 6, 6, 5, 5, 5, 6], [5, 6, 6, 5, 6, 6, 5, 5, 5, 6]],
            "Медиа": [[6, 6, 5, 5, 8, 7, 5, 7, 5, 2], [8, 7, 7, 3, 6, 6, 5, 6, 5, 6], [6, 7, 5, 5, 6, 8, 5, 5, 7, 4], [7, 5, 6, 5, 7, 6, 5, 6, 5, 5], [6, 6, 7, 5, 6, 7, 6, 6, 5, 6], [7, 5, 6, 5, 7, 6, 6, 6, 5, 6], [8, 5, 5, 6, 7, 6, 7, 6, 5, 6], [7, 5, 6, 6, 7, 6, 6, 6, 5, 6], [7, 6, 6, 6, 7, 6, 5, 6, 5, 6], [5, 6, 6, 6, 7, 6, 5, 6, 5, 6]],
            "Законник": [[5, 6, 7, 5, 7, 8, 5, 6, 5, 6], [6, 6, 6, 5, 6, 8, 5, 7, 5, 5], [7, 7, 7, 5, 6, 7, 5, 6, 5, 5], [6, 6, 6, 5, 8, 5, 7, 6, 5, 6], [6, 6, 6, 5, 7, 6, 7, 6, 5, 6], [6, 6, 6, 5, 8, 7, 6, 6, 5, 5], [8, 7, 5, 6, 7, 6, 5, 6, 5, 6], [5, 6, 5, 6, 7, 6, 6, 6, 5, 6], [5, 6, 6, 6, 7, 6, 6, 5, 5, 6], [6, 6, 6, 5, 7, 6, 5, 6, 5, 5]],
            "Менеджер": [[8, 5, 5, 3, 8, 6, 6, 5, 5, 2], [8, 6, 6, 4, 7, 7, 5, 7, 5, 3], [7, 6, 3, 8, 6, 4, 5, 8, 5, 4], [8, 5, 6, 4, 7, 5, 6, 5, 5, 4], [7, 5, 6, 5, 7, 7, 5, 7, 5, 3], [6, 5, 7, 6, 7, 5, 7, 6, 5, 4], [7, 6, 5, 7, 7, 5, 6, 6, 5, 4], [6, 7, 5, 5, 6, 6, 6, 5, 5, 5], [7, 6, 5, 6, 7, 6, 7, 5, 5, 5], [5, 5, 6, 6, 7, 6, 5, 6, 5, 5]],
            "Фиксер": [[8, 5, 7, 4, 6, 5, 8, 5, 5, 2], [8, 5, 5, 6, 7, 8, 7, 5, 5, 3], [7, 6, 6, 5, 4, 6, 6, 5, 5, 4], [6, 8, 5, 6, 5, 7, 6, 6, 5, 5], [7, 6, 6, 6, 6, 7, 6, 5, 5, 5], [5, 6, 6, 6, 6, 6, 6, 5, 5, 5], [7, 6, 6, 6, 7, 5, 6, 5, 5, 5], [6, 6, 5, 5, 7, 6, 6, 5, 5, 5], [7, 6, 5, 6, 7, 6, 6, 5, 5, 5], [5, 6, 5, 6, 6, 5, 6, 5, 5, 5]],
            "Кочевник": [[6, 6, 8, 3, 6, 7, 6, 6, 4, 2], [5, 7, 6, 8, 8, 8, 7, 5, 4, 3], [8, 6, 3, 8, 6, 5, 6, 5, 4, 4], [8, 7, 4, 8, 7, 6, 7, 5, 5, 4], [5, 8, 6, 6, 7, 5, 6, 6, 5, 4], [6, 7, 8, 6, 7, 5, 7, 6, 5, 4], [8, 7, 6, 5, 7, 5, 7, 6, 5, 4], [5, 5, 7, 6, 6, 6, 6, 5, 5, 4], [7, 6, 5, 6, 7, 5, 6, 5, 5, 5], [5, 6, 7, 4, 7, 8, 7, 7, 4, 4]]
        };
        const template = templates[role];
        if (!template) return {};
        const statsRow = template[roll - 1];
        return {
            INT: statsRow[0], REF: statsRow[1], DEX: statsRow[2], TECH: statsRow[3],
            COOL: statsRow[4], WILL: statsRow[5], LUCK: statsRow[6], MOVE: statsRow[7],
            BODY: statsRow[8], EMP: statsRow[9]
        };
    }

    generateSkillsForRole(role) {
        const templates = {
            "Рокербой": { "Атлетика": 2, "Драка": 6, "Концентрация": 2, "Общение": 2, "Образование": 2, "Уклонение": 6, "Первая помощь": 6, "Проницательность": 6, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 4, "Восприятие": 2, "Убеждение": 6, "Скрытность": 2, "Композиция": 6, "Короткоствольное оружие": 6, "Холодное оружие": 6, "Уход за собой": 4, "Опыт на улицах": 6, "Гардероб и стиль": 4 },
            "Соло": { "Атлетика": 2, "Драка": 2, "Концентрация": 2, "Общение": 2, "Образование": 2, "Уклонение": 6, "Первая помощь": 6, "Проницательность": 2, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 2, "Восприятие": 6, "Убеждение": 2, "Скрытность": 2, "Автоогонь": 6, "Короткоствольное оружие": 6, "Допрос": 6, "Холодное оружие": 6, "Сопротивление пыткам/наркотикам": 6, "Длинноствольное оружие": 6, "Тактика": 6 },
            "Нетраннер": { "Атлетика": 2, "Драка": 2, "Концентрация": 2, "Общение": 2, "Образование": 6, "Уклонение": 6, "Первая помощь": 2, "Проницательность": 2, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 2, "Восприятие": 2, "Убеждение": 2, "Скрытность": 6, "Основы техники": 6, "Скрытие/обнаружение объекта": 6, "Криптография": 6, "Кибертехника": 6, "Электроника/безопасность": 6, "Поиск информации": 6, "Наука (выбери 1)": 6 },
            "Техник": { "Атлетика": 2, "Драка": 2, "Концентрация": 2, "Общение": 2, "Образование": 6, "Уклонение": 6, "Первая помощь": 6, "Проницательность": 2, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 2, "Восприятие": 2, "Убеждение": 2, "Скрытность": 2, "Основы техники": 6, "Кибертехника": 6, "Электроника/безопасность": 6, "Автомеханика": 6, "Длинноствольное оружие": 6, "Оружейная техника": 6, "Наука (выбери 1)": 6 },
            "Медтех": { "Атлетика": 2, "Драка": 2, "Концентрация": 2, "Общение": 6, "Образование": 6, "Уклонение": 6, "Первая помощь": 2, "Проницательность": 6, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 2, "Восприятие": 2, "Убеждение": 2, "Скрытность": 2, "Основы техники": 6, "Кибертехника": 4, "Парамедицина": 6, "Дедукция": 6, "Сопротивление пыткам/наркотикам": 4, "Наука (выбери 1)": 6, "Длинноствольное оружие": 6 },
            "Медиа": { "Атлетика": 2, "Драка": 2, "Концентрация": 2, "Общение": 6, "Образование": 2, "Уклонение": 6, "Первая помощь": 2, "Проницательность": 6, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 6, "Восприятие": 6, "Убеждение": 6, "Скрытность": 2, "Взяточничество": 6, "Композиция": 6, "Дедукция": 6, "Короткоствольное оружие": 6, "Поиск информации": 4, "Выслеживание": 6, "Торговля": 6 },
            "Законник": { "Атлетика": 2, "Драка": 6, "Концентрация": 2, "Общение": 6, "Образование": 2, "Уклонение": 6, "Первая помощь": 2, "Проницательность": 2, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 2, "Восприятие": 2, "Убеждение": 2, "Скрытность": 2, "Автоогонь": 6, "Криминология": 6, "Дедукция": 6, "Короткоствольное оружие": 6, "Допрос": 6, "Длинноствольное оружие": 6, "Чтение по губам": 4 },
            "Менеджер": { "Атлетика": 2, "Драка": 2, "Концентрация": 2, "Общение": 6, "Образование": 6, "Уклонение": 6, "Первая помощь": 2, "Проницательность": 6, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 2, "Восприятие": 2, "Убеждение": 6, "Скрытность": 2, "Бухгалтерия": 6, "Бюрократия": 6, "Бизнес": 6, "Дедукция": 6, "Допрос": 6, "Длинноствольное оружие": 6, "Уход за собой": 4 },
            "Фиксер": { "Атлетика": 2, "Драка": 2, "Концентрация": 2, "Общение": 6, "Образование": 2, "Уклонение": 6, "Первая помощь": 2, "Проницательность": 6, "Язык (Уличный сленг)": 4, "Знание района (Твой дом)": 6, "Восприятие": 2, "Убеждение": 4, "Скрытность": 2, "Взяточничество": 6, "Бизнес": 6, "Фальсификация": 6, "Дедукция": 6, "Короткоствольное оружие": 6, "Чтение по губам": 6, "Торговля": 6 },
            "Кочевник": { "Атлетика": 2, "Драка": 6, "Концентрация": 2, "Общение": 2, "Образование": 2, "Уклонение": 6, "Первая помощь": 6, "Проницательность": 2, "Язык (Уличный сленг)": 2, "Знание района (Твой дом)": 2, "Восприятие": 4, "Убеждение": 2, "Скрытность": 6, "Обращение с животными": 6, "Вождение": 6, "Короткоствольное оружие": 6, "Взлом замков": 4, "Опыт на улицах": 6, "Выживание в дикой местности": 6, "Торговля": 6 }
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

    // ========== ОСНОВНЫЕ МЕТОДЫ ДЛЯ КАРТОЧКИ ==========
    buildCharacterCard(cardData) {
        const { name, role, roleRank = 4, stats, skills, gear, cyberware, hp, severe, humanity, empFrom, deathSave, notes = '' } = cardData;
        const container = document.getElementById('characterCardContainer');
        const cardHtml = this.buildCharacterCardHTML({ name, role, roleRank, stats, skills, gear, cyberware, hp, severe, humanity, empFrom, deathSave, notes });
        container.innerHTML = cardHtml;
        this.attachCardEventHandlers();
        const editBtn = container.querySelector('.edit-card-btn');
        const syncBtn = container.querySelector('.sync-card-btn');
        if (editBtn) editBtn.addEventListener('click', () => this.enableEditMode(container.querySelector('.character-card')));
        if (syncBtn) syncBtn.addEventListener('click', () => this.syncFromTabs());
        const roleInfo = rolesData.find(r => r.name === role);
const roleSkillName = roleInfo ? roleInfo.skill : '—';
const roleRankDisplay = roleRank ? ` (ранг ${roleRank})` : '';

const roleSkillHtml = `
    <div class="role-skill-badge">
        <span class="role-skill-name">${roleSkillName}</span>
        <span class="role-skill-rank">${roleRankDisplay}</span>
    </div>
`;
    }

    buildCharacterCardHTML({ name, role, roleRank = 4, stats, skills, gear, cyberware = [], hp, severe, humanity, empFrom, deathSave, notes }) {
    stats = stats || {};
    skills = skills || {};
    gear = gear || { weapons: [], armor: { body: '', head: '' }, items: [] };
    cyberware = cyberware || [];

    // ---------- МОДИФИКАТОРЫ ОТ ИМПЛАНТОВ ----------
    // Словарь эффектов (можно вынести в отдельный файл)
    const implantModifiers = {
        "Керензиков": { initiative: 2, display: "+2 к инициативе" },
        "Искусственные мышцы и усиленные кости": { BODY: 2, maxBody: 10, display: "+2 к ТЕЛО (макс. 10)" },
        "Усиленные антитела": { special: "Восстанавливает ТЕЛО×2 ПЗ в день", display: "Регенерация" },
        "Жабры": { special: "дыхание под водой", display: "Дыхание под водой" },
        "Назальные фильтры": { special: "иммунитет к газам", display: "Иммунитет к газам" },
        "Связыватели токсинов": { resistance: 2, display: "+2 к Сопротивлению пыткам/наркотикам" }
        // добавьте другие импланты по необходимости
    };

    let bonuses = { BODY: 0, initiative: 0, resistance: 0 };
    let extraEffects = [];

    for (const implant of cyberware) {
        const mod = implantModifiers[implant];
        if (mod) {
            if (mod.BODY) bonuses.BODY += mod.BODY;
            if (mod.initiative) bonuses.initiative += mod.initiative;
            if (mod.resistance) bonuses.resistance += mod.resistance;
            if (mod.display) extraEffects.push(mod.display);
        }
    }

    // Применяем бонус к ТЕЛО (только для отображения, ПЗ не меняем)
    let bodyBase = stats.BODY || 6;
    let bodyDisplay = bodyBase + bonuses.BODY;
    const bodyMax = 10;
    if (bodyDisplay > bodyMax) bodyDisplay = bodyMax;
    const bodyBonusText = bonuses.BODY !== 0 ? ` (база ${bodyBase} +${bonuses.BODY} от имплантов)` : '';

    // ---------- ФОРМИРОВАНИЕ HTML ----------
    const statsHtml = Object.entries(stats).map(([k, v]) => {
        if (k === 'BODY' && bonuses.BODY !== 0) {
            return `<div class="stat-item" data-stat="${k}"><span class="stat-name">${k}</span><span class="stat-value">${bodyDisplay}${bodyBonusText}</span></div>`;
        }
        return `<div class="stat-item" data-stat="${k}"><span class="stat-name">${k}</span><span class="stat-value">${v}</span></div>`;
    }).join('');

    const skillsHtml = Object.entries(skills).filter(([_, v]) => v > 0).map(([k, v]) => `
        <div class="skill-item" data-skill="${k}">
            <span class="skill-name">${this.escapeHtml(k)}</span>
            <span class="skill-level">${v}</span>
        </div>
    `).join('');

    const weaponsHtml = (gear.weapons || []).map((w, idx) => `<li data-weapon-idx="${idx}">🔫 ${this.escapeHtml(w)}</li>`).join('');
    const cyberHtml = (cyberware || []).map((c, idx) => `<li data-cyber-idx="${idx}">🦾 ${this.escapeHtml(c)}</li>`).join('');
    const gearHtmlItems = (gear.items || []).map((g, idx) => `<li data-gear-idx="${idx}">📦 ${this.escapeHtml(g)}</li>`).join('');

    const bodyArmorInfo = armors.find(a => a.name === gear.armor?.body);
    const headArmorInfo = armors.find(a => a.name === gear.armor?.head);
    const armorHtml = `
        <li>🛡️ Тело: ${this.escapeHtml(gear.armor?.body || 'нет')}${bodyArmorInfo ? ` (ОС ${bodyArmorInfo.sp}, штраф ${bodyArmorInfo.penalty})` : ''}</li>
        <li>⛑️ Голова: ${this.escapeHtml(gear.armor?.head || 'нет')}${headArmorInfo ? ` (ОС ${headArmorInfo.sp}, штраф ${headArmorInfo.penalty})` : ''}</li>
    `;

    const notesHtml = `
        <div class="char-section" data-section="notes">
            <h4>📝 Заметки</h4>
            <div class="notes-preview">${this.escapeHtml(notes) || '— нет —'}</div>
        </div>
    `;

    // Блок derived-stats с добавлением инициативы от имплантов
    let derivedStatsHtml = `
        <div data-derived="hp">ПЗ: <span class="current-hp">${hp}</span> / ${hp} <span class="hp-threshold">(тяж. ≤ ${severe})</span></div>
        <div data-derived="deathSave">Спасбросок: ${deathSave}</div>
    `;
    if (bonuses.initiative !== 0) {
        derivedStatsHtml += `<div>Инициатива: ${stats.REF} + ${bonuses.initiative} (от имплантов)</div>`;
    }
    derivedStatsHtml += `<div data-derived="humanity">Человечность: ${humanity} (ЭМП = ${empFrom})</div>`;
    if (extraEffects.length) {
        derivedStatsHtml += `<div class="implant-effects">✨ Эффекты имплантов: ${extraEffects.join(', ')}</div>`;
    }

    // Ролевой навык
    const roleInfo = rolesData.find(r => r.name === role);
    const roleSkillName = roleInfo ? roleInfo.skill : '—';
    const roleSkillHtml = `
        <div class="role-skill-badge">
            <span class="role-skill-name">${roleSkillName}</span>
            <span class="role-skill-rank">${roleRank ? ` (ранг ${roleRank})` : ''}</span>
        </div>
    `;

    return `
        <div class="character-card" data-name="${this.escapeHtml(name)}" data-role="${role}">
            <div class="character-card-header">
                <div class="character-name" data-field="name">${this.escapeHtml(name)}</div>
                <div class="character-role" data-field="role">${role}</div>
                ${roleSkillHtml}
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
                    <div class="derived-stats">${derivedStatsHtml}</div>
                    <div class="combat-buttons">
                        <button class="heal-btn">💊 Лечение (+${stats.BODY || 6} ПЗ)</button>
                        <button class="damage-btn">💥 Урон</button>
                    </div>
                </div>
                <div class="char-section" data-section="skills">
                    <h4>🎯 Навыки</h4>
                    <div class="skills-grid" data-skills-container>${skillsHtml || '<p>— нет —</p>'}</div>
                </div>
                ${notesHtml}
                <div class="equipment-grid" data-equipment>
                    <div class="equipment-card" data-type="armor">
                        <h5>🛡️ Броня</h5>
                        <ul class="compact" data-armor-list>${armorHtml}</ul>
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

    displaySavedCharacterCard() {
        const char = loadCharacter();
        if (!char) {
            console.warn('Нет сохранённого персонажа');
            return;
        }
        const stats = {
            INT: char.INT || 6, REF: char.REF || 6, DEX: char.DEX || 6,
            TECH: char.TECH || 6, COOL: char.COOL || 6, WILL: char.WILL || 6,
            LUCK: char.LUCK || 6, MOVE: char.MOVE || 6, BODY: char.BODY || 6, EMP: char.EMP || 6
        };
        const skills = char.skills || {};
        const gear = char.gear || { weapons: [], armor: { body: '', head: '' }, items: [] };
        const cyberware = char.cyberware || [];
        const body = stats.BODY, will = stats.WILL, emp = stats.EMP;
        const hp = getHP(body, will);
        const severe = Math.ceil(hp / 2);
        let humanityLoss = 0;
        for (const name of cyberware) {
            const implant = detailedCyberware.find(i => i.name === name);
            if (implant) humanityLoss += parseInt(implant.humanity) || 0;
        }
        const humanity = Math.max(0, emp * 10 - humanityLoss);
        const empFrom = Math.floor(humanity / 10);
        const deathSave = body;
        this.buildCharacterCard({
    name: char.name || 'Безымянный',
    role: char.role || 'Без роли',
    roleRank: char.roleRank || 4,   // добавить
    stats: stats,
    skills: skills,
    gear: gear,
    cyberware: cyberware,
    hp: hp,
    severe: severe,
    humanity: humanity,
    empFrom: empFrom,
    deathSave: deathSave,
    notes: char.notes || ''
});
    }

    exportCharacterToJSON() {
        const char = loadCharacter();
        if (!char) {
            alert('Нет сохранённого персонажа');
            return;
        }
        const dataStr = JSON.stringify(char, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${char.name || 'character'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importCharacterFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const char = JSON.parse(e.target.result);
                if (!char.name || !char.role) {
                    alert('Неверный формат JSON');
                    return;
                }
                saveCharacter(char);
                // Обновляем форму во вкладке "Основное"
                document.getElementById('charName').value = char.name || '';
                document.getElementById('genRole').value = char.role || 'Соло';
                const statsFields = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
                statsFields.forEach(s => {
                    if (char[s]) document.getElementById(`stat${s}`).value = char[s];
                });
                this.calcDerived();
                this.displaySavedCharacterCard();
                alert('Персонаж импортирован');
            } catch (err) {
                alert('Ошибка разбора JSON');
            }
        };
        reader.readAsText(file);
    }

    // ========== РЕДАКТИРОВАНИЕ КАРТОЧКИ ==========
    enableEditMode(card) {
        const nameSpan = card.querySelector('[data-field="name"]');
        const roleSpan = card.querySelector('[data-field="role"]');
        if (!nameSpan || !roleSpan) return;
        const currentName = nameSpan.innerText;
        const currentRole = roleSpan.innerText;
        nameSpan.innerHTML = `<input type="text" class="edit-input" value="${this.escapeHtml(currentName)}">`;
        roleSpan.innerHTML = `<select class="edit-select">${this.getRoleOptions(currentRole)}</select>`;

        card.querySelectorAll('.stat-item').forEach(item => {
            const statNameElem = item.querySelector('.stat-name');
            const statValueElem = item.querySelector('.stat-value');
            if (statNameElem && statValueElem) {
                const statName = statNameElem.innerText;
                const statValue = statValueElem.innerText;
                statValueElem.outerHTML = `<input type="number" class="edit-stat" data-stat="${statName}" value="${statValue}" min="2" max="8">`;
            }
        });

        card.querySelectorAll('.skill-item').forEach(item => {
            const skillNameElem = item.querySelector('.skill-name');
            const skillLevelElem = item.querySelector('.skill-level');
            if (skillNameElem && skillLevelElem) {
                const skillName = skillNameElem.innerText;
                const skillLevel = skillLevelElem.innerText;
                item.innerHTML = `<span class="skill-name">${skillName}</span><input type="number" class="edit-skill" data-skill="${skillName}" value="${skillLevel}" min="0" max="10">`;
            }
        });

        this.makeEquipmentEditable(card);
        const editBtn = card.querySelector('.edit-card-btn');
        if (editBtn) {
            editBtn.textContent = '💾 Сохранить';
            editBtn.classList.add('save-card-btn');
            editBtn.classList.remove('edit-card-btn');
            const oldHandler = editBtn._clickHandler;
            if (oldHandler) editBtn.removeEventListener('click', oldHandler);
            const saveHandler = () => this.disableEditMode(card);
            editBtn.addEventListener('click', saveHandler);
            editBtn._clickHandler = saveHandler;
        }
    }

    getRoleOptions(selectedRole) {
        const roles = ["Рокербой", "Соло", "Нетраннер", "Техник", "Медтех", "Медиа", "Законник", "Менеджер", "Фиксер", "Кочевник"];
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
        if (removeBtn) removeBtn.addEventListener('click', () => li.remove());
    }

    disableEditMode(card) {
        // 1. Имя
        const nameInput = card.querySelector('[data-field="name"] input');
        if (!nameInput) return;
        let newName = nameInput.value.trim();
        if (newName === "") newName = "Безымянный";
        console.log("Новое имя:", newName);

        // 2. Роль
        const roleSelect = card.querySelector('[data-field="role"] select');
        const newRole = roleSelect ? roleSelect.value : "Соло";

        // 3. Характеристики
        const newStats = {};
        card.querySelectorAll('.edit-stat').forEach(input => {
            const statName = input.dataset.stat;
            newStats[statName] = parseInt(input.value) || 6;
        });

        // 4. Навыки
        const newSkills = {};
        card.querySelectorAll('.edit-skill').forEach(input => {
            const skillName = input.dataset.skill;
            newSkills[skillName] = parseInt(input.value) || 0;
        });

        // 5. Снаряжение (оружие, импланты, вещи, броня)
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

        // 6. Производные (ПЗ, человечность)
        const body = newStats.BODY || 6;
        const will = newStats.WILL || 6;
        const emp = newStats.EMP || 6;
        const hp = getHP(body, will);
        const severe = Math.ceil(hp / 2);
        let humanityLoss = 0;
        for (const name of newGear.cyberware) {
            const implant = detailedCyberware.find(i => i.name === name);
            if (implant) humanityLoss += parseInt(implant.humanity) || 0;
        }
        const humanity = Math.max(0, emp * 10 - humanityLoss);
        const empFrom = Math.floor(humanity / 10);
        const deathSave = body;

        // 7. Заметки
        const notesDiv = card.querySelector('.notes-preview');
        const newNotes = notesDiv ? notesDiv.innerText : '';

        // 8. Сохраняем в localStorage
        const charData = {
            name: newName,
            role: newRole,
            ...newStats,
            skills: newSkills,
            gear: newGear,
            cyberware: newGear.cyberware,
            style: [],
            lifestyle: "100",
            housing: "500",
            notes: newNotes
        };
        console.log("Сохраняемые данные:", charData);
        saveCharacter(charData);

        // 9. Перезагружаем карточку из сохранённых данных
        this.displaySavedCharacterCard();
        const newRoleRank = 4; // пока временно, можно позже добавить редактирование
// или взять из charData, если добавили поле
this.buildCharacterCard({
    name: newName,
    role: newRole,
    roleRank: newRoleRank,
    stats: newStats,
    skills: newSkills,
    gear: newGear,
    cyberware: newGear.cyberware,
    hp: hp,
    severe: severe,
    humanity: humanity,
    empFrom: empFrom,
    deathSave: deathSave,
    notes: newNotes
});
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
            skills = { "Атлетика": 2, "Восприятие": 2, "Драка": 2, "Уклонение": 2 };
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
        this.buildCharacterCard({
    name, role, roleRank: 4, stats, skills, gear, cyberware: gear.cyberware,
    hp, severe, humanity, empFrom, deathSave, notes: ''
});
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
                    let newHp = Math.max(0, current - parseInt(dmg));
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
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
}