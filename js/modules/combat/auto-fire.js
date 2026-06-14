// modules/combat/auto-fire.js
import { rangedWeapons } from '../../data.js';

export class AutoFireUI {
    constructor() {
        this.weaponsList = this.getAutoFireWeapons();
        this.initUI();
    }

    // Собираем всё оружие, способное к автоогню, и извлекаем множитель
    getAutoFireWeapons() {
        const weapons = [];
        for (const w of rangedWeapons) {
            if (w.notes && w.notes.includes('Автоогонь')) {
                const match = w.notes.match(/Автоогонь\((\d+)\)/);
                let multiplier = 3; // по умолчанию
                if (match) multiplier = parseInt(match[1]);
                weapons.push({
                    name: w.name,
                    multiplier: multiplier,
                    // Сохраняем тип для группировки в таблице (ПП или винтовка)
                    category: w.name.includes('ПП') ? 'smg' : (w.name.includes('винтовка') ? 'rifle' : 'other')
                });
            }
        }
        // Добавляем экзотическое оружие, если его нет в списке (например, Helix)
        const hasHelix = weapons.some(w => w.name === 'Tsunami Arms Helix');
        if (!hasHelix) {
            weapons.push({ name: 'Tsunami Arms Helix', multiplier: 5, category: 'exotic' });
        }
        return weapons;
    }

    initUI() {
        let container = document.getElementById('combat-formulas');
        if (!container) {
            console.warn('AutoFireUI: контейнер #combat-formulas не найден');
            return;
        }
        if (!document.getElementById('autoFireCard')) {
            const card = document.createElement('div');
            card.id = 'autoFireCard';
            card.className = 'card';
            card.innerHTML = this.getHTML();
            container.appendChild(card);
            this.attachEvents();
            this.populateWeaponSelect();
            this.updateSLDisplay();
        }
    }

    getHTML() {
        return `
            <h3>🔥 Автоматический огонь (все виды оружия)</h3>
            <div class="auto-fire-form">
                <div class="form-row" style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
                    <label>РЕФ атакующего: <input type="number" id="afRef" value="6" min="2" max="10" step="1"></label>
                    <label>Навык «Автоогонь»: <input type="number" id="afSkill" value="6" min="0" max="10" step="1"></label>
                    <label>Бросок d10: 
                        <select id="afD10">
                            <option value="0">🎲 Автоматический</option>
                            <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                            <option value="4">4</option><option value="5">5</option><option value="6">6</option>
                            <option value="7">7</option><option value="8">8</option><option value="9">9</option>
                            <option value="10">10</option>
                        </select>
                    </label>
                </div>
                <div class="form-row" style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
                    <label>Оружие:
                        <select id="afWeaponSelect"></select>
                    </label>
                    <label>Дистанция (м):
                        <input type="range" id="afDistance" min="0" max="100" value="25" step="1">
                        <span id="afDistanceVal">25</span>
                    </label>
                    <label>ОС брони цели: <input type="number" id="afArmor" value="11" min="0" step="1"></label>
                </div>

                <!-- Таблица СЛ для автоогня (динамическая) -->
                <div style="margin: 15px 0; overflow-x: auto;">
                    <table class="cyber-table" style="min-width: 400px;">
                        <thead>
                            <tr><th>Оружие / категория</th><th>0-6 м</th><th>7-12 м</th><th>13-25 м</th><th>26-50 м</th><th>51-100 м</th><th>Текущая СЛ</th><th>Множитель</th></tr>
                        </thead>
                        <tbody id="autoFireTableBody">
                            <!-- строки будут добавлены динамически -->
                        </tbody>
                    </table>
                    <p class="note">* Значения СЛ для автоматического огня (стр. 173 Core Rulebook).</p>
                </div>

                <button id="calcAutoFireBtn" class="cyber-btn">🎲 Открыть огонь</button>
                <div id="autoFireResult" class="info-block" style="margin-top: 10px;"></div>
            </div>
        `;
    }

    populateWeaponSelect() {
        const select = document.getElementById('afWeaponSelect');
        if (!select) return;
        select.innerHTML = '';
        for (const w of this.weaponsList) {
            const option = document.createElement('option');
            option.value = JSON.stringify({ name: w.name, multiplier: w.multiplier, category: w.category });
            option.textContent = `${w.name} (множитель ×${w.multiplier})`;
            select.appendChild(option);
        }
        // Выбираем первый по умолчанию
        if (this.weaponsList.length > 0) select.selectedIndex = 0;
    }

    // Определяем СЛ для конкретной категории оружия
    getSL(category, distance) {
        if (category === 'smg') {
            if (distance <= 6) return 20;
            if (distance <= 12) return 17;
            if (distance <= 25) return 20;
            if (distance <= 50) return 25;
            if (distance <= 100) return 30;
            return 999;
        } else { // rifle, exotic (используем таблицу винтовки)
            if (distance <= 6) return 22;
            if (distance <= 12) return 20;
            if (distance <= 25) return 17;
            if (distance <= 50) return 20;
            if (distance <= 100) return 25;
            return 999;
        }
    }

