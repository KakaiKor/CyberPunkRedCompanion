export class InitiativeTracker {
    constructor() {
        this.entries = [];
        this.render();
        document.getElementById('addInitiativeBtn')?.addEventListener('click', () => this.add());
        document.getElementById('rollInitiativeForTrackerBtn')?.addEventListener('click', () => this.roll());
        document.getElementById('clearInitiativeBtn')?.addEventListener('click', () => this.clear());
    }
    render() {
        const container = document.getElementById('initiativeList');
        if (!container) return;
        if (this.entries.length === 0) { container.innerHTML = '<p>Список пуст. Добавьте участников.</p>'; return; }
        const sorted = [...this.entries].sort((a, b) => b.init - a.init);
        let html = `<table style="width:100%"><thead><tr><th>Имя</th><th>Инициатива</th><th></th></tr></thead><tbody>`;
        sorted.forEach((e, idx) => html += `<tr><td><strong>${e.name}</strong></td><td><strong>${e.init}</strong></td><td><button onclick="window.initTracker.remove(${idx})">🗑️</button></td></tr>`);
        html += `</tbody></table>`;
        container.innerHTML = html;
    }
    add() {
        const name = document.getElementById('initName').value.trim() || 'Безымянный';
        let init = parseInt(document.getElementById('initValue').value);
        if (isNaN(init)) init = 0;
        this.entries.push({ name, init });
        this.render();
        document.getElementById('initName').value = '';
        document.getElementById('initValue').value = '';
    }
    roll() {
        const ref = prompt('Введите РЕФ персонажа:', '7');
        if (ref) {
            const dice = Math.floor(Math.random() * 10) + 1;
            const init = parseInt(ref) + dice;
            document.getElementById('initValue').value = init;
            alert(`Бросок d10 = ${dice}, инициатива = ${init}`);
        }
    }
    remove(idx) {
        this.entries.splice(idx, 1);
        this.render();
    }
    clear() {
        this.entries = [];
        this.render();
    }
}