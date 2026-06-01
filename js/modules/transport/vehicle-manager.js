// modules/transport/vehicle-manager.js
import { transport, addVehicle, saveVehicles, loadVehicles } from '../../data.js';
import { renderVehicleList } from './render-vehicle-list.js';

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