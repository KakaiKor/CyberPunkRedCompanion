import { getHP } from '../../utils.js';
import { critBody, critHead } from '../../data.js';

export class CombatCalculatorUI {
    constructor() {
        document.getElementById('calcHpBtn')?.addEventListener('click', () => {
            const b = parseInt(document.getElementById('calcBody').value);
            const w = parseInt(document.getElementById('calcWill').value);
            const hp = getHP(b, w);
            const severe = Math.ceil(hp / 2);
            document.getElementById('calcResult').innerHTML = `<strong>ПЗ = ${hp}</strong><br>Тяжёлое ≤ ${severe}<br>Спасбросок = ${b}`;
        });
        document.getElementById('calcDamageBtn')?.addEventListener('click', () => {
            let dmg = parseInt(document.getElementById('damageInput').value);
            let armor = parseInt(document.getElementById('armorInput').value);
            const cold = document.getElementById('coldWeaponCheck').checked;
            if (cold) armor = Math.ceil(armor / 2);
            const final = Math.max(0, dmg - armor);
            document.getElementById('damageResult').innerHTML = `<strong>Прошедший урон = ${final} ПЗ</strong>`;
        });
        document.getElementById('rollCritBtn')?.addEventListener('click', () => {
            const r = Math.floor(Math.random() * 11) + 2;
            const crit = critBody.find(c => c.roll === r);
            document.getElementById('critResult').innerHTML = `<strong>Тело:</strong> ${r} → ${crit ? crit.name + ' – ' + crit.effect : 'не найден'}`;
        });
        document.getElementById('rollCritHeadBtn')?.addEventListener('click', () => {
            const r = Math.floor(Math.random() * 11) + 2;
            const crit = critHead.find(c => c.roll === r);
            document.getElementById('critResult').innerHTML = `<strong>Голова:</strong> ${r} → ${crit ? crit.name + ' – ' + crit.effect : 'не найден'}`;
        });
    }
}