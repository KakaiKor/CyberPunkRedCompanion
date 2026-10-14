import { loadCharacter } from '../../storage.js';
import { rangedWeapons, meleeWeapons } from '../../data.js';
export class CombatFormulas {
            constructor() {
        this.fillDistanceTable();
        document.getElementById('combatType')?.addEventListener('change', () => this.toggleFields());
                // Помечаем поле СЛ как «изменённое вручную»
        document.getElementById('attackSL')?.addEventListener('input', (e) => {
            e.target.dataset.userEdited = '1';
        });
        document.getElementById('calcAttackBtn')?.addEventListener('click', () => this.calculateAttack());

        // Кнопка броска d10
        document.getElementById('rollAttackD10')?.addEventListener('click', () => {
            const d10 = Math.floor(Math.random() * 10) + 1;
            const input = document.getElementById('d10Roll');
            if (input) input.value = d10;
        });

        // Выбор оружия из инвентаря
        document.getElementById('attackWeaponSelect')?.addEventListener('change', (e) => {
            this.applyWeapon(e.target.value);
        });

        // Кнопка «Из карточки»
        document.getElementById('loadFromCharBtn')?.addEventListener('click', () => {
            this.loadFromCharacter();
        });

        this.populateWeaponSelect();
        this.toggleFields();

        // Автоподстановка РЕФ/навыков при первом открытии
        setTimeout(() => this.loadFromCharacter(), 100);

        // Обновление селекта при изменении персонажа (импорт/снаряжение)
        window.addEventListener('characterUpdated', () => {
            this.populateWeaponSelect();
        });
    }

        toggleFields() {
        const type = document.getElementById('combatType').value;
        const rangedDiv = document.getElementById('rangedFields');
        const meleeDiv = document.getElementById('meleeFields');
        const slLabel = document.getElementById('attackSLLabel');
        const slHint = document.getElementById('attackSLHint');
        const slInput = document.getElementById('attackSL');

        if (type === 'ranged') {
            if (rangedDiv) rangedDiv.style.display = 'block';
            if (meleeDiv) meleeDiv.style.display = 'none';
            if (slLabel) slLabel.textContent = 'СЛ дистанции:';
            if (slHint) slHint.textContent = 'СЛ берётся из таблицы дистанций для выбранного оружия. Если цель уклоняется (РЕФ ≥ 8) — введи её результат: ЛВК + Уклонение + 1d10.';
            // Дефолт для дальнего боя — 15 (средняя дистанция)
            if (slInput && !slInput.dataset.userEdited) slInput.value = 15;
        } else {
            if (rangedDiv) rangedDiv.style.display = 'none';
            if (meleeDiv) meleeDiv.style.display = 'block';
            if (slLabel) slLabel.textContent = 'Результат уклонения цели:';
            if (slHint) slHint.textContent = 'Для рукопашной СЛ = ЛВК + Уклонение + 1d10 цели. Если цель не уклоняется — СЛ 13 (обычная сложность).';
            // Дефолт для рукопашной — 13
            if (slInput && !slInput.dataset.userEdited) slInput.value = 13;
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
        html += `</tbody>
        </table>
        </div>
        `;
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
            attackDesc = `${ref} (РЕФ) + ${skill} (навык) + ${roll} (d10) + ${mod} (мод)`;
        } else {
            const dex = parseInt(document.getElementById('dexValue').value) || 0;
            const skill = parseInt(document.getElementById('meleeSkill').value) || 0;
            attackValue = dex + skill + roll + mod;
            attackDesc = `${dex} (ЛВК) + ${skill} (навык) + ${roll} (d10) + ${mod} (мод)`;
        }

        // Берём СЛ из поля, а не через prompt
        const slInput = document.getElementById('attackSL');
        const target = parseInt(slInput?.value);

        if (isNaN(target)) {
            document.getElementById('attackResult').innerHTML =
                `<span style="color:#ff3c5f;">❌ Введите СЛ или результат защиты цели.</span>`;
            return;
        }

        const isHit = attackValue > target;
        const excess = attackValue - target;

        let resultHtml = '';
        if (isHit) {
            let excessText = '';
            if (excess >= 10) excessText = ' (блестяще! +' + excess + ')';
            else if (excess >= 5) excessText = ' (уверенно, +' + excess + ')';
            else excessText = ' (в притирку, +' + excess + ')';

            resultHtml = `
                <div style="color:#39ff14;">
                    <strong>✅ ПОПАДАНИЕ!</strong>${excessText}<br>
                    <span style="font-family:monospace; font-size:0.85em;">${attackDesc} = <strong>${attackValue}</strong></span><br>
                    Против СЛ ${target}<br>
                    <span style="color:#9aa4bf; font-size:0.85em;">→ Переходи к броску урона. Не забудь про ОС брони цели.</span>
                </div>
            `;
        } else {
            const missBy = Math.abs(excess);
            resultHtml = `
                <div style="color:#ff9a3c;">
                    <strong>❌ ПРОМАХ</strong> (не хватило ${missBy})<br>
                    <span style="font-family:monospace; font-size:0.85em;">${attackDesc} = <strong>${attackValue}</strong></span><br>
                    Против СЛ ${target}
                </div>
            `;
        }

        document.getElementById('attackResult').innerHTML = resultHtml;
    }
        // ─── Заполнение селекта оружием из инвентаря ─────────────
    populateWeaponSelect() {
        const select = document.getElementById('attackWeaponSelect');
        if (!select) return;

        const char = loadCharacter();
        const weapons = (char && char.gear && char.gear.weapons) || [];

        // Сохраняем текущее значение
        const current = select.value;

        if (weapons.length === 0) {
            select.innerHTML = '<option value="">— нет оружия в инвентаре —</option>';
            return;
        }

        let html = '<option value="">— выберите оружие —</option>';
        weapons.forEach(name => {
            const escaped = name.replace(/"/g, '&quot;');
            html += `<option value="${escaped}">${name}</option>`;
        });

        // Опция «все» — если оружия нет в инвентаре
        html += '<option value="__manual__">— ввести вручную —</option>';

        select.innerHTML = html;

        // Восстанавливаем выбор
        if (current) select.value = current;
    }

    // ─── Применение оружия к полям ────────────────────────────
    applyWeapon(weaponName) {
        if (!weaponName || weaponName === '__manual__') return;

        const char = loadCharacter();
        if (!char) return;

        // Ищем оружие в справочниках
        const ranged = rangedWeapons.find(w => w.name === weaponName);
        const melee = meleeWeapons.find(w => w.name === weaponName);
        const weapon = ranged || melee;

        if (!weapon) {
            // Не найдено — возможно, добавлено вручную
            return;
        }

        // Определяем тип атаки
        const typeSelect = document.getElementById('combatType');
        if (typeSelect) {
            typeSelect.value = ranged ? 'ranged' : 'melee';
            this.toggleFields();
        }

        // Определяем ключ навыка
        const skillKey = ranged ? weapon.skill : this.mapMeleeToSkill(weapon);
        const skillLevel = this.findSkillLevel(char, skillKey);

        if (ranged) {
            // Для дальнобойного — подставляем РЕФ и навык
            const refInput = document.getElementById('refValue');
            const skillInput = document.getElementById('rangedSkill');

            const ref = this.getFinalStat('REF', 6);
            if (refInput) refInput.value = ref;
            if (skillInput) skillInput.value = skillLevel;

            // Показываем какой навык применён
            this.showWeaponHint(`Навык: ${skillKey} (уровень ${skillLevel}). Урон: ${weapon.dmg}. Магазин: ${weapon.mag}.`);
        } else {
            // Для рукопашного — ЛВК и навык
            const dexInput = document.getElementById('dexValue');
            const skillInput = document.getElementById('meleeSkill');

            const dex = this.getFinalStat('DEX', 6);
            if (dexInput) dexInput.value = dex;
            if (skillInput) skillInput.value = skillLevel;

            this.showWeaponHint(`Навык: ${skillKey} (уровень ${skillLevel}). Урон: ${weapon.dmg}.`);
        }

        // Обновляем СЛ если есть подходящее поле
        this.suggestSL(weaponName, ranged);
    }

    // ─── Маппинг холдного оружия на навык ────────────────────
    mapMeleeToSkill(weapon) {
        // Если у оружия явно указан навык — используем
        if (weapon.skill) return weapon.skill;
        // Иначе — «Холодное оружие» для всего, что не «Драка»
        return 'Холодное оружие';
    }

    // ─── Поиск уровня навыка в персонаже ─────────────────────
    findSkillLevel(char, skillKey) {
        if (!char || !char.skills) return 0;
        // Точное совпадение
        if (char.skills[skillKey] !== undefined) return char.skills[skillKey];
        // Частичное — «Короткоствольное» → «Короткоствольное оружие»
        const keys = Object.keys(char.skills);
        const found = keys.find(k => k.toLowerCase().includes(skillKey.toLowerCase()));
        return found ? char.skills[found] : 0;
    }

    // ─── Получить финальный ХАР ─────────────────────────────
    getFinalStat(statKey, fallback = 6) {
        if (window.__finalStats && window.__finalStats[statKey] !== undefined) {
            return window.__finalStats[statKey];
        }
        const char = loadCharacter();
        if (char && char.baseStats && char.baseStats[statKey] !== undefined) {
            return char.baseStats[statKey];
        }
        return fallback;
    }

    // ─── Загрузка данных из карточки персонажа ────────────────
    loadFromCharacter() {
        const char = loadCharacter();
        if (!char) {
            alert('Сначала создайте или загрузите персонажа.');
            return;
        }

        const ref = this.getFinalStat('REF', 6);
        const dex = this.getFinalStat('DEX', 6);

        const refInput = document.getElementById('refValue');
        const dexInput = document.getElementById('dexValue');

        if (refInput) refInput.value = ref;
        if (dexInput) dexInput.value = dex;

        // Подтянем навыки по типу
        const type = document.getElementById('combatType')?.value;
        if (type === 'ranged') {
            const rangedSkill = this.findSkillLevel(char, 'Короткоствольное');
            const skillInput = document.getElementById('rangedSkill');
            if (skillInput && rangedSkill > 0) skillInput.value = rangedSkill;
        } else {
            const meleeSkill = this.findSkillLevel(char, 'Холодное');
            const skillInput = document.getElementById('meleeSkill');
            if (skillInput && meleeSkill > 0) skillInput.value = meleeSkill;
        }

        this.showWeaponHint(`📥 Загружено из карточки: РЕФ ${ref}, ЛВК ${dex}.`);
    }

    // ─── Показать подсказку под полями ────────────────────────
    showWeaponHint(text) {
        let hint = document.getElementById('attackWeaponHint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'attackWeaponHint';
            hint.className = 'attack-weapon-hint';
            const row = document.querySelector('.attack-weapon-row');
            if (row) row.parentElement.insertBefore(hint, row.nextSibling);
        }
        hint.textContent = text;
    }

    // ─── Подсказка СЛ по дистанции (заглушка, развивается в 2.2) ──
    suggestSL(weaponName, isRanged) {
        // На этапе 2.2 сделаем полноценную модалку с дистанцией
        // Сейчас — оставляем дефолт
    }
}