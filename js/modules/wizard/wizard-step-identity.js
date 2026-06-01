export function renderIdentityStep(data) {
    const cultures = ["Европа", "Северная Америка", "Южная Америка", "Азия", "Африка", "Океания", "СССР/Россия", "Ближний Восток"];
    const safeName = data?.name || '';
    const safeCulture = data?.culture || 'Европа';
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
        <p class="note">Культурные корни влияют на знание языков и районов (опционально).</p>
    `;
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}