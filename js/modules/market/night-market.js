// modules/market/night-market.js
import { marketItems } from '../../data.js';

export class NightMarket {
    constructor() {
        this.currentGoods = [];
        document.getElementById('generateMarketBtn')?.addEventListener('click', () => this.generate());
        document.getElementById('haggleMarketBtn')?.addEventListener('click', () => this.haggle());
        this.generate();
    }
    generate() {
        let cat = document.getElementById('marketCategory')?.value || 'all';
        let filtered = cat === 'all' ? marketItems : marketItems.filter(i => i.cat === cat);
        if (filtered.length === 0) filtered = marketItems;
        this.currentGoods = [];
        for (let i = 0; i < 6; i++) {
            let item = { ...filtered[Math.floor(Math.random() * filtered.length)] };
            item.currentPrice = item.cost;
            this.currentGoods.push(item);
        }
        this.render();
    }
    haggle() {
        if (this.currentGoods.length === 0) this.generate();
        this.currentGoods = this.currentGoods.map(item => {
            let mod = 0.8 + Math.random() * 0.8;
            let newPrice = Math.floor(item.cost * mod);
            if (newPrice < 1) newPrice = 1;
            item.currentPrice = newPrice;
            return item;
        });
        this.render();
    }
    render() {
        let html = '<ul>';
        this.currentGoods.forEach(g => html += `<li><strong>${g.name}</strong> (${g.cat}) – ${g.currentPrice} eb</li>`);
        html += `</ul><p class="note">🎲 Нажмите "Торг" для случайной скидки/наценки.</p>`;
        document.getElementById('marketList').innerHTML = html;
    }
}