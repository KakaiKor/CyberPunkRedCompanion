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

    // ========== ГРУППИРОВКА (сохранение состояний сворачивания) ==========
    saveGroupStates() {
        this.groupStates = {};
        document.querySelectorAll('.skills-category-table').forEach(cat => {
            const categoryName = cat.querySelector('h4')?.innerText || '';
            const wrapper = cat.querySelector('.table-wrapper');
            if (wrapper) this.groupStates[`skills_${categoryName}`] = wrapper.style.display !== 'none';
        });
        document.querySelectorAll('.cyber-group-table').forEach(group => {
            const groupName = group.querySelector('h4')?.innerText || '';
            const wrapper = group.querySelector('.table-wrapper');
            if (wrapper) this.groupStates[`cyber_${groupName}`] = wrapper.style.display !== 'none';
        });
    }

    restoreGroupStates() {
        if (!this.groupStates) return;
        document.querySelectorAll('.skills-category-table').forEach(cat => {
            const categoryName = cat.querySelector('h4')?.innerText || '';
            const wrapper = cat.querySelector('.table-wrapper');
            if (wrapper && this.groupStates[`skills_${categoryName}`] !== undefined) {
                wrapper.style.display = this.groupStates[`skills_${categoryName}`] ? 'block' : 'none';
            }
        });
        document.querySelectorAll('.cyber-group-table').forEach(group => {
            const groupName = group.querySelector('h4')?.innerText || '';
            const wrapper = group.querySelector('.table-wrapper');
            if (wrapper && this.groupStates[`cyber_${groupName}`] !== undefined) {
                wrapper.style.display = this.groupStates[`cyber_${groupName}`] ? 'block' : 'none';
            }
        });
    }

    // ========== ОБЩИЙ БЮДЖЕТ ==========
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

    // ========== ВСПОМОГАТЕЛЬНЫЕ ==========
    getItemCost(name) {
        const all = [...rangedWeapons, ...meleeWeapons, ...armors, ...gearItems];
        const found = all.find(i => i.name === name);
        return found ? found.cost : 0;
    }

    getAllSkillsList() {
        return allSkills;
    }

    // ========== ОТРИСОВКА ШАГА ==========
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

        if (this.currentStep === 4 || this.currentStep === 5) this.saveGroupStates();

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

        if (this.currentStep === 4 || this.currentStep === 5) this.restoreGroupStates();

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

    // ========== ОБРАБОТЧИКИ ШАГОВ ==========
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
                this.updateRole();
                this.renderStep(); // обновить отображение ролевого навыка
            });
        });
        const rankInput = document.getElementById('roleRank');
        if (rankInput) rankInput.addEventListener('change', () => this.updateRoleRank());
    }
    updateRoleRank() {
        const rank = parseInt(document.getElementById('roleRank')?.value);
        if (!isNaN(rank)) this.data.roleRank = rank;
        this.saveProgress();
    }
    updateRole() {
        const selected = document.querySelector('input[name="role"]:checked');
        if (selected) this.data.role = selected.value;
        this.saveProgress();
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

    attachGearEvents() {
        // Переключение вкладок
        const filterSelect = document.getElementById('gearCategoryFilter');
        const weaponsSection = document.getElementById('weaponsSection');
        const armorSection = document.getElementById('armorSection');
        const itemsSection = document.getElementById('itemsSection');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (weaponsSection) weaponsSection.style.display = (val === 'weapons') ? 'block' : 'none';
                if (armorSection) armorSection.style.display = (val === 'armor') ? 'block' : 'none';
                if (itemsSection) itemsSection.style.display = (val === 'items') ? 'block' : 'none';
            });
        }

        // Поиск
        const searchInput = document.getElementById('gearSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('#weaponsSection .cyber-table tbody tr, #armorSection .cyber-table tbody tr, #itemsSection .cyber-table tbody tr').forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        }

        // Обработка чекбоксов – делегирование на весь документ
        if (this._gearHandler) document.removeEventListener('change', this._gearHandler);
        this._gearHandler = (e) => {
            const target = e.target;
            if (target && target.type === 'checkbox') {
                // Собираем данные
                const weaponCheckboxes = document.querySelectorAll('#weaponsSection input[type="checkbox"]:checked');
                this.data.gear.weapons = Array.from(weaponCheckboxes).map(cb => cb.value);
                const armorBody = document.querySelector('#armorSection input[data-slot="body"]:checked');
                const armorHead = document.querySelector('#armorSection input[data-slot="head"]:checked');
                this.data.gear.armor.body = armorBody ? armorBody.value : '';
                this.data.gear.armor.head = armorHead ? armorHead.value : '';
                const itemCheckboxes = document.querySelectorAll('#itemsSection input[type="checkbox"]:checked');
                this.data.gear.items = Array.from(itemCheckboxes).map(cb => cb.value);
                this.updateTotalSpent();
                this.updateGearBudgetDisplay();
                this.saveProgress();
            }
        };
        document.addEventListener('change', this._gearHandler);
    }

    attachSkillsEvents() {
        // Поля ввода уровня
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

        // Сворачивание категорий
        document.querySelectorAll('.skills-category-table h4').forEach(header => {
            header.style.cursor = 'pointer';
            header.removeEventListener('click', this._skillsCollapseHandler);
            this._skillsCollapseHandler = (e) => {
                e.stopPropagation();
                const cat = header.closest('.skills-category-table');
                const wrapper = cat.querySelector('.table-wrapper');
                if (wrapper) {
                    const isVisible = wrapper.style.display !== 'none';
                    wrapper.style.display = isVisible ? 'none' : 'block';
                    const icon = header.querySelector('.collapse-icon');
                    if (icon) icon.textContent = isVisible ? '▶' : '▼';
                    const categoryName = header.innerText.replace(/[▼▶]/g, '').trim();
                    this.groupStates[`skills_${categoryName}`] = !isVisible;
                }
            };
            header.addEventListener('click', this._skillsCollapseHandler);
        });
    }

    updateSkills() {
        const inputs = document.querySelectorAll('.skill-level-table');
        inputs.forEach(inp => {
            const skill = inp.dataset.skill;
            this.data.skills[skill] = parseInt(inp.value) || 0;
        });
        this.saveProgress();
        this.renderStep(); // обновить отображение остатка очков
    }

    attachCyberwareEvents() {
        // Чекбоксы имплантов – делегирование
        if (this._cyberHandler) document.removeEventListener('change', this._cyberHandler);
        this._cyberHandler = (e) => {
            if (e.target && e.target.classList.contains('cyber-checkbox-table')) {
                this.updateCyberware();
            }
        };
        document.addEventListener('change', this._cyberHandler);

        // Сворачивание групп
        document.querySelectorAll('.cyber-group-table h4').forEach(header => {
            header.style.cursor = 'pointer';
            header.removeEventListener('click', this._cyberCollapseHandler);
            this._cyberCollapseHandler = (e) => {
                e.stopPropagation();
                const group = header.closest('.cyber-group-table');
                const wrapper = group.querySelector('.table-wrapper');
                if (wrapper) {
                    const isVisible = wrapper.style.display !== 'none';
                    wrapper.style.display = isVisible ? 'none' : 'block';
                    const icon = header.querySelector('.collapse-icon');
                    if (icon) icon.textContent = isVisible ? '▶' : '▼';
                    const groupName = header.innerText.replace(/[▼▶]/g, '').trim();
                    this.groupStates[`cyber_${groupName}`] = !isVisible;
                }
            };
            header.addEventListener('click', this._cyberCollapseHandler);
        });

        // Поиск
        const searchInput = document.getElementById('cyberSearchTable');
        if (searchInput) {
            searchInput.removeEventListener('input', this._cyberSearchHandler);
            this._cyberSearchHandler = (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.cyber-group-table tbody tr').forEach(row => {
                    row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
                });
            };
            searchInput.addEventListener('input', this._cyberSearchHandler);
        }
    }

    updateCyberware() {
        const checkboxes = document.querySelectorAll('.cyber-checkbox-table:checked');
        this.data.cyberware = Array.from(checkboxes).map(cb => cb.value);
        this.updateTotalSpent();
        this.updateCyberBudgetDisplay();
        this.saveProgress();
        // Не вызываем renderStep(), чтобы не сбросить состояние групп
    }

    attachStyleEvents() {
        if (this._styleHandler) document.removeEventListener('change', this._styleHandler);
        this._styleHandler = (e) => {
            if (e.target && e.target.classList.contains('style-checkbox')) {
                this.updateStyle();
            }
        };
        document.addEventListener('change', this._styleHandler);

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

    updateStyle() {
        const checkboxes = document.querySelectorAll('.style-checkbox:checked');
        this.data.styleItems = Array.from(checkboxes).map(cb => cb.value);
        this.saveProgress();
        this.renderStep(); // обновить бюджет
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
                    alert('Библиотека html2canvas не загружена. Добавьте скрипт в index.html');
                }
            });
        }
        if (healBtn) {
            healBtn.addEventListener('click', () => {
                const hpDiv = document.querySelector('.derived-stats div:first-child');
                if (!hpDiv) return;
                const match = hpDiv.innerText.match(/ПЗ:\s*(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    let current = parseInt(match[1]);
                    const max = parseInt(match[2]);
                    const body = this.data.stats?.BODY || 6;
                    const newHp = Math.min(current + body, max);
                    hpDiv.innerText = hpDiv.innerText.replace(/\d+/, newHp);
                }
            });
        }
        if (damageBtn) {
            damageBtn.addEventListener('click', () => {
                const dmg = prompt('Введите урон:');
                if (dmg !== null) {
                    const hpDiv = document.querySelector('.derived-stats div:first-child');
                    if (!hpDiv) return;
                    const match = hpDiv.innerText.match(/ПЗ:\s*(\d+)\s*\/\s*(\d+)/);
                    if (match) {
                        let current = parseInt(match[1]);
                        const max = parseInt(match[2]);
                        let newHp = Math.max(0, current - parseInt(dmg));
                        hpDiv.innerText = hpDiv.innerText.replace(/\d+/, newHp);
                        const severe = Math.ceil(max / 2);
                        if (newHp <= severe && newHp > 0) alert('⚠️ Тяжёлое ранение! Штраф -2 ко всем действиям.');
                        if (newHp <= 0) alert('💀 Смертельное ранение! Требуется спасбросок.');
                    }
                }
            });
        }
    }

    // ========== НАВИГАЦИЯ И ВАЛИДАЦИЯ ==========
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
        if (this.currentStep === 2) {
            let total = 0;
            for (let s in this.data.stats) total += this.data.stats[s];
            if (total !== 62) {
                alert("Сумма ХАР должна быть ровно 62!");
                return false;
            }
        }
        if (this.currentStep === 4) {
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