export function renderNotesStep(data) {
    return `
        <h3>📝 Заметки и предыстория</h3>
        <textarea id="charNotes" rows="8" placeholder="Любые заметки: предыстория, связи, цели, внешность, особенности...">${escapeHtml(data.notes)}</textarea>
        <p class="note">Эта информация не влияет на механику, но помогает оживить персонажа.</p>
    `;
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}