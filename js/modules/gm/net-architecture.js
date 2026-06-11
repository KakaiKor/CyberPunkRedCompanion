// modules/net-architecture.js

/**
 * Генерация архитектуры сети
 */
export function generateNetArchitecture() {
    const complexity = parseInt(document.getElementById('netComplexity')?.value) || 1;
    const slValues = [6, 8, 10, 12];
    const sl = slValues[complexity];
    const floorsCount = Math.floor(Math.random() * 6) + 3;
    let floors = [];
    for (let i = 0; i < floorsCount; i++) {
        let type;
        if (i < 2) {
            const types = ["Пароль", "Файл", "Узел управления", "Блуждающий огонёк", "Скорпион"];
            type = types[Math.floor(Math.random() * types.length)];
        } else {
            const types = ["Пароль", "Файл", "Узел управления", "Адская гончая", "Аспид", "Скорпион", "Блуждающий огонёк", "Убийца"];
            type = types[Math.floor(Math.random() * types.length)];
        }
        let floorHtml = `<strong>Этаж ${i + 1}</strong>: ${type}`;
        if (type === "Пароль" || type === "Файл" || type === "Узел управления") floorHtml += ` (СЛ ${sl})`;
        else floorHtml += ` (Чёрный лёд)`;
        floors.push(floorHtml);
    }
    const container = document.getElementById('netArchResult');
    if (container) {
        container.innerHTML = `<strong>🌐 Архитектура сети (${floorsCount} этажей)</strong><br>Сложность: СЛ ${sl}<br>${floors.map(f => `• ${f}`).join('<br>')}<button id="refreshNetArchBtn" class="reset-btn" style="margin-top:10px;">🔄 Новая архитектура</button>`;
        const refreshBtn = document.getElementById('refreshNetArchBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', generateNetArchitecture);
        }
    }
    
}

/**
 * Инициализация обработчика кнопки генерации архитектуры сети
 */
export function initNetArchitecture() {
    const btn = document.getElementById('genNetArchBtn');
    if (btn) {
        btn.removeEventListener('click', generateNetArchitecture);
        btn.addEventListener('click', generateNetArchitecture);
    }
}