// modules/market/treasure-generator.js
export class TreasureGenerator {
    static generate() {
        const treasures = [
            "Боевой нож (50 eb)", "Тяжёлый пистолет (100 eb)", "Штурмовая винтовка (500 eb)",
            "Лёгкий арморджек (100 eb)", "Кевларовый жилет (50 eb)", "Киберглаз (100 eb)",
            "Нейролинк (500 eb)", "Смэш (доза, 10 eb)", "Синткок (доза, 20 eb)",
            "Агент (100 eb)", "Сумка техника (500 eb)", "Рация (100 eb)",
            "Набор отмычек (20 eb)", "Стимулятор (200 eb)"
        ];
        let count = Math.floor(Math.random() * 3) + 1;
        let items = [];
        for (let i = 0; i < count; i++) items.push(treasures[Math.floor(Math.random() * treasures.length)]);
        let html = `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul><p class="note">🎲 Случайные трофеи с врага.</p>`;
        document.getElementById('treasureResult').innerHTML = html;
    }
}