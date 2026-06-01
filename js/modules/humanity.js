// modules/humanity.js
export class HumanityCalculator {
    constructor() {
        this.curr = 60;
        this.pending = 0;
        this.updateUI();
        document.getElementById('currentHumanity')?.addEventListener('input', (e) => {
            this.curr = parseInt(e.target.value) || 0;
            this.updateUI();
        });
        document.getElementById('rollHumanityBtn')?.addEventListener('click', () => this.roll());
        document.getElementById('applyHumanityBtn')?.addEventListener('click', () => this.apply());
        document.getElementById('implantSelect')?.addEventListener('change', () => {
            this.pending = 0;
            this.updateUI();
        });
    }
    updateUI() {
        document.getElementById('humanityResult').innerHTML = `Текущая ЧЕЛ: ${this.curr} → ЭМП = ${Math.floor(this.curr / 10)}<br>Ожидает потери: ${this.pending || 'нет'}`;
    }
    roll() {
        const val = parseInt(document.getElementById('implantSelect').value);
        if (val === 14) {
            let r = 0; for (let i=0;i<4;i++) r += Math.floor(Math.random()*4)+1;
            this.pending = r;
            document.getElementById('humanityResult').innerHTML = `Бросок 4d6 = ${r}. Потеря ${r}. Нажмите "Применить".`;
        } else if (val === 7 || val === 3) {
            const r = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
            this.pending = r;
            document.getElementById('humanityResult').innerHTML = `Бросок 2d6 = ${r}. Потеря ${r}.`;
        } else {
            this.pending = 0;
            document.getElementById('humanityResult').innerHTML = 'ПЧ = 0, потери нет.';
        }
    }
    apply() {
        if (this.pending) {
            this.curr -= this.pending;
            if (this.curr < 0) this.curr = 0;
            document.getElementById('currentHumanity').value = this.curr;
            this.updateUI();
            this.pending = 0;
        } else {
            document.getElementById('humanityResult').innerHTML = 'Сначала бросьте ПЧ.';
        }
    }
}