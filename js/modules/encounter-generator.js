// modules/encounter-generator.js
export class EncounterGenerator {
    static generate() {
        const time = document.getElementById('encounterTime').value;
        const zone = document.getElementById('encounterZone').value;
        const roll = Math.floor(Math.random() * 100) + 1;
        let encounter = null;
        if (zone === 'corporate') encounter = this.getCorporateEncounter(roll, time);
        else if (zone === 'moderate') encounter = this.getModerateEncounter(roll, time);
        else encounter = { type: "Обычная встреча", description: "Ничего особенного.", threat: "Нет" };
        if (!encounter) { document.getElementById('encounterResult').innerHTML = '<div class="info-block error">Ошибка генерации</div>'; return; }
        this.renderEncounter(encounter, roll);
    }
    static getCorporateEncounter(roll, time) {
        if (time === 'day') {
            if (roll <=5) return { type:"Местная полиция", description:"Патруль из 2-3 офицеров.", threat:"Низкая" };
            if (roll <=11) return { type:"Корпоративная охрана", description:"Охранники в лёгком арморджеке.", threat:"Низкая" };
            return { type:"Обычные прохожие", description:"Ничего примечательного.", threat:"Нет" };
        } else return { type:"Вечерняя прогулка", description:"Город затихает.", threat:"Нет" };
    }
    static getModerateEncounter(roll, time) {
        if (time === 'day') {
            if (roll <=5) return { type:"Полиция", description:"Патруль проверяет документы.", threat:"Низкая" };
            return { type:"Местные жители", description:"Люди спешат по делам.", threat:"Нет" };
        } else return { type:"Вечер", description:"Улицы пустеют.", threat:"Нет" };
    }
    static renderEncounter(encounter, roll) {
        const threatColor = { 'Нет':'#9aa4bf','Низкая':'#4caf50','Средняя':'#ffc107','Высокая':'#ff9800','Очень высокая':'#ff3c5f' };
        const html = `
            <div class="encounter-card">
                <div class="encounter-header">
                    <div class="encounter-type">${encounter.type}</div>
                    <div class="encounter-threat" style="color:${threatColor[encounter.threat] || '#9aa4bf'}">🎯 Угроза: ${encounter.threat}</div>
                </div>
                <div class="encounter-description">${encounter.description}</div>
                <div class="encounter-roll">🎲 Результат броска: ${roll}</div>
            </div>
            <div class="button-group"><button id="rerollEncounterBtn" class="cyber-btn">🎲 Перебросить</button></div>
        `;
        document.getElementById('encounterResult').innerHTML = html;
        document.getElementById('rerollEncounterBtn')?.addEventListener('click', () => this.generate());
    }
}