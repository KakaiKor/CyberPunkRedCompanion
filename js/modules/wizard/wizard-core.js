// modules/wizard/wizard-core.js
import { getHP } from '../../utils.js';
import { saveCharacter } from '../../storage.js';
import { detailedCyberware, rangedWeapons, meleeWeapons, armors, gearItems } from '../../data.js';
import { allSkills } from '../../data/skills-data.js';

import { renderIdentityStep } from './wizard-step-identity.js';
import { renderRoleStep } from './wizard-step-role.js';
import { renderStatsStep } from './wizard-step-stats.js';
import { renderGearStep } from './wizard-step-gear.js';
import { renderSkillsStep } from './wizard-step-skills.js';
import { renderCyberwareStep } from './wizard-step-cyberware.js';
import { renderStyleStep } from './wizard-step-style.js';
import { renderHumanityStep } from './wizard-step-humanity.js';
import { renderExpensesStep } from './wizard-step-expenses.js';
import { renderNotesStep } from './wizard-step-notes.js';
import { renderSummaryStep } from './wizard-step-summary.js';

export class CharacterWizard {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 11;
        this.data = this.loadProgress() || this.getDefaultData();
        this._validating = false;
        this.init();
    }

    getDefaultData() {
        return {
            name: "Новый персонаж",
            culture: "Европа",
            role: "Соло",
            roleRank: 4,
            stats: { INT: 6, REF: 6, DEX: 6, TECH: 6, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 6 },
            skills: {},
            cyberware: [],
            gear: { weapons: [], armor: { body: "", head: "" }, items: [] },
            styleItems: [],
            lifestyle: "100",
            housing: "500",
            notes: "",
            totalSpentOnGearAndCyber: 0,
            avatar: "",
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

    saveGearBackup() {
        const currentHasGear = (this.data.gear.weapons && this.data.gear.weapons.length > 0) ||
                               (this.data.gear.armor && (this.data.gear.armor.body || this.data.gear.armor.head)) ||
                               (this.data.gear.items && this.data.gear.items.length > 0);
        if (currentHasGear) {
            localStorage.setItem('wizard_gear_backup', JSON.stringify(this.data.gear));
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
        if (idx === this.currentStep) step.classList.add('active');
        else step.classList.remove('active');
    });

    const nextBtn = document.getElementById('wizardNextBtn');
    const prevBtn = document.getElementById('wizardPrevBtn');
    const saveBtn = document.getElementById('wizardSaveBtn');
    if (this.currentStep === this.totalSteps - 1) {
        nextBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
    }
    prevBtn.disabled = (this.currentStep === 0);

    let html = '';
    switch (this.currentStep) {
        case 0: html = renderIdentityStep(this.data); break;
        case 1: html = renderRoleStep(this.data); break;
        case 2: html = renderStatsStep(this.data); break;
        case 3: html = renderGearStep(this.data, (name) => this.getItemCost(name)); break;
        case 4: html = renderSkillsStep(this.data, this.getAllSkillsList()); break;
        case 5: html = renderCyberwareStep(this.data); break;
        case 6: html = renderStyleStep(this.data, (name) => this.getItemCost(name)); break;
        case 7: html = renderHumanityStep(this.data); break;
        case 8: html = renderExpensesStep(this.data); break;
        case 9: html = renderNotesStep(this.data); break;
        case 10: html = renderSummaryStep(this.data); break;
        default: html = '<p>Ошибка: шаг не найден</p>';
    }
    container.innerHTML = html;

    // ========== НАВИГАЦИЯ ПО ШАГАМ С ВАЛИДАЦИЕЙ ==========
    document.querySelectorAll('.wizard-steps .step').forEach((el, idx) => {
    el.style.cursor = 'pointer';
    el.removeEventListener('click', this._stepHandler);
    this._stepHandler = () => {
        if (idx === this.currentStep) return;
        this.currentStep = idx;
        this.renderStep();
    };
    el.addEventListener('click', this._stepHandler);
});

    this.attachStepEvents();
}

    attachStepEvents() {
        if (this.currentStep === 0) this.attachIdentityEvents();
        if (this.currentStep === 1) this.attachRoleEvents();
        if (this.currentStep === 2) this.attachStatsEvents();
        if (this.currentStep === 3) this.attachGearEvents();
        if (this.currentStep === 4) this.attachSkillsEvents();
        if (this.currentStep === 5) this.attachCyberwareEvents();
        if (this.currentStep === 6) this.attachStyleEvents();
        if (this.currentStep === 7) this.attachHumanityEvents();
        if (this.currentStep === 8) this.attachExpensesEvents();
        if (this.currentStep === 9) this.attachNotesEvents();
        if (this.currentStep === 10) this.attachSummaryEvents();
    }

    // ========== ОБРАБОТЧИКИ ==========
    attachIdentityEvents() {
    const nameInput = document.getElementById('charNameInput');
    const cultureSelect = document.getElementById('charCulture');
    const avatarInput = document.getElementById('avatarInput');
    if (nameInput) nameInput.addEventListener('input', () => this.updateIdentity());
    if (cultureSelect) cultureSelect.addEventListener('change', () => this.updateIdentity());
    if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            // Ограничение размера файла (2 МБ)
            if (file.size > 2 * 1024 * 1024) {
                alert('Изображение слишком большое! Максимум 2 МБ.');
                avatarInput.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                // Сжимаем изображение через Image и canvas
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxSize = 300; // максимальная ширина/высота аватарки
                    let width = img.width;
                    let height = img.height;
                    if (width > maxSize || height > maxSize) {
                        const ratio = Math.min(maxSize / width, maxSize / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/jpeg', 0.7); // качество 70%
                    this.data.avatar = compressed;
                    this.saveProgress();
                    const previewDiv = document.getElementById('avatarPreview');
                    if (previewDiv) previewDiv.innerHTML = `<img src="${compressed}" style="width:80px; height:80px; border-radius:50%; object-fit:cover;">`;
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}
}
    updateIdentity() {
        this.data.name = document.getElementById('charNameInput')?.value || '';
        this.data.culture = document.getElementById('charCulture')?.value || 'Европа';
        this.saveProgress();
    }

    attachRoleEvents() {
    // Обработчики для карточек ролей (стильные)
    const roleCards = document.querySelectorAll('.role-card-v2');
    roleCards.forEach(card => {
        card.removeEventListener('click', this._roleCardHandler);
        this._roleCardHandler = () => {
            const newRole = card.dataset.role;
            if (newRole && this.data.role !== newRole) {
                this.data.role = newRole;
                this.saveProgress();
                this.renderStep(); // перерисовываем шаг
            }
        };
        card.addEventListener('click', this._roleCardHandler);
    });
    
    // Также старые радиокнопки (если они есть)
    const roleRadios = document.querySelectorAll('input[name="role"]');
    roleRadios.forEach(radio => {
        radio.removeEventListener('change', this._roleRadioHandler);
        this._roleRadioHandler = () => {
            this.data.role = radio.value;
            this.saveProgress();
            this.renderStep();
        };
        radio.addEventListener('change', this._roleRadioHandler);
    });

    const rankInput = document.getElementById('roleRank');
    if (rankInput) {
        rankInput.removeEventListener('change', this._roleRankHandler);
        this._roleRankHandler = () => {
            this.data.roleRank = parseInt(rankInput.value) || 4;
            this.saveProgress();
        };
        rankInput.addEventListener('change', this._roleRankHandler);
    }
}

    attachStatsEvents() {
        const inputs = document.querySelectorAll('.stat-input');
        const update = () => this.updateStats();
        inputs.forEach(inp => {
            inp.addEventListener('input', update);
            inp.addEventListener('change', update);
        });
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
        let total = 0;
        for (let s in this.data.stats) total += this.data.stats[s];
        const remaining = 62 - total;
        const counterSpan = document.querySelector('.points-counter strong');
        if (counterSpan) {
            counterSpan.innerText = remaining;
            counterSpan.className = remaining < 0 ? 'over' : 'ok';
        }
    }
    randomizeStats() {
        const stats = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
        stats.forEach(s => this.data.stats[s] = Math.floor(Math.random() * 7) + 2);
        this.saveProgress();
        this.renderStep();
    }

    attachGearEvents() {
        const filterSelect = document.getElementById('gearCategoryFilter');
        const weaponsSection = document.getElementById('weaponsSection');
        const armorSection = document.getElementById('armorSection');
        const itemsSection = document.getElementById('itemsSection');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (weaponsSection) weaponsSection.style.display = (val === 'all' || val === 'weapons') ? 'block' : 'none';
                if (armorSection) armorSection.style.display = (val === 'all' || val === 'armor') ? 'block' : 'none';
                if (itemsSection) itemsSection.style.display = (val === 'all' || val === 'items') ? 'block' : 'none';
            });
        }
        const searchInput = document.getElementById('gearSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('#weaponsSection .cyber-table tbody tr, #armorSection .cyber-table tbody tr, #itemsSection .cyber-table tbody tr').forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        }
        if (this._gearHandler) document.removeEventListener('change', this._gearHandler);
        this._gearHandler = (e) => {
            if (e.target && (e.target.type === 'checkbox' || e.target.type === 'radio')) {
                this.updateGearFromDOM();
            }
        };
        document.addEventListener('change', this._gearHandler);
    }

    updateGearFromDOM() {
        if (this.currentStep !== 3) return;
        const weaponCheckboxes = document.querySelectorAll('#weaponsSection input[type="checkbox"]:checked');
        this.data.gear.weapons = Array.from(weaponCheckboxes).map(cb => cb.value);
        const armorBody = document.querySelector('#armorSection input[data-slot="body"]:checked');
        this.data.gear.armor.body = armorBody ? armorBody.value : '';
        const armorHead = document.querySelector('#armorSection input[data-slot="head"]:checked');
        this.data.gear.armor.head = armorHead ? armorHead.value : '';
        const itemCheckboxes = document.querySelectorAll('#itemsSection input[type="checkbox"]:checked');
        this.data.gear.items = Array.from(itemCheckboxes).map(cb => cb.value);
        this.updateTotalSpent();
        this.updateGearBudgetDisplay();
        this.saveProgress();
        this.saveGearBackup();
    }

    updateTotalSpent() {
        let total = 0;
        for (let w of this.data.gear.weapons) total += this.getItemCost(w);
        if (this.data.gear.armor.body) total += this.getItemCost(this.data.gear.armor.body);
        if (this.data.gear.armor.head) total += this.getItemCost(this.data.gear.armor.head);
        for (let i of this.data.gear.items) total += this.getItemCost(i);
        for (let c of this.data.cyberware) total += this.getItemCost(c);
        this.data.totalSpentOnGearAndCyber = total;
        this.saveProgress();
        this.updateGearBudgetDisplay();
        this.updateCyberBudgetDisplay();
        return total;
    }

    updateGearBudgetDisplay() {
        const remaining = 2550 - this.data.totalSpentOnGearAndCyber;
        const budgetSpan = document.querySelector('.gear-budget strong');
        if (budgetSpan) {
            budgetSpan.innerText = remaining;
            budgetSpan.className = remaining < 0 ? 'over' : 'ok';
        }
    }

    updateCyberBudgetDisplay() {
        const remaining = 2550 - this.data.totalSpentOnGearAndCyber;
        const budgetSpan = document.querySelector('.cyber-budget-info strong');
        if (budgetSpan) {
            budgetSpan.innerText = remaining;
            budgetSpan.className = remaining < 0 ? 'over' : 'ok';
        }
    }

    attachSkillsEvents() {
        const handleSkillInput = (e) => {
            if (e.target && e.target.classList.contains('skill-level-table')) {
                this.updateSkills();
            }
        };
        if (this._skillHandler) {
            document.removeEventListener('input', this._skillHandler);
            document.removeEventListener('change', this._skillHandler);
        }
        this._skillHandler = handleSkillInput;
        document.addEventListener('input', this._skillHandler);
        document.addEventListener('change', this._skillHandler);
    }

    updateSkills() {
        const inputs = document.querySelectorAll('.skill-level-table');
        inputs.forEach(inp => {
            const skill = inp.dataset.skill;
            let val = parseInt(inp.value);
            if (isNaN(val)) val = 0;
            if (val > 6) val = 6;
            inp.value = val;
            this.data.skills[skill] = val;
        });
        this.saveProgress();
        this.updateSkillsBudgetDisplay();
    }

    updateSkillsBudgetDisplay() {
        let total = 0;
        const skillsList = this.getAllSkillsList();
        for (let skill of skillsList) {
            const level = this.data.skills[skill.name] ?? (skill.base ? 2 : 0);
            total += level * (skill.costMult || 1);
        }
        const remaining = 86 - total;
        const budgetSpan = document.querySelector('.skills-budget strong');
        if (budgetSpan) {
            budgetSpan.innerText = remaining;
            budgetSpan.className = remaining < 0 ? 'over' : 'ok';
        }
    }

    attachCyberwareEvents() {
        if (this._cyberHandler) document.removeEventListener('change', this._cyberHandler);
        this._cyberHandler = (e) => {
            if (e.target && e.target.classList.contains('cyber-checkbox-table')) {
                this.updateCyberware();
            }
        };
        document.addEventListener('change', this._cyberHandler);
    }

    updateCyberware() {
        const checkboxes = document.querySelectorAll('.cyber-checkbox-table:checked');
        this.data.cyberware = Array.from(checkboxes).map(cb => cb.value);
        this.updateTotalSpent();
        this.saveProgress();
    }

    attachStyleEvents() {
        if (this._styleHandler) document.removeEventListener('change', this._styleHandler);
        this._styleHandler = (e) => {
            if (e.target && e.target.classList.contains('style-checkbox')) {
                this.updateStyle();
            }
        };
        document.addEventListener('change', this._styleHandler);
    }

    updateStyle() {
        const checkboxes = document.querySelectorAll('.style-checkbox:checked');
        this.data.styleItems = Array.from(checkboxes).map(cb => cb.value);
        this.saveProgress();
        this.renderStep();
    }

    attachHumanityEvents() {}
    attachExpensesEvents() {
        const lifestyleSelect = document.getElementById('expensesLifestyle');
        const housingSelect = document.getElementById('expensesHousing');
        if (lifestyleSelect) lifestyleSelect.addEventListener('change', () => this.updateExpenses());
        if (housingSelect) housingSelect.addEventListener('change', () => this.updateExpenses());
    }
    updateExpenses() {
        this.data.lifestyle = document.getElementById('expensesLifestyle')?.value || '100';
        this.data.housing = document.getElementById('expensesHousing')?.value || '500';
        this.saveProgress();
        this.renderStep();
    }

    attachNotesEvents() {
        const notesText = document.getElementById('charNotes');
        if (notesText) notesText.addEventListener('input', () => this.updateNotes());
    }
    updateNotes() {
        this.data.notes = document.getElementById('charNotes')?.value || '';
        this.saveProgress();
    }

    attachSummaryEvents() {
    const healBtn = document.querySelector('.heal-btn');
    const damageBtn = document.querySelector('.damage-btn');
    const exportBtn = document.getElementById('exportPngBtn');

    // Обработчик лечения
    if (healBtn) {
        healBtn.addEventListener('click', () => {
            // Ищем элемент с текущим ПЗ в карточке
            const hpSpan = document.querySelector('.current-hp');
            if (!hpSpan) {
                console.warn('Элемент .current-hp не найден');
                return;
            }
            const current = parseInt(hpSpan.innerText);
            const maxHp = parseInt(hpSpan.innerText.split('/')[1]?.trim() || hpSpan.innerText);
            const body = this.data.stats?.BODY || 6;
            const newHp = Math.min(current + body, maxHp);
            hpSpan.innerText = newHp;
            // Также обновим data (если нужно для сохранения)
            this.data.currentHp = newHp;
        });
    }

    // Обработчик урона
    if (damageBtn) {
        damageBtn.addEventListener('click', () => {
            const dmg = prompt('Введите урон:');
            if (dmg !== null) {
                const hpSpan = document.querySelector('.current-hp');
                if (!hpSpan) return;
                let current = parseInt(hpSpan.innerText);
                const maxHp = parseInt(hpSpan.innerText.split('/')[1]?.trim() || hpSpan.innerText);
                let newHp = Math.max(0, current - parseInt(dmg));
                hpSpan.innerText = newHp;
                const severe = Math.ceil(maxHp / 2);
                if (newHp <= severe && newHp > 0) alert('⚠️ Тяжёлое ранение! Штраф -2 ко всем действиям.');
                if (newHp <= 0) alert('💀 Смертельное ранение! Требуется спасбросок.');
                this.data.currentHp = newHp;
            }
        });
    }

    // Кнопка PNG (уже есть)
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const card = document.querySelector('.character-card');
            if (card && typeof html2canvas !== 'undefined') {
                html2canvas(card, { scale: 2, backgroundColor: null }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `${this.data.name || 'character'}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                });
            } else {
                alert('Библиотека html2canvas не загружена.');
            }
        });
    }
}

    getItemCost(name) {
        const all = [...rangedWeapons, ...meleeWeapons, ...armors, ...gearItems, ...detailedCyberware];
        const found = all.find(i => i.name === name);
        return found ? found.cost : 0;
    }

    getAllSkillsList() {
        return allSkills;
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    nextStep() {
        if (!this.validateStep()) return;
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.renderStep();
        }
    }

    validateStep() {
    // Защита от рекурсивного вызова
    if (this._validating) return true;
    this._validating = true;
    let valid = true;

    try {
        // Шаг 2: ХАР
        if (this.currentStep === 2) {
            const inputs = document.querySelectorAll('.stat-input');
            inputs.forEach(inp => {
                const stat = inp.dataset.stat;
                this.data.stats[stat] = parseInt(inp.value) || 2;
            });
            let total = 0;
            for (let s in this.data.stats) total += this.data.stats[s];
            if (total !== 62) {
                alert(`Сумма ХАР должна быть ровно 62! Сейчас ${total}. Осталось ${62 - total} очков.`);
                valid = false;
            }
        }
        // Шаг 4: Навыки
        else if (this.currentStep === 4) {
            const skillsList = this.getAllSkillsList();
            const mandatorySkills = [
                "Атлетика", "Драка", "Концентрация", "Общение", "Образование",
                "Уклонение", "Первая помощь", "Проницательность", "Язык (родной)",
                "Знание района", "Восприятие", "Убеждение", "Скрытность"
            ];
            let totalSpent = 0;
            for (let skill of skillsList) {
                const level = this.data.skills[skill.name] ?? (skill.base ? 2 : 0);
                if (level > 6) {
                    alert(`Навык "${skill.name}" не может быть выше 6 уровня!`);
                    valid = false;
                    break;
                }
                if (mandatorySkills.includes(skill.name) && level < 2) {
                    alert(`Обязательный навык "${skill.name}" должен быть минимум 2 уровня!`);
                    valid = false;
                    break;
                }
                totalSpent += level * (skill.costMult || 1);
            }
            if (valid && totalSpent > 86) {
                alert(`Превышение очков навыков! Максимум 86, потрачено ${totalSpent}.`);
                valid = false;
            }
        }
        // Шаг 3 и 5: общий бюджет (снаряжение + импланты)
        else if (this.currentStep === 3 || this.currentStep === 5) {
            this.updateTotalSpent(); // пересчитывает totalSpentOnGearAndCyber, но не вызывает валидацию
            if (this.data.totalSpentOnGearAndCyber > 2550) {
                alert("Превышен общий бюджет снаряжения и имплантов (2550 eb)");
                valid = false;
            }
        }
        // Шаг 6: стиль
        else if (this.currentStep === 6) {
            let totalStyle = 0;
            for (let s of this.data.styleItems) totalStyle += this.getItemCost(s);
            if (totalStyle > 800) {
                alert("Превышен бюджет стиля! Лимит: 800 eb");
                valid = false;
            }
        }
    } finally {
        this._validating = false;
    }
    return valid;
}

    saveCharacter() {
        if (this.currentStep === 3) this.updateGearFromDOM();
        const char = {
            name: this.data.name || "Безымянный",
            culture: this.data.culture,
            role: this.data.role,
            roleRank: this.data.roleRank,
            INT: this.data.stats.INT,
            REF: this.data.stats.REF,
            DEX: this.data.stats.DEX,
            TECH: this.data.stats.TECH,
            COOL: this.data.stats.COOL,
            WILL: this.data.stats.WILL,
            LUCK: this.data.stats.LUCK,
            MOVE: this.data.stats.MOVE,
            BODY: this.data.stats.BODY,
            EMP: this.data.stats.EMP,
            skills: this.data.skills,
            cyberware: this.data.cyberware,
            gear: this.data.gear,
            style: this.data.styleItems,
            lifestyle: this.data.lifestyle,
            housing: this.data.housing,
            notes: this.data.notes,
            avatar: this.data.avatar || ''
        };
        saveCharacter(char);
        alert("Персонаж сохранён!");
        localStorage.removeItem('wizard_progress');
        this.currentStep = 0;
        this.data = this.getDefaultData();
        this.renderStep();

        if (window.characterHelper) {
            window.characterHelper.displaySavedCharacterCard();
        }
        const modal = document.getElementById('wizardModal');
        if (modal) modal.style.display = 'none';
        const mainTab = document.querySelector('.main-tabs .tab-btn[data-tab="tab-character"]');
        if (mainTab && !mainTab.classList.contains('active')) mainTab.click();
        const subTab = document.querySelector('#tab-character .sub-tab-btn[data-sub="char-main"]');
        if (subTab && !subTab.classList.contains('active')) subTab.click();
    }
}