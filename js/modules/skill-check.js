// js/modules/skill-check.js
// Калькулятор проверок навыков на странице «Персонаж → Основное».

import { allSkills, roleTemplates } from '../data/skills-data.js';
import { loadCharacter } from '../storage.js';

const STAT_NAMES = {
    INT: 'ИНТ', REF: 'РЕФ', DEX: 'ЛВК', TECH: 'ТЕХ', COOL: 'КРУТ',
    WILL: 'ВОЛЯ', LUCK: 'УДЧ', MOVE: 'СКО', BODY: 'ТЕЛО', EMP: 'ЭМП'
};

const DIFFICULTIES = [9, 13, 15, 17, 21, 24, 29];

// Группировка навыков по категориям (та же, что в wizard-step-skills.js)
const SKILL_CATEGORIES = {
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

export class SkillCheckCalculator {
    constructor() {
        this.history = [];      // последние 5 бросков
        this.maxHistory = 5;

        this.selectEl = document.getElementById('skillCheckSkill');
        this.formulaEl = document.getElementById('skillCheckFormula');
        this.d10El = document.getElementById('skillCheckD10');
        this.modEl = document.getElementById('skillCheckModifier');
        this.luckEl = document.getElementById('skillCheckLuck');
        this.luckMaxEl = document.getElementById('skillCheckLuckMax');
        this.totalEl = document.getElementById('skillCheckTotal');
        this.totalValueEl = this.totalEl?.querySelector('.skill-check-total-value');
        this.diffContainer = document.getElementById('skillCheckDifficulties');
        this.rollBtn = document.getElementById('skillCheckRollBtn');
        this.resetBtn = document.getElementById('skillCheckResetBtn');
        this.historyEl = document.getElementById('skillCheckHistory');

        if (!this.selectEl) return;   // калькулятор не на странице — молча выходим

        this.populateSkills();
        this.refreshLuckMax();
        this.attachEvents();
        this.recalculate();

        // Реакция на обновление персонажа (импорт, повышение навыков и т.п.)
        window.addEventListener('characterUpdated', () => {
            this.refreshLuckMax();
            this.recalculate();
        });
    }

    // ─── Заполнение селекта навыками с группами ─────────────────
    populateSkills() {
        const char = loadCharacter() || {};
        const role = char.role || 'Соло';
        const template = roleTemplates[role] || {};
        const skills = char.skills || {};

        // Собираем: категория → [навыки]
        const map = {};
        for (const cat of Object.keys(SKILL_CATEGORIES)) map[cat] = [];

        for (const skill of allSkills) {
            let placed = false;
            for (const [cat, names] of Object.entries(SKILL_CATEGORIES)) {
                if (names.includes(skill.name)) {
                    map[cat].push(skill);
                    placed = true;
                    break;
                }
            }
            if (!placed) map['Образование'].push(skill);
        }

        // Рендер optgroup'ами
        let html = '<option value="">— выберите навык —</option>';
        for (const [cat, list] of Object.entries(map)) {
            if (!list.length) continue;
            html += `<optgroup label="${cat}">`;
            for (const skill of list) {
                const priority = template[skill.name];
                const star = priority === 6 ? ' ★★' : priority === 4 ? ' ★' : '';
                const lvl = skills[skill.name] ?? (skill.base ? 2 : 0);
                html += `<option value="${skill.name}">${skill.name}${star} · ${skill.stat} · ур. ${lvl}</option>`;
            }
            html += '</optgroup>';
        }
        this.selectEl.innerHTML = html;
    }

    // ─── Обновить пул УДЧ ──────────────────────────────────────
    refreshLuckMax() {
        if (!this.luckMaxEl) return;
        const char = loadCharacter() || {};
        const luck = (char.baseStats && char.baseStats.LUCK) || char.LUCK || 6;
        this.luckMaxEl.textContent = luck;
        if (this.luckEl) this.luckEl.max = luck;
    }

    // ─── Обработчики ───────────────────────────────────────────
    attachEvents() {
        this.selectEl.addEventListener('change', () => this.recalculate());
        this.d10El?.addEventListener('input', () => this.recalculate());
        this.modEl?.addEventListener('input', () => this.recalculate());
        this.luckEl?.addEventListener('input', () => {
            // Ограничиваем УДЧ сверху
            const max = parseInt(this.luckEl.max) || 0;
            let v = parseInt(this.luckEl.value) || 0;
            if (v < 0) v = 0;
            if (v > max) v = max;
            this.luckEl.value = v;
            this.recalculate();
        });

                this.rollBtn?.addEventListener('click', () => {
            const d10 = Math.floor(Math.random() * 10) + 1;
            this.d10El.value = d10;
            this.recalculate();
            // [QUICK-STATS] сообщаем системе о броске
            window.dispatchEvent(new CustomEvent('skillCheckRolled', { detail: { d10 } }));
        });

        this.resetBtn?.addEventListener('click', () => {
            if (this.d10El) this.d10El.value = 5;
            if (this.modEl) this.modEl.value = 0;
            if (this.luckEl) this.luckEl.value = 0;
            this.recalculate();
        });
    }

    // ─── Основной расчёт ───────────────────────────────────────
    recalculate() {
        const skillName = this.selectEl.value;
        const totalValue = this.totalValueEl;

        if (!skillName) {
            this.formulaEl.textContent = 'Выберите навык, чтобы увидеть формулу';
            if (totalValue) {
                totalValue.textContent = '—';
                totalValue.classList.add('is-empty');
            }
            this.clearDifficulties();
            return;
        }

        const char = loadCharacter() || {};
        const skills = char.skills || {};
        const baseStats = char.baseStats || {};
        const role = char.role || 'Соло';
        const template = roleTemplates[role] || {};

        // Находим данные навыка
        const skillData = allSkills.find(s => s.name === skillName);
        const statKey = skillData ? this.statToKey(skillData.stat) : 'INT';
        const statValue = baseStats[statKey] || char[statKey] || 6;
        const skillLevel = skills[skillName] ?? (skillData?.base ? 2 : 0);
        const base = statValue + skillLevel;

        // Формула
        const priority = template[skillName];
        const star = priority === 6 ? ' <span class="formula-priority">★★</span>'
                    : priority === 4 ? ' <span class="formula-priority">★</span>'
                    : '';
        const statLabel = STAT_NAMES[statKey] || statKey;
        this.formulaEl.innerHTML = `<strong>${statLabel} ${statValue}</strong> + <strong>${skillName} ${skillLevel}</strong> = база <strong>${base}</strong>${star}`;

        // Слагаемые
        const d10 = parseInt(this.d10El.value) || 0;
        const mod = parseInt(this.modEl.value) || 0;
        const luck = parseInt(this.luckEl.value) || 0;
        const total = base + d10 + mod + luck;

        // Итог
        if (totalValue) {
            totalValue.textContent = total;
            totalValue.classList.remove('is-empty');
        }

        // Сложности
        this.renderDifficulties(total);
    }

    // ─── Отрисовка СЛ ──────────────────────────────────────────
    renderDifficulties(total) {
        if (!this.diffContainer) return;
        const rows = this.diffContainer.querySelectorAll('.skill-check-diff-row');
        rows.forEach(row => {
            const dv = parseInt(row.dataset.dv);
            const resultEl = row.querySelector('.dv-result');
            row.classList.remove('is-success', 'is-fail', 'is-empty');
            if (total >= dv) {
                row.classList.add('is-success');
                if (resultEl) resultEl.textContent = '✅';
            } else {
                row.classList.add('is-fail');
                if (resultEl) resultEl.textContent = '❌';
            }
        });

        // Добавляем в историю (только когда пользователь ввёл d10 > 0)
        const d10 = parseInt(this.d10El.value) || 0;
        if (d10 > 0) {
            this.maybeAddToHistory({
                skill: this.selectEl.value,
                total,
                d10,
                mod: parseInt(this.modEl.value) || 0,
                luck: parseInt(this.luckEl.value) || 0
            });
        }
    }

    clearDifficulties() {
        if (!this.diffContainer) return;
        const rows = this.diffContainer.querySelectorAll('.skill-check-diff-row');
        rows.forEach(row => {
            row.classList.remove('is-success', 'is-fail');
            row.classList.add('is-empty');
            const resultEl = row.querySelector('.dv-result');
            if (resultEl) resultEl.textContent = '—';
        });
    }

    // ─── История ───────────────────────────────────────────────
    maybeAddToHistory(entry) {
        // Не спамим одинаковыми записями при каждой перерисовке
        const last = this.history[0];
        if (last &&
            last.skill === entry.skill &&
            last.total === entry.total &&
            last.d10 === entry.d10 &&
            last.mod === entry.mod &&
            last.luck === entry.luck) {
            return;
        }
        this.history.unshift(entry);
        if (this.history.length > this.maxHistory) this.history.pop();
        this.renderHistory();
    }

    renderHistory() {
        if (!this.historyEl || !this.history.length) return;
        this.historyEl.innerHTML = `
            <div class="history-title">Последние броски</div>
            ${this.history.map(h => `
                <div class="history-item">
                    <span>${h.skill}</span>
                    <span class="hi-result">${h.total}</span>
                </div>
            `).join('')}
        `;
    }

    // ─── Хелпер: русская ХАР → ключ ────────────────────────────
    statToKey(statRu) {
        for (const [key, val] of Object.entries(STAT_NAMES)) {
            if (val === statRu) return key;
        }
        return statRu;   // если уже ключ — вернуть как есть
    }
}