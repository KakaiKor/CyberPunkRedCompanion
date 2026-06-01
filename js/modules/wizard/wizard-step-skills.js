import { allSkills } from '../../data/skills-data.js';

export function renderSkillsStep(data, skillsList) {
    const userSkills = data.skills || {};
    const categories = groupSkillsByCategory(skillsList || allSkills);
    let totalSpent = 0;
    for (let skill of (skillsList || allSkills)) {
        const level = userSkills[skill.name] ?? (skill.base ? 2 : 0);
        totalSpent += level * (skill.costMult || 1);
    }
    const remaining = 86 - totalSpent;

    return `
        <h3>🎯 Навыки (очков: 86, базовые минимум 2)</h3>
        <div class="skills-budget">Осталось очков: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong></div>
        <div class="skills-controls">
            <input type="text" id="skillsSearchTable" placeholder="🔍 Поиск по названию...">
        </div>
        <div id="skillsTablesContainer">
            ${Object.entries(categories).map(([category, skills]) => `
                <div class="skills-category-table" data-category="${category}">
                    <h4 class="collapsible-header">📁 ${category} <span class="collapse-icon">▼</span></h4>
                    <div class="table-wrapper">
                        <table class="cyber-table skills-table">
                            <thead>
                                <tr><th>Навык</th><th>ХАР</th><th>×2</th><th>Уровень</th></tr>
                            </thead>
                            <tbody>
                                ${skills.map(skill => {
        const current = userSkills[skill.name] ?? (skill.base ? 2 : 0);
        return `
                                        <tr data-skill-name="${skill.name}">
                                            <td>${skill.name}</td>
                                            <td>${skill.stat}</td>
                                            <td>${skill.costMult === 2 ? 'да' : ''}</td>
                                            <td><input type="number" class="skill-level-table" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="10" value="${current}" step="1"></td>
                                        </tr>
                                    `;
    }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    function groupSkillsByCategory(skills) {
        const map = {
            "Восприятие": [], "Физические": [], "Управление": [], "Образование": [],
            "Рукопашные": [], "Творческие": [], "Дальний бой": [], "Социальные": [], "Технические": []
        };
        const mapping = {
            "Восприятие": ["Восприятие", "Скрытность", "Выслеживание", "Сопротивление пыткам/наркотикам", "Концентрация", "Танец", "Чтение по губам", "Скрытие/обнаружение объекта"],
            "Физические": ["Акробатика", "Атлетика", "Выносливость"],
            "Управление": ["Верховая езда", "Вождение", "Пилотирование", "Судовождение"],
            "Образование": ["Азартные игры", "Бизнес", "Бухгалтерия", "Бюрократия", "Выживание в дикой местности", "Дедукция", "Знание района", "Композиция", "Криминология", "Криптография", "Наука", "Образование", "Обращение с животными", "Поиск информации", "Тактика", "Язык (родной)"],
            "Рукопашные": ["Боевые искусства", "Драка", "Уклонение", "Холодное оружие"],
            "Творческие": ["Актёрское мастерство", "Игра на инструменте"],
            "Дальний бой": ["Автоогонь", "Длинноствольное оружие", "Короткоствольное оружие", "Луки и арбалеты", "Тяжёлое оружие"],
            "Социальные": ["Взяточничество", "Гардероб и стиль", "Допрос", "Общение", "Опыт на улицах", "Проницательность", "Торговля", "Убеждение", "Уход за собой"],
            "Технические": ["Авиатехника", "Автомеханика", "Взлом замков", "Взрывотехника", "Живопись/рисование/скульптура", "Карманная кража", "Кибертехника", "Оружейная техника", "Основы техники", "Парамедицина", "Первая помощь", "Судоремонт", "Фальсификация", "Фотография/видео", "Электроника/безопасность"]
        };
        for (const skill of skills) {
            let placed = false;
            for (const [cat, names] of Object.entries(mapping)) {
                if (names.includes(skill.name)) {
                    map[cat].push(skill);
                    placed = true;
                    break;
                }
            }
            if (!placed) map["Образование"].push(skill);
        }
        for (const cat in map) if (map[cat].length === 0) delete map[cat];
        return map;
    }
}