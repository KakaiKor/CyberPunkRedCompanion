import { rangedWeapons, meleeWeapons, armors, detailedCyberware, critBody, critHead, gearItems, streetDrugs, ammoTypes, weaponAttachments, transport } from '../data.js';

export function renderRanged(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Навык</th><th>Урон</th><th>Маг.</th><th>СКОР</th><th>Рук</th><th>Скрыть</th><th>Цена</th></tr></thead><tbody>${data.map(w => `<tr><td>${w.name}</td><td>${w.skill}</td><td>${w.dmg}</td><td>${w.mag}</td><td>${w.rof}</td><td>${w.hands}</td><td>${w.conceal}</td><td>${w.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderMelee(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Тип</th><th>Урон</th><th>СКОР</th><th>Скрыть</th><th>Цена</th></tr></thead><tbody>${data.map(w => `<tr><td>${w.name}</td><td>${w.type}</td><td>${w.dmg}</td><td>${w.rof}</td><td>${w.conceal}</td><td>${w.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderArmor(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>ОС</th><th>Штраф</th><th>Цена</th></tr></thead><tbody>${data.map(a => `<tr><td>${a.name}</td><td>${a.sp}</td><td>${a.penalty}</td><td>${a.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderCrit(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>2d6</th><th>Травма</th><th>Эффект</th><th>Быстрая помощь</th><th>Лечение</th></tr></thead><tbody>${data.map(c => `<tr><td>${c.roll}</td><td><strong>${c.name}</strong></td><td>${c.effect}</td><td>${c.quick}</td><td>${c.treat}</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderCyberware(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Тип</th><th>Установка</th><th>Эффект</th><th>Цена</th><th>ПЧ</th><th>Прим.</th></tr></thead><tbody>${data.map(c => `<tr><td>${c.name}</td><td>${c.type}</td><td>${c.install}</td><td>${c.effect}</td><td>${c.cost} eb</td><td>${c.humanity}</td><td>${c.notes || ''}</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderSkills() {
    return `<div class="table-wrapper">
        <table class="cyber-table">
            <thead><tr><th>Навык</th><th>ХАР</th><th>Описание</th></tr></thead>
            <tbody>
                <tr><td>Атлетика</td><td>ЛВК</td><td>Прыжки, лазание, плавание</td></tr>
                <tr><td>Восприятие</td><td>ИНТ</td><td>Обнаружение скрытого</td></tr>
                <tr><td>Драка</td><td>ЛВК</td><td>Кулачный бой</td></tr>
                <tr><td>Уклонение</td><td>ЛВК</td><td>Уклонение от атак (РЕФ 8+ для пуль)</td></tr>
                <tr><td>Короткоствольное оружие</td><td>РЕФ</td><td>Пистолеты, ПП</td></tr>
                <tr><td>Длинноствольное оружие</td><td>РЕФ</td><td>Винтовки, дробовики</td></tr>
                <tr><td>Автоогонь</td><td>РЕФ</td><td>Автоматическая стрельба</td></tr>
                <tr><td>Холодное оружие</td><td>ЛВК</td><td>Ножи, мечи, дубины</td></tr>
                <tr><td>Убеждение</td><td>КРУТ</td><td>Уговоры, влияние</td></tr>
                <tr><td>Общение</td><td>ЭМП</td><td>Выведывание информации</td></tr>
                <tr><td>Первая помощь</td><td>ТЕХ</td><td>Экстренная стабилизация</td></tr>
                <tr><td>Парамедицина</td><td>ТЕХ</td><td>Лечение критических травм</td></tr>
                <tr><td>Скрытность</td><td>ЛВК</td><td>Тихое передвижение</td></tr>
                <tr><td>Вождение</td><td>РЕФ</td><td>Управление наземным транспортом</td></tr>
                <tr><td>Выживание в дикой местности</td><td>ИНТ</td><td>Выживание в пустошах</td></tr>
            </tbody>
        </table>
        <p class="note">* Полный список (40+ навыков) в книге правил.</p>
    </div>`;
}
export function renderGear(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Категория</th><th>Цена</th><th>Описание</th><th>Эффект</th></tr></thead><tbody>${data.map(g => `<tr><td><strong>${g.name}</strong></td><td>${g.category}</td><td>${g.cost} eb</td><td>${g.description}</td><td>${g.effect || '—'}</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderDrugs(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Длительность</th><th>Эффект</th><th>Побочный эффект</th><th>Цена</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.name}</td><td>${d.duration}</td><td>${d.effect}</td><td>${d.sideEffect}</td><td>${d.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderAmmo(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Тип</th><th>Эффект</th><th>Цена</th></tr></thead><tbody>${data.map(a => `<tr><td>${a.name}</td><td>${a.effect}</td><td>${a.cost}</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderAttachments(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Эффект</th><th>Цена</th></tr></thead><tbody>${data.map(a => `<tr><td>${a.name}</td><td>${a.effect}</td><td>${a.cost} eb</td></tr>`).join('')}</tbody></table></div>`;
}
export function renderTransport(data) {
    return `<div class="table-wrapper"><table class="cyber-table"><thead><tr><th>Название</th><th>Тип</th><th>ПСП</th><th>Мест</th><th>СКО (бой)</th><th>Скорость</th><th>Цена</th></tr></thead><tbody>${data.map(t => `<tr><td><strong>${t.name}</strong></td><td>${t.type}</td><td>${t.psp}</td><td>${t.seats}</td><td>${t.speedCombat}</td><td>${t.speedNarrative}</td><td>${t.cost.toLocaleString()} eb</td></tr>`).join('')}</tbody></table></div>`;
}
// ... существующие импорты

export function renderFilteredCyberware() {
    const filterValue = document.getElementById('cyberFilter')?.value || 'all';
    let filtered = detailedCyberware;
    if (filterValue !== 'all') {
        filtered = detailedCyberware.filter(c => c.type === filterValue);
    }
    const html = renderCyberware(filtered);
    if (document.getElementById('cyber-detailed-table')) {
        document.getElementById('cyber-detailed-table').innerHTML = html;
    }
    if (document.getElementById('cyber-detailed-table-gear')) {
        document.getElementById('cyber-detailed-table-gear').innerHTML = html;
    }
}

// Обновляем updateAllTables, заменяем прямые вызовы renderCyberware на renderFilteredCyberware
export function updateAllTables() {
    if (document.getElementById('ranged-table')) document.getElementById('ranged-table').innerHTML = renderRanged(rangedWeapons);
    if (document.getElementById('melee-table')) document.getElementById('melee-table').innerHTML = renderMelee(meleeWeapons);
    if (document.getElementById('armor-table')) document.getElementById('armor-table').innerHTML = renderArmor(armors);
    if (document.getElementById('crit-body-table')) document.getElementById('crit-body-table').innerHTML = renderCrit(critBody);
    if (document.getElementById('crit-head-table')) document.getElementById('crit-head-table').innerHTML = renderCrit(critHead);
    if (document.getElementById('skillsTable')) document.getElementById('skillsTable').innerHTML = renderSkills();
    if (document.getElementById('transport-table')) document.getElementById('transport-table').innerHTML = renderTransport(transport);
    if (document.getElementById('drugs-table')) document.getElementById('drugs-table').innerHTML = renderDrugs(streetDrugs);
    if (document.getElementById('ammo-table')) document.getElementById('ammo-table').innerHTML = renderAmmo(ammoTypes);
    if (document.getElementById('attachments-table')) document.getElementById('attachments-table').innerHTML = renderAttachments(weaponAttachments);
    if (document.getElementById('gear-table')) document.getElementById('gear-table').innerHTML = renderGear(gearItems);
    
    // Вместо прямых вызовов renderCyberware используем фильтрующую функцию
    renderFilteredCyberware();
}

// В filterTables тоже нужно учитывать фильтр типа? filterTables уже есть, он ищет по тексту.
// Для совместимости: при глобальном поиске фильтр по типу сбрасывается – оставляем как есть.
export function filterTables(term) {
    const flt = arr => arr.filter(i => JSON.stringify(i).toLowerCase().includes(term));
    if(document.getElementById('ranged-table')) document.getElementById('ranged-table').innerHTML = renderRanged(flt(rangedWeapons));
    if(document.getElementById('melee-table')) document.getElementById('melee-table').innerHTML = renderMelee(flt(meleeWeapons));
    if(document.getElementById('armor-table')) document.getElementById('armor-table').innerHTML = renderArmor(flt(armors));
    if(document.getElementById('crit-body-table')) document.getElementById('crit-body-table').innerHTML = renderCrit(flt(critBody));
    if(document.getElementById('crit-head-table')) document.getElementById('crit-head-table').innerHTML = renderCrit(flt(critHead));
    if(document.getElementById('transport-table')) document.getElementById('transport-table').innerHTML = renderTransport(flt(transport));
    if(document.getElementById('drugs-table')) document.getElementById('drugs-table').innerHTML = renderDrugs(flt(streetDrugs));
    if(document.getElementById('ammo-table')) document.getElementById('ammo-table').innerHTML = renderAmmo(flt(ammoTypes));
    if(document.getElementById('attachments-table')) document.getElementById('attachments-table').innerHTML = renderAttachments(flt(weaponAttachments));
    if(document.getElementById('gear-table')) document.getElementById('gear-table').innerHTML = renderGear(flt(gearItems));
    if(document.getElementById('cyber-detailed-table')) document.getElementById('cyber-detailed-table').innerHTML = renderCyberware(flt(detailedCyberware));
    if(document.getElementById('cyber-detailed-table-gear')) document.getElementById('cyber-detailed-table-gear').innerHTML = renderCyberware(flt(detailedCyberware));
}