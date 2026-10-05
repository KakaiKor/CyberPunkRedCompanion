// js/modules/wizard/wizard-step-skills.js
import { allSkills, roleTemplates } from '../../data/skills-data.js';
import { skillDescriptions } from '../../data/skills-descriptions.js'; // [TIP]

export function renderSkillsStep(data, skillsList) {
    const userSkills = data.skills || {};
    const role = data.role || 'Соло';                       // [PRIORITY] какая роль выбрана
    const roleTemplate = roleTemplates[role] || {};         // [PRIORITY] карта приоритетов для неё
    const categories = groupSkillsByCategory(skillsList || allSkills);

    let totalSpent = 0;
    for (let skill of (skillsList || allSkills)) {
        const level = userSkills[skill.name] ?? (skill.base ? 2 : 0);
        totalSpent += level * (skill.costMult || 1);
    }
    const remaining = 86 - totalSpent;

    // [PRIORITY] Если для роли вообще есть шаблон — покажем легенду
    const hasAnyPriority = Object.keys(roleTemplate).length > 0;

    return `
        <h3>🎯 Навыки (очков: 86, базовые минимум 2)</h3>
        <div class="skills-budget">Осталось очков: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong></div>

        ${hasAnyPriority ? `
        <div class="skills-priority-legend">
            <span class="legend-title">Роль «${role}»:</span>
            <span class="legend-item"><span class="legend-swatch high"></span> Приоритетный</span>
            <span class="legend-item"><span class="legend-swatch mid"></span> Вторичный</span>
            <span class="legend-item"><span class="legend-swatch low"></span> Рекомендуемый</span>
        </div>
        ` : ''}

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
        const priorityClass = getPriorityClass(skill.name, roleTemplate);   // [PRIORITY]
        // const priorityTitle = getPriorityTitle(priorityClass, role);        // [PRIORITY]
        const desc = skillDescriptions[skill.name];                          // [TIP]
        const infoIcon = desc ? `
            <span class="skill-info-icon" aria-label="Описание навыка">i<span class="skill-tooltip">
                <span class="tip-section"><span class="tip-label">Что это</span><span class="tip-text">${escapeTip(desc.what)}</span></span>
                <span class="tip-section"><span class="tip-label">Как применять</span><span class="tip-text">${escapeTip(desc.how)}</span></span>
            </span></span>` : '';                                              // [TIP]
        return `
                                        <tr data-skill-name="${skill.name}" class="${priorityClass}">
                                            <td>${skill.name}${infoIcon}</td>
                                            <td>${skill.stat}</td>
                                            <td>${skill.costMult === 2 ? 'да' : ''}</td>
                                            <td><input type="number" class="skill-level-table" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="6" value="${current}" step="1"></td>
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

// ============================================================
// [PRIORITY] Хелперы — вне функции, чтобы не пересоздавались
// ============================================================

/**
 * Определяет CSS-класс приоритета навыка для выбранной роли.
 * 6 → высокий, 4 → средний, 2 → низкий, иначе — без класса.
 */
function getPriorityClass(skillName, template) {
    const lvl = template[skillName];
    if (lvl === 6) return 'skill-priority-high';
    if (lvl === 4) return 'skill-priority-mid';
    if (lvl === 2) return 'skill-priority-low';
    return '';
}

/** Текст подсказки при наведении на строку. */
function getPriorityTitle(priorityClass, role) {
    if (priorityClass === 'skill-priority-high') return `★ Приоритетный навык роли «${role}»`;
    if (priorityClass === 'skill-priority-mid')  return `☆ Вторичный навык роли «${role}»`;
    if (priorityClass === 'skill-priority-low')  return `Рекомендуемый навык роли «${role}»`;
    return '';
}

// ============================================================
// [TIP] Хелпер экранирования для содержимого тултипа
// ============================================================

/**
 * Экранирует служебные символы в тексте описания,
 * чтобы тултип не сломал вёрстку и не открыл XSS-дыру.
 */
function escapeTip(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}