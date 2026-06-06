export function renderIdentityStep(data) {
    const cultures = ["Европа", "Северная Америка", "Южная Америка", "Азия", "Африка", "Океания", "СССР/Россия", "Ближний Восток"];
    const safeName = data?.name || '';
    const safeCulture = data?.culture || 'Европа';
    const avatarPreview = data.avatar ? `<img src="${data.avatar}" id="avatarPreviewImg" style="width:80px; height:80px; border-radius:50%; object-fit:cover;">` : '';
    return `
        <h3>📛 Имя и происхождение</h3>
        <div class="form-group">
            <label>Имя персонажа:</label>
            <input type="text" id="charNameInput" value="${escapeHtml(safeName)}" placeholder="Введите имя">
        </div>
        <div class="form-group">
            <label>Культурные корни:</label>
            <select id="charCulture">
                ${cultures.map(c => `<option value="${c}" ${safeCulture === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Аватар персонажа:</label>
            <input type="file" id="avatarInput" accept="image/*">
            <div id="avatarPreview">${avatarPreview}</div>
        </div>
        <p class="note">Аватар будет отображаться в карточке.</p>
    `;
}
function escapeHtml(str) { return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }