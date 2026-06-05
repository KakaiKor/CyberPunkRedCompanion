export function renderGear(data) {
    if (!data.length) return '<p>Нет данных</p>';
    return `
        <div class="table-wrapper">
            <table class="cyber-table">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Цена</th>
                        <th>Описание</th>
                        <th>Эффект</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(g => `
                        <tr>
                            <td><strong>${g.name}</strong></td>
                            <td>${g.category}</td>
                            <td>${g.cost} eb</td>
                            <td>${g.description || '—'}</td>
                            <td>${g.effect || '—'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}