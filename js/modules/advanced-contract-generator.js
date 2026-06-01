// modules/advanced-contract-generator.js
export class AdvancedContractGenerator {
    static generate() {
        const difficulty = document.getElementById('contractDifficulty').value;
        let chosenType = document.getElementById('contractType').value;
        if (chosenType === 'random') {
            const types = ['extraction','elimination','protection','theft','sabotage','transport','espionage','psyop'];
            chosenType = types[Math.floor(Math.random() * types.length)];
        }
        const contract = this.buildContract(chosenType, difficulty);
        this.renderContract(contract);
        return contract;
    }
    static buildContract(type, difficulty) {
        const clients = {
            extraction: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Trauma Team", "Медиа-корпорация", "Частный коллекционер"],
            elimination: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Семья Скив", "Якудза", "Ревнивый супруг"],
            protection: ["Корпорация Arasaka", "Militech", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Trauma Team", "Медиа-корпорация", "Богатый бизнесмен", "Учёный Biotechnica", "Свидетель"],
            theft: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Хакер-одиночка", "Конкурирующий фиксер", "Музей"],
            sabotage: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Эко-террористы", "Недовольный менеджер"],
            transport: ["Корпорация Arasaka", "Militech", "Фиксер Хорнет", "Кочевники Альдекальдо", "Контрабандисты", "Криминальный синдикат", "Докер", "Гуманитарная организация"],
            espionage: ["Корпорация Arasaka", "Militech", "Правительство НСША", "Европейский союз", "Неосоветы", "Конкурирующая корпорация", "Иностранное посольство"],
            psyop: ["Корпорация Arasaka", "Militech", "Правительство НСША", "Медиа-корпорация", "Политическая партия", "Культ", "Психоотряд"]
        };
        const targets = {
            extraction: ["похищенного учёного", "свидетеля", "ценный прототип", "члена семьи", "предателя", "имплант с данными", "заложника"],
            elimination: ["корпоративного шпиона", "лидера банды", "предателя", "свидетеля", "цель из списка", "конкурента", "киберпсиха"],
            protection: ["VIP-персону", "караван с грузом", "объект", "свидетеля", "тайник с уликами", "базу повстанцев"],
            theft: ["файлы данных", "прототип", "артефакт", "финансовые отчёты", "чертежи", "пароль", "ключ-карту"],
            sabotage: ["лабораторию", "склад оружия", "серверную", "транспортный узел", "энергоблок", "завод", "систему безопасности"],
            transport: ["деликатный груз", "контрабанду", "гуманитарную помощь", "ценный антиквариат", "партию имплантов", "образцы ДНК"],
            espionage: ["секретные планы", "коды доступа", "список агентов", "компромат", "архивы переписки", "дипломатические документы"],
            psyop: ["распространить слух", "дезинформацию", "компромат на политика", "манипуляцию общественным мнением", "спровоцировать конфликт"]
        };
        const complications = {
            easy: [],
            medium: ["сжатые сроки", "неполная информация", "нейтральная территория"],
            hard: ["утечка информации", "конкурирующая команда", "двойной агент", "система безопасности"],
            deadly: ["предательство заказчика", "засада", "вмешательство третьей стороны", "временная бомба", "ненадёжное снаряжение"]
        };
        const twists = [
            "Цель знает о покушении и подготовилась",
            "Заказчик планирует избавиться от команды после выполнения",
            "Данные, которые вы украли, содержат вирус",
            "Груз – живой, и он не хочет ехать",
            "На объекте уже работает другая команда",
            "Цель оказывается старым другом",
            "В процессе выясняется, что заказчик – корпорация, а цель – правительство"
        ];
        const rewardBase = { easy: 500, medium: 1000, hard: 2000, deadly: 4000 };
        const reward = rewardBase[difficulty] + Math.floor(Math.random() * 500);
        const clientList = clients[type] || clients.extraction;
        const client = clientList[Math.floor(Math.random() * clientList.length)];
        const targetList = targets[type] || targets.extraction;
        const target = targetList[Math.floor(Math.random() * targetList.length)];
        const complicationList = complications[difficulty];
        const hasComplication = Math.random() > 0.5;
        const complication = hasComplication && complicationList.length ? complicationList[Math.floor(Math.random() * complicationList.length)] : null;
        const hasTwist = Math.random() > 0.7;
        const twist = hasTwist ? twists[Math.floor(Math.random() * twists.length)] : null;
        let description = "";
        switch(type) {
            case 'extraction': description = `Заказчик ${client} нанимает команду для извлечения ${target}. Цель находится на охраняемом объекте. Оплата: ${reward} eb.`; break;
            case 'elimination': description = `Заказчик ${client} требует ликвидировать ${target}. Цель хорошо охраняется. Оплата: ${reward} eb.`; break;
            case 'protection': description = `Заказчик ${client} нанимает команду для охраны ${target}. Угроза: возможное нападение. Оплата: ${reward} eb.`; break;
            case 'theft': description = `Заказчик ${client} поручает кражу ${target}. Охрана усилена. Оплата: ${reward} eb.`; break;
            case 'sabotage': description = `Заказчик ${client} нанимает команду для саботажа ${target}. Необходимо минимизировать следы. Оплата: ${reward} eb.`; break;
            case 'transport': description = `Заказчик ${client} нуждается в перевозке ${target}. Маршрут опасен. Оплата: ${reward} eb.`; break;
            case 'espionage': description = `Заказчик ${client} требует добыть ${target}. Операция секретная. Оплата: ${reward} eb.`; break;
            case 'psyop': description = `Заказчик ${client} поручает психологическую операцию: ${target}. Цель – повлиять на общественное мнение. Оплата: ${reward} eb.`; break;
        }
        if (complication) description += ` Осложнение: ${complication}.`;
        if (twist) description += ` Неожиданный поворот: ${twist}.`;
        return { type, client, target, difficulty, reward, complication, twist, description };
    }
    static renderContract(contract) {
        const container = document.getElementById('advancedContractResult');
        if (!container) return;
        const html = `
            <div class="contract-card">
                <div class="contract-header">
                    <div class="contract-type">${this.translateType(contract.type)}</div>
                    <div class="contract-difficulty">${this.translateDifficulty(contract.difficulty)}</div>
                </div>
                <div class="contract-description">${contract.description}</div>
                <div class="contract-details">
                    <div><strong>Заказчик:</strong> ${contract.client}</div>
                    <div><strong>Цель:</strong> ${contract.target}</div>
                    <div><strong>Награда:</strong> ${contract.reward} eb</div>
                    ${contract.complication ? `<div><strong>Осложнение:</strong> ${contract.complication}</div>` : ''}
                    ${contract.twist ? `<div><strong>Поворот:</strong> ${contract.twist}</div>` : ''}
                </div>
            </div>
        `;
        container.innerHTML = html;
    }
    static translateType(type) {
        const map = { extraction: "Извлечение", elimination: "Устранение", protection: "Охрана", theft: "Кража данных", sabotage: "Саботаж", transport: "Перевозка груза", espionage: "Шпионаж", psyop: "Психологическая операция" };
        return map[type] || type;
    }
    static translateDifficulty(diff) {
        const map = { easy: "Лёгкая", medium: "Средняя", hard: "Тяжёлая", deadly: "Смертельная" };
        return map[diff] || diff;
    }
    static copyToClipboard() {
        const container = document.getElementById('advancedContractResult');
        if (!container || !container.innerText) return;
        const text = container.innerText;
        navigator.clipboard.writeText(text).then(() => alert('Контракт скопирован в буфер обмена!'));
    }
}