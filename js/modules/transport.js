import { transport, playerVehicles, addVehicle, removeVehicle, saveVehicles, loadVehicles } from '../data.js';

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

export function initTransport() {
    loadVehicles();
    renderVehicleList();
    const buySelect = document.getElementById('buyVehicleSelect');
    if (buySelect) {
        buySelect.innerHTML = transport.map(v => `<option value="${v.name}">${v.name} — ${v.cost.toLocaleString()} eb</option>`).join('');
    }
    document.getElementById('buyVehicleBtn')?.addEventListener('click', () => {
        const selected = document.getElementById('buyVehicleSelect').value;
        if (addVehicle(selected)) {
            renderVehicleList();
            alert('Транспорт куплен!');
        } else {
            alert('Не удалось купить транспорт.');
        }
    });
    document.getElementById('calcRamBtn')?.addEventListener('click', () => {
        const speed = parseInt(document.getElementById('ramSpeed').value) || 20;
        const weight = parseInt(document.getElementById('ramWeight').value) || 1500;
        let damage = Math.min(48, Math.max(6, Math.floor((speed * 10) / 100 * weight * 0.5)));
        document.getElementById('ramResult').innerHTML = `<strong>Урон от тарана: ${damage}</strong>`;
    });
}