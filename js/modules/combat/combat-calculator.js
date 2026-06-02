// modules/combat/combat-calculator.js
import { getHP } from '../../utils.js';
import { critBody, critHead } from '../../data.js';

export class CombatCalculatorUI {
    constructor() {
        // Калькулятор ПЗ (без изменений)
        document.getElementById('calcHpBtn')?.addEventListener('click', () => {
            const b = parseInt(document.getElementById('calcBody').value);
            const w = parseInt(document.getElementById('calcWill').value);
            const hp = getHP(b, w);
            const severe = Math.ceil(hp / 2);
            document.getElementById('calcResult').innerHTML = `<strong>ПЗ = ${hp}</strong><br>Тяжёлое ≤ ${severe}<br>Спасбросок = ${b}`;
        });

        // НОВЫЙ КАЛЬКУЛЯТОР УРОНА С БРОСКОМ КУБИКОВ
        const rollDamageBtn = document.getElementById('rollDamageBtn');
        const damageDiceSelect = document.getElementById('damageDice');
        const damageInput = document.getElementById('damageInput');
        const armorInput = document.getElementById('armorInput');
        const coldCheck = document.getElementById('coldWeaponCheck');
        const damageResultDiv = document.getElementById('damageResult');

        // Функция броска кубиков
        function rollDice(diceString) {
            const [count, sides] = diceString.split('d').map(Number);
            let total = 0;
            let sixes = 0;
            for (let i = 0; i < count; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                total += roll;
                if (roll === 6) sixes++;
            }
            return { total, sixes };
        }

        // Обработчик кнопки "Бросить урон"
        if (rollDamageBtn) {
            rollDamageBtn.addEventListener('click', () => {
                const diceString = damageDiceSelect.value;
                const { total, sixes } = rollDice(diceString);
                damageInput.value = total; // показать выпавший урон в поле ввода
                let armor = parseInt(armorInput.value) || 0;
                const cold = coldCheck.checked;
                if (cold) armor = Math.ceil(armor / 2);
                const finalDamage = Math.max(0, total - armor);
                let critMessage = '';
                if (sixes >= 2) {
                    critMessage = `<br><span style="color:#ff3c5f;">💥 КРИТИЧЕСКАЯ ТРАВМА! (${sixes} шестёрки)</span>`;
                }
                damageResultDiv.innerHTML = `<strong>Бросок: ${diceString} → ${total} урона</strong><br>Броня: ${armorInput.value} (${cold ? 'холодное, половина' : 'стандартно'}) → ${finalDamage} ПЗ${critMessage}`;
            });
        }

        // Обработчик ручного ввода (оставляем как есть)
        document.getElementById('calcDamageBtn')?.addEventListener('click', () => {
            let dmg = parseInt(damageInput.value);
            let armor = parseInt(armorInput.value);
            const cold = coldCheck.checked;
            if (cold) armor = Math.ceil(armor / 2);
            const final = Math.max(0, dmg - armor);
            damageResultDiv.innerHTML = `<strong>Прошедший урон = ${final} ПЗ</strong><br><span class="note">(ручной ввод, крит не определяется)</span>`;
        });

        // Критические травмы (без изменений)
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