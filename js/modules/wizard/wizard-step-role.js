export function renderRoleStep(data) {
    const roles = ["Рокербой","Соло","Нетраннер","Техник","Медтех","Медиа","Законник","Менеджер","Фиксер","Кочевник"];
    const roleSkills = {
        "Рокербой": "Харизматическое влияние",
        "Соло": "Боевое чутьё",
        "Нетраннер": "Интерфейс",
        "Техник": "Создатель",
        "Медтех": "Медицина",
        "Медиа": "Авторитетность",
        "Законник": "Подкрепление",
        "Менеджер": "Командная работа",
        "Фиксер": "Деловая хватка",
        "Кочевник": "Мото"
    };
    const selectedRole = data.role || "Соло";
    const roleSkillName = roleSkills[selectedRole];
    const roleRank = data.roleRank ?? 4;
    return `
        <h3>Выберите роль</h3>
        <div class="role-selector" id="roleSelector">
            ${roles.map(r => `<label class="role-option ${selectedRole === r ? 'selected' : ''}"><input type="radio" name="role" value="${r}" ${selectedRole === r ? 'checked' : ''}> ${r}</label>`).join('')}
        </div>
        <div id="roleSkillDisplay">
            <strong>Ролевой навык:</strong> ${roleSkillName}<br>
            <label>Уровень навыка (1-10): 
                <input type="number" id="roleRank" min="1" max="10" value="${roleRank}" step="1">
            </label>
        </div>
        <p class="note">Ролевой навык определяет уникальные способности персонажа.</p>
    `;
}