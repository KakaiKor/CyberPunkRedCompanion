import { getHP } from '../utils.js';
import { saveCharacter, loadCharacter } from '../storage.js';

export class CharacterHelper {
    // ... (без изменений, как в предыдущих версиях)
    constructor() {
        this.buildStatsGrid();
        document.getElementById('randomStatsBtn')?.addEventListener('click', () => this.randomStats());
        document.getElementById('calcCharBtn')?.addEventListener('click', () => this.calcDerived());
        document.getElementById('saveCharBtn')?.addEventListener('click', () => this.save());
        document.getElementById('loadCharBtn')?.addEventListener('click', () => this.load());
    }
    buildStatsGrid() {
        const container = document.getElementById('statsGrid');
        if (!container) return;
        const ids = ['statINT','statREF','statDEX','statTECH','statCOOL','statWILL','statLUCK','statMOVE','statBODY','statEMP'];
        const names = ['ИНТ','РЕФ','ЛВК','ТЕХ','КРУТ','ВОЛЯ','УДЧ','СКО','ТЕЛО','ЭМП'];
        let html = '';
        for (let i = 0; i < ids.length; i++) html += `<label>${names[i]}<br><input type="number" id="${ids[i]}" min="2" max="8" value="6"></label>`;
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
        } else document.getElementById('charSaveStatus').innerText = 'Нет сохранений';
    }
}

