// modules/simple-contract.js

/**
 * Генерация простого контракта
 */
export function generateSimpleContract() {
    const types = ["Извлечение", "Устранение", "Охрана", "Кража данных", "Саботаж", "Перевозка груза", "Шпионаж", "Психологическая операция"];
    const clients = ["Корпорация Arasaka", "Корпорация Militech", "Банда Мальстрём", "Банда Тигриные когти", "Фиксер Хорнет", "Частное лицо", "Правительство НСША", "Кочевники Альдекальдо", "Trauma Team", "Медиа-корпорация"];
    const complicationsList = ["Засада", "Предательство", "Конкурирующая команда", "Неверная информация", "Сложная цель", "Временной лимит", "Свидетель"];
    
    let type = types[Math.floor(Math.random() * types.length)];
    let client = clients[Math.floor(Math.random() * clients.length)];
    let complications = [];
    let numComp = Math.floor(Math.random() * 3);
    for (let i = 0; i < numComp; i++) {
        let comp = complicationsList[Math.floor(Math.random() * complicationsList.length)];
        if (!complications.includes(comp)) complications.push(comp);
    }
    let basePay = { "Извлечение": 2000, "Устранение": 3000, "Охрана": 1500, "Кража данных": 2500, "Саботаж": 2000, "Перевозка груза": 1000, "Шпионаж": 4000, "Психологическая операция": 3500 }[type] || 2000;
    let pay = basePay + complications.length * 500;
    
    const container = document.getElementById('contractResult');
    if (container) {
        container.innerHTML = `<strong>📋 Контракт: ${type}</strong><br><strong>Заказчик:</strong> ${client}<br><strong>Оплата:</strong> ${pay} eb<br><strong>Осложнения:</strong> ${complications.length ? complications.join(', ') : 'Нет'}<br><button id="refreshContractBtn" class="reset-btn" style="margin-top:10px;">🔄 Новый контракт</button>`;
        const refreshBtn = document.getElementById('refreshContractBtn');
        if (refreshBtn) refreshBtn.addEventListener('click', generateSimpleContract);
    }
}

/**
 * Инициализация обработчика кнопки простого контракта
 */
export function initSimpleContract() {
    const btn = document.getElementById('genContractBtn');
    if (btn) {
        btn.removeEventListener('click', generateSimpleContract);
        btn.addEventListener('click', generateSimpleContract);
    }
}