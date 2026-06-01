// modules/wizard/wizard-core.js
import { getHP } from '../../utils.js';
import { saveCharacter } from '../../storage.js';
import { detailedCyberware, rangedWeapons, meleeWeapons, armors, gearItems } from '../../data.js';

import { renderRoleStep } from './wizard-step-role.js';
import { renderStatsStep } from './wizard-step-stats.js';
import { renderSkillsStep } from './wizard-step-skills.js';
import { renderCyberwareStep } from './wizard-step-cyberware.js';
import { renderGearStep } from './wizard-step-gear.js';
import { renderSummaryStep } from './wizard-step-summary.js';

export class CharacterWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.data = this.loadProgress() || this.getDefaultData();
        this.init();
    }

    getDefaultData() {
        return {
            role: "Соло",
            stats: { INT: 6, REF: 6, DEX: 6, TECH: 6, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 6 },
            skills: {},
            cyberware: [],
            gear: { weapons: [], armor: { body: "", head: "" }, items: [] },
            styleItems: []
        };
    }

    loadProgress() {
        const saved = localStorage.getItem('wizard_progress');
        return saved ? JSON.parse(saved) : null;
    }

    saveProgress() {
        localStorage.setItem('wizard_progress', JSON.stringify(this.data));
        const statusDiv = document.getElementById('wizardStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '<span style="color:#39ff14;">✅ Прогресс сохранён</span>';
            setTimeout(() => statusDiv.innerHTML = '', 2000);
        }
    }

    init() {
        this.renderStep();
        document.getElementById('wizardPrevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('wizardNextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('wizardSaveBtn').addEventListener('click', () => this.saveCharacter());
    }

    renderStep() {
        const container = document.getElementById('wizardContent');
        const steps = document.querySelectorAll('.wizard-steps .step');
        steps.forEach((step, idx) => {
            if (idx + 1 === this.currentStep) step.classList.add('active');
            else step.classList.remove('active');
        });

        const nextBtn = document.getElementById('wizardNextBtn');
        const prevBtn = document.getElementById('wizardPrevBtn');
        const saveBtn = document.getElementById('wizardSaveBtn');
        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        }
        prevBtn.disabled = (this.currentStep === 1);

        let html = '';
        switch (this.currentStep) {
            case 1:
                html = renderRoleStep(this.data);
                break;
            case 2:
                html = renderStatsStep(this.data);
                break;
            case 3:
                html = renderSkillsStep(this.data, this.getAllSkillsList());
                break;
            case 4:
                html = renderCyberwareStep(this.data);
                break;
            case 5:
                html = renderGearStep(this.data, (name) => this.getItemCost(name));
                break;
            case 6:
                html = renderSummaryStep(this.data);
                break;
        }
        container.innerHTML = html;
        this.attachStepEvents();
    }

    attachStepEvents() {
        if (this.currentStep === 2) this.attachStatsEvents();
        if (this.currentStep === 3) this.attachSkillsEvents();
        if (this.currentStep === 4) this.attachCyberwareEvents();
        if (this.currentStep === 5) this.attachGearEvents();
    }

    attachStatsEvents() {
        const inputs = document.querySelectorAll('.stat-input');
        inputs.forEach(inp => inp.addEventListener('change', () => this.updateStats()));
        const randomBtn = document.getElementById('randomStatsWizardBtn');
        if (randomBtn) randomBtn.addEventListener('click', () => this.randomizeStats());
    }

    updateStats() {
        const inputs = document.querySelectorAll('.stat-input');
        inputs.forEach(inp => {
            const stat = inp.dataset.stat;
            this.data.stats[stat] = parseInt(inp.value) || 2;
        });
        this.saveProgress();
        this.renderStep();
    }

    randomizeStats() {
        const stats = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
        stats.forEach(s => this.data.stats[s] = Math.floor(Math.random() * 7) + 2);
        this.saveProgress();
        this.renderStep();
    }

    attachSkillsEvents() {
        const inputs = document.querySelectorAll('.skill-wizard-level');
        inputs.forEach(inp => inp.addEventListener('change', () => this.updateSkills()));
    }

    updateSkills() {
        const inputs = document.querySelectorAll('.skill-wizard-level');
        inputs.forEach(inp => {
            const skill = inp.dataset.skill;
            this.data.skills[skill] = parseInt(inp.value) || 0;
        });
        this.saveProgress();
        this.renderStep();
    }

    attachCyberwareEvents() {
        const checkboxes = document.querySelectorAll('.cyber-option input');
        checkboxes.forEach(cb => cb.addEventListener('change', () => this.updateCyberware()));
    }

    updateCyberware() {
        const checkboxes = document.querySelectorAll('.cyber-option input');
        this.data.cyberware = [];
        checkboxes.forEach(cb => {
            if (cb.checked) this.data.cyberware.push(cb.value);
        });
        this.saveProgress();
        this.renderStep();
    }

    attachGearEvents() {
        const checkboxes = document.querySelectorAll('.gear-category input');
        checkboxes.forEach(cb => cb.addEventListener('change', () => this.updateGear()));
    }

    updateGear() {
        const checkboxes = document.querySelectorAll('.gear-category input');
        this.data.gear.weapons = [];
        this.data.gear.armor.body = "";
        this.data.gear.armor.head = "";
        this.data.gear.items = [];
        this.data.styleItems = [];
        checkboxes.forEach(cb => {
            if (!cb.checked) return;
            const type = cb.dataset.type;
            const name = cb.value;
            if (type === 'weapon') this.data.gear.weapons.push(name);
            else if (type === 'armor') {
                if (!this.data.gear.armor.body) this.data.gear.armor.body = name;
                else if (!this.data.gear.armor.head) this.data.gear.armor.head = name;
            } else if (type === 'item') this.data.gear.items.push(name);
            else if (type === 'style') this.data.styleItems.push(name);
        });
        this.saveProgress();
        this.renderStep();
    }

    getItemCost(name) {
        const all = [...rangedWeapons, ...meleeWeapons, ...armors, ...gearItems];
        const found = all.find(i => i.name === name);
        return found ? found.cost : 0;
    }

    getAllSkillsList() {
        return [
            { name: "Восприятие", stat: "ИНТ", base: true, costMult: 1 },
            { name: "Скрытность", stat: "ЛВК", base: true, costMult: 1 },
            { name: "Выслеживание", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Сопротивление пыткам/наркотикам", stat: "ВОЛЯ", base: false, costMult: 1 },
            { name: "Концентрация", stat: "ВОЛЯ", base: true, costMult: 1 },
            { name: "Танец", stat: "ЛВК", base: false, costMult: 1 },
            { name: "Скрытие/обнаружение объекта", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Чтение по губам", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Акробатика", stat: "ЛВК", base: false, costMult: 1 },
            { name: "Атлетика", stat: "ЛВК", base: true, costMult: 1 },
            { name: "Выносливость", stat: "ВОЛЯ", base: false, costMult: 1 },
            { name: "Верховая езда", stat: "РЕФ", base: false, costMult: 1 },
            { name: "Вождение", stat: "РЕФ", base: false, costMult: 1 },
            { name: "Пилотирование", stat: "РЕФ", base: false, costMult: 2 },
            { name: "Судовождение", stat: "РЕФ", base: false, costMult: 1 },
            { name: "Азартные игры", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Бизнес", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Бухгалтерия", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Бюрократия", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Выживание в дикой местности", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Дедукция", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Знание района", stat: "ИНТ", base: true, costMult: 1 },
            { name: "Композиция", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Криминология", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Криптография", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Наука", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Образование", stat: "ИНТ", base: true, costMult: 1 },
            { name: "Обращение с животными", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Поиск информации", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Тактика", stat: "ИНТ", base: false, costMult: 1 },
            { name: "Язык", stat: "ИНТ", base: true, costMult: 1 },
            { name: "Боевые искусства", stat: "ЛВК", base: false, costMult: 2 },
            { name: "Драка", stat: "ЛВК", base: true, costMult: 1 },
            { name: "Уклонение", stat: "ЛВК", base: true, costMult: 1 },
            { name: "Холодное оружие", stat: "ЛВК", base: false, costMult: 1 },
            { name: "Актёрское мастерство", stat: "КРУТ", base: false, costMult: 1 },
            { name: "Игра на инструменте", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Автоогонь", stat: "РЕФ", base: false, costMult: 2 },
            { name: "Длинноствольное оружие", stat: "РЕФ", base: false, costMult: 1 },
            { name: "Короткоствольное оружие", stat: "РЕФ", base: false, costMult: 1 },
            { name: "Луки и арбалеты", stat: "РЕФ", base: false, costMult: 1 },
            { name: "Тяжёлое оружие", stat: "РЕФ", base: false, costMult: 2 },
            { name: "Взяточничество", stat: "КРУТ", base: false, costMult: 1 },
            { name: "Гардероб и стиль", stat: "КРУТ", base: false, costMult: 1 },
            { name: "Допрос", stat: "КРУТ", base: false, costMult: 1 },
            { name: "Общение", stat: "ЭМП", base: true, costMult: 1 },
            { name: "Опыт на улицах", stat: "КРУТ", base: false, costMult: 1 },
            { name: "Проницательность", stat: "ЭМП", base: true, costMult: 1 },
            { name: "Торговля", stat: "КРУТ", base: false, costMult: 1 },
            { name: "Убеждение", stat: "КРУТ", base: true, costMult: 1 },
            { name: "Уход за собой", stat: "КРУТ", base: false, costMult: 1 },
            { name: "Авиатехника", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Автомеханика", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Взлом замков", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Взрывотехника", stat: "ТЕХ", base: false, costMult: 2 },
            { name: "Живопись/рисование/скульптура", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Карманная кража", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Кибертехника", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Оружейная техника", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Основы техники", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Парамедицина", stat: "ТЕХ", base: false, costMult: 2 },
            { name: "Первая помощь", stat: "ТЕХ", base: true, costMult: 1 },
            { name: "Судоремонт", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Фальсификация", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Фотография/видео", stat: "ТЕХ", base: false, costMult: 1 },
            { name: "Электроника/безопасность", stat: "ТЕХ", base: false, costMult: 2 }
        ];
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderStep();
        }
    }

    nextStep() {
        if (!this.validateStep()) return;
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.renderStep();
        }
    }

    validateStep() {
        if (this.currentStep === 2) {
            let total = 0;
            for (let s in this.data.stats) total += this.data.stats[s];
            if (total !== 62) {
                alert("Сумма ХАР должна быть ровно 62!");
                return false;
            }
        }
        if (this.currentStep === 3) {
            let total = 0;
            for (let lvl of Object.values(this.data.skills)) total += lvl;
            if (total > 86) {
                alert("Превышение очков навыков (максимум 86)");
                return false;
            }
        }
        if (this.currentStep === 4) {
            let totalCost = 0;
            for (let item of this.data.cyberware) {
                const found = detailedCyberware.find(c => c.name === item);
                if (found) totalCost += found.cost;
            }
            if (totalCost > 2550) {
                alert("Слишком много киберимплантов! Бюджет 2550 eb");
                return false;
            }
        }
        if (this.currentStep === 5) {
            let totalMain = 0;
            for (let w of this.data.gear.weapons) totalMain += this.getItemCost(w);
            if (this.data.gear.armor.body) totalMain += this.getItemCost(this.data.gear.armor.body);
            if (this.data.gear.armor.head) totalMain += this.getItemCost(this.data.gear.armor.head);
            for (let i of this.data.gear.items) totalMain += this.getItemCost(i);
            let totalStyle = 0;
            for (let s of this.data.styleItems) totalStyle += this.getItemCost(s);
            if (totalMain > 2550 || totalStyle > 800) {
                alert("Превышен бюджет! Основной: 2550 eb, стиль: 800 eb");
                return false;
            }
        }
        return true;
    }

    saveCharacter() {
        const char = {
            name: "Новый персонаж",
            role: this.data.role,
            ...this.data.stats,
            skills: this.data.skills,
            cyberware: this.data.cyberware,
            gear: this.data.gear,
            style: this.data.styleItems
        };
        saveCharacter(char);
        alert("Персонаж сохранён! Вы можете найти его в блоке 'Основное' (кнопка 'Загрузить').");
        localStorage.removeItem('wizard_progress');
        this.currentStep = 1;
        this.data = this.getDefaultData();
        this.renderStep();
    }
}