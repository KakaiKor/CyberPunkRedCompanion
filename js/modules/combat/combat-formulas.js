export class CombatFormulas {
    constructor() {
        this.fillDistanceTable();
        document.getElementById('combatType')?.addEventListener('change', () => this.toggleFields());
        document.getElementById('calcAttackBtn')?.addEventListener('click', () => this.calculateAttack());
        this.toggleFields();
    }

    toggleFields() {
        const type = document.getElementById('combatType').value;
        const rangedDiv = document.getElementById('rangedFields');
        const meleeDiv = document.getElementById('meleeFields');
        if (type === 'ranged') {
            if (rangedDiv) rangedDiv.style.display = 'block';
            if (meleeDiv) meleeDiv.style.display = 'none';
        } else {
            if (rangedDiv) rangedDiv.style.display = 'none';
            if (meleeDiv) meleeDiv.style.display = 'block';
        }
    }

    fillDistanceTable() {
        const container = document.getElementById('distanceTable');
        if (!container) return;
        const weapons = [
            { name: "Пистолет", values: [13, 15, 20, 25, 30, 30, "—", "—"] },
            { name: "Пистолет-пулемёт", values: [15, 13, 15, 20, 25, 25, 30, "—"] },
            { name: "Дробовик", values: [13, 15, 20, 25, 30, 35, "—", "—"] },
            { name: "Штурмовая винтовка", values: [17, 16, 15, 13, 15, 20, 25, 30] },
            { name: "Снайперская винтовка", values: [30, 25, 25, 20, 15, 16, 17, 20] },
            { name: "Лук/арбалет", values: [15, 13, 15, 17, 20, 22, "—", "—"] },
            { name: "Гранатомёт", values: [16, 15, 15, 17, 20, 22, 25, "—"] },
            { name: "Ракетница", values: [17, 16, 15, 15, 20, 20, 25, 30] }
        ];
        let html = `<div class="table-wrapper"><table class="cyber-table">
            <thead><tr><th>Оружие</th><th>0-6м</th><th>7-12м</th><th>13-25м</th><th>26-50м</th><th>51-100м</th><th>101-200м</th><th>201-400м</th><th>401-800м</th></tr></thead>
            <tbody>`;
        weapons.forEach(w => {
            html += `<tr><td><strong>${w.name}</strong></td>`;
            w.values.forEach(v => html += `<td>${v}</td>`);
            html += `</tr>`;
        });
        html += `</tbody></table></div><p class="note">* Автоогонь использует другие СЛ (см. книгу правил).</p>`;
        container.innerHTML = html;
    }

    calculateAttack() {
        const type = document.getElementById('combatType').value;
        const roll = parseInt(document.getElementById('d10Roll').value) || 1;
        const mod = parseInt(document.getElementById('modifiers').value) || 0;

        let attackValue = 0;
        let attackDesc = "";

        if (type === 'ranged') {
            const ref = parseInt(document.getElementById('refValue').value) || 0;
            const skill = parseInt(document.getElementById('rangedSkill').value) || 0;
            attackValue = ref + skill + roll + mod;
            attackDesc = `${ref} (РЕФ) + ${skill} (навык) + ${roll} (d10) + ${mod} (мод) = ${attackValue}`;
        } else {
            const dex = parseInt(document.getElementById('dexValue').value) || 0;
            const skill = parseInt(document.getElementById('meleeSkill').value) || 0;
            attackValue = dex + skill + roll + mod;
            attackDesc = `${dex} (ЛВК) + ${skill} (навык) + ${roll} (d10) + ${mod} (мод) = ${attackValue}`;
        }

        const slOrDefense = prompt(
            "Введите СЛ дистанции (или результат защиты цели):\n" +
            "Примеры СЛ: 13 (средняя дистанция), 15 (трудная), 17 (профессиональная).\n" +
            "Если цель уклоняется (РЕФ≥8), введите её результат: ЛВК+Уклонение+1d10."
        );
        if (slOrDefense === null) return;

        const target = parseInt(slOrDefense);
        if (isNaN(target)) {
            document.getElementById('attackResult').innerHTML = `<span style="color:#ff3c5f;">❌ Некорректное значение СЛ/защиты.</span>`;
            return;
        }

        const isHit = attackValue > target;
        const resultHtml = `
            <strong>🎯 Результат атаки:</strong> ${attackValue}<br>
            <strong>🛡️ Сопротивление:</strong> ${target}<br>
            <strong>${isHit ? '✅ ПОПАДАНИЕ!' : '❌ ПРОМАХ'}</strong><br>
            ${isHit ? 'Нанесите урон: бросьте кубики оружия, вычтите ОС брони (для холодного – половину).' : ''}
        `;
        document.getElementById('attackResult').innerHTML = resultHtml;
    }
}