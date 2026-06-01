// modules/expenses.js
export class ExpensesCalc {
    static calc() {
        const lifestyle = parseInt(document.getElementById('lifestyleSelect').value);
        const housing = parseInt(document.getElementById('housingSelect').value);
        const total = lifestyle + housing;
        document.getElementById('expensesResult').innerHTML = `Месячные расходы: <strong>${total} eb</strong><br>(еда: ${lifestyle} eb, жильё: ${housing} eb)`;
    }
}