    // Обновляет таблицу СЛ и отображает текущую СЛ для выбранного оружия
    updateSLDisplay() {
        const tbody = document.getElementById('autoFireTableBody');
        if (!tbody) return;
        // Группируем оружие для отображения в таблице (чтобы не было дубликатов)
        const groups = new Map();
        for (const w of this.weaponsList) {
            const key = `${w.category}_${w.multiplier}`;
            if (!groups.has(key)) {
                groups.set(key, { names: [], category: w.category, multiplier: w.multiplier });
            }
            groups.get(key).names.push(w.name);
        }
        // Преобразуем в массив и сортируем
        const groupArray = Array.from(groups.values());
        const distance = parseInt(document.getElementById('afDistance')?.value || '25');
        let html = '';
        for (const grp of groupArray) {
            const sl = this.getSL(grp.category, distance);
            const namesStr = grp.names.join(', ');
            html += `
                <tr>
                    <td><strong>${namesStr}</strong></td>
                    <td>${this.getSL(grp.category, 6)}</td>
                    <td>${this.getSL(grp.category, 12)}</td>
                    <td>${this.getSL(grp.category, 25)}</td>
                    <td>${this.getSL(grp.category, 50)}</td>
                    <td>${this.getSL(grp.category, 100)}</td>
                    <td>${sl >= 999 ? '—' : sl}</td>
                    <td>×${grp.multiplier}</td>
                </tr>
            `;
        }
        tbody.innerHTML = html;

        // Подсветка строки выбранного оружия
        const selectedStr = document.getElementById('afWeaponSelect')?.value;
        if (selectedStr) {
            const selected = JSON.parse(selectedStr);
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const nameCell = row.cells[0];
                if (nameCell && nameCell.innerText.includes(selected.name)) {
                    row.classList.add('active-row');
                } else {
                    row.classList.remove('active-row');
                }
            });
        }
    }

    attachEvents() {
        const distanceSlider = document.getElementById('afDistance');
        const distanceSpan = document.getElementById('afDistanceVal');
        const weaponSelect = document.getElementById('afWeaponSelect');
        if (distanceSlider && distanceSpan) {
            distanceSlider.addEventListener('input', (e) => {
                distanceSpan.innerText = e.target.value;
                this.updateSLDisplay();
            });
        }
        if (weaponSelect) {
            weaponSelect.addEventListener('change', () => this.updateSLDisplay());
        }
        const calcBtn = document.getElementById('calcAutoFireBtn');
        if (calcBtn) calcBtn.addEventListener('click', () => this.calculate());
    }

    calculate() {
        const ref = parseInt(document.getElementById('afRef')?.value || '6');
        const skill = parseInt(document.getElementById('afSkill')?.value || '6');
        let d10 = parseInt(document.getElementById('afD10')?.value || '0');
        if (d10 === 0) d10 = Math.floor(Math.random() * 10) + 1;

        const weaponSelect = document.getElementById('afWeaponSelect');
        let selectedWeapon = null;
        if (weaponSelect && weaponSelect.value) {
            selectedWeapon = JSON.parse(weaponSelect.value);
        } else if (this.weaponsList.length > 0) {
            selectedWeapon = { name: this.weaponsList[0].name, multiplier: this.weaponsList[0].multiplier, category: this.weaponsList[0].category };
        }
        if (!selectedWeapon) return;

        const multiplier = selectedWeapon.multiplier;
        const category = selectedWeapon.category;
        const distance = parseInt(document.getElementById('afDistance')?.value || '25');
        const armor = parseInt(document.getElementById('afArmor')?.value || '0');

        const sl = this.getSL(category, distance);
        const attackRoll = ref + skill + d10;
        const excess = attackRoll - sl;
        const isHit = (excess > 0 && sl !== 999);

        let resultHtml = '';
        if (!isHit) {
            resultHtml = `
                <div style="color:#ff9a3c;">
                    <strong>❌ ПРОМАХ!</strong><br>
                    Оружие: ${selectedWeapon.name}<br>
                    Бросок: ${ref} (РЕФ) + ${skill} (Автоогонь) + ${d10} = ${attackRoll}<br>
                    СЛ: ${sl} (дистанция ${distance} м)
                </div>
            `;
        } else {
            let effectiveExcess = Math.min(excess, multiplier);
            const r1 = Math.floor(Math.random() * 6) + 1;
            const r2 = Math.floor(Math.random() * 6) + 1;
            const damageRoll = r1 + r2;
            let rawDamage = damageRoll * effectiveExcess;
            let finalDamage = Math.max(0, rawDamage - armor);
            const isCritical = (r1 === 6 && r2 === 6);
            resultHtml = `
                <div style="color:#00ffcc;">
                    <strong>✅ ПОПАДАНИЕ!</strong><br>
                    Оружие: ${selectedWeapon.name} (множитель ×${multiplier})<br>
                    Бросок: ${ref}+${skill}+${d10} = ${attackRoll}<br>
                    СЛ: ${sl}, превышение: ${excess} (ограничено ×${multiplier} → ${effectiveExcess})<br>
                    Урон 2d6: [${r1},${r2}] = ${damageRoll} × ${effectiveExcess} = ${rawDamage}<br>
                    Броня цели: ${armor} → <strong>итоговый урон: ${finalDamage} ПЗ</strong><br>
                    ${isCritical ? '<span style="color:#ff3c5f;">💥 КРИТИЧЕСКАЯ ТРАВМА! (две шестёрки)</span>' : ''}
                </div>
            `;
        }
        const resultDiv = document.getElementById('autoFireResult');
        if (resultDiv) resultDiv.innerHTML = resultHtml;
    }
}