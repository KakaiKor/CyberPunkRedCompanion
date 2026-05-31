import { getHP } from '../utils.js';
import { saveCharacter } from '../storage.js';
import { detailedCyberware, rangedWeapons, meleeWeapons, armors, gearItems } from '../data.js';

export class CharacterWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.data = this.loadProgress() || {
            role: "Соло",
            stats: { INT:6, REF:6, DEX:6, TECH:6, COOL:6, WILL:6, LUCK:6, MOVE:6, BODY:6, EMP:6 },
            skills: {},
            cyberware: [],
            gear: { weapons: [], armor: { body: "", head: "" }, items: [] },
            styleItems: []
        };
        this.init();
    }

    loadProgress() {
        const saved = localStorage.getItem('wizard_progress');
        return saved ? JSON.parse(saved) : null;
    }

    saveProgress() {
        localStorage.setItem('wizard_progress', JSON.stringify(this.data));
        document.getElementById('wizardStatus').innerHTML = '<span style="color:#39ff14;">✅ Прогресс сохранён</span>';
        setTimeout(() => document.getElementById('wizardStatus').innerHTML = '', 2000);
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
        switch (this.currentStep) {
            case 1: container.innerHTML = this.renderRoleStep(); break;
            case 2: container.innerHTML = this.renderStatsStep(); break;
            case 3: container.innerHTML = this.renderSkillsStep(); break;
            case 4: container.innerHTML = this.renderCyberwareStep(); break;
            case 5: container.innerHTML = this.renderGearStep(); break;
            case 6: container.innerHTML = this.renderSummaryStep(); break;
        }
        this.attachStepEvents();
    }

    renderRoleStep() {
        const roles = ["Рокербой","Соло","Нетраннер","Техник","Медтех","Медиа","Законник","Менеджер","Фиксер","Кочевник"];
        return `
            <h3>Выберите роль</h3>
            <div class="role-selector">
                ${roles.map(r => `<label class="role-option ${this.data.role === r ? 'selected' : ''}"><input type="radio" name="role" value="${r}" ${this.data.role === r ? 'checked' : ''}> ${r}</label>`).join('')}
            </div>
            <p class="note">Роль определяет ваш ролевой навык и стиль игры.</p>
        `;
    }

    renderStatsStep() {
        const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        let total = 0;
        for (let s of stats) total += this.data.stats[s];
        const remaining = 62 - total;
        return `
            <h3>Характеристики (очков: 62)</h3>
            <div class="stats-wizard-grid">
                ${stats.map(s => `
                    <label>${s}: <input type="number" class="stat-input" data-stat="${s}" min="2" max="8" value="${this.data.stats[s]}"></label>
                `).join('')}
            </div>
            <div class="points-counter">Осталось очков: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong></div>
            <button id="randomStatsWizardBtn" class="cyber-btn">🎲 Случайные ХАР</button>
        `;
    }

    renderSkillsStep() {
        const allSkills = this.getAllSkillsList();
        let total = 0;
        for (let [name, level] of Object.entries(this.data.skills)) total += level;
        const remaining = 86 - total;
        return `
            <h3>Навыки (очков: 86, базовые минимум 2)</h3>
            <div class="skills-wizard-list">
                ${allSkills.map(skill => `
                    <div class="skill-wizard-item">
                        <span class="skill-name">${skill.name} (${skill.stat})</span>
                        <input type="number" class="skill-wizard-level" data-skill="${skill.name}" min="0" max="10" value="${this.data.skills[skill.name] || (skill.base ? 2 : 0)}" step="1">
                    </div>
                `).join('')}
            </div>
            <div class="points-counter">Осталось очков: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong></div>
        `;
    }

    renderCyberwareStep() {
        let totalCost = 0;
        for (let item of this.data.cyberware) {
            const found = detailedCyberware.find(c => c.name === item);
            if (found) totalCost += found.cost;
        }
        const remaining = 2550 - totalCost;
        return `
            <h3>Киберимпланты (бюджет: 2550 eb)</h3>
            <div class="cyber-wizard-list">
                ${detailedCyberware.map(cyber => `
                    <label class="cyber-option">
                        <input type="checkbox" value="${cyber.name}" data-cost="${cyber.cost}" ${this.data.cyberware.includes(cyber.name) ? 'checked' : ''}>
                        ${cyber.name} - ${cyber.cost} eb (ПЧ: ${cyber.humanity})
                    </label>
                `).join('')}
            </div>
            <div class="points-counter">Осталось денег: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong> eb</div>
        `;
    }

    renderGearStep() {
        let totalCost = 0;
        for (let w of this.data.gear.weapons) totalCost += this.getItemCost(w);
        if (this.data.gear.armor.body) totalCost += this.getItemCost(this.data.gear.armor.body);
        if (this.data.gear.armor.head) totalCost += this.getItemCost(this.data.gear.armor.head);
        for (let i of this.data.gear.items) totalCost += this.getItemCost(i);
        const remainingMain = 2550 - totalCost;
        let styleCost = 0;
        for (let s of this.data.styleItems) styleCost += this.getItemCost(s);
        const remainingStyle = 800 - styleCost;
        return `
            <h3>Снаряжение (основной бюджет: 2550 eb, стиль: 800 eb)</h3>
            <div class="gear-wizard-grid">
                <div class="gear-category">
                    <h4>Оружие</h4>
                    ${this.renderGearCheckboxes([...rangedWeapons, ...meleeWeapons], 'weapon', this.data.gear.weapons)}
                </div>
                <div class="gear-category">
                    <h4>Броня</h4>
                    ${this.renderGearCheckboxes(armors, 'armor', [this.data.gear.armor.body, this.data.gear.armor.head].filter(Boolean))}
                </div>
                <div class="gear-category">
                    <h4>Снаряжение</h4>
                    ${this.renderGearCheckboxes(gearItems, 'item', this.data.gear.items)}
                </div>
                <div class="gear-category">
                    <h4>Стиль (бюджет 800 eb)</h4>
                    ${this.renderGearCheckboxes(gearItems, 'style', this.data.styleItems)}
                </div>
            </div>
            <div class="points-counter">Основной бюджет: <strong class="${remainingMain < 0 ? 'over' : 'ok'}">${remainingMain}</strong> eb</div>
            <div class="points-counter">Стиль бюджет: <strong class="${remainingStyle < 0 ? 'over' : 'ok'}">${remainingStyle}</strong> eb</div>
        `;
    }

    renderGearCheckboxes(items, type, selectedNames) {
        return items.map(item => `
            <label>
                <input type="checkbox" data-type="${type}" value="${item.name}" data-cost="${item.cost}" ${selectedNames.includes(item.name) ? 'checked' : ''}>
                ${item.name} - ${item.cost} eb
            </label>
        `).join('');
    }

    renderSummaryStep() {
        const hp = getHP(this.data.stats.BODY, this.data.stats.WILL);
        const severe = Math.ceil(hp/2);
        const humanity = this.data.stats.EMP * 10;
        const empFrom = Math.floor(humanity/10);
        return `
            <h3>Итоговый персонаж</h3>
            <div class="wizard-summary">
                <div><strong>Роль:</strong> ${this.data.role}</div>
                <div><strong>ХАР:</strong> ${Object.entries(this.data.stats).map(([k,v])=>`${k}=${v}`).join(', ')}</div>
                <div><strong>ПЗ:</strong> ${hp} (тяж. ≤ ${severe}), Спасбросок: ${this.data.stats.BODY}</div>
                <div><strong>Человечность:</strong> ${humanity} (ЭМП = ${empFrom})</div>
                <div><strong>Киберимпланты:</strong> ${this.data.cyberware.length ? this.data.cyberware.join(', ') : 'нет'}</div>
                <div><strong>Снаряжение:</strong> оружие: ${this.data.gear.weapons.join(', ')}; броня: тело ${this.data.gear.armor.body || '—'}, голова ${this.data.gear.armor.head || '—'}; прочее: ${this.data.gear.items.join(', ')}</div>
                ${this.data.styleItems.length ? `<div><strong>Стиль:</strong> ${this.data.styleItems.join(', ')}</div>` : ''}
            </div>
            <p class="note">Нажмите "Сохранить персонажа", чтобы записать его.</p>
        `;
    }

    attachStepEvents() {
        if (this.currentStep === 2) {
            const inputs = document.querySelectorAll('.stat-input');
            inputs.forEach(inp => inp.addEventListener('change', () => this.updateStats()));
            document.getElementById('randomStatsWizardBtn')?.addEventListener('click', () => this.randomizeStats());
        }
        if (this.currentStep === 3) {
            const inputs = document.querySelectorAll('.skill-wizard-level');
            inputs.forEach(inp => inp.addEventListener('change', () => this.updateSkills()));
        }
        if (this.currentStep === 4) {
            const checkboxes = document.querySelectorAll('.cyber-option input');
            checkboxes.forEach(cb => cb.addEventListener('change', () => this.updateCyberware()));
        }
        if (this.currentStep === 5) {
            const checkboxes = document.querySelectorAll('.gear-category input');
            checkboxes.forEach(cb => cb.addEventListener('change', () => this.updateGear()));
        }
    }

    updateStats() {
        const inputs = document.querySelectorAll('.stat-input');
        inputs.forEach(inp => {
            const stat = inp.dataset.stat;
            this.data.stats[stat] = parseInt(inp.value) || 2;
        });
        this.saveProgress();
        this.renderStep(); // перерисовка для обновления счётчика
    }

    randomizeStats() {
        const stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        stats.forEach(s => this.data.stats[s] = Math.floor(Math.random() * 7) + 2);
        this.saveProgress();
        this.renderStep();
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

    updateCyberware() {
        const checkboxes = document.querySelectorAll('.cyber-option input');
        this.data.cyberware = [];
        checkboxes.forEach(cb => {
            if (cb.checked) this.data.cyberware.push(cb.value);
        });
        this.saveProgress();
        this.renderStep();
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
        // Восприятие
        { name:"Восприятие", stat:"ИНТ", base:true, costMult:1 },
        { name:"Скрытность", stat:"ЛВК", base:true, costMult:1 },
        { name:"Выслеживание", stat:"ИНТ", base:false, costMult:1 },
        { name:"Сопротивление пыткам/наркотикам", stat:"ВОЛЯ", base:false, costMult:1 },
        { name:"Концентрация", stat:"ВОЛЯ", base:true, costMult:1 },
        { name:"Танец", stat:"ЛВК", base:false, costMult:1 },
        { name:"Скрытие/обнаружение объекта", stat:"ИНТ", base:false, costMult:1 },
        { name:"Чтение по губам", stat:"ИНТ", base:false, costMult:1 },
        // Физические
        { name:"Акробатика", stat:"ЛВК", base:false, costMult:1 },
        { name:"Атлетика", stat:"ЛВК", base:true, costMult:1 },
        { name:"Выносливость", stat:"ВОЛЯ", base:false, costMult:1 },
        // Управления
        { name:"Верховая езда", stat:"РЕФ", base:false, costMult:1 },
        { name:"Вождение", stat:"РЕФ", base:false, costMult:1 },
        { name:"Пилотирование", stat:"РЕФ", base:false, costMult:2 },  // ×2
        { name:"Судовождение", stat:"РЕФ", base:false, costMult:1 },
        // Образования
        { name:"Азартные игры", stat:"ИНТ", base:false, costMult:1 },
        { name:"Бизнес", stat:"ИНТ", base:false, costMult:1 },
        { name:"Бухгалтерия", stat:"ИНТ", base:false, costMult:1 },
        { name:"Бюрократия", stat:"ИНТ", base:false, costMult:1 },
        { name:"Выживание в дикой местности", stat:"ИНТ", base:false, costMult:1 },
        { name:"Дедукция", stat:"ИНТ", base:false, costMult:1 },
        { name:"Знание района", stat:"ИНТ", base:true, costMult:1 },  // для «твоего дома»
        { name:"Композиция", stat:"ИНТ", base:false, costMult:1 },
        { name:"Криминология", stat:"ИНТ", base:false, costMult:1 },
        { name:"Криптография", stat:"ИНТ", base:false, costMult:1 },
        { name:"Наука", stat:"ИНТ", base:false, costMult:1 },
        { name:"Образование", stat:"ИНТ", base:true, costMult:1 },
        { name:"Обращение с животными", stat:"ИНТ", base:false, costMult:1 },
        { name:"Поиск информации", stat:"ИНТ", base:false, costMult:1 },
        { name:"Тактика", stat:"ИНТ", base:false, costMult:1 },
        { name:"Язык", stat:"ИНТ", base:true, costMult:1 },  // родной и уличный сленг
        // Рукопашного боя
        { name:"Боевые искусства", stat:"ЛВК", base:false, costMult:2 },  // ×2
        { name:"Драка", stat:"ЛВК", base:true, costMult:1 },
        { name:"Уклонение", stat:"ЛВК", base:true, costMult:1 },
        { name:"Холодное оружие", stat:"ЛВК", base:false, costMult:1 },
        // Творческие
        { name:"Актёрское мастерство", stat:"КРУТ", base:false, costMult:1 },
        { name:"Игра на инструменте", stat:"ТЕХ", base:false, costMult:1 },
        // Боя на дистанции
        { name:"Автоогонь", stat:"РЕФ", base:false, costMult:2 },  // ×2
        { name:"Длинноствольное оружие", stat:"РЕФ", base:false, costMult:1 },
        { name:"Короткоствольное оружие", stat:"РЕФ", base:false, costMult:1 },
        { name:"Луки и арбалеты", stat:"РЕФ", base:false, costMult:1 },
        { name:"Тяжёлое оружие", stat:"РЕФ", base:false, costMult:2 },  // ×2
        // Социальные
        { name:"Взяточничество", stat:"КРУТ", base:false, costMult:1 },
        { name:"Гардероб и стиль", stat:"КРУТ", base:false, costMult:1 },
        { name:"Допрос", stat:"КРУТ", base:false, costMult:1 },
        { name:"Общение", stat:"ЭМП", base:true, costMult:1 },
        { name:"Опыт на улицах", stat:"КРУТ", base:false, costMult:1 },
        { name:"Проницательность", stat:"ЭМП", base:true, costMult:1 },
        { name:"Торговля", stat:"КРУТ", base:false, costMult:1 },
        { name:"Убеждение", stat:"КРУТ", base:true, costMult:1 },
        { name:"Уход за собой", stat:"КРУТ", base:false, costMult:1 },
        // Технические
        { name:"Авиатехника", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Автомеханика", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Взлом замков", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Взрывотехника", stat:"ТЕХ", base:false, costMult:2 },  // ×2
        { name:"Живопись/рисование/скульптура", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Карманная кража", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Кибертехника", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Оружейная техника", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Основы техники", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Парамедицина", stat:"ТЕХ", base:false, costMult:2 },  // ×2
        { name:"Первая помощь", stat:"ТЕХ", base:true, costMult:1 },
        { name:"Судоремонт", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Фальсификация", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Фотография/видео", stat:"ТЕХ", base:false, costMult:1 },
        { name:"Электроника/безопасность", stat:"ТЕХ", base:false, costMult:2 }  // ×2
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
        this.data = this.loadProgress() || { role:"Соло", stats:{ INT:6,REF:6,DEX:6,TECH:6,COOL:6,WILL:6,LUCK:6,MOVE:6,BODY:6,EMP:6 }, skills:{}, cyberware:[], gear:{ weapons:[], armor:{ body:"", head:"" }, items:[] }, styleItems:[] };
        this.renderStep();
    }
}