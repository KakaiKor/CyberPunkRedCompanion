import { marketItems, rangedWeapons, meleeWeapons, armors, detailedCyberware, gearItems } from '../data.js';

export class NightMarket {
    constructor() { this.currentGoods=[]; document.getElementById('generateMarketBtn')?.addEventListener('click',()=>this.generate()); document.getElementById('haggleMarketBtn')?.addEventListener('click',()=>this.haggle()); this.generate(); }
    generate() {
        let cat = document.getElementById('marketCategory')?.value||'all';
        let filtered = cat==='all' ? marketItems : marketItems.filter(i=>i.cat===cat);
        if(filtered.length===0) filtered=marketItems;
        this.currentGoods=[];
        for(let i=0;i<6;i++) { let item = {...filtered[Math.floor(Math.random()*filtered.length)]}; item.currentPrice = item.cost; this.currentGoods.push(item); }
        this.render();
    }
    haggle() {
        if(this.currentGoods.length===0) this.generate();
        this.currentGoods = this.currentGoods.map(item => { let mod = 0.8+Math.random()*0.8; let newPrice = Math.floor(item.cost*mod); if(newPrice<1) newPrice=1; item.currentPrice=newPrice; return item; });
        this.render();
    }
    render() {
        let html = '<ul>';
        this.currentGoods.forEach(g => html += `<li><strong>${g.name}</strong> (${g.cat}) – ${g.currentPrice} eb</li>`);
        html += `</ul><p class="note">🎲 Нажмите "Торг" для случайной скидки/наценки.</p>`;
        document.getElementById('marketList').innerHTML = html;
    }
}
export class TreasureGenerator {
    static generate() {
        const treasures = ["Боевой нож (50 eb)","Тяжёлый пистолет (100 eb)","Штурмовая винтовка (500 eb)","Лёгкий арморджек (100 eb)","Кевларовый жилет (50 eb)","Киберглаз (100 eb)","Нейролинк (500 eb)","Смэш (доза, 10 eb)","Синткок (доза, 20 eb)","Агент (100 eb)","Сумка техника (500 eb)","Рация (100 eb)","Набор отмычек (20 eb)","Стимулятор (200 eb)"];
        let count = Math.floor(Math.random()*3)+1;
        let items = [];
        for(let i=0;i<count;i++) items.push(treasures[Math.floor(Math.random()*treasures.length)]);
        let html = `<ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul><p class="note">🎲 Случайные трофеи с врага.</p>`;
        document.getElementById('treasureResult').innerHTML = html;
    }
}
export class IdealShop {
    constructor() { this.mainBudget=2550; this.styleBudget=800; this.mainRemaining=2550; this.styleRemaining=800; this.cart=[]; this.init(); }
    init() { this.renderItemSelect(); document.getElementById('shopCategory')?.addEventListener('change',()=>this.renderItemSelect()); document.getElementById('addToCartBtn')?.addEventListener('click',()=>this.addToCart()); document.getElementById('resetCartBtn')?.addEventListener('click',()=>this.resetCart()); this.updateDisplay(); }
    getItemsByCategory(cat) {
        switch(cat) {
            case 'ranged': return rangedWeapons.map(i=>({...i,price:i.cost,type:'ranged',name:i.name}));
            case 'melee': return meleeWeapons.map(i=>({...i,price:i.cost,type:'melee',name:i.name}));
            case 'armor': return armors.map(i=>({...i,price:i.cost,type:'armor',name:i.name}));
            case 'cyber': return detailedCyberware.map(i=>({...i,price:i.cost,type:'cyber',name:i.name}));
            case 'gear': return gearItems.map(i=>({...i,price:i.cost,type:'gear',name:i.name}));
            case 'style':
                let styleItems = detailedCyberware.filter(i=>i.type==='стилевые').map(i=>({...i,price:i.cost,type:'style',name:i.name}));
                const clothes = [{name:"Куртка Generic Chic",price:50},{name:"Куртка Gang Colours",price:50},{name:"Куртка Nomad Leathers",price:100},{name:"Обувь Leisurewear",price:50},{name:"Зеркальные очки",price:20},{name:"Украшения Bohemian",price:100}];
                clothes.forEach(c=>styleItems.push({...c,type:'style',price:c.price,name:c.name}));
                return styleItems;
            default: return [];
        }
    }
    renderItemSelect() {
        const cat = document.getElementById('shopCategory').value;
        const items = this.getItemsByCategory(cat);
        const container = document.getElementById('shopItemSelectContainer');
        if(!container) return;
        let html = `<label>Предмет: <select id="shopItemSelect">`;
        items.forEach(item => html += `<option value="${item.name}" data-price="${item.price}">${item.name} – ${item.price} eb</option>`);
        html += `</select></label>`;
        container.innerHTML = html;
    }
    getCurrentItem() {
        const cat = document.getElementById('shopCategory').value;
        const items = this.getItemsByCategory(cat);
        const select = document.getElementById('shopItemSelect');
        if(!select) return null;
        return items.find(i=>i.name===select.value);
    }
    addToCart() {
        const item = this.getCurrentItem();
        if(!item) return;
        const count = parseInt(document.getElementById('shopQuantity').value)||1;
        const totalPrice = item.price * count;
        const isStyle = (document.getElementById('shopCategory').value==='style');
        let budgetRemaining = isStyle ? this.styleRemaining : this.mainRemaining;
        if(totalPrice > budgetRemaining) { alert(`Недостаточно бюджета! Остаток: ${budgetRemaining} eb`); return; }
        this.cart.push({ item: item.name, price: item.price, count, totalPrice, isStyle, category: document.getElementById('shopCategory').value });
        if(isStyle) this.styleRemaining -= totalPrice;
        else this.mainRemaining -= totalPrice;
        this.updateDisplay();
    }
    resetCart() { this.cart=[]; this.mainRemaining=this.mainBudget; this.styleRemaining=this.styleBudget; this.updateDisplay(); }
    removeFromCart(index) {
        const entry = this.cart[index];
        if(entry.isStyle) this.styleRemaining += entry.totalPrice;
        else this.mainRemaining += entry.totalPrice;
        this.cart.splice(index,1);
        this.updateDisplay();
    }
    updateDisplay() {
        document.getElementById('mainRemaining').innerText = this.mainRemaining;
        document.getElementById('styleRemaining').innerText = this.styleRemaining;
        const cartContainer = document.getElementById('cartList');
        if(!cartContainer) return;
        if(this.cart.length===0) { cartContainer.innerHTML='<p>Корзина пуста.</p>'; return; }
        let html = `<table style="width:100%"><thead><tr><th>Предмет</th><th>Цена (за шт.)</th><th>Кол-во</th><th>Стоимость</th><th>Тип бюджета</th><th></th></tr></thead><tbody>`;
        this.cart.forEach((entry,idx)=> html += `<tr><td>${entry.item}</td><td>${entry.price} eb</td><td>${entry.count}</td><td>${entry.totalPrice} eb</td><td>${entry.isStyle?'стиль':'основной'}</td><td><button class="remove-cart-item" data-idx="${idx}">🗑️</button></td></tr>`);
        html += `</tbody></table>`;
        cartContainer.innerHTML = html;
        document.querySelectorAll('.remove-cart-item').forEach(btn => btn.addEventListener('click',(e)=>this.removeFromCart(parseInt(e.target.dataset.idx))));
    }
}