// modules/transport/render-vehicle-list.js
import { playerVehicles, saveVehicles, removeVehicle } from '../../data.js';

export function renderVehicleList() {
    const container = document.getElementById('vehicleList');
    if (!container) return;
    if (!playerVehicles.length) {
        container.innerHTML = '<p>Нет транспорта. Купите что-нибудь!</p>';
        return;
    }
    let html = '<div class="vehicle-grid">';
    playerVehicles.forEach((v, idx) => {
        html += `
            <div class="vehicle-card">
                <h4>${v.name}</h4>
                <div>ПСП: ${v.currentPsp}/${v.psp}</div>
                <div class="vehicle-buttons">
                    <button class="repair-btn" data-idx="${idx}">🔧 Починить</button>
                    <button class="remove-vehicle-btn" data-idx="${idx}">🗑️ Удалить</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;

    // Обработчики для кнопок починки
    document.querySelectorAll('.repair-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            repairVehicle(idx);
        });
    });
    // Обработчики для кнопок удаления
    document.querySelectorAll('.remove-vehicle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            if (confirm('Удалить транспорт? Это действие нельзя отменить.')) {
                removeVehicle(idx);
                renderVehicleList();
                alert('Транспорт удалён.');
            }
        });
    });
}

function repairVehicle(idx) {
    if (confirm('Починить транспорт? (бесплатно)')) {
        playerVehicles[idx].currentPsp = playerVehicles[idx].psp;
        saveVehicles();
        renderVehicleList();
        alert('Транспорт отремонтирован!');
    }
}