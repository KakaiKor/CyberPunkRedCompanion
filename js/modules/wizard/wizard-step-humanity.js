import { detailedCyberware } from '../../data.js';

export function renderHumanityStep(data) {
    const emp = data.stats?.EMP || 6;
    const baseHumanity = emp * 10;
    let loss = 0;
    for (const name of (data.cyberware || [])) {
        const implant = detailedCyberware.find(i => i.name === name);
        if (implant) loss += parseInt(implant.humanity) || 0;
    }
    const finalHumanity = Math.max(0, baseHumanity - loss);
    const risk = finalHumanity <= 0 ? '💀 КИБЕРПСИХОЗ!' : (finalHumanity < 30 ? '⚠️ Высокий риск' : (finalHumanity < 50 ? '⚠️ Средний риск' : '✅ Норма'));
    return `
        <h3>🧠 Человечность и киберпсихоз</h3>
        <div class="humanity-stats">
            <div>Базовое значение: ${baseHumanity} (ЭМП = ${emp})</div>
            <div>Потеря от имплантов: -${loss}</div>
            <div><strong>Итоговая ЧЕЛ: ${finalHumanity}</strong></div>
            <div class="risk-indicator ${finalHumanity <= 0 ? 'high-risk' : ''}">${risk}</div>
        </div>
        <p class="note">При ЧЕЛ ≤ 0 персонаж становится киберпсихотиком и переходит под контроль Мастера.</p>
    `;
}