export class HumanityCalculator {
    // ... (без изменений)
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

// ========== ПОЛНЫЙ СПИСОК НАВЫКОВ ==========
const allSkills = [
    // Восприятие
    { name:"Восприятие", stat:"ИНТ", costMult:1, base:true },
    { name:"Скрытность", stat:"ЛВК", costMult:1, base:true },
    { name:"Выслеживание", stat:"ИНТ", costMult:1, base:false },
    { name:"Сопротивление пыткам/наркотикам", stat:"ВОЛЯ", costMult:1, base:false },
    { name:"Концентрация", stat:"ВОЛЯ", costMult:1, base:true },
    { name:"Танец", stat:"ЛВК", costMult:1, base:false },
    { name:"Чтение по губам", stat:"ИНТ", costMult:1, base:false },
    { name:"Скрытие/обнаружение объекта", stat:"ИНТ", costMult:1, base:false },
    // Физические
    { name:"Акробатика", stat:"ЛВК", costMult:1, base:false },
    { name:"Атлетика", stat:"ЛВК", costMult:1, base:true },
    { name:"Выносливость", stat:"ВОЛЯ", costMult:1, base:false },
    // Управление
    { name:"Верховая езда", stat:"РЕФ", costMult:1, base:false },
    { name:"Вождение", stat:"РЕФ", costMult:1, base:false },
    { name:"Пилотирование", stat:"РЕФ", costMult:2, base:false },
    { name:"Судовождение", stat:"РЕФ", costMult:1, base:false },
    // Образование
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
    // Рукопашные
    { name:"Боевые искусства", stat:"ЛВК", costMult:2, base:false },
    { name:"Драка", stat:"ЛВК", costMult:1, base:true },
    { name:"Уклонение", stat:"ЛВК", costMult:1, base:true },
    { name:"Холодное оружие", stat:"ЛВК", costMult:1, base:false },
    // Творческие
    { name:"Актёрское мастерство", stat:"КРУТ", costMult:1, base:false },
    { name:"Игра на инструменте", stat:"ТЕХ", costMult:1, base:false },
    // Дальний бой
    { name:"Автоогонь", stat:"РЕФ", costMult:2, base:false },
    { name:"Длинноствольное оружие", stat:"РЕФ", costMult:1, base:false },
    { name:"Короткоствольное оружие", stat:"РЕФ", costMult:1, base:false },
    { name:"Луки и арбалеты", stat:"РЕФ", costMult:1, base:false },
    { name:"Тяжёлое оружие", stat:"РЕФ", costMult:2, base:false },
    // Социальные
    { name:"Взяточничество", stat:"КРУТ", costMult:1, base:false },
    { name:"Гардероб и стиль", stat:"КРУТ", costMult:1, base:false },
    { name:"Допрос", stat:"КРУТ", costMult:1, base:false },
    { name:"Общение", stat:"ЭМП", costMult:1, base:true },
    { name:"Опыт на улицах", stat:"КРУТ", costMult:1, base:false },
    { name:"Проницательность", stat:"ЭМП", costMult:1, base:true },
    { name:"Торговля", stat:"КРУТ", costMult:1, base:false },
    { name:"Убеждение", stat:"КРУТ", costMult:1, base:true },
    { name:"Уход за собой", stat:"КРУТ", costMult:1, base:false },
    // Технические
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

// Шаблоны рекомендуемых навыков для каждой роли (навык → уровень)
const roleTemplates = {
    "Рокербой": { "Композиция":6, "Игра на инструменте":6, "Убеждение":6, "Общение":6, "Гардероб и стиль":4, "Опыт на улицах":6, "Харизматическое влияние":4 },
    "Соло": { "Автоогонь":6, "Короткоствольное оружие":6, "Холодное оружие":6, "Длинноствольное оружие":6, "Уклонение":6, "Тактика":6, "Сопротивление пыткам/наркотикам":6 },
    "Нетраннер": { "Основы техники":6, "Кибертехника":4, "Электроника/безопасность":6, "Криптография":6, "Поиск информации":6, "Скрытность":6, "Интерфейс":4 },
    "Техник": { "Основы техники":6, "Кибертехника":6, "Электроника/безопасность":6, "Оружейная техника":6, "Автомеханика":6, "Взлом замков":4 },
    "Медтех": { "Первая помощь":6, "Парамедицина":6, "Кибертехника":4, "Основы техники":4, "Наука":6, "Сопротивление пыткам/наркотикам":4 },
    "Медиа": { "Композиция":6, "Поиск информации":6, "Общение":6, "Допрос":6, "Фотография/видео":4, "Опыт на улицах":6, "Авторитетность":4 },
    "Законник": { "Криминология":6, "Допрос":6, "Короткоствольное оружие":6, "Убеждение":6, "Выслеживание":6, "Тактика":6, "Подкрепление":4 },
    "Менеджер": { "Бизнес":6, "Бухгалтерия":6, "Бюрократия":6, "Убеждение":6, "Взяточничество":6, "Тактика":4, "Командная работа":4 },
    "Фиксер": { "Торговля":6, "Опыт на улицах":6, "Взяточничество":6, "Убеждение":6, "Фальсификация":6, "Деловая хватка":4 },
    "Кочевник": { "Вождение":6, "Автомеханика":6, "Выживание в дикой местности":6, "Длинноствольное оружие":6, "Скрытность":6, "Мото":4 }
};

export class IdealCharacterBuilder {
    constructor() {
        this.stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        this.init();
    }
    init() {
        this.buildStatsGrid();
        this.buildSkillsGrid();
        this.attachEvents();
        document.getElementById('randomIdealStatsBtn')?.addEventListener('click', () => this.randomizeStats());
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
    randomizeStats() {
    const statIds = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
    let total = 0;
    for (let s of statIds) {
        let val = Math.floor(Math.random() * 7) + 2; // от 2 до 8
        document.getElementById(`idealStat${s}`).value = val;
        total += val;
    }
    this.updateStatsRemaining();
    if (total > 62) {
        alert(`Сумма ХАР = ${total} (максимум 62). Вы можете уменьшить значения вручную.`);
    } else if (total < 62) {
        alert(`Сумма ХАР = ${total}. Осталось ${62 - total} очков для распределения.`);
    } else {
        alert(`Сумма ХАР = 62. Идеально!`);
    }
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

        // Панель управления
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

        // Группируем навыки по категориям
        const categories = this.groupSkillsByCategory();
        for (const [category, skills] of Object.entries(categories)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'skills-category';
            categoryDiv.innerHTML = `
                <div class="category-header" data-category="${category}">
                    <span class="category-toggle">▶</span> <strong>${category}</strong> <span class="skill-count">(${skills.length})</span>
                </div>
                <div class="category-body" style="display: none;">
                    <table class="cyber-table skills-table">
                        <thead><tr><th>Навык</th><th>ХАР</th><th>×2</th><th>Уровень</th></tr></thead>
                        <tbody id="skills-tbody-${category.replace(/\s/g, '')}"></tbody>
                    </table>
                </div>
            `;
            container.appendChild(categoryDiv);
            this.renderCategoryTable(category, skills);
        }

        // Сворачивание/разворачивание
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', () => {
                const body = header.parentElement.querySelector('.category-body');
                const toggle = header.querySelector('.category-toggle');
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
        document.getElementById('skillsSearchInput')?.addEventListener('input', () => this.filterSkills());

        // Применить рекомендованные
        document.getElementById('applyRecommendedSkillsBtn')?.addEventListener('click', () => {
            const role = document.getElementById('idealRoleSelect').value;
            this.applyRecommendedSkills(role);
        });

        // Копировать список навыков
        document.getElementById('copySkillsBtn')?.addEventListener('click', () => this.copySkillsToClipboard());

        this.updateSkillRemaining();
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
        // Удаляем пустые
        for (const cat in categories) {
            if (categories[cat].length === 0) delete categories[cat];
        }
        return categories;
    }

    renderCategoryTable(category, skills) {
        const tbodyId = `skills-tbody-${category.replace(/\s/g, '')}`;
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        let html = '';
        skills.forEach(skill => {
            const defaultValue = skill.base ? 2 : 0;
            html += `<tr class="skill-row" data-skill-name="${skill.name}">
                <td style="white-space: nowrap;">${skill.name}</td>
                <td>${skill.stat}</td>
                <td>${skill.costMult === 2 ? 'да' : 'нет'}</td>
                <td><input type="number" class="skill-level" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="10" value="${defaultValue}" step="1"></td>
            </tr>`;
        });
        tbody.innerHTML = html;
        tbody.querySelectorAll('.skill-level').forEach(input => {
            input.addEventListener('input', () => this.updateSkillRemaining());
        });
    }

    filterSkills() {
        const term = document.getElementById('skillsSearchInput').value.toLowerCase();
        const allRows = document.querySelectorAll('#idealSkillsList .skill-row');
        allRows.forEach(row => {
            const name = row.getAttribute('data-skill-name') || '';
            row.style.display = name.toLowerCase().includes(term) ? '' : 'none';
        });
        // Разворачиваем категории с видимыми строками
        document.querySelectorAll('.skills-category').forEach(cat => {
            const visibleRows = Array.from(cat.querySelectorAll('.skill-row')).some(r => r.style.display !== 'none');
            const body = cat.querySelector('.category-body');
            const toggle = cat.querySelector('.category-toggle');
            if (visibleRows && body.style.display === 'none') {
                body.style.display = 'block';
                if (toggle) toggle.textContent = '▼';
            }
        });
    }

    applyRecommendedSkills(role) {
        const template = roleTemplates[role];
        if (!template) return;
        // Сбросить все навыки на базовые
        for (const skill of allSkills) {
            const defaultValue = skill.base ? 2 : 0;
            const input = document.querySelector(`.skill-level[data-skill="${skill.name}"]`);
            if (input) input.value = defaultValue;
        }
        // Установить рекомендованные
        for (const [skillName, level] of Object.entries(template)) {
            const input = document.querySelector(`.skill-level[data-skill="${skillName}"]`);
            if (input && level <= 10) input.value = level;
        }
        // Базовые навыки минимум 2
        for (const skill of allSkills) {
            if (skill.base) {
                const input = document.querySelector(`.skill-level[data-skill="${skill.name}"]`);
                if (input && parseInt(input.value) < 2) input.value = 2;
            }
        }
        this.updateSkillRemaining();
        alert(`Рекомендованные навыки для ${role} применены.`);
    }

    copySkillsToClipboard() {
        let text = "Навыки персонажа:\n";
        const rows = document.querySelectorAll('#idealSkillsList .skill-row');
        rows.forEach(row => {
            const name = row.querySelector('td:first-child')?.innerText;
            const input = row.querySelector('.skill-level');
            if (name && input) {
                const level = input.value;
                if (level != 0) text += `${name}: ${level}\n`;
            }
        });
        navigator.clipboard.writeText(text).then(() => alert("Список навыков скопирован в буфер обмена!"));
    }

    updateSkillRemaining() {
        let total = 0;
        document.querySelectorAll('.skill-level').forEach(input => {
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