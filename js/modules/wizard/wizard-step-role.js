export function renderRoleStep(data) {
    const roles = ["Рокербой", "Соло", "Нетраннер", "Техник", "Медтех", "Медиа", "Законник", "Менеджер", "Фиксер", "Кочевник"];
    return `
        <h3>Выберите роль</h3>
        <div class="role-selector">
            ${roles.map(r => `<label class="role-option ${data.role === r ? 'selected' : ''}"><input type="radio" name="role" value="${r}" ${data.role === r ? 'checked' : ''}> ${r}</label>`).join('')}
        </div>
        <p class="note">Роль определяет ваш ролевой навык и стиль игры.</p>
    `;
}