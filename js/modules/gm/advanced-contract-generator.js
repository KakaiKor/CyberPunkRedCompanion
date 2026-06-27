// modules/advanced-contract-generator.js
export class AdvancedContractGenerator {
    static generate() {
        const difficulty = document.getElementById('contractDifficulty').value;
        let chosenType = document.getElementById('contractType').value;
        if (chosenType === 'random') {
            const types = ['extraction','elimination','protection','theft','sabotage','transport','espionage','psyop'];
            chosenType = types[Math.floor(Math.random() * types.length)];
        }
        // Получаем выбранный тип награды (если есть)
        let rewardTypePref = 'random';
        const rewardSelect = document.getElementById('contractRewardType');
        if (rewardSelect) rewardTypePref = rewardSelect.value;

        const contract = this.buildContract(chosenType, difficulty, rewardTypePref);
        this.renderContract(contract);
        return contract;
    }

    static buildContract(type, difficulty, rewardTypePref = 'random') {
        // ----- клиенты, цели, локации, осложнения, повороты, сроки -----
        const clients = {
            extraction: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Trauma Team", "Медиа-корпорация", "Частный коллекционер", "Криминальный синдикат", "Шестая улица", "Учёный Biotechnica", "Нетраннер-одиночка", "Культ", "Банда позеров", "Беглый корпорат"],
            elimination: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Семья Скив", "Якудза", "Ревнивый супруг", "Корпорация Petrochem", "Киберпсих-одиночка", "Недовольный менеджер", "Предатель"],
            protection: ["Корпорация Arasaka", "Militech", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Trauma Team", "Медиа-корпорация", "Богатый бизнесмен", "Учёный Biotechnica", "Свидетель", "Глава банды", "Звезда поп-медиа"],
            theft: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Хакер-одиночка", "Конкурирующий фиксер", "Музей", "Коллекционер имплантов", "Корпорация Ziggurat"],
            sabotage: ["Корпорация Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксер Хорнет", "Правительство НСША", "Кочевники Альдекальдо", "Эко-террористы", "Недовольный менеджер", "Корпорация Continental Brands", "Клан кочевников Телас"],
            transport: ["Корпорация Arasaka", "Militech", "Фиксер Хорнет", "Кочевники Альдекальдо", "Контрабандисты", "Криминальный синдикат", "Докер", "Гуманитарная организация", "Семья кочевников Стальные вакерос", "Trauma Team"],
            espionage: ["Корпорация Arasaka", "Militech", "Правительство НСША", "Европейский союз", "Неосоветы", "Конкурирующая корпорация", "Иностранное посольство", "Криминальный синдикат", "NetWatch"],
            psyop: ["Корпорация Arasaka", "Militech", "Правительство НСША", "Медиа-корпорация", "Политическая партия", "Культ", "Психоотряд", "Рокербой", "Корпорация Network 54"]
        };

        const targets = {
            extraction: ["похищенного учёного", "свидетеля обвинения", "ценный прототип", "члена семьи", "предателя", "имплант с данными", "заложника", "исследовательские образцы", "кибердеку с чёрным льдом", "ноутбук с финансами", "архивы корпорации", "дипломата", "материнскую плату с чипом"],
            elimination: ["корпоративного шпиона", "лидера банды", "предателя", "свидетеля", "цель из списка", "конкурента", "киберпсиха", "информатора", "нелояльного менеджера", "двойного агента", "судью", "журналиста-расследователя", "бывшего коллегу"],
            protection: ["VIP-персону", "караван с грузом", "объект", "свидетеля", "тайник с уликами", "базу повстанцев", "точку доступа к сети", "лабораторию", "судью", "журналиста-расследователя"],
            theft: ["файлы данных", "прототип оружия", "артефакт", "финансовые отчёты", "чертежи", "пароль", "ключ-карту", "список агентов", "криптоключ", "образцы ДНК"],
            sabotage: ["лабораторию", "склад оружия", "серверную", "транспортный узел", "энергоблок", "завод", "систему безопасности", "трубопровод", "антенную решётку", "корабельный док"],
            transport: ["деликатный груз", "контрабанду", "гуманитарную помощь", "ценный антиквариат", "партию имплантов", "образцы ДНК", "партию CHOOH2", "военную технику", "секретные документы", "труп для криозаморозки"],
            espionage: ["секретные планы", "коды доступа", "список агентов", "компромат", "архивы переписки", "дипломатические документы", "биометрические данные", "исследования Biotechnica"],
            psyop: ["распространить слух", "дезинформацию", "компромат на политика", "манипуляцию общественным мнением", "спровоцировать конфликт", "подорвать репутацию", "организовать фальшивую атаку"]
        };

        const locations = [
            "в заброшенном комплексе Arasaka в Горячей зоне", "в небоскрёбе корпоративной зоны", "в доках Хейвуда", "в башне Уотсона", "в клубе «Посмертие»", "в офисе Zhirafa", "в караване кочевников", "в лаборатории Biotechnica", "в подземном бункере Militech", "на крыше мегабашни", "в подворотнях боевой зоны", "на станции очистки воды", "в заброшенной станции метро", "на крыше небоскрёба", "в подземном бункере", "в старом театре", "на складе в порту", "в руинах церкви", "в закрытом торговом центре", "в загородном особняке"
        ];

        const complications = {
            easy: ["у вас всего 24 часа", "информация о цели неполная", "вокруг много гражданских", "охранники получили приказ стрелять на поражение", "у вас сломалась машина"],
            medium: ["о задании просочились слухи – конкуренты уже в деле", "система безопасности обновлена, старые коды не работают", "цель охраняют ветераны-соло", "в здании отключили питание – придётся полагаться на ПНВ", "у вас нет доступа к сети"],
            hard: ["один из вас – двойной агент (Мастер знает кто)", "засада по пути к цели – вас ждали", "в дело вмешивается третья сторона (корпорация или банда)", "через час здание взлетит на воздух – успейте уйти", "цель уже знает о вашем прибытии"],
            deadly: ["заказчик планирует избавиться от команды после выполнения", "цель – полный конверт тела с боевыми системами", "архитектура сети объекта полна демонов и чёрного льда", "MAX-TAC уже выехал по ложному вызову – будут через 10 минут", "в здании находится ядерное устройство"]
        };

        const twists = [
            "Цель оказывается старым другом одного из вас – он умоляет отпустить его и предлагает вдвое больше.",
            "Заказчик – подставное лицо, на самом деле это ловушка конкурентов.",
            "Украденные данные содержат вирус, который активируется при вскрытии и стирает все улики.",
            "Груз – живой, и он не хочет ехать; это киберпсих, которого везут на «лечение».",
            "На объекте уже работает другая команда, и они открывают огонь без предупреждения.",
            "Цель невиновна – её подставили, и она готова заплатить за свою защиту.",
            "Заказчик – корпорация, а цель – правительственный свидетель, за которым охотится полиция.",
            "Задание – лишь прикрытие для налёта конкурентов на ваш собственный склад.",
            "Внутри груза находится бомба с датчиком движения – при вскрытии рванёт.",
            "Цель владеет компроматом на заказчика и предлагает сделку."
        ];

        const titles = {
            extraction: ["Операция «Спаситель»", "Извлечение «Фантом»", "Груз 404", "Похищение в высотке", "Последний свидетель"],
            elimination: ["Ликвидация «Призрак»", "Охота на шакала", "Чистка рядов", "Устранение нежелательного", "Мишень – Красный"],
            protection: ["Щит и меч", "Неприкосновенный", "Охрана «Караван»", "Спасти VIP", "Ценный груз"],
            theft: ["Кража «Исходный код»", "Добыча «Чёрный кристалл»", "Операция «Фальшивый флаг»", "Тихий умысел", "Взломать и вынести"],
            sabotage: ["Саботаж «Безмолвный»", "Разрушитель", "Сломать механизм", "Огненные цветы", "Точка невозврата"],
            transport: ["Перевозка «Деликатный»", "Рейс 404", "Конвой смерти", "Скорый груз", "Транзит"],
            espionage: ["Шпионские игры", "Крот", "Секретный пакет", "Слежка и отчёт", "Компрометирующие доказательства"],
            psyop: ["Психологическая война", "Фейк", "Игра разума", "Атака на репутацию", "Волна"]
        };

        const timeLimits = { easy: "3 дня", medium: "48 часов", hard: "24 часа", deadly: "12 часов" };
        const rewardBase = { easy: 500, medium: 1000, hard: 2000, deadly: 4000 };
        let reward = rewardBase[difficulty] + Math.floor(Math.random() * 500);
        if (type === 'elimination') reward += 200;
        if (type === 'extraction') reward += 150;

        const clientList = clients[type] || clients.extraction;
        const client = clientList[Math.floor(Math.random() * clientList.length)];
        const target = (targets[type] || targets.extraction)[Math.floor(Math.random() * (targets[type] || targets.extraction).length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const complicationList = complications[difficulty];
        const hasComplication = Math.random() > 0.4;
        const complication = hasComplication && complicationList.length ? complicationList[Math.floor(Math.random() * complicationList.length)] : null;
        const hasTwist = Math.random() > 0.65;
        const twist = hasTwist ? twists[Math.floor(Math.random() * twists.length)] : null;

        // ----- Определение типа награды -----
        const rewardTypes = [
            { id: 'money', label: '💰 Деньги', weight: 50 },
            { id: 'cyberware', label: '🦾 Киберимплант', weight: 15 },
            { id: 'weapon', label: '🔫 Оружие', weight: 12 },
            { id: 'armor', label: '🛡️ Броня', weight: 8 },
            { id: 'info', label: '📜 Информация', weight: 10 },
            { id: 'service', label: '🤝 Услуга', weight: 7 },
            { id: 'reputation', label: '🎭 Репутация', weight: 8 },
            { id: 'training', label: '📖 Обучение', weight: 5 }
        ];

        // Если пользователь выбрал конкретный тип – используем его
        let chosenRewardType = rewardTypePref;
        if (chosenRewardType === 'random' || !rewardTypes.some(rt => rt.id === chosenRewardType)) {
            // Случайный выбор с учётом весов
            const totalWeight = rewardTypes.reduce((sum, rt) => sum + rt.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const rt of rewardTypes) {
                rand -= rt.weight;
                if (rand <= 0) {
                    chosenRewardType = rt.id;
                    break;
                }
            }
            if (!chosenRewardType) chosenRewardType = 'money';
        }

        // Генерация описания награды
        let rewardDescription = '';
        let rewardType = chosenRewardType;

        // Импортируем данные для предметов (если есть)
        let detailedCyberware = [];
        let rangedWeapons = [];
        let armors = [];
        try {
            // Пытаемся загрузить данные из глобальных переменных (если они определены)
            if (typeof window !== 'undefined') {
                if (window.detailedCyberware) detailedCyberware = window.detailedCyberware;
                if (window.rangedWeapons) rangedWeapons = window.rangedWeapons;
                if (window.armors) armors = window.armors;
            }
        } catch(e) {}

        switch(chosenRewardType) {
            case 'money':
                rewardDescription = `${reward} eb`;
                break;
            case 'cyberware':
                if (detailedCyberware.length > 0) {
                    const item = detailedCyberware[Math.floor(Math.random() * detailedCyberware.length)];
                    rewardDescription = `${item.name} (стоимостью ~${item.cost || '?'} eb)`;
                } else {
                    const cyberList = ["Нейролинк", "Керензиков", "Сандевистан", "Подкожная броня", "Киберглаз (пара)", "Киберрука"];
                    const cyberItem = cyberList[Math.floor(Math.random() * cyberList.length)];
                    rewardDescription = `${cyberItem} (стоимостью до ${reward} eb)`;
                }
                break;
            case 'weapon':
                if (rangedWeapons.length > 0) {
                    const item = rangedWeapons[Math.floor(Math.random() * rangedWeapons.length)];
                    rewardDescription = `${item.name} (${item.dmg})`;
                } else {
                    const weaponList = ["Malorian Arms 3516", "Штурмовая винтовка с интерфейсом", "Дробовик Militech Bulldog", "Моно-катана"];
                    rewardDescription = weaponList[Math.floor(Math.random() * weaponList.length)];
                }
                break;
            case 'armor':
                if (armors.length > 0) {
                    const item = armors[Math.floor(Math.random() * armors.length)];
                    rewardDescription = `${item.name} (ОС ${item.sp})`;
                } else {
                    const armorList = ["Лёгкий арморджек", "Средний арморджек", "Осколочный бронежилет", "Костюм Bodyweight"];
                    rewardDescription = armorList[Math.floor(Math.random() * armorList.length)];
                }
                break;
            case 'info':
                const infoList = [
                    "Компромат на корпоративного менеджера",
                    "Коды доступа к серверной Arasaka",
                    "Чертежи прототипа оружия",
                    "Список агентов в Найт-Сити",
                    "Финансовые отчёты корпорации",
                    "Пароли к защищённой сети"
                ];
                rewardDescription = infoList[Math.floor(Math.random() * infoList.length)];
                break;
            case 'service':
                const serviceList = [
                    "Бесплатный вызов Trauma Team (одно использование)",
                    "Месяц защиты от банды Мальстрём",
                    "Услуга фиксера без комиссии",
                    "Тренировочная сессия с ветераном",
                    "Личный телохранитель на одно задание",
                    "Ремонт брони и оружия за счёт клиента"
                ];
                rewardDescription = serviceList[Math.floor(Math.random() * serviceList.length)];
                break;
            case 'reputation':
                const repAmount = Math.floor(Math.random() * 3) + 1;
                const factionList = ["Альдекальдо", "Arasaka", "Militech", "Банда Мальстрём", "Тигриные когти", "Фиксеры"];
                const faction = factionList[Math.floor(Math.random() * factionList.length)];
                rewardDescription = `+${repAmount} репутации у ${faction}`;
                break;
            case 'training':
                const skillList = ["Вождение", "Уклонение", "Восприятие", "Длинноствольное оружие", "Холодное оружие", "Драка"];
                const skillName = skillList[Math.floor(Math.random() * skillList.length)];
                rewardDescription = `Бесплатное обучение: +1 к навыку "${skillName}" (требуется время)`;
                break;
            default:
                rewardDescription = `${reward} eb`;
                rewardType = 'money';
        }

        // ----- ЖИВЫЕ ОПИСАНИЯ (с атмосферой и голосом) -----
        let description = "";
        const intro = [
            "На ваш агент приходит зашифрованное сообщение:",
            "В баре «Посмертие» к вам подсаживается фиксер с помятой папкой:",
            "Голос в наушнике, искажённый модулятором, произносит:",
            "В ДатаПуле появляется анонимный заказ с высоким приоритетом:",
            "Старый знакомый хакер пересылает вам координаты встречи:"
        ][Math.floor(Math.random() * 5)];

        let body = "";
        switch(type) {
            case 'extraction':
                body = `«${client} платит за извлечение ${target}. Последний раз его видели ${location}. Охрана — бывшие корпоративные соло. Заказчик хочет живым, но если пойдёт не по плану — приоритет на доставку. Времени до полуночи.»`;
                break;
            case 'elimination':
                body = `«${client} просит убрать ${target}. Цель засела ${location}. У неё кибероружие и как минимум трое охранников. Доказательства — любая часть тела с узнаваемой татуировкой.»`;
                break;
            case 'protection':
                body = `«${client} нанимает команду для охраны ${target} ${location}. Угроза — конкурентные банды или корпоративные киллеры. Заказчик будет рядом — не подведите.»`;
                break;
            case 'theft':
                body = `«Нужно выкрасть ${target} из ${location}. Охрана — электронные замки и патруль с ПП. ${client} платит. Желательно без шума, но если начнётся стрельба — заметайте следы.»`;
                break;
            case 'sabotage':
                body = `«${client} хочет уничтожить ${target} ${location}. Чем больше хаоса, тем лучше — но без прямых улик на заказчика. Подрывная смесь ждёт в условленном месте.»`;
                break;
            case 'transport':
                body = `«Доставить ${target} из ${location} до склада в доке. Маршрут идёт через боевую зону, возможны нападения кочевников-контрабандистов. ${client} платит. Груз хрупкий — не трясите.»`;
                break;
            case 'espionage':
                body = `«Раздобыть ${target} ${location}. Система безопасности — Level 3, есть чёрный лёд. ${client} даёт щедрую награду. Работа строго конфиденциально — если вас поймают, заказчик откажется от любых связей.»`;
                break;
            case 'psyop':
                body = `«Психологическая операция: ${target} через ${location}. Нужно, чтобы слух разошёлся по всему городу. ${client} платит. Используйте агентов, подставные скримлисты — ваша фантазия.»`;
                break;
        }

        // Добавляем информацию о награде в описание
        const rewardIcon = {
            money: '💰',
            cyberware: '🦾',
            weapon: '🔫',
            armor: '🛡️',
            info: '📜',
            service: '🤝',
            reputation: '🎭',
            training: '📖'
        }[rewardType] || '💰';
        body += `\n\n🏆 Награда: ${rewardIcon} ${rewardDescription}`;

        if (complication) body += ` ⚠️ Проблема: ${complication}.`;
        if (twist) body += ` 🔄 Поворот: ${twist}.`;

        description = `${intro} ${body}`;

        const contractTitle = (titles[type] || titles.extraction)[Math.floor(Math.random() * (titles[type] || titles.extraction).length)];

        return {
            title: contractTitle,
            type,
            client,
            target,
            location,
            difficulty,
            reward,
            rewardType: rewardType,
            rewardDescription: rewardDescription,
            timeLimit: timeLimits[difficulty],
            recommendedRank: { easy: "1–2", medium: "3–4", hard: "5–6", deadly: "7+" }[difficulty],
            complication,
            twist,
            description
        };
    }

    static renderContract(contract) {
        const container = document.getElementById('advancedContractResult');
        if (!container) return;
        const difficultyClass = `diff-${contract.difficulty}`;
        const rewardIcon = {
            money: '💰',
            cyberware: '🦾',
            weapon: '🔫',
            armor: '🛡️',
            info: '📜',
            service: '🤝',
            reputation: '🎭',
            training: '📖'
        }[contract.rewardType] || '💰';

        const html = `
            <div class="contract-card ${difficultyClass}">
                <div class="contract-header">
                    <div class="contract-title">${this.escapeHtml(contract.title)}</div>
                    <div class="contract-type">${this.translateType(contract.type)}</div>
                </div>
                <div class="contract-difficulty-badge">${this.translateDifficulty(contract.difficulty)}</div>
                <div class="contract-reward" style="font-size:1.2rem; padding:8px 0; border-bottom:1px solid #2a3342; margin-bottom:8px;">
                    <strong>🏆 Награда:</strong> ${rewardIcon} ${this.escapeHtml(contract.rewardDescription)}
                </div>
                <div class="contract-description">${this.escapeHtml(contract.description)}</div>
                <div class="contract-details">
                    <div><i class="fas fa-user"></i> <strong>Заказчик:</strong> ${this.escapeHtml(contract.client)}</div>
                    <div><i class="fas fa-bullseye"></i> <strong>Цель:</strong> ${this.escapeHtml(contract.target)}</div>
                    <div><i class="fas fa-map-marker-alt"></i> <strong>Место:</strong> ${this.escapeHtml(contract.location)}</div>
                    <div><i class="fas fa-hourglass-half"></i> <strong>Срок:</strong> ${contract.timeLimit}</div>
                    <div><i class="fas fa-chart-line"></i> <strong>Рекомендуемый ранг:</strong> ${contract.recommendedRank}</div>
                    ${contract.complication ? `<div><i class="fas fa-exclamation-triangle"></i> <strong>Осложнение:</strong> ${this.escapeHtml(contract.complication)}</div>` : ''}
                    ${contract.twist ? `<div><i class="fas fa-sync-alt"></i> <strong>Поворот:</strong> ${this.escapeHtml(contract.twist)}</div>` : ''}
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

    static escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}