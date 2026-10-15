import { loadCharacter } from '../../storage.js';
import { rangedWeapons, meleeWeapons } from '../../data.js';
export class CombatFormulas {
            constructor() {
        // Глобальный доступ для inline-onclick на кнопке 📏 (страховка от потери контекста)
        window.__toggleDistWidget = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            this.toggleDistanceWidget();
        };

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

        // // Кнопка «📏» — таблица дистанций
        // document.getElementById('showDistanceBtn')?.addEventListener('click', () => {
        //     this.toggleDistanceWidget();
        // });

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

        const distBtn = document.getElementById('showDistanceBtn');
        const distWidget = document.getElementById('distanceWidget');

        if (type === 'ranged') {
            if (rangedDiv) rangedDiv.style.display = 'block';
            if (meleeDiv) meleeDiv.style.display = 'none';
            if (slLabel) slLabel.textContent = 'СЛ дистанции:';
            if (slHint) slHint.textContent = 'СЛ берётся из таблицы дистанций для выбранного оружия. Если цель уклоняется (РЕФ ≥ 8) — введи её результат: ЛВК + Уклонение + 1d10.';
            if (distBtn) distBtn.style.display = 'inline-flex';
            // Дефолт для дальнего боя — 15 (средняя дистанция)
            if (slInput && !slInput.dataset.userEdited) slInput.value = 15;
        } else {
            if (rangedDiv) rangedDiv.style.display = 'none';
            if (meleeDiv) meleeDiv.style.display = 'block';
            if (slLabel) slLabel.textContent = 'Результат уклонения цели:';
            if (slHint) slHint.textContent = 'Для рукопашной СЛ = ЛВК + Уклонение + 1d10 цели. Если цель не уклоняется — СЛ 13 (обычная сложность).';
            if (distBtn) distBtn.style.display = 'none';
            if (distWidget) distWidget.style.display = 'none';
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

    const char = loadCharacter();
    const traumaInfo = this.getTraumaPenalties(char, type);
    const allTraumas = (char && Array.isArray(char.traumas)) ? char.traumas : [];

    let attackValue = 0;
    let attackDesc = "";

    if (type === 'ranged') {
        const ref = parseInt(document.getElementById('refValue').value) || 0;
        const skill = parseInt(document.getElementById('rangedSkill').value) || 0;
        attackValue = ref + skill + roll + mod + traumaInfo.total;
        attackDesc = `${ref} (РЕФ) + ${skill} (навык) + ${roll} (d10) + ${mod} (мод)`
            + (traumaInfo.total !== 0 ? ` + ${traumaInfo.total} (травмы)` : '');
    } else {
        const dex = parseInt(document.getElementById('dexValue').value) || 0;
        const skill = parseInt(document.getElementById('meleeSkill').value) || 0;
        attackValue = dex + skill + roll + mod + traumaInfo.total;
        attackDesc = `${dex} (ЛВК) + ${skill} (навык) + ${roll} (d10) + ${mod} (мод)`
            + (traumaInfo.total !== 0 ? ` + ${traumaInfo.total} (травмы)` : '');
    }

    // СЛ из поля
    const slInput = document.getElementById('attackSL');
    const target = parseInt(slInput?.value);

    if (isNaN(target)) {
        document.getElementById('attackResult').innerHTML =
            `<span style="color:#ff3c5f;">❌ Введите СЛ или результат защиты цели.</span>`;
        return;
    }

    const isHit = attackValue > target;
    const excess = attackValue - target;

    // ─── Блок со ВСЕМИ активными травмами ──────────────────────
    // Показываем каждую травму и помечаем, учтена ли она в броске
    let traumaBlock = '';
    if (allTraumas.length > 0) {
        const reasons = traumaInfo.reasons;   // строки вида "Название: –4 (...)"
        const items = allTraumas.map(t => {
            const name = t.name || 'Без названия';
            const isPenalty = reasons.some(r => r.startsWith(name));
            const mark = isPenalty ? '⚠️' : 'ℹ️';
            const status = isPenalty ? '<span class="trauma-affected">учтено в броске</span>'
                                     : '<span class="trauma-not-affected">не влияет на атаку</span>';
            return `<li>${mark} <strong>${this._escHtml(name)}</strong> — ${this._escHtml(t.effect || '')} ${status}</li>`;
        }).join('');

        traumaBlock = `
            <div class="attack-trauma-block">
                🩹 <strong>Активные травмы (${allTraumas.length}):</strong>
                <ul class="attack-trauma-list">${items}</ul>
            </div>
        `;
    }

    let resultHtml = '';
    if (isHit) {
        let excessText = '';
        if (excess >= 10) excessText = ` (блестяще! +${excess})`;
        else if (excess >= 5) excessText = ` (уверенно, +${excess})`;
        else excessText = ` (в притирку, +${excess})`;

        resultHtml = `
            <div style="color:#39ff14;">
                <strong>✅ ПОПАДАНИЕ!</strong>${excessText}<br>
                <span style="font-family:monospace; font-size:0.85em;">${attackDesc} = <strong>${attackValue}</strong></span><br>
                Против СЛ ${target}<br>
                <span style="color:#9aa4bf; font-size:0.85em;">→ Переходи к броску урона. Не забудь про ОС брони цели.</span>
            </div>
            ${traumaBlock}
        `;
    } else {
        const missBy = Math.abs(excess);
        resultHtml = `
            <div style="color:#ff9a3c;">
                <strong>❌ ПРОМАХ</strong> (не хватило ${missBy})<br>
                <span style="font-family:monospace; font-size:0.85em;">${attackDesc} = <strong>${attackValue}</strong></span><br>
                Против СЛ ${target}
            </div>
            ${traumaBlock}
        `;
    }

    document.getElementById('attackResult').innerHTML = resultHtml;

    // ─── [ЮКИ] Оповещаем модуль ИИ-компаньона о броске атаки ────
    const weaponName = document.getElementById('attackWeaponSelect')?.value || null;
    const skillName = (type === 'ranged')
        ? (document.getElementById('rangedSkill')?.previousElementSibling?.textContent?.includes('Навык')
            ? 'Дистанционная атака'
            : 'Дистанционная атака')
        : 'Рукопашная атака';

    window.dispatchEvent(new CustomEvent('skillCheckRolled', {
        detail: {
            skill: weaponName
                ? `${skillName}: ${weaponName}`
                : skillName,
            total: attackValue,
            d10: roll,
            mod: mod + traumaInfo.total,
            success: isHit,
            kind: 'attack',
            sl: target,
            excess: excess
        }
    }));
}

// Хелпер: безопасно экранирует HTML в названиях травм
_escHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
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
        // Если виджет дистанций открыт — обновляем его под новое оружие
        const widget = document.getElementById('distanceWidget');
        if (widget && widget.style.display !== 'none') {
            this.renderDistanceWidget(weaponName);
        }
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
    // ─── Штрафы от активных травм ────────────────────────────
// Возвращает { attack, ranged, melee, move, total, reasons }
// ─── Штрафы от активных травм ────────────────────────────
// Возвращает { attack, ranged, melee, move, total, reasons }
getTraumaPenalties(char, attackType = 'ranged') {
    const traumas = (char && Array.isArray(char.traumas)) ? char.traumas : [];
    const result = {
        attack: 0,
        ranged: 0,
        melee: 0,
        move: 0,
        total: 0,
        reasons: []
    };

    for (const t of traumas) {
        const name = (t && t.name) ? t.name : '';
        switch (name) {
            // ── Универсальные штрафы (влияют на атаку любого типа) ──
            case 'Перелом руки':
                result.attack -= 2;
                result.reasons.push(`${name}: –2 (рука повреждена)`);
                break;
            case 'Раздробленные пальцы':
                result.attack -= 4;
                result.reasons.push(`${name}: –4 к действиям этой рукой`);
                break;
            case 'Травма мозга':
            case 'Сотрясение':
                result.attack -= 2;
                result.reasons.push(`${name}: –2 ко всем действиям`);
                break;
            case 'Травма позвоночника':
                result.attack -= 2;
                result.reasons.push(`${name}: –2 (только перемещение)`);
                break;

            // ── Только к рукопашной ──
            case 'Разрыв мышц':
                result.melee -= 2;
                result.reasons.push(`${name}: –2 к рукопашным атакам`);
                break;

            // ── Только к дальнему бою ──
            case 'Потеря глаза':
                result.ranged -= 4;
                result.reasons.push(`${name}: –4 к дальним атакам`);
                break;
            case 'Повреждение глаза':
                result.ranged -= 2;
                result.reasons.push(`${name}: –2 к дальним атакам`);
                break;

            // ── Влияют на перемещение, не на атаку ──
            case 'Перелом ноги':
                result.move -= 4;
                result.reasons.push(`${name}: –4 к СКО`);
                break;
            case 'Разрыв лёгкого':
                result.move -= 2;
                result.reasons.push(`${name}: –2 к СКО`);
                break;
            case 'Оторванная нога':
                result.move -= 6;
                result.reasons.push(`${name}: –6 к СКО (нельзя уклоняться)`);
                break;

            // ── Информационные (влияют на что-то другое, но не на бросок атаки) ──
            // НЕ добавляем в reasons — они не должны менять attackValue.
            // Но их всё равно видно в блоке «Активные травмы» через allTraumas.
            case 'Оторванная рука':
            case 'Оторванная кисть':
                // – никак не влияет на броску атаки. +1 к спасброскам.
                break;
            case 'Перелом рёбер':
            case 'Инородное тело':
                // Боль при беге > 4 м — не влияет на атаку.
                break;
            case 'Хлыстовая травма шеи':
                // +1 к спасброскам.
                break;
            case 'Трещина черепа':
                // Прицельные в голову ×3.
                break;
            case 'Перелом челюсти':
                // –4 к речи.
                break;
            case 'Раздавленная трахея':
            case 'Травма трахеи':
                // Нельзя говорить.
                break;
            case 'Повреждение уха':
                // –2 к слуховому Восприятию.
                break;
            case 'Потеря уха':
                // –4 к слуховому Восприятию.
                break;
        }
    }

    // Итоговый модификатор к броску атаки
    result.total = (attackType === 'ranged')
        ? result.attack + result.ranged
        : result.attack + result.melee;

    return result;
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
         // Травмы — предупреждение в подсказке
    const traumas = char.traumas || [];
    let traumaHint = '';
    if (traumas.length > 0) {
        const names = traumas.map(t => t.name).join(', ');
        traumaHint = ` 🩹 Травмы: ${names}.`;
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

      // ─── Подсказка СЛ по дистанции ─────────────────────────
    suggestSL(weaponName, isRanged) {
        // Ничего не делаем автоматически — игрок сам решает, использовать ли виджет.
        // Но при выборе оружия на всякий случай прячем открытый виджет,
        // чтобы он не показывал СЛ от старого оружия.
        const widget = document.getElementById('distanceWidget');
        if (widget) widget.style.display = 'none';
    }

    // ─── Виджет дистанций: переключить ────────────────────
    toggleDistanceWidget() {
        const widget = document.getElementById('distanceWidget');
        if (!widget) return;

        const weaponName = document.getElementById('attackWeaponSelect')?.value;

        if (widget.style.display === 'none' || !widget.innerHTML.trim()) {
            this.renderDistanceWidget(weaponName);
            widget.style.display = 'block';
        } else {
            widget.style.display = 'none';
        }
    }

    // ─── Виджет дистанций: отрисовать ──────────────────────
    renderDistanceWidget(weaponName) {
        const widget = document.getElementById('distanceWidget');
        if (!widget) return;

        const DISTANCES = [
            { label: '0–6 м',    max: 6 },
            { label: '7–12 м',   max: 12 },
            { label: '13–25 м',  max: 25 },
            { label: '26–50 м',  max: 50 },
            { label: '51–100 м', max: 100 },
            { label: '101–200 м', max: 200 },
            { label: '201–400 м', max: 400 },
            { label: '401–800 м', max: 800 }
        ];

        // Таблица СЛ по категориям оружия (из правил Cyberpunk RED, стр. 174)
        const SL_TABLE = {
            pistol:  [13, 15, 20, 25, 30, 30, '—', '—'],
            smg:     [15, 13, 15, 20, 25, 25, 30, '—'],
            shotgun: [13, 15, 20, 25, 30, 35, '—', '—'],
            rifle:   [17, 16, 15, 13, 15, 20, 25, 30],
            sniper:  [30, 25, 25, 20, 15, 16, 17, 20],
            bow:     [15, 13, 15, 17, 20, 22, '—', '—'],
            grenade: [16, 15, 15, 17, 20, 22, 25, '—'],
            rocket:  [17, 16, 15, 15, 20, 20, 25, 30]
        };

        const CATEGORY_LABELS = {
            pistol:  'Пистолет / ПП (одиночный)',
            smg:     'Пистолет-пулемёт',
            shotgun: 'Дробовик (жакан)',
            rifle:   'Штурмовая винтовка',
            sniper:  'Снайперская винтовка',
            bow:     'Лук / арбалет',
            grenade: 'Гранатомёт',
            rocket:  'Ракетница'
        };

        const category = this.detectWeaponCategory(weaponName);

        // Если категория не определена — показываем все категории
        const categoriesToShow = category ? [category] : Object.keys(SL_TABLE);

        // Находим «золотую зону» для каждой категории
        const findGoldenIndex = (row) => {
            let bestIdx = -1, bestVal = Infinity;
            row.forEach((v, i) => {
                if (typeof v === 'number' && v < bestVal) { bestVal = v; bestIdx = i; }
            });
            return bestIdx;
        };

        let html = '';

        if (weaponName && category) {
            html += `<div class="dist-widget-title">📏 ${this._escHtml(weaponName)} <span class="dist-widget-category">(${CATEGORY_LABELS[category]})</span></div>`;
        } else if (weaponName) {
            html += `<div class="dist-widget-title">📏 ${this._escHtml(weaponName)} <span class="dist-widget-category">(категория не определена)</span></div>`;
        } else {
            html += `<div class="dist-widget-title">📏 Выберите оружие в инвентаре, чтобы увидеть точные СЛ. Ниже — все категории.</div>`;
        }

        html += `<div class="dist-widget-scroll"><table class="dist-widget-table">`;

        // Заголовок
        html += `<thead><tr><th>Оружие</th>`;
        DISTANCES.forEach(d => { html += `<th>${d.label}</th>`; });
        html += `</tr></thead><tbody>`;

        categoriesToShow.forEach(cat => {
            const row = SL_TABLE[cat];
            const goldenIdx = findGoldenIndex(row);
            html += `<tr data-category="${cat}">`;
            html += `<td class="dist-cat-name">${CATEGORY_LABELS[cat]}</td>`;
            row.forEach((v, i) => {
                const isGolden = i === goldenIdx;
                const cls = [
                    'dist-cell',
                    isGolden ? 'dist-golden' : '',
                    typeof v !== 'number' ? 'dist-empty' : ''
                ].filter(Boolean).join(' ');
                if (typeof v === 'number') {
                    html += `<td class="${cls}" data-sl="${v}" title="Клик — подставить СЛ ${v}">${v}</td>`;
                } else {
                    html += `<td class="${cls}">${v}</td>`;
                }
            });
            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        html += `<div class="dist-widget-hint">💡 Клик по ячейке — подставить СЛ в поле. <span class="dist-golden-legend">Золотая зона</span> — минимальная СЛ.</div>`;

        widget.innerHTML = html;

        // Обработчики кликов
        widget.querySelectorAll('.dist-cell[data-sl]').forEach(cell => {
            cell.addEventListener('click', () => {
                const sl = parseInt(cell.dataset.sl);
                const slInput = document.getElementById('attackSL');
                if (slInput) {
                    slInput.value = sl;
                    slInput.dataset.userEdited = '1'; // помечаем как «введено вручную» — toggleFields не перезапишет
                }
                widget.style.display = 'none';
            });
        });
    }

    // ─── Определение категории оружия по имени ────────────
    // Использует данные из rangedWeapons (name + notes), чтобы решить, к какой строке
    // таблицы дистанций отнести оружие.
    detectWeaponCategory(weaponName) {
        if (!weaponName) return null;

        // Точное совпадение в rangedWeapons
        const w = rangedWeapons.find(x => x.name === weaponName);
        const nameLower = (weaponName || '').toLowerCase();
        const notes = (w && w.notes) ? w.notes.toLowerCase() : '';

        // Снайперская — раньше всех остальных
        if (nameLower.includes('снайперск')) return 'sniper';

        // Гранатомёт / ракетница
        if (nameLower.includes('гранатомёт') || nameLower.includes('гранатомет')) return 'grenade';
        if (nameLower.includes('ракетниц')) return 'rocket';

        // Лук / арбалет
        if (nameLower.includes('лук') || nameLower.includes('арбалет')) return 'bow';

        // Дробовик
        if (nameLower.includes('дробовик')) return 'shotgun';

        // Штурмовая винтовка
        if (nameLower.includes('винтовка')) return 'rifle';

        // ПП (пистолет-пулемёт) — но не «тяжёлый ПП», там всё равно ПП-таблица
        if (nameLower.includes('пп') || nameLower.includes('пистолет-пулемёт') || nameLower.includes('пистолет-пулемет')) return 'smg';

        // Пистолеты (все разновидности)
        if (nameLower.includes('пистолет')) return 'pistol';

        // Если ничего не нашли — пробуем по навыку из справочника
        if (w && w.skill) {
            const skillLower = w.skill.toLowerCase();
            if (skillLower.includes('луки')) return 'bow';
            if (skillLower.includes('тяжёлое') || skillLower.includes('тяжелое')) return 'grenade';
            if (skillLower.includes('длинноствольн')) return 'rifle';
            if (skillLower.includes('короткоствольн')) return 'pistol';
        }

        return null;
    }

    // Хелпер: безопасно экранирует HTML (если ещё нет — добавляем)
    _escHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
    }
}