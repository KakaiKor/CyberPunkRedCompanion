// modules/gm/scream-sheet-generator.js
export class ScreamSheetGenerator {
    // ========== БАЗОВЫЕ ДАННЫЕ ДЛЯ ГЕНЕРАЦИИ ==========
    static getSections() {
        return ["СПЛЕТНИ", "МНЕНИЯ", "ПОГОДА", "ТЕХНОЛОГИИ", "СТИЛЬ", "МЕСТНЫЕ", "БИЗНЕС", "МИР"];
    }

    static getCorps() {
        return ["Arasaka", "Militech", "Biotechnica", "Kang Tao", "SovOil", "Orbital Air", "EBM", "NCPD", "Trauma Team", "Petrochem"];
    }

    static getGangs() {
        return ["Мальстрём", "Тигриные когти", "Валентино", "6-я улица", "Альдекальдо", "Вудуисты", "Скавенджеры", "Игроки прайм-тайма", "Пираньи"];
    }

    static getDistricts() {
        return ["Уотсон", "Уэстбрук", "Санто-Доминго", "Хейвуд", "Пасифика", "Сити-центр", "Норт-Оукс", "Чартер-Хилл"];
    }

    static getCharacters() {
        return ["профессор Коган Акиго", "Королева Мороша", "Зип Принт", "Джеки МакГи", "Зигги «Фронт» Пейдж", "Эрик Уэллс", "Грин Хаммер", "Бон Чейни"];
    }

    static getVerbs() {
        return ["обнаружен", "атаковал", "скрывается", "объявил войну", "провёл операцию", "выиграл контракт", "потерял влияние", "обанкротился"];
    }

    static getOutcomes() {
        return ["с большим успехом", "без потерь", "ценой огромных жертв", "при загадочных обстоятельствах", "оставив множество вопросов"];
    }

    static getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static generateRandomArticle() {
        const section = this.getRandom(this.getSections());
        const corp = this.getRandom(this.getCorps());
        const gang = this.getRandom(this.getGangs());
        const district = this.getRandom(this.getDistricts());
        const character = this.getRandom(this.getCharacters());
        const verb = this.getRandom(this.getVerbs());
        const outcome = this.getRandom(this.getOutcomes());
        const date = `${Math.floor(Math.random() * 28) + 1} ${["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"][Math.floor(Math.random() * 12)]} 2077`;
        const truthRoll = Math.random();
        let truth, truthText;
        if (truthRoll < 0.6) { truth = "правда"; truthText = "✓ проверено"; }
        else if (truthRoll < 0.8) { truth = "полуправда"; truthText = "⚠️ неподтверждено"; }
        else { truth = "ложь"; truthText = "❌ фейк"; }

        // Рубрика + заголовок
        let headline = "";
        let body = "";

        if (section === "СПЛЕТНИ") {
            headline = `Сенсация: ${corp} тайно ${verb} в ${district}!`;
            body = `По словам анонимного источника, ${corp} ${verb} ${outcome}. Очевидцы утверждают, что видели ${character} в районе происшествия. Местные жители обеспокоены. Представитель ${corp} отказался от комментариев.`;
        } else if (section === "МНЕНИЯ") {
            headline = `${character}: "${corp} уничтожает ${district}"`;
            body = `В эксклюзивном интервью ${character} заявил, что деятельность ${corp} наносит непоправимый ущерб ${district}. «Мы должны остановить это безумие», — подчеркнул он. Эксперты разделились во мнениях.`;
        } else if (section === "ПОГОДА") {
            headline = `Аномальная жара в ${district}: кислотные дожди ожидаются`;
            body = `Синоптики предупреждают: в ближайшие дни в ${district} температура поднимется до +45°C, возможны кислотные осадки. Рекомендуется не выходить на улицу без защитных масок и избегать открытых водоёмов.`;
        } else if (section === "ТЕХНОЛОГИИ") {
            headline = `${corp} представила прорывную технологию: кибер-${verb}`;
            body = `Корпорация ${corp} анонсировала новое устройство, способное ${verb} ${outcome}. Аналитики прогнозируют рост акций. Конкуренты уже готовят ответный шаг.`;
        } else if (section === "СТИЛЬ") {
            headline = `Новая мода от ${character}: ${gang} захватывают улицы ${district}`;
            body = `Стиль участников ${gang} стал трендом сезона. «Это смесь панка и кибердека», — говорит модельер ${character}. Местные бутики уже начали продавать соответствующие аксессуары.`;
        } else if (section === "МЕСТНЫЕ") {
            headline = `Жители ${district} протестуют против ${corp}`;
            body = `Несколько сотен человек вышли на акцию протеста, требуя прекратить строительство объекта ${corp}. Полиция усилила патрулирование. Лидер движения ${character} призвал к мирному сопротивлению.`;
        } else if (section === "БИЗНЕС") {
            headline = `${corp} поглощает конкурента: рынок лихорадит`;
            body = `Сегодня стало известно о слиянии ${corp} с ${this.getRandom(this.getCorps())}. Эксперты ожидают волатильность акций. Мелкие игроки опасаются монополии.`;
        } else { // МИР
            headline = `Война ${gang} и ${corp} перешла в новую фазу`;
            body = `Конфликт между бандой ${gang} и корпорацией ${corp} достиг апогея. Вчера вечером произошла перестрелка в ${district}. ${character} призвал стороны к переговорам. Погибших и раненых пока нет.`;
        }

        return { headline, body, date, truth, source: "редакция Night City Today", section };
    }

    static render() {
        const container = document.getElementById('screamSheetResult');
        if (!container) {
            console.error('Элемент #screamSheetResult не найден');
            return;
        }
        const article = this.generateRandomArticle();
        container.innerHTML = `
            <div class="scream-sheet" id="screamSheetCard">
                <div class="sheet-header">
                    <span class="sheet-date">Night City Today • ${article.date}</span>
                    <span class="sheet-section">${article.section}</span>
                    <span class="sheet-truth ${article.truth}">⚡ ${article.truth.toUpperCase()}</span>
                </div>
                <div class="sheet-headline">${this.escapeHtml(article.headline)}</div>
                <div class="sheet-body">${this.escapeHtml(article.body)}</div>
                <div class="sheet-footer">
                    <span class="sheet-source">Источник: ${article.source}</span>
                    <button class="copy-sheet-btn">📋 Копировать текст</button>
                </div>
            </div>
        `;
        const copyBtn = container.querySelector('.copy-sheet-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = `${article.headline}\n\n${article.body}\n\n— ${article.source}, ${article.date}`;
                navigator.clipboard.writeText(text);
                alert('Скримлист скопирован!');
            });
        }
    }

    static escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
}