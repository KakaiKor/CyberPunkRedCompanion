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
            { id: 'cyberware', name: '🧠 Киберимпланты', items: detailedCyberware },
            { id: 'gear', name: '🎒 Снаряжение', items: gearItems },
            { id: 'ammo', name: '🔫 Боеприпасы', items: ammoTypes },
            { id: 'attachments', name: '🔧 Приспособления', items: weaponAttachments }
        ];
        this.activeCategory = 'weapons';
        this.searchTerm = '';
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
        if (window.inventoryUI) window.inventoryUI.render();
    }

    render() {
        const char = this.getCharacter();
        let html = `
            <div class="shop-container">
                <div class="shop-header">
                    <h3>🛒 Магазин</h3>
                    <div class="shop-money">💰 Ваши деньги: <strong>${char.money} eb</strong></div>
                </div>
                <div class="shop-tabs">
                    ${this.categories.map(cat => `
                        <button class="shop-tab ${this.activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                            ${cat.name}
                        </button>
                    `).join('')}
                </div>
                <div class="shop-search">
                    <input type="text" id="shopSearchInput" placeholder="🔍 Поиск по названию, описанию, эффекту...">
                </div>
                <div class="shop-items-grid" id="shopItemsGrid">
                    ${this.renderItems()}
                </div>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEvents();
    }

    renderItems() {
        const category = this.categories.find(c => c.id === this.activeCategory);
        if (!category) return '<p>Выберите категорию</p>';
        let items = category.items;
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(term) ||
                (item.description && item.description.toLowerCase().includes(term)) ||
                (item.effect && item.effect.toLowerCase().includes(term)) ||
                (item.type && item.type.toLowerCase().includes(term))
            );
        }
        if (items.length === 0) return '<p>Ничего не найдено</p>';
        return items.map(item => this.renderItemCard(item, category.id)).join('');
    }

    renderItemCard(item, categoryId) {
        let detailsHtml = '';
        if (categoryId === 'weapons') {
            const isRanged = item.hasOwnProperty('skill');
            if (isRanged) {
                detailsHtml = `<div class="item-details">${item.skill} • ${item.dmg} • СКОР ${item.rof} • Маг. ${item.mag}</div>`;
            } else {
                detailsHtml = `<div class="item-details">${item.type} • ${item.dmg} • СКОР ${item.rof}</div>`;
            }
        } else if (categoryId === 'armor') {
            detailsHtml = `<div class="item-details">ОС ${item.sp} • Штраф ${item.penalty}</div>`;
        } else if (categoryId === 'cyberware') {
            detailsHtml = `<div class="item-details">${item.type} • ПЧ ${item.humanity} • Установка: ${item.install}</div>`;
            if (item.effect) detailsHtml += `<div class="item-desc">${item.effect.substring(0, 80)}${item.effect.length > 80 ? '…' : ''}</div>`;
        } else if (categoryId === 'gear') {
            if (item.description) detailsHtml = `<div class="item-desc">${item.description.substring(0, 80)}${item.description.length > 80 ? '…' : ''}</div>`;
            if (item.effect) detailsHtml += `<div class="item-desc">🔹 ${item.effect}</div>`;
        } else if (categoryId === 'ammo') {
            detailsHtml = `<div class="item-details">${item.effect || ''}</div>`;
        } else if (categoryId === 'attachments') {
            detailsHtml = `<div class="item-details">${item.effect}</div>`;
        }
        return `
            <div class="shop-item-card" data-item='${JSON.stringify({ name: item.name, cost: item.cost, type: categoryId })}'>
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.cost} eb</div>
                ${detailsHtml}
                <button class="buy-btn" data-item='${JSON.stringify({ name: item.name, cost: item.cost, type: categoryId })}'>Купить</button>
            </div>
        `;
    }

    attachEvents() {
        // Переключение категорий
        document.querySelectorAll('.shop-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.activeCategory = btn.dataset.category;
                this.render();
            });
        });
        // Поиск
        const searchInput = document.getElementById('shopSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                const grid = document.getElementById('shopItemsGrid');
                if (grid) grid.innerHTML = this.renderItems();
                this.attachBuyEvents();
            });
        }
        this.attachBuyEvents();
    }

    attachBuyEvents() {
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.removeEventListener('click', this._buyHandler);
            this._buyHandler = () => {
                const itemData = JSON.parse(btn.dataset.item);
                this.confirmBuy(itemData);
            };
            btn.addEventListener('click', this._buyHandler);
        });
    }

    confirmBuy(item) {
        const char = this.getCharacter();
        if (char.money < item.cost) {
            alert('Недостаточно средств!');
            return;
        }
        if (confirm(`Купить ${item.name} за ${item.cost} eb?`)) {
        this.buyItem(item);
    }
    }

    buyItem(item) {
    const char = this.getCharacter();
    let cost = item.cost;
    let itemName = item.name;
    let quantity = 1;
    let isAmmo = false;

    // Особый случай: боеприпасы
    if (item.type === 'ammo') {
        isAmmo = true;
        let qty = prompt(`Сколько единиц (штук) ${item.name} купить?\nЦена за 1 шт.: ${Math.floor(item.cost / 10)} eb\nОбычно продаётся пачками по 10 шт.`, "10");
        if (qty === null) return;
        quantity = parseInt(qty);
        if (isNaN(quantity) || quantity <= 0) {
            alert('Некорректное количество');
            return;
        }
        // Стоимость: цена за 10 шт. / 10 * количество
        const pricePerUnit = item.cost / 10;
        cost = Math.ceil(pricePerUnit * quantity);
        if (char.money < cost) {
            alert(`Недостаточно средств! Нужно ${cost} eb, у вас ${char.money} eb`);
            return;
        }
        itemName = `${item.name} x${quantity}`;
    } else {
        if (char.money < cost) {
            alert(`Недостаточно средств! Нужно ${cost} eb, у вас ${char.money} eb`);
            return;
        }
    }

    char.money -= cost;

    switch (item.type) {
        case 'weapons':
            if (!char.gear.weapons) char.gear.weapons = [];
            char.gear.weapons.push(itemName);
            break;
        case 'armor':
            if (!char.gear.armor) char.gear.armor = { body: '', head: '' };
            if (!char.gear.armor.body) char.gear.armor.body = itemName;
            else if (!char.gear.armor.head) char.gear.armor.head = itemName;
            else {
                alert('У вас уже есть броня на тело и голову. Сначала продайте старую.');
                char.money += cost;
                return;
            }
            break;
        case 'gear':
            if (!char.gear.items) char.gear.items = [];
            char.gear.items.push(itemName);
            break;
        case 'cyberware':
            if (!char.cyberware) char.cyberware = [];
            char.cyberware.push(itemName);
            break;
        case 'ammo':
            if (!char.ammo) char.ammo = [];
            char.ammo.push(itemName);
            break;
        case 'attachments':
            if (!char.attachments) char.attachments = [];
            char.attachments.push(itemName);
            break;
    }
    this.saveCharacter(char);
    this.render();
    alert(`${itemName} куплен!`);
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

        const renderSection = (title, itemsList, type, isArmorBody = false, isArmorHead = false) => {
            if (itemsList.length === 0 && !isArmorBody && !isArmorHead) return '';
            let html = `<div class="inventory-section"><h4>${title}</h4><div class="inventory-items">`;
            if (isArmorBody) {
                html += `<div class="inventory-item">🛡️ Тело: ${armorBody} ${armorBody !== 'нет' ? `<button class="sell-btn" data-type="armorBody" data-name="${armorBody}">Продать (${Math.floor(this.getItemCost(armorBody) * 0.5)} eb)</button>` : ''}</div>`;
            }
            if (isArmorHead) {
                html += `<div class="inventory-item">⛑️ Голова: ${armorHead} ${armorHead !== 'нет' ? `<button class="sell-btn" data-type="armorHead" data-name="${armorHead}">Продать (${Math.floor(this.getItemCost(armorHead) * 0.5)} eb)</button>` : ''}</div>`;
            }
            itemsList.forEach((name, idx) => {
                const price = Math.floor(this.getItemCost(name) * 0.5);
                html += `
                    <div class="inventory-item">
                        <span class="item-name">${name}</span>
                        <button class="sell-btn" data-type="${type}" data-name="${name}" data-idx="${idx}">Продать (${price} eb)</button>
                    </div>
                `;
            });
            html += `</div></div>`;
            return html;
        };

        let html = `
            <div class="inventory-container">
                <div class="inventory-header">
                    <h3>🎒 Инвентарь</h3>
                    <div class="shop-money">💰 Деньги: <strong>${char.money} eb</strong></div>
                </div>
                <div class="inventory-sections">
                    ${renderSection('🔫 Оружие', weapons, 'weapon')}
                    ${renderSection('🛡️ Броня', [], null, true, true)}
                    ${renderSection('🦾 Киберимпланты', cyberware, 'cyberware')}
                    ${renderSection('🎒 Снаряжение', items, 'item')}
                    ${renderSection('🔫 Боеприпасы', ammo, 'ammo')}
                    ${renderSection('🔧 Приспособления', attachments, 'attachment')}
                </div>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEvents();
    }

    attachEvents() {
        this.container.querySelectorAll('.sell-btn').forEach(btn => {
            btn.removeEventListener('click', this._sellHandler);
            this._sellHandler = () => {
                const type = btn.dataset.type;
                const name = btn.dataset.name;
                const idx = parseInt(btn.dataset.idx);
                if (confirm(`Продать ${name} за ${Math.floor(this.getItemCost(name) * 0.5)} eb?`)) {
                    this.sellItem(type, name, idx);
                }
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
        this.render();
        if (window.shopUI) window.shopUI.render();
        alert(`${name} продан!`);
    }

    saveCharacter(char) {
        saveCharacter(char);
        if (window.characterHelper) window.characterHelper.displaySavedCharacterCard();
    }
}