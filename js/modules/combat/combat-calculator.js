// modules/combat/combat-calculator.js
import { critBody, critHead } from '../../data.js';

export class CombatCalculatorUI {
    constructor() {
        this.attachDamageHandler();
        this.attachCritHandlers();
    }

    // ─── Урон и броня ────────────────────────────────────────
    attachDamageHandler() {
        const rollDamageBtn = document.getElementById('rollDamageBtn');
        const damageDiceSelect = document.getElementById('damageDice');
        const armorInput = document.getElementById('armorInput');
        const coldCheck = document.getElementById('coldWeaponCheck');
        const damageResultDiv = document.getElementById('damageResult');

        if (!rollDamageBtn) return;

        rollDamageBtn.addEventListener('click', () => {
            const diceString = damageDiceSelect?.value || '2d6';
            const { total, rolls, sixes } = this.rollDice(diceString);
            let armor = parseInt(armorInput?.value) || 0;
            const cold = coldCheck?.checked || false;
            if (cold) armor = Math.ceil(armor / 2);
            const finalDamage = Math.max(0, total - armor);

            const isCrit = sixes >= 2;
            const armorOriginal = parseInt(armorInput?.value) || 0;

            let html = `
                <div class="damage-roll-result">
                    <div class="damage-roll-formula">
                        <strong>${diceString}</strong> → [${rolls.join(', ')}] = <strong>${total}</strong>
                    </div>
                    <div class="damage-roll-armor">
                        ${cold ? '⚔️ Холодное оружие — ОС делится на 2:<br>' : ''}
                        ОС брони цели: ${armorOriginal} → поглощено ${armor}
                    </div>
                    <div class="damage-roll-final">
                        💥 Итоговый урон: <strong>${finalDamage} ПЗ</strong>
                    </div>
            `;

            if (isCrit) {
                html += `
                    <div class="damage-roll-crit">
                        💀 <strong>КРИТИЧЕСКАЯ ТРАВМА!</strong> (${sixes} шестёрки на кубах)
                        <br><span style="font-size:0.85em; color:#9aa4bf;">→ Перейди во вкладку «🩹 Травмы» и брось крит</span>
                    </div>
                `;
            }

            html += `</div>`;
            if (damageResultDiv) damageResultDiv.innerHTML = html;
        });
    }

    // ─── Критические травмы ──────────────────────────────────
    attachCritHandlers() {
        document.getElementById('rollCritBtn')?.addEventListener('click', () => {
            const r = Math.floor(Math.random() * 11) + 2;
            const crit = critBody.find(c => c.roll === r);
            document.getElementById('critResult').innerHTML = `
                <div class="crit-roll-result">
                    <div><strong>По телу:</strong> 2d6 → <strong>${r}</strong></div>
                    <div class="crit-name">${crit ? crit.name : '— не найдено —'}</div>
                    <div class="crit-effect">${crit ? crit.effect : ''}</div>
                    ${crit && crit.treat ? `<div class="crit-treat">Лечение: ${crit.treat}</div>` : ''}
                </div>
            `;
        });

        document.getElementById('rollCritHeadBtn')?.addEventListener('click', () => {
            const r = Math.floor(Math.random() * 11) + 2;
            const crit = critHead.find(c => c.roll === r);
            document.getElementById('critResult').innerHTML = `
                <div class="crit-roll-result">
                    <div><strong>По голове:</strong> 2d6 → <strong>${r}</strong></div>
                    <div class="crit-name">${crit ? crit.name : '— не найдено —'}</div>
                    <div class="crit-effect">${crit ? crit.effect : ''}</div>
                    ${crit && crit.treat ? `<div class="crit-treat">Лечение: ${crit.treat}</div>` : ''}
                </div>
            `;
        });
    }

    // ─── Бросок кубиков ──────────────────────────────────────
    rollDice(diceString) {
        const [count, sides] = diceString.split('d').map(Number);
        let total = 0;
        const rolls = [];
        let sixes = 0;
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
            if (roll === 6) sixes++;
        }
        return { total, rolls, sixes };
    }
}