// modules/ideal-builder.js
import { getHP } from '../utils.js';
import { allSkills, roleTemplates } from '../data/skills-data.js';

export class IdealCharacterBuilder {
    constructor() {
        this.stats = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        this.init();
        this.getCurrentSkills = this.getCurrentSkills.bind(this);
    }
    init() {
        this.buildStatsGrid();
        this.buildSkillsGrid();
        this.attachEvents();
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
        const controlHtml = `
            <div class="skills-controls">
                <div class="role-row">
                    <label>Роль для рекомендации: 
                        <select id="idealRoleSelect">
                            ${Object.keys(roleTemplates).map(role => `<option value="${role}">${role}</option>`).join('')}
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
        
        const skillsGrid = document.createElement('div');
        skillsGrid.className = 'skills-grid-modern';
        container.appendChild(skillsGrid);
        
        const categories = this.groupSkillsByCategory();
        for (const [category, skills] of Object.entries(categories)) {
            const categorySection = document.createElement('div');
            categorySection.className = 'skills-category-modern';
            categorySection.innerHTML = `
                <div class="category-header-modern" data-category="${category}">
                    <span class="category-toggle-modern">▶</span> <strong>${category}</strong> <span class="skill-count">(${skills.length})</span>
                </div>
                <div class="category-body-modern" style="display: none;">
                    <div class="skills-grid-modern-inner"></div>
                </div>
            `;
            skillsGrid.appendChild(categorySection);
            
            const innerGrid = categorySection.querySelector('.skills-grid-modern-inner');
            skills.forEach(skill => {
                const defaultValue = skill.base ? 2 : 0;
                const skillCard = document.createElement('div');
                skillCard.className = 'skill-card-modern';
                skillCard.setAttribute('data-skill-name', skill.name);
                skillCard.innerHTML = `
                    <div class="skill-name-modern">${skill.name}</div>
                    <div class="skill-stat-modern">${skill.stat}</div>
                    <div class="skill-x2-modern">${skill.costMult === 2 ? '×2' : ''}</div>
                    <input type="number" class="skill-level-modern" data-skill="${skill.name}" data-cost="${skill.costMult}" min="0" max="10" value="${defaultValue}" step="1">
                `;
                innerGrid.appendChild(skillCard);
            });
            
            innerGrid.querySelectorAll('.skill-level-modern').forEach(input => {
                input.addEventListener('input', () => this.updateSkillRemaining());
            });
        }
        
        document.querySelectorAll('.category-header-modern').forEach(header => {
            header.addEventListener('click', () => {
                const body = header.parentElement.querySelector('.category-body-modern');
                const toggle = header.querySelector('.category-toggle-modern');
                if (body.style.display === 'none') {
                    body.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    body.style.display = 'none';
                    toggle.textContent = '▶';
                }
            });
        });
        
        document.getElementById('skillsSearchInput')?.addEventListener('input', () => this.filterSkillsModern());
        document.getElementById('applyRecommendedSkillsBtn')?.addEventListener('click', () => {
            const role = document.getElementById('idealRoleSelect').value;
            this.applyRecommendedSkills(role);
        });
        document.getElementById('copySkillsBtn')?.addEventListener('click', () => this.copySkillsToClipboard());
        this.updateSkillRemaining();
    }
    
    groupSkillsByCategory() {
        const categories = {
            "Восприятие": [], "Физические": [], "Управление": [], "Образование": [],
            "Рукопашные": [], "Творческие": [], "Дальний бой": [], "Социальные": [], "Технические": []
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
        for (const cat in categories) if (categories[cat].length === 0) delete categories[cat];
        return categories;
    }
    
    filterSkillsModern() {
        const term = document.getElementById('skillsSearchInput').value.toLowerCase();
        const allCards = document.querySelectorAll('.skill-card-modern');
        allCards.forEach(card => {
            const name = card.querySelector('.skill-name-modern')?.innerText.toLowerCase() || '';
            card.style.display = name.includes(term) ? 'flex' : 'none';
        });
        document.querySelectorAll('.skills-category-modern').forEach(cat => {
            const visibleCards = Array.from(cat.querySelectorAll('.skill-card-modern')).some(c => c.style.display !== 'none');
            const body = cat.querySelector('.category-body-modern');
            const toggle = cat.querySelector('.category-toggle-modern');
            if (visibleCards && body.style.display === 'none') {
                body.style.display = 'block';
                if (toggle) toggle.textContent = '▼';
            } else if (!visibleCards && body.style.display === 'block') {
                body.style.display = 'none';
                if (toggle) toggle.textContent = '▶';
            }
        });
    }
    
    applyRecommendedSkills(role) {
        const template = roleTemplates[role];
        if (!template) return;
        document.querySelectorAll('.skill-level-modern').forEach(input => {
            const skillName = input.dataset.skill;
            const skill = allSkills.find(s => s.name === skillName);
            const defaultValue = (skill && skill.base) ? 2 : 0;
            input.value = defaultValue;
        });
        for (const [skillName, level] of Object.entries(template)) {
            const input = document.querySelector(`.skill-level-modern[data-skill="${skillName}"]`);
            if (input && level <= 10) input.value = level;
        }
        for (const skill of allSkills) {
            if (skill.base) {
                const input = document.querySelector(`.skill-level-modern[data-skill="${skill.name}"]`);
                if (input && parseInt(input.value) < 2) input.value = 2;
            }
        }
        this.updateSkillRemaining();
        alert(`Рекомендованные навыки для ${role} применены.`);
    }
    
    copySkillsToClipboard() {
        let text = "Навыки персонажа:\n";
        document.querySelectorAll('.skill-card-modern').forEach(card => {
            const name = card.querySelector('.skill-name-modern')?.innerText;
            const input = card.querySelector('.skill-level-modern');
            if (name && input) {
                const level = input.value;
                if (level != 0) text += `${name}: ${level}\n`;
            }
        });
        navigator.clipboard.writeText(text).then(() => alert("Список навыков скопирован в буфер обмена!"));
    }
    
    updateSkillRemaining() {
        let total = 0;
        document.querySelectorAll('.skill-level-modern').forEach(input => {
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
        document.getElementById('randomIdealStatsBtn')?.addEventListener('click', () => this.randomizeStats());
    }
    
    randomizeStats() {
        const statIds = ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'];
        let total = 0;
        for (let s of statIds) {
            let val = Math.floor(Math.random() * 7) + 2;
            document.getElementById(`idealStat${s}`).value = val;
            total += val;
        }
        this.updateStatsRemaining();
        if (total > 62) alert(`Сумма ХАР = ${total} (максимум 62). Уменьшите значения.`);
        else if (total < 62) alert(`Сумма ХАР = ${total}. Осталось ${62 - total} очков.`);
        else alert(`Сумма ХАР = 62. Идеально!`);
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
    
    getCurrentSkills() {
        const skills = {};
        document.querySelectorAll('.skill-card-modern').forEach(card => {
            const name = card.querySelector('.skill-name-modern')?.innerText;
            const input = card.querySelector('.skill-level-modern');
            if (name && input) {
                skills[name] = parseInt(input.value) || 0;
            }
        });
        return skills;
    }
}