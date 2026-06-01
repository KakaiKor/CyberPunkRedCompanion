export function renderExpensesStep(data) {
    const lifestyle = parseInt(data.lifestyle);
    const housing = parseInt(data.housing);
    const total = lifestyle + housing;
    return `
        <h3>💰 Ежемесячные расходы</h3>
        <div class="form-row">
            <label>Образ жизни:
                <select id="expensesLifestyle">
                    <option value="100" ${data.lifestyle === '100' ? 'selected' : ''}>Киббл (100 eb)</option>
                    <option value="300" ${data.lifestyle === '300' ? 'selected' : ''}>Полуфабрикаты (300 eb)</option>
                    <option value="600" ${data.lifestyle === '600' ? 'selected' : ''}>Хорошие продукты (600 eb)</option>
                    <option value="1500" ${data.lifestyle === '1500' ? 'selected' : ''}>Свежая еда (1500 eb)</option>
                </select>
            </label>
            <label>Жильё:
                <select id="expensesHousing">
                    <option value="500" ${data.housing === '500' ? 'selected' : ''}>Куб-отель (500 eb)</option>
                    <option value="1000" ${data.housing === '1000' ? 'selected' : ''}>Контейнер (1000 eb)</option>
                    <option value="1500" ${data.housing === '1500' ? 'selected' : ''}>Студия (1500 eb)</option>
                    <option value="2500" ${data.housing === '2500' ? 'selected' : ''}>2-спальная (2500 eb)</option>
                </select>
            </label>
        </div>
        <div class="expenses-total"><strong>Итого в месяц:</strong> ${total} eb</div>
        <p class="note">Расходы нужно оплачивать каждый месяц игры. Совет: не тратьте всё на импланты!</p>
    `;
}