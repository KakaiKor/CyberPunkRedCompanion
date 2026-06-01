import { getHP } from '../../utils.js';

export function renderSummaryStep(data) {
    const hp = getHP(data.stats.BODY, data.stats.WILL);
    const severe = Math.ceil(hp / 2);
    const humanity = data.stats.EMP * 10;
    const empFrom = Math.floor(humanity / 10);
    return `
        <h3>Итоговый персонаж</h3>
        <div class="wizard-summary">
            <div><strong>Роль:</strong> ${data.role}</div>
            <div><strong>ХАР:</strong> ${Object.entries(data.stats).map(([k, v]) => `${k}=${v}`).join(', ')}</div>
            <div><strong>ПЗ:</strong> ${hp} (тяж. ≤ ${severe}), Спасбросок: ${data.stats.BODY}</div>
            <div><strong>Человечность:</strong> ${humanity} (ЭМП = ${empFrom})</div>
            <div><strong>Киберимпланты:</strong> ${data.cyberware.length ? data.cyberware.join(', ') : 'нет'}</div>
            <div><strong>Снаряжение:</strong> оружие: ${data.gear.weapons.join(', ')}; броня: тело ${data.gear.armor.body || '—'}, голова ${data.gear.armor.head || '—'}; прочее: ${data.gear.items.join(', ')}</div>
            ${data.styleItems.length ? `<div><strong>Стиль:</strong> ${data.styleItems.join(', ')}</div>` : ''}
        </div>
        <p class="note">Нажмите "Сохранить персонажа", чтобы записать его.</p>
    `;
}