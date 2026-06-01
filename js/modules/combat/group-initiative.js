export class GroupInitiative {
    constructor() {
        this.participants = [];
        this.render();
        document.getElementById('addToGroupInitBtn')?.addEventListener('click', () => this.add());
        document.getElementById('rollGroupInitBtn')?.addEventListener('click', () => this.rollAll());
        document.getElementById('clearGroupInitBtn')?.addEventListener('click', () => this.clear());
    }
    add() {
        let name = document.getElementById('groupInitName').value.trim();
        let ref = parseInt(document.getElementById('groupInitRef').value);
        if (!name) name = "Персонаж";
        if (isNaN(ref)) ref = 5;
        this.participants.push({ name, ref, init: 0 });
        this.render();
        document.getElementById('groupInitName').value = '';
    }
    rollAll() {
        this.participants = this.participants.map(p => ({ ...p, init: p.ref + Math.floor(Math.random() * 10) + 1 }));
        this.render();
    }
    clear() {
        this.participants = [];
        this.render();
    }
    render() {
        const container = document.getElementById('groupInitList');
        if (!container) return;
        if (this.participants.length === 0) { container.innerHTML = '<p>Список пуст. Добавьте участников.</p>'; return; }
        const sorted = [...this.participants].sort((a, b) => b.init - a.init);
        let html = `<table style="width:100%"><thead><tr><th>Имя</th><th>РЕФ</th><th>Инициатива</th><th></th></tr></thead><tbody>`;
        sorted.forEach((p, idx) => html += `<tr><td><strong>${p.name}</strong></td><td><strong>${p.ref}</strong></td><td><strong>${p.init || '—'}</strong></td><td><button onclick="window.groupInitiative.remove(${idx})">🗑️</button></td></tr>`);
        html += `</tbody></table>`;
        container.innerHTML = html;
    }
    remove(idx) {
        this.participants.splice(idx, 1);
        this.render();
    }
}