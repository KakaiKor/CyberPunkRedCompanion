// modules/gm/encounter-generator.js
export class EncounterGenerator {
    static generate() {
        const time = document.getElementById('encounterTime').value;
        const zone = document.getElementById('encounterZone').value;
        const roll = Math.floor(Math.random() * 100) + 1;
        let encounter = null;

        // Получаем количество игроков (можно добавить поле ввода)
        let playerCount = 4;
        const playerInput = document.getElementById('playerCountForEncounter');
        if (playerInput) playerCount = parseInt(playerInput.value) || 4;

        if (zone === 'corporate') {
            if (time === 'day') encounter = this.getCorporateDay(roll, playerCount);
            else if (time === 'evening') encounter = this.getCorporateEvening(roll, playerCount);
            else encounter = this.getCorporateNight(roll, playerCount);
        } else if (zone === 'moderate') {
            if (time === 'day') encounter = this.getModerateDay(roll, playerCount);
            else if (time === 'evening') encounter = this.getModerateEvening(roll, playerCount);
            else encounter = this.getModerateNight(roll, playerCount);
        } else if (zone === 'combat') {
            if (time === 'day') encounter = this.getCombatDay(roll, playerCount);
            else if (time === 'evening') encounter = this.getCombatEvening(roll, playerCount);
            else encounter = this.getCombatNight(roll, playerCount);
        } else { // hot zone
            if (time === 'day') encounter = this.getHotDay(roll, playerCount);
            else if (time === 'evening') encounter = this.getHotEvening(roll, playerCount);
            else encounter = this.getHotNight(roll, playerCount);
        }

        if (!encounter) encounter = { title: "Обычная встреча", description: "Ничего особенного.", threat: "Нет" };
        this.renderEncounter(encounter, roll);
    }

    // ---------------------- ДЕНЬ, КОРПОРАТИВНАЯ ЗОНА ----------------------
    static getCorporateDay(roll, pc) {
        if (roll <= 5) return { title: "Местная полиция", description: `Патруль из ${Math.ceil(pc/2)} офицеров. Штурмовые винтовки, очень тяжёлые пистолеты, тяжёлые дубинки, кевлар. Остановят, потребуют документы.`, threat: "Низкая" };
        if (roll <= 11) return { title: "Корпоративная охрана", description: `${pc} охранников в лёгком арморджеке с ПП. Патрулируют территорию, прогонят с территории.`, threat: "Низкая" };
        if (roll <= 13) return { title: "Техники", description: `${Math.ceil(pc/2)} техников с дробовиками, в кевларовых жилетах. Чинят городскую инфраструктуру.`, threat: "Нет" };
        if (roll <= 17) return { title: "Частный детектив", description: `Вооружён очень тяжёлым пистолетом и дубинкой, в среднем арморджеке. Следит за кем-то.`, threat: "Низкая" };
        if (roll <= 20) return { title: "Корпораты", description: `${pc} сотрудников в костюмах с кевларом, средние пистолеты. Ловят такси, могут быть ограблены бандитами.`, threat: "Низкая" };
        if (roll <= 27) return { title: "Местные", description: `Двое молодых. Их могут грабить бандиты (${pc} чел) или избивать культисты.`, threat: "Средняя" };
        if (roll <= 32) return { title: "Восстановители", description: `${pc-2} восстановителей и главарь подключают здание к сети.`, threat: "Низкая" };
        if (roll <= 37) return { title: "Медиа", description: `Съёмочная группа из 2 чел. Снимают сюжет, могут втянуть в конфликт.`, threat: "Низкая" };
        if (roll <= 41) return { title: "Частный детектив (повтор)", description: `Детектив избивает информатора или вскрывает машину.`, threat: "Низкая" };
        if (roll <= 46) return { title: "Trauma Team", description: `AV-4 садится рядом, медики помогают раненым. Могут принять вас за участника.`, threat: "Средняя" };
        if (roll <= 57) return { title: "Мусорщики", description: `${pc} мусорщиков с ножами и очень тяжёлыми пистолетами. Клянчат деньги или пытаются ограбить.`, threat: "Средняя" };
        if (roll <= 63) return { title: "Кочевники", description: `${pc} кочевников в коже, с арбалетами, ножами, очень тяжёлыми пистолетами. Ищут драки.`, threat: "Средняя" };
        if (roll <= 70) return { title: "Банда бустеров (Пираньи)", description: `${pc} бустеров с очень тяжёлыми пистолетами и царапками. Прессуют лёгкую добычу.`, threat: "Средняя" };
        if (roll <= 76) return { title: "Уличные панки", description: `${pc} панков с ножами и дубинками, без брони. Нападают.`, threat: "Средняя" };
        if (roll <= 82) return { title: "Культисты", description: `${pc} культистов с ножами, дубинками, тяжёлыми пистолетами. Проповедуют, могут напасть.`, threat: "Средняя" };
        if (roll <= 88) return { title: "Кочевнический грузовик", description: `${Math.ceil(pc/2)} кочевников чинят грузовик, на них нападают ${pc} бандитов.`, threat: "Высокая" };
        if (roll <= 94) return { title: "Банда бустеров (Железные прицелы)", description: `${pc} бустеров с ПП, кибероптикой, имплантами-ускорителями. Ищут драки.`, threat: "Высокая" };
        return { title: "Крупный преступник", description: `${pc-2} соло с очень тяжёлыми пистолетами и дробовиками, в тяжёлом арморджеке. Разгружают контрабанду.`, threat: "Очень высокая" };
    }

    static getCorporateEvening(roll, pc) { /* аналогично, но на основе книги */ return this.getCorporateDay(roll, pc); }
    static getCorporateNight(roll, pc) { return this.getCorporateDay(roll, pc); }

    static getModerateDay(roll, pc) { /* упрощённо, но можно развить */ return this.getCorporateDay(roll, pc); }
    static getModerateEvening(roll, pc) { return this.getCorporateDay(roll, pc); }
    static getModerateNight(roll, pc) { return this.getCorporateDay(roll, pc); }

    static getCombatDay(roll, pc) { return this.getCorporateDay(roll, pc); }
    static getCombatEvening(roll, pc) { return this.getCorporateDay(roll, pc); }
    static getCombatNight(roll, pc) { return this.getCorporateDay(roll, pc); }

    static getHotDay(roll, pc) { return this.getCorporateDay(roll, pc); }
    static getHotEvening(roll, pc) { return this.getCorporateDay(roll, pc); }
    static getHotNight(roll, pc) { return this.getCorporateDay(roll, pc); }

    static renderEncounter(encounter, roll) {
        const container = document.getElementById('encounterResult');
        if (!container) return;
        const threatColor = {
            'Нет':'#9aa4bf', 'Низкая':'#4caf50', 'Средняя':'#ffc107',
            'Высокая':'#ff9800', 'Очень высокая':'#ff3c5f'
        };
        container.innerHTML = `
            <div class="encounter-card">
                <div class="encounter-header">
                    <div class="encounter-type">${encounter.title}</div>
                    <div class="encounter-threat" style="color:${threatColor[encounter.threat] || '#9aa4bf'}">🎯 Угроза: ${encounter.threat}</div>
                </div>
                <div class="encounter-description">${encounter.description}</div>
                <div class="encounter-roll">🎲 Результат броска: ${roll}</div>
                <button class="reroll-encounter-btn">🔄 Другую встречу</button>
            </div>
        `;
        container.querySelector('.reroll-encounter-btn').addEventListener('click', () => this.generate());
    }
}