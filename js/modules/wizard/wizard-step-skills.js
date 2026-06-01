// modules/wizard/wizard-step-skills.js
export function renderSkillsStep(data, skillsList) {
    let total = 0;
    for (let level of Object.values(data.skills)) total += level;
    const remaining = 86 - total;
    return `
        <h3>Навыки (очков: 86, базовые минимум 2)</h3>
        <div class="skills-wizard-list">
            ${skillsList.map(skill => `
                <div class="skill-wizard-item">
                    <span class="skill-name">${skill.name} (${skill.stat})</span>
                    <input type="number" class="skill-wizard-level" data-skill="${skill.name}" min="0" max="10" value="${data.skills[skill.name] || (skill.base ? 2 : 0)}" step="1">
                </div>
            `).join('')}
        </div>
        <div class="points-counter">Осталось очков: <strong class="${remaining < 0 ? 'over' : 'ok'}">${remaining}</strong></div>
    `;
}