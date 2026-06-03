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
        // Обновляем индикатор шагов
        const steps = document.querySelectorAll('.wizard-steps .step');
        steps.forEach((step, idx) => {
            if (idx === this.currentStep) step.classList.add('active');
            else step.classList.remove('active');
        });

        // Управление кнопками
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

        // Рендеринг HTML текущего шага
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

        // Привязываем обработчики событий для текущего шага
        this.attachStepEvents();

        // Делаем шаги в индикаторе кликабельными (для перехода)
        document.querySelectorAll('.wizard-steps .step').forEach((el, idx) => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.canJumpToStep(idx)) {
                    this.currentStep = idx;
                    this.renderStep();
                } else {
                    alert(`Сначала завершите шаг ${this.getStepName(idx-1)}`);
                }
            });
        });
    }

    getStepName(step) {
        const names = ["Имя", "Роль", "ХАР", "Снаряжение", "Навыки", "Импланты", "Стиль", "Человечность", "Расходы", "Заметки", "Итог"];
        return names[step] || "Шаг";
    }

    canJumpToStep(targetStep) {
        // Можно перейти к шагу, если все предыдущие шаги валидны
        for (let i = 0; i < targetStep; i++) {
            if (!this.validateStepForIndex(i)) return false;
        }
        return true;
    }

    validateStepForIndex(stepIndex) {
        // Временно сохраняем текущий шаг, проверяем, восстанавливаем
        const oldStep = this.currentStep;
        this.currentStep = stepIndex;
        const isValid = this.validateStep();
        this.currentStep = oldStep;
        return isValid;
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

    // ----- Обработчики шагов -----
    attachIdentityEvents() {
        const nameInput = document.getElementById('charNameInput');
        const cultureSelect = document.getElementById('charCulture');
        if (nameInput) nameInput.addEventListener('change', () => this.updateIdentity());
        if (cultureSelect) cultureSelect.addEventListener('change', () => this.updateIdentity());
    }
    updateIdentity() {
        this.data.name = document.getElementById('charNameInput')?.value || '';
        this.data.culture = document.getElementById('charCulture')?.value || 'Европа';
        this.saveProgress();
    }

    attachRoleEvents() {
        const roleRadios = document.querySelectorAll('input[name="role"]');
        roleRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.data.role = radio.value;
                this.saveProgress();
                this.renderStep(); // чтобы обновить описание ролевого навыка
            });
        });
        const rankInput = document.getElementById('roleRank');
        if (rankInput) rankInput.addEventListener('change', () => {
            this.data.roleRank = parseInt(rankInput.value) || 4;
            this.saveProgress();
        });
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
        // обновляем отображение оставшихся очков (без перерисовки шага)
        this.updateStatsPointsDisplay();
    }
    updateStatsPointsDisplay() {
        let total = 0;
        for (let s in this.data.stats) total += this.data.stats[s];
        const remaining = 62 - total;
        const pointsSpan = document.querySelector('.points-counter strong');
        if (pointsSpan) {
            pointsSpan.innerText = remaining;
            pointsSpan.className = remaining < 0 ? 'over' : 'ok';
        }
    }
    randomizeStats() {
        const stats = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
        stats.forEach(s => this.data.stats[s] = Math.floor(Math.random() * 7) + 2);
        this.saveProgress();
        this.renderStep(); // перерисовываем шаг для обновления полей ввода
    }

    attachGearEvents() {
        // Обработка изменения чекбоксов – без перерисовки
        const handleGearChange = () => {
            this.updateGearFromDOM();
            this.updateGearBudgetDisplay();
        };
        // Навешиваем на все чекбоксы
        const allCheckboxes = document.querySelectorAll('#weaponsSection input[type="checkbox"], #armorSection input[type="checkbox"], #itemsSection input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.addEventListener('change', handleGearChange));
        // Фильтр вкладок и поиск – без изменений
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
                document.querySelectorAll('.cyber-table tbody tr').forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        }
    }
    updateGearFromDOM() {
        const weaponCheckboxes = document.querySelectorAll('#weaponsSection input[type="checkbox"]:checked');
        this.data.gear.weapons = Array.from(weaponCheckboxes).map(cb => cb.value);
        const armorBody = document.querySelector('#armorSection input[data-slot="body"]:checked');
        this.data.gear.armor.body = armorBody ? armorBody.value : '';
        const armorHead = document.querySelector('#armorSection input[data-slot="head"]:checked');
        this.data.gear.armor.head = armorHead ? armorHead.value : '';
        const itemCheckboxes = document.querySelectorAll('#itemsSection input[type="checkbox"]:checked');
        this.data.gear.items = Array.from(itemCheckboxes).map(cb => cb.value);
        this.saveProgress();
        this.updateTotalSpent();
    }
    updateGearBudgetDisplay() {
        const remaining = 2550 - this.data.totalSpentOnGearAndCyber;
        const budgetSpan = document.querySelector('.gear-budget strong');
        if (budgetSpan) {
            budgetSpan.innerText = remaining;
            budgetSpan.className = remaining < 0 ? 'over' : 'ok';
        }
    }

    attachSkillsEvents() {
        const handleSkillChange = () => {
            this.updateSkillsFromDOM();
            this.updateSkillsBudgetDisplay();
        };
        const inputs = document.querySelectorAll('.skill-level-table');
        inputs.forEach(inp => inp.addEventListener('input', handleSkillChange));
        const searchInput = document.getElementById('skillsSearchTable');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.skills-category-table tbody tr').forEach(row => {
                    const skillName = row.querySelector('td:first-child')?.innerText.toLowerCase() || '';
                    row.style.display = skillName.includes(term) ? '' : 'none';
                });
            });
        }
        // Сворачивание категорий – если нужно
    }
    updateSkillsFromDOM() {
        const inputs = document.querySelectorAll('.skill-level-table');
        inputs.forEach(inp => {
            const skill = inp.dataset.skill;
            this.data.skills[skill] = parseInt(inp.value) || 0;
        });
        this.saveProgress();
        this.updateTotalSpent(); // потому что навыки не влияют на бюджет, но на всякий случай
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
        const handleCyberChange = () => {
            this.updateCyberwareFromDOM();
            this.updateCyberBudgetDisplay();
        };
        const checkboxes = document.querySelectorAll('.cyber-checkbox-table');
        checkboxes.forEach(cb => cb.addEventListener('change', handleCyberChange));
        const searchInput = document.getElementById('cyberSearchTable');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.cyber-group-table tbody tr').forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        }
    }
    updateCyberwareFromDOM() {
        const checkboxes = document.querySelectorAll('.cyber-checkbox-table:checked');
        this.data.cyberware = Array.from(checkboxes).map(cb => cb.value);
        this.saveProgress();
        this.updateTotalSpent();
    }
    updateCyberBudgetDisplay() {
        const remaining = 2550 - this.data.totalSpentOnGearAndCyber;
        const budgetSpan = document.querySelector('.cyber-budget-info strong');
        if (budgetSpan) {
            budgetSpan.innerText = remaining;
            budgetSpan.className = remaining < 0 ? 'over' : 'ok';
        }
    }

    attachStyleEvents() {
        const handleStyleChange = () => {
            this.updateStyleFromDOM();
            this.updateStyleBudgetDisplay();
        };
        const checkboxes = document.querySelectorAll('.style-checkbox');
        checkboxes.forEach(cb => cb.addEventListener('change', handleStyleChange));
        const searchInput = document.getElementById('styleSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.style-checkbox').forEach(cb => {
                    const row = cb.closest('tr');
                    if (row) row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        }
    }
    updateStyleFromDOM() {
        const checkboxes = document.querySelectorAll('.style-checkbox:checked');
        this.data.styleItems = Array.from(checkboxes).map(cb => cb.value);
        this.saveProgress();
    }
    updateStyleBudgetDisplay() {
        let total = 0;
        for (let s of this.data.styleItems) total += this.getItemCost(s);
        const remaining = 800 - total;
        const budgetSpan = document.querySelector('.style-budget strong');
        if (budgetSpan) {
            budgetSpan.innerText = remaining;
            budgetSpan.className = remaining < 0 ? 'over' : 'ok';
        }
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
        this.renderStep(); // обновить отображение суммы
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
        // Кнопки лечения/урона и PNG – уже есть
        const healBtn = document.querySelector('.heal-btn');
        const damageBtn = document.querySelector('.damage-btn');
        const exportBtn = document.getElementById('exportPngBtn');
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
        if (healBtn) {
            healBtn.addEventListener('click', () => {
                const hpDiv = document.querySelector('.derived-stats div:first-child');
                if (hpDiv) {
                    const match = hpDiv.innerText.match(/ПЗ:\s*(\d+)\s*\/\s*(\d+)/);
                    if (match) {
                        let current = parseInt(match[1]);
                        const max = parseInt(match[2]);
                        const body = this.data.stats?.BODY || 6;
                        const newHp = Math.min(current + body, max);
                        hpDiv.innerText = hpDiv.innerText.replace(/\d+/, newHp);
                    }
                }
            });
        }
        if (damageBtn) {
            damageBtn.addEventListener('click', () => {
                const dmg = prompt('Введите урон:');
                if (dmg !== null) {
                    const hpDiv = document.querySelector('.derived-stats div:first-child');
                    if (hpDiv) {
                        const match = hpDiv.innerText.match(/ПЗ:\s*(\d+)\s*\/\s*(\d+)/);
                        if (match) {
                            let current = parseInt(match[1]);
                            const max = parseInt(match[2]);
                            let newHp = Math.max(0, current - parseInt(dmg));
                            hpDiv.innerText = hpDiv.innerText.replace(/\d+/, newHp);
                            const severe = Math.ceil(max / 2);
                            if (newHp <= severe && newHp > 0) alert('⚠️ Тяжёлое ранение! Штраф -2.');
                            if (newHp <= 0) alert('💀 Смертельное ранение!');
                        }
                    }
                }
            });
        }
    }

    // Вспомогательные методы
    getItemCost(name) {
        const all = [...rangedWeapons, ...meleeWeapons, ...armors, ...gearItems];
        const found = all.find(i => i.name === name);
        return found ? found.cost : 0;
    }

    getAllSkillsList() {
        return allSkills;
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
        return total;
    }

    // Навигация
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
        if (this.currentStep === 2) { // ХАР
            let total = 0;
            for (let s in this.data.stats) total += this.data.stats[s];
            if (total !== 62) {
                alert("Сумма ХАР должна быть ровно 62!");
                return false;
            }
        }
        if (this.currentStep === 4) { // Навыки
            let total = 0;
            const skillsList = this.getAllSkillsList();
            for (let skill of skillsList) {
                const level = this.data.skills[skill.name] ?? (skill.base ? 2 : 0);
                total += level * (skill.costMult || 1);
            }
            if (total > 86) {
                alert("Превышение очков навыков (максимум 86 с учётом ×2)");
                return false;
            }
        }
        if (this.currentStep === 3 || this.currentStep === 5) {
            this.updateTotalSpent();
            if (this.data.totalSpentOnGearAndCyber > 2550) {
                alert("Превышен общий бюджет снаряжения и имплантов (2550 eb)");
                return false;
            }
        }
        if (this.currentStep === 6) {
            let totalStyle = 0;
            for (let s of this.data.styleItems) totalStyle += this.getItemCost(s);
            if (totalStyle > 800) {
                alert("Превышен бюджет стиля! Лимит: 800 eb");
                return false;
            }
        }
        return true;
    }

    saveCharacter() {
        // НЕ вызываем updateGearFromDOM() – данные уже актуальны
        const char = {
            name: this.data.name || "Безымянный",
            culture: this.data.culture,
            role: this.data.role,
            ...this.data.stats,
            skills: this.data.skills,
            cyberware: this.data.cyberware,
            gear: this.data.gear,
            style: this.data.styleItems,
            lifestyle: this.data.lifestyle,
            housing: this.data.housing,
            notes: this.data.notes
        };
        saveCharacter(char);
        alert("Персонаж сохранён!");
        localStorage.removeItem('wizard_progress');
        this.currentStep = 0;
        this.data = this.getDefaultData();
        this.renderStep();
    }
}