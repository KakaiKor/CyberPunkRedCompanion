import { getHP } from '../utils.js';
import { critBody, critHead } from '../data.js';

export class CombatCalculatorUI {
    constructor() {
        document.getElementById('calcHpBtn')?.addEventListener('click', () => {
            const b = parseInt(document.getElementById('calcBody').value);
            const w = parseInt(document.getElementById('calcWill').value);
            const hp = getHP(b,w);
            const severe = Math.ceil(hp/2);
            document.getElementById('calcResult').innerHTML = `<strong>ПЗ = ${hp}</strong><br>Тяжёлое ≤ ${severe}<br>Спасбросок = ${b}`;
        });
        document.getElementById('calcDamageBtn')?.addEventListener('click', () => {
            let dmg = parseInt(document.getElementById('damageInput').value);
            let armor = parseInt(document.getElementById('armorInput').value);
            const cold = document.getElementById('coldWeaponCheck').checked;
            if(cold) armor = Math.ceil(armor/2);
            const final = Math.max(0, dmg - armor);
            document.getElementById('damageResult').innerHTML = `<strong>Прошедший урон = ${final} ПЗ</strong>`;
        });
        document.getElementById('rollCritBtn')?.addEventListener('click', () => {
            const r = Math.floor(Math.random()*11)+2;
            const crit = critBody.find(c=>c.roll===r);
            document.getElementById('critResult').innerHTML = `<strong>Тело:</strong> ${r} → ${crit ? crit.name+' – '+crit.effect : 'не найден'}`;
        });
        document.getElementById('rollCritHeadBtn')?.addEventListener('click', () => {
            const r = Math.floor(Math.random()*11)+2;
            const crit = critHead.find(c=>c.roll===r);
            document.getElementById('critResult').innerHTML = `<strong>Голова:</strong> ${r} → ${crit ? crit.name+' – '+crit.effect : 'не найден'}`;
        });
    }
}
export class DistanceCalculator {
    constructor() {
        const distTable = { pistol:[13,15,20,25,30,30,null,null], smg:[15,13,15,20,25,25,30,null], shotgun:[13,15,20,25,30,35,null,null], rifle:[17,16,15,13,15,20,25,30], sniper:[30,25,25,20,15,16,17,20] };
        const ranges = [{min:0,max:6,label:"0-6 м"},{min:7,max:12,label:"7-12 м"},{min:13,max:25,label:"13-25 м"},{min:26,max:50,label:"26-50 м"},{min:51,max:100,label:"51-100 м"},{min:101,max:200,label:"101-200 м"},{min:201,max:400,label:"201-400 м"},{min:401,max:800,label:"401-800 м"}];
        const weaponSelect = document.getElementById('weaponDistanceSelect');
        const slider = document.getElementById('distanceSlider');
        const update = () => {
            const weapon = weaponSelect.value;
            const dist = parseInt(slider.value);
            document.getElementById('distanceValue').innerText = dist;
            const row = distTable[weapon];
            let sl = null;
            for(let i=0;i<ranges.length;i++) if(dist>=ranges[i].min && dist<=ranges[i].max) { sl = row[i]; break; }
            document.getElementById('slValue').textContent = (sl!==null && sl!==undefined) ? sl : "вне дальности";
            let bestIdx=-1, minSL=Infinity;
            for(let i=0;i<row.length;i++) if(row[i]!==null && row[i]<minSL) { minSL=row[i]; bestIdx=i; }
            const goldenDiv = document.getElementById('goldenZone');
            const goldenInfo = document.getElementById('goldenZoneInfo');
            if(bestIdx!==-1 && goldenDiv) {
                const left = (ranges[bestIdx].min/800)*100;
                const right = (ranges[bestIdx].max/800)*100;
                goldenDiv.style.left = `${left}%`;
                goldenDiv.style.width = `${right-left}%`;
                goldenDiv.style.display = 'block';
                goldenInfo.innerHTML = `✨ Золотая зона: ${ranges[bestIdx].label} (СЛ = ${minSL})`;
            } else if(goldenDiv) goldenDiv.style.display = 'none';
        };
        weaponSelect.addEventListener('change', update);
        slider.addEventListener('input', update);
        update();
    }
}
export class InitiativeTracker {
    constructor() { this.entries=[]; this.render(); document.getElementById('addInitiativeBtn')?.addEventListener('click',()=>this.add()); document.getElementById('rollInitiativeForTrackerBtn')?.addEventListener('click',()=>this.roll()); document.getElementById('clearInitiativeBtn')?.addEventListener('click',()=>this.clear()); }
    render() {
        const container = document.getElementById('initiativeList');
        if(!container) return;
        if(this.entries.length===0) { container.innerHTML='<p>Список пуст. Добавьте участников.</p>'; return; }
        const sorted = [...this.entries].sort((a,b)=>b.init-a.init);
        let html = `<table style="width:100%"><thead><tr><th>Имя</th><th>Инициатива</th><th></th></tr></thead><tbody>`;
        sorted.forEach((e,idx)=> html += `<tr><td>${e.name}</td><td>${e.init}</td><td><button onclick="window.initTracker.remove(${idx})">🗑️</button></td></tr>`);
        html += `</tbody></table>`;
        container.innerHTML = html;
    }
    add() { const name = document.getElementById('initName').value.trim()||'Безымянный'; let init = parseInt(document.getElementById('initValue').value); if(isNaN(init)) init=0; this.entries.push({name,init}); this.render(); document.getElementById('initName').value=''; document.getElementById('initValue').value=''; }
    roll() { const ref = prompt('Введите РЕФ персонажа:','7'); if(ref) { const dice = Math.floor(Math.random()*10)+1; const init = parseInt(ref)+dice; document.getElementById('initValue').value = init; alert(`Бросок d10 = ${dice}, инициатива = ${init}`); } }
    remove(idx) { this.entries.splice(idx,1); this.render(); }
    clear() { this.entries=[]; this.render(); }
}
export class GroupInitiative {
    constructor() { this.participants=[]; this.render(); document.getElementById('addToGroupInitBtn')?.addEventListener('click',()=>this.add()); document.getElementById('rollGroupInitBtn')?.addEventListener('click',()=>this.rollAll()); document.getElementById('clearGroupInitBtn')?.addEventListener('click',()=>this.clear()); }
    add() { let name = document.getElementById('groupInitName').value.trim(); let ref = parseInt(document.getElementById('groupInitRef').value); if(!name) name="Персонаж"; if(isNaN(ref)) ref=5; this.participants.push({name,ref,init:0}); this.render(); document.getElementById('groupInitName').value=''; }
    rollAll() { this.participants = this.participants.map(p=>({...p, init: p.ref + Math.floor(Math.random()*10)+1 })); this.render(); }
    clear() { this.participants=[]; this.render(); }
    render() {
        const container = document.getElementById('groupInitList');
        if(!container) return;
        if(this.participants.length===0) { container.innerHTML='<p>Список пуст. Добавьте участников.</p>'; return; }
        const sorted = [...this.participants].sort((a,b)=>b.init-a.init);
        let html = `<table style="width:100%"><thead><tr><th>Имя</th><th>РЕФ</th><th>Инициатива</th><th></th></tr></thead><tbody>`;
        sorted.forEach((p,idx)=> html += `<tr><td>${p.name}</td><td>${p.ref}</td><td>${p.init||'—'}</td><td><button onclick="window.groupInitiative.remove(${idx})">🗑️</button></td></tr>`);
        html += `</tbody></table>`;
        container.innerHTML = html;
    }
    remove(idx) { this.participants.splice(idx,1); this.render(); }
    
}
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
            rangedDiv.style.display = 'block';
            meleeDiv.style.display = 'none';
        } else {
            rangedDiv.style.display = 'none';
            meleeDiv.style.display = 'block';
        }
    }

    fillDistanceTable() {
        const tbody = document.getElementById('distanceTableBody');
        if (!tbody) return;
        const weapons = [
            { name: "Пистолет", values: [13,15,20,25,30,30,"—","—"] },
            { name: "Пистолет-пулемёт", values: [15,13,15,20,25,25,30,"—"] },
            { name: "Дробовик", values: [13,15,20,25,30,35,"—","—"] },
            { name: "Штурмовая винтовка", values: [17,16,15,13,15,20,25,30] },
            { name: "Снайперская винтовка", values: [30,25,25,20,15,16,17,20] },
            { name: "Лук/арбалет", values: [15,13,15,17,20,22,"—","—"] },
            { name: "Гранатомёт", values: [16,15,15,17,20,22,25,"—"] },
            { name: "Ракетница", values: [17,16,15,15,20,20,25,30] }
        ];
        tbody.innerHTML = weapons.map(w => `<tr><td>${w.name}</td>${w.values.map(v => `<td>${v === "—" ? "—" : v}</td>`).join('')}</tr>`).join('');
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