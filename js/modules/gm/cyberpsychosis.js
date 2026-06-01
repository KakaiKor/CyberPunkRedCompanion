// modules/cyberpsychosis.js

/**
 * Проверка состояния киберпсихоза по человечности
 */
export function checkCyberpsychosis() {
    const name = document.getElementById('psychoName')?.value || 'Персонаж';
    const humanity = parseInt(document.getElementById('psychoHumanity')?.value);
    if (isNaN(humanity)) {
        const resultDiv = document.getElementById('psychoResult');
        if (resultDiv) resultDiv.innerHTML = '<span style="color:#ff3c5f;">Введите значение человечности (ЧЕЛ)</span>';
        return;
    }
    const emp = Math.floor(humanity / 10);
    let stage;
    if (emp >= 3) stage = { state: "✅ Норма — стабилен", effect: "Нет особых эффектов" };
    else if (emp === 2) stage = { state: "⚠️ Пограничное расстройство", effect: "Цинизм, холодность" };
    else if (emp === 1) stage = { state: "⚠️ Тяжёлая степень", effect: "Почти полная потеря эмпатии" };
    else stage = { state: "💀 КИБЕРПСИХОЗ", effect: "Персонаж переходит под контроль ГМ!" };
    
    const resultDiv = document.getElementById('psychoResult');
    if (resultDiv) {
        resultDiv.innerHTML = `<strong>${name}</strong><br>🧠 Человечность: ${humanity} → ЭМП = ${emp}<br>📊 Состояние: ${stage.state}<br>🎭 Эффект: ${stage.effect}`;
    }
}

/**
 * Инициализация обработчика кнопки проверки киберпсихоза
 */
export function initCyberpsychosis() {
    const btn = document.getElementById('calcPsychoBtn');
    if (btn) {
        // Удаляем старый обработчик, если есть, чтобы не навешивать несколько
        btn.removeEventListener('click', checkCyberpsychosis);
        btn.addEventListener('click', checkCyberpsychosis);
    }
}