// modules/market/shop.js
import { rangedWeapons, meleeWeapons, armors, gearItems, ammoTypes, weaponAttachments, detailedCyberware } from '../../data.js';
import { loadCharacter, saveCharacter } from '../../storage.js';

export class ShopUI {
    constructor() {
        this.container = document.getElementById('shopContainer');
        if (!this.container) return;
        this.categories = [
            { id: 'weapons', name: '🔫 Оружие', items: [...rangedWeapons, ...meleeWeapons] },
            { id: 'armor', name: '🛡️ Броня', items: armors },
            { id: 'gear', name: '🎒 Снаряжение', items: gearItems },
            { id: 'cyberware', name: '🧠 Киберимпланты', items: detailedCyberware },
            { id: 'ammo', name: '🔫 Боеприпасы', items: ammoTypes },
            { id: 'attachments', name: '🔧 Приспособления', items: weaponAttachments }
        ];
        this.render();
    }

    getCharacter() {
        let char = loadCharacter();
        if (!char) {
            char = { money: 1000, gear: { weapons: [], armor: { body: '', head: '' }, items: [] }, cyberware: [] };
            saveCharacter(char);
        }
        if (char.money === undefined) char.money = 1000;
        return char;
    }

    saveCharacter(char) {
        saveCharacter(char);
        if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
        if (window.inventoryUI) window.inventoryUI.render(); // обновляем инвентарь
    }

    render() {
        const char = this.getCharacter();
        let html = `<div class="shop-header"><h3>🛒 Магазин</h3><div class="shop-money">💰 Ваши деньги: <strong>${char.money} eb</strong></div></div>`;
        for (const cat of this.categories) {
            html += `<div class="shop-category"><h4>${cat.name}</h4><div class="shop-items-grid">`;
            for (const item of cat.items) {
                html += `<div class="shop-item" data-item='${JSON.stringify({ name: item.name, cost: item.cost, type: cat.id })}'>
                            <div class="shop-item-name">${item.name}</div>
                            <div class="shop-item-price">${item.cost} eb</div>
                            <button class="buy-btn" data-item='${JSON.stringify({ name: item.name, cost: item.cost, type: cat.id })}'>Купить</button>
                         </div>`;
            }
            html += `</div></div>`;
        }
        this.container.innerHTML = html;
        this.attachEvents(); // привязываем обработчики после обновления DOM
    }

    attachEvents() {
        this.container.querySelectorAll('.buy-btn').forEach(btn => {
            btn.removeEventListener('click', this._buyHandler);
            this._buyHandler = () => {
                const itemData = JSON.parse(btn.dataset.item);
                this.buyItem(itemData);
            };
            btn.addEventListener('click', this._buyHandler);
        });
    }

    buyItem(item) {
        const char = this.getCharacter();
        if (char.money < item.cost) {
            alert('Недостаточно средств!');
            return;
        }
        switch (item.type) {
            case 'weapons':
                if (!char.gear.weapons) char.gear.weapons = [];
                char.gear.weapons.push(item.name);
                break;
            case 'armor':
                if (!char.gear.armor) char.gear.armor = { body: '', head: '' };
                if (!char.gear.armor.body) char.gear.armor.body = item.name;
                else if (!char.gear.armor.head) char.gear.armor.head = item.name;
                else { alert('У вас уже есть броня на тело и голову. Сначала продайте старую.'); return; }
                break;
            case 'gear':
                if (!char.gear.items) char.gear.items = [];
                char.gear.items.push(item.name);
                break;
            case 'cyberware':
                if (!char.cyberware) char.cyberware = [];
                char.cyberware.push(item.name);
                break;
            case 'ammo':
                if (!char.ammo) char.ammo = [];
                char.ammo.push(item.name);
                break;
            case 'attachments':
                if (!char.attachments) char.attachments = [];
                char.attachments.push(item.name);
                break;
        }
        char.money -= item.cost;
        this.saveCharacter(char);
        this.render(); // перерисовываем магазин (обновляются деньги)
    }
}

export class InventoryUI {
    constructor() {
        this.container = document.getElementById('inventoryContainer');
        if (!this.container) return;
        this.render();
    }

    getCharacter() {
        let char = loadCharacter();
        if (!char) {
            char = { money: 1000, gear: { weapons: [], armor: { body: '', head: '' }, items: [] }, cyberware: [] };
            saveCharacter(char);
        }
        if (char.money === undefined) char.money = 1000;
        return char;
    }

    getItemCost(name) {
        const all = [...rangedWeapons, ...meleeWeapons, ...armors, ...gearItems, ...ammoTypes, ...weaponAttachments, ...detailedCyberware];
        const found = all.find(i => i.name === name);
        return found ? found.cost : 0;
    }

    render() {
        const char = this.getCharacter();
        const weapons = char.gear?.weapons || [];
        const armorBody = char.gear?.armor?.body || 'нет';
        const armorHead = char.gear?.armor?.head || 'нет';
        const items = char.gear?.items || [];
        const cyberware = char.cyberware || [];
        const ammo = char.ammo || [];
        const attachments = char.attachments || [];

        const renderSellList = (arr, type) => {
            return arr.map((name, idx) => {
                const price = Math.floor(this.getItemCost(name) * 0.5);
                return `<div class="inventory-item">
                            <span>${name}</span>
                            <button class="sell-btn" data-type="${type}" data-name="${name}" data-idx="${idx}">Продать (${price} eb)</button>
                         </div>`;
            }).join('');
        };

        let html = `<div class="inventory-header"><h3>🎒 Инвентарь</h3><div class="shop-money">💰 Ваши деньги: <strong>${char.money} eb</strong></div></div>`;
        html += `<div class="inventory-sections">
            <div class="inventory-section"><h4>🔫 Оружие</h4>${renderSellList(weapons, 'weapon')}</div>
            <div class="inventory-section"><h4>🛡️ Броня</h4>
                <div>Тело: ${armorBody} ${armorBody !== 'нет' ? `<button class="sell-btn" data-type="armorBody" data-name="${armorBody}">Продать (${Math.floor(this.getItemCost(armorBody) * 0.5)} eb)</button>` : ''}</div>
                <div>Голова: ${armorHead} ${armorHead !== 'нет' ? `<button class="sell-btn" data-type="armorHead" data-name="${armorHead}">Продать (${Math.floor(this.getItemCost(armorHead) * 0.5)} eb)</button>` : ''}</div>
            </div>
            <div class="inventory-section"><h4>🎒 Снаряжение</h4>${renderSellList(items, 'item')}</div>
            <div class="inventory-section"><h4>🦾 Киберимпланты</h4>${renderSellList(cyberware, 'cyberware')}</div>
            <div class="inventory-section"><h4>🔫 Боеприпасы</h4>${renderSellList(ammo, 'ammo')}</div>
            <div class="inventory-section"><h4>🔧 Приспособления</h4>${renderSellList(attachments, 'attachment')}</div>
        </div>`;
        this.container.innerHTML = html;
        this.attachEvents(); // привязываем обработчики к новым кнопкам
    }

    attachEvents() {
        this.container.querySelectorAll('.sell-btn').forEach(btn => {
            btn.removeEventListener('click', this._sellHandler);
            this._sellHandler = () => {
                const type = btn.dataset.type;
                const name = btn.dataset.name;
                const idx = parseInt(btn.dataset.idx);
                this.sellItem(type, name, idx);
            };
            btn.addEventListener('click', this._sellHandler);
        });
    }

    sellItem(type, name, idx) {
        const char = this.getCharacter();
        const price = Math.floor(this.getItemCost(name) * 0.5);
        char.money += price;
        switch (type) {
            case 'weapon': char.gear.weapons.splice(idx, 1); break;
            case 'armorBody': char.gear.armor.body = ''; break;
            case 'armorHead': char.gear.armor.head = ''; break;
            case 'item': char.gear.items.splice(idx, 1); break;
            case 'cyberware': char.cyberware.splice(idx, 1); break;
            case 'ammo': char.ammo.splice(idx, 1); break;
            case 'attachment': char.attachments.splice(idx, 1); break;
        }
        this.saveCharacter(char);
        this.render(); // перерисовываем инвентарь
        if (window.shopUI) window.shopUI.render(); // обновляем магазин (деньги)
    }

    saveCharacter(char) {
        saveCharacter(char);
        if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    }
}