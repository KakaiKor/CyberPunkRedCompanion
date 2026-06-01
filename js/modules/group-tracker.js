// modules/group-tracker.js
export class GroupTracker {
    constructor() {
        this.members = [];
        this.load();
        this.render();
        document.getElementById('addMemberBtn')?.addEventListener('click', () => this.addMember());
        document.getElementById('clearGroupBtn')?.addEventListener('click', () => this.clear());
    }
    load() { let saved = localStorage.getItem('cpr_group'); if (saved) this.members = JSON.parse(saved); }
    save() { localStorage.setItem('cpr_group', JSON.stringify(this.members)); }
    addMember() {
        let name = document.getElementById('memberName').value.trim() || 'Безымянный';
        let maxHp = parseInt(document.getElementById('memberMaxHp').value);
        if (isNaN(maxHp)) maxHp = 35;
        this.members.push({ name, maxHp, currentHp: maxHp, crits: [] });
        this.save(); this.render();
        document.getElementById('memberName').value = ''; document.getElementById('memberMaxHp').value = '';
    }
    clear() { this.members = []; this.save(); this.render(); }
    getCritList() { return ["Оторванная рука","Оторванная кисть","Разрыв лёгкого","Перелом рёбер","Перелом руки","Инородное тело","Перелом ноги","Разрыв мышц","Травма позвоночника","Раздробленные пальцы","Оторванная нога","Потеря глаза","Травма мозга","Повреждение глаза","Сотрясение","Перелом челюсти","Хлыстовая травма шеи","Трещина черепа","Повреждение уха","Травма трахеи","Потеря уха"]; }
    getPenaltyForCrit(critName) {
        const penalties = { "Оторванная рука":-1,"Оторванная кисть":-1,"Разрыв лёгкого":-2,"Травма позвоночника":-1,"Раздробленные пальцы":-4,"Оторванная нога":-6,"Потеря глаза":-4,"Травма мозга":-2,"Повреждение глаза":-2,"Сотрясение":-2,"Перелом челюсти":-4,"Хлыстовая травма шеи":-1,"Повреждение уха":-2,"Потеря уха":-4,"Перелом ноги":-4,"Разрыв мышц":-2 };
        return penalties[critName] || 0;
    }
    calculateTotalPenalty(member) {
        let total = 0;
        if (member.currentHp <= Math.floor(member.maxHp / 2)) total -= 2;
        if (member.currentHp <= 0) total -= 4;
        for (let crit of member.crits) total += this.getPenaltyForCrit(crit);
        return total;
    }
    escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }
    render() {
        const container = document.getElementById('groupList');
        if (!container) return;
        if (this.members.length === 0) { container.innerHTML = '<p>Группа пуста. Добавьте персонажей.</p>'; return; }
        let html = '<div class="group-members">';
        this.members.forEach((member, idx) => {
            const penalty = this.calculateTotalPenalty(member);
            html += `
                <div class="member-card" data-member-index="${idx}">
                    <div class="member-header">
                        <div class="member-name">${this.escapeHtml(member.name)}</div>
                        <div class="member-stats">
                            <label>ПЗ: <input type="number" value="${member.currentHp}" data-field="hp" class="member-hp-input" data-idx="${idx}"></label>
                            <span class="member-penalty">Штраф: ${penalty}</span>
                            <button class="remove-member" data-idx="${idx}">✖</button>
                        </div>
                    </div>
                    <div class="member-crits">
                        <div class="crits-label">Критические травмы:</div>
                        <div class="crits-chips-container">`;
            const allCrits = this.getCritList();
            for (let crit of allCrits) {
                const active = member.crits.includes(crit);
                html += `<button type="button" class="crit-chip ${active ? 'active' : ''}" data-crit="${this.escapeHtml(crit)}">${this.escapeHtml(crit)}</button>`;
            }
            html += `</div></div></div>`;
        });
        html += '</div>';
        container.innerHTML = html;
        document.querySelectorAll('.member-hp-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                let val = parseInt(e.target.value);
                if (!isNaN(val) && this.members[idx]) {
                    this.members[idx].currentHp = val;
                    this.save();
                    this.render();
                }
            });
        });
        document.querySelectorAll('.remove-member').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                if (!isNaN(idx) && this.members[idx]) { this.members.splice(idx,1); this.save(); this.render(); }
            });
        });
        document.querySelectorAll('.crit-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const memberCard = chip.closest('.member-card');
                if (!memberCard) return;
                const memberIdx = parseInt(memberCard.dataset.memberIndex);
                if (isNaN(memberIdx) || !this.members[memberIdx]) return;
                const critName = chip.dataset.crit;
                const member = this.members[memberIdx];
                const index = member.crits.indexOf(critName);
                if (index === -1) member.crits.push(critName);
                else member.crits.splice(index,1);
                this.save();
                this.render();
            });
        });
    }
}