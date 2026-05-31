export const rangedWeapons = [
    { name:"Средний пистолет", skill:"Короткоствольное", dmg:"2d6", mag:12, rof:2, hands:1, conceal:"да", cost:50, notes:"" },
    { name:"Тяжёлый пистолет", skill:"Короткоствольное", dmg:"3d6", mag:8, rof:2, hands:1, conceal:"да", cost:100, notes:"" },
    { name:"Очень тяжёлый пистолет", skill:"Короткоствольное", dmg:"4d6", mag:8, rof:1, hands:1, conceal:"нет", cost:100, notes:"" },
    { name:"ПП", skill:"Короткоствольное", dmg:"2d6", mag:30, rof:1, hands:1, conceal:"да", cost:100, notes:"Автоогонь(3)" },
    { name:"Тяжёлый ПП", skill:"Короткоствольное", dmg:"3d6", mag:40, rof:1, hands:1, conceal:"нет", cost:100, notes:"Автоогонь(3)" },
    { name:"Дробовик", skill:"Длинноствольное", dmg:"5d6", mag:4, rof:1, hands:2, conceal:"нет", cost:500, notes:"Дробь" },
    { name:"Штурмовая винтовка", skill:"Длинноствольное", dmg:"5d6", mag:25, rof:1, hands:2, conceal:"нет", cost:500, notes:"Автоогонь(4)" },
    { name:"Снайперская винтовка", skill:"Длинноствольное", dmg:"5d6", mag:4, rof:1, hands:2, conceal:"нет", cost:500, notes:"" }
];
export const meleeWeapons = [
    { name:"Боевой нож", type:"лёгкое", dmg:"1d6", rof:2, conceal:"да", cost:50 },
    { name:"Мачете", type:"среднее", dmg:"2d6", rof:2, conceal:"нет", cost:50 },
    { name:"Меч", type:"тяжёлое", dmg:"3d6", rof:2, conceal:"нет", cost:100 },
    { name:"Кувалда", type:"очень тяжёлое", dmg:"4d6", rof:1, conceal:"нет", cost:500 }
];
export const armors = [
    { name:"Кожа", sp:4, penalty:0, cost:20 },
    { name:"Кевлар", sp:7, penalty:0, cost:50 },
    { name:"Лёгкий арморджек", sp:11, penalty:0, cost:100 },
    { name:"Средний арморджек", sp:12, penalty:-2, cost:100 },
    { name:"Тяжёлый арморджек", sp:13, penalty:-2, cost:500 },
    { name:"Осколочный бронежилет", sp:15, penalty:-4, cost:500 },
    { name:"Metalgear", sp:18, penalty:-4, cost:5000 }
];
export const critBody = [
    { roll:2, name:"Оторванная рука", effect:"+1 штраф спасброска", quick:"—", treat:"Хирургия СЛ17" },
    { roll:3, name:"Оторванная кисть", effect:"+1 штраф", quick:"—", treat:"Хирургия СЛ17" },
    { roll:4, name:"Разрыв лёгкого", effect:"–2 СКО, +1 спасбросок", quick:"Парамедицина СЛ15", treat:"Хирургия СЛ15" },
    { roll:5, name:"Перелом рёбер", effect:"урон при движении >4м", quick:"Парамедицина СЛ13", treat:"Парамедицина/Хирургия" },
    { roll:6, name:"Перелом руки", effect:"рука бесполезна", quick:"Парамедицина СЛ13", treat:"Парамедицина/Хирургия" },
    { roll:7, name:"Инородное тело", effect:"урон при движении >4м", quick:"Первая помощь/Парамедицина СЛ13", treat:"Быстрая помощь лечит" },
    { roll:8, name:"Перелом ноги", effect:"–4 СКО", quick:"Парамедицина СЛ13", treat:"Парамедицина/Хирургия" },
    { roll:9, name:"Разрыв мышц", effect:"–2 рукопашные атаки", quick:"Первая помощь/Парамедицина СЛ13", treat:"Быстрая помощь лечит" },
    { roll:10, name:"Травма позвоночника", effect:"след. ход только перемещение, +1 спасбросок", quick:"Парамедицина СЛ15", treat:"Хирургия СЛ15" },
    { roll:11, name:"Раздробленные пальцы", effect:"–4 к действиям этой рукой", quick:"Парамедицина СЛ13", treat:"Хирургия СЛ15" },
    { roll:12, name:"Оторванная нога", effect:"–6 СКО, нельзя уклоняться", quick:"—", treat:"Хирургия СЛ15" }
];
export const critHead = [
    { roll:2, name:"Потеря глаза", effect:"–4 дальние атаки, Восприятие", quick:"—", treat:"Хирургия СЛ17" },
    { roll:3, name:"Травма мозга", effect:"–2 ко всем действиям", quick:"—", treat:"Хирургия СЛ17" },
    { roll:4, name:"Повреждение глаза", effect:"–2 дальние атаки, Восприятие", quick:"Парамедицина СЛ15", treat:"Хирургия СЛ13" },
    { roll:5, name:"Сотрясение", effect:"–2 ко всем действиям", quick:"Первая помощь/Парамедицина СЛ13", treat:"Быстрая помощь лечит" },
    { roll:6, name:"Перелом челюсти", effect:"–4 действия с речью", quick:"Парамедицина СЛ13", treat:"Парамедицина/Хирургия СЛ13" },
    { roll:7, name:"Инородное тело", effect:"урон при движении >4м", quick:"Первая помощь/Парамедицина СЛ13", treat:"Быстрая помощь лечит" },
    { roll:8, name:"Хлыстовая травма шеи", effect:"+1 спасбросок", quick:"Парамедицина СЛ13", treat:"Парамедицина/Хирургия СЛ15" },
    { roll:9, name:"Трещина черепа", effect:"прицельные в голову ×3, +1 спасбросок", quick:"Парамедицина СЛ15", treat:"Парамедицина/Хирургия СЛ15" },
    { roll:10, name:"Повреждение уха", effect:"–2 Восприятие (слух), урон при движении", quick:"Парамедицина СЛ13", treat:"Хирургия СЛ13" },
    { roll:11, name:"Травма трахеи", effect:"нельзя говорить, +1 спасбросок", quick:"—", treat:"Хирургия СЛ15" },
    { roll:12, name:"Потеря уха", effect:"–4 Восприятие (слух), урон при движении", quick:"—", treat:"Хирургия СЛ17" }
];
export const detailedCyberware = [
    { name:"Биомонитор", type:"стилевые", install:"ТЦ", effect:"Подкожный имплант, выводящий показатели", cost:100, humanity:"0", notes:"" },
    { name:"Изменчивые линзы", type:"стилевые", install:"ТЦ", effect:"Линзы с изменяемым цветом", cost:100, humanity:"0", notes:"" },
    { name:"Светотату", type:"стилевые", install:"ТЦ", effect:"Подкожные татуировки, +2 к стилю", cost:100, humanity:"0", notes:"" },
    { name:"Техноволосы", type:"стилевые", install:"ТЦ", effect:"Искусственные волосы, меняющие цвет", cost:100, humanity:"0", notes:"" },
    { name:"Химкожа", type:"стилевые", install:"ТЦ", effect:"Изменение цвета кожи", cost:100, humanity:"0", notes:"" },
    { name:"Нейролинк", type:"нейро", install:"Клиника", effect:"Искусственная нервная система, 5 слотов", cost:500, humanity:"7(2d6)", notes:"Основа для нейроимплантов" },
    { name:"Интерфейсный разъём", type:"нейро", install:"Клиника", effect:"Разъёмы для подключения к технике", cost:500, humanity:"7(2d6)", notes:"Требует нейролинк" },
    { name:"Керензиков", type:"нейро", install:"Клиника", effect:"+2 к инициативе", cost:500, humanity:"14(4d6)", notes:"Только один ускоритель" },
    { name:"Сандевистан", type:"нейро", install:"Клиника", effect:"+3 к инициативе на 1 минуту", cost:500, humanity:"7(2d6)", notes:"Перезарядка 1 час" },
    { name:"Разъём для щепок", type:"нейро", install:"Клиника", effect:"Позволяет использовать щепки", cost:500, humanity:"7(2d6)", notes:"" },
    { name:"Киберглаз", type:"оптика", install:"Клиника", effect:"Искусственный глаз, 3 слота", cost:100, humanity:"7(2d6)", notes:"" },
    { name:"Антиослепление", type:"оптика", install:"ТЦ", effect:"Иммунитет к вспышкам", cost:100, humanity:"2(1d6/2)", notes:"Требует два глаза" },
    { name:"Виртуальность", type:"оптика", install:"ТЦ", effect:"Проецирует киберпространство", cost:100, humanity:"2(1d6/2)", notes:"" },
    { name:"ПНВ/ИК/УФ", type:"оптика", install:"ТЦ", effect:"Ночное/тепловое зрение", cost:500, humanity:"3(1d6)", notes:"Требует два глаза" },
    { name:"Прицельный модуль", type:"оптика", install:"Клиника", effect:"+1 к прицельным выстрелам", cost:500, humanity:"3(1d6)", notes:"" },
    { name:"Телеоптика", type:"оптика", install:"Клиника", effect:"Видит до 800 м, +1 на дистанции", cost:500, humanity:"3(1d6)", notes:"" },
    { name:"Набор кибераудио", type:"аудио", install:"Клиника", effect:"3 слота опций", cost:500, humanity:"7(2d6)", notes:"" },
    { name:"Усиленный слух", type:"аудио", install:"ТЦ", effect:"+2 к Восприятию (слух)", cost:100, humanity:"3(1d6)", notes:"" },
    { name:"Демпфер", type:"аудио", install:"ТЦ", effect:"Иммунитет к громким звукам", cost:100, humanity:"2(1d6/2)", notes:"" },
    { name:"Внутренний агент", type:"аудио", install:"ТЦ", effect:"Агент внутри тела", cost:100, humanity:"3(1d6)", notes:"" },
    { name:"Вампиры", type:"внутренние", install:"Клиника", effect:"Клыки, лёгкое холодное оружие", cost:500, humanity:"14(4d6)", notes:"" },
    { name:"Жабры", type:"внутренние", install:"Больница", effect:"Дыхание под водой", cost:1000, humanity:"7(2d6)", notes:"" },
    { name:"Искусственные мышцы и усиленные кости", type:"внутренние", install:"Больница", effect:"+2 ТЕЛО (макс.10)", cost:1000, humanity:"14(4d6)", notes:"" },
    { name:"Назальные фильтры", type:"внутренние", install:"Клиника", effect:"Иммунитет к газам", cost:100, humanity:"2(1d6/2)", notes:"" },
    { name:"Усиленные антитела", type:"внутренние", install:"ТЦ", effect:"Восстанавливает ТЕЛО×2 ПЗ в день", cost:500, humanity:"2(1d6/2)", notes:"" },
    { name:"Подкожная броня", type:"внешние", install:"Больница", effect:"ОС 11 на тело и голову", cost:1000, humanity:"14(4d6)", notes:"" },
    { name:"Подкожный карман", type:"внешние", install:"Клиника", effect:"Тайник под кожей", cost:100, humanity:"3(1d6)", notes:"" },
    { name:"Скрытая кобура", type:"внешние", install:"Клиника", effect:"Хранит оружие внутри тела", cost:500, humanity:"7(2d6)", notes:"" },
    { name:"Киберрука", type:"конечности", install:"Больница", effect:"4 слота опций", cost:500, humanity:"7(2d6)", notes:"" },
    { name:"Когти", type:"конечности", install:"Клиника", effect:"Выдвижные когти, среднее холодное оружие", cost:500, humanity:"7(2d6)", notes:"" },
    { name:"Потрошители", type:"конечности", install:"Клиника", effect:"Когти из карбостекла, тяжёлое оружие", cost:500, humanity:"3(1d6)", notes:"" },
    { name:"Рука-мультитул", type:"конечности", install:"Клиника", effect:"Инструменты в пальцах", cost:100, humanity:"3(1d6)", notes:"" },
    { name:"Кибернога", type:"конечности", install:"Больница", effect:"3 слота опций", cost:100, humanity:"3(1d6)", notes:"" },
    { name:"Роликовая стопа", type:"конечности", install:"Клиника", effect:"Ролики, +6 м к бегу", cost:500, humanity:"3(1d6)", notes:"Требует две ноги" },
    { name:"Усилитель прыжка", type:"конечности", install:"Клиника", effect:"Игнорирует штрафы прыжков", cost:500, humanity:"3(1d6)", notes:"Требует две ноги" },
    { name:"Эндоскелет Сигма", type:"боргирование", install:"Больница", effect:"ТЕЛО становится 12", cost:1000, humanity:"14(4d6)", notes:"Требует ТЕЛО 6" },
    { name:"Эндоскелет Бета", type:"боргирование", install:"Больница", effect:"ТЕЛО становится 14", cost:5000, humanity:"14(4d6)", notes:"Требует ТЕЛО 8" }
];
export const marketItems = [
    { name:"Боевой нож", cat:"оружие", cost:50 }, { name:"Тяжёлый пистолет", cat:"оружие", cost:100 },
    { name:"Штурмовая винтовка", cat:"оружие", cost:500 }, { name:"Лёгкий арморджек", cat:"броня", cost:100 },
    { name:"Киберглаз", cat:"имплант", cost:100 }, { name:"Нейролинк", cat:"имплант", cost:500 },
    { name:"Смэш (доза)", cat:"наркотик", cost:10 }, { name:"Агент", cat:"снаряжение", cost:100 }
];
export const transport = [
    { name: "Дорожный мотоцикл", type: "наземный", psp: 35, seats: 2, speedCombat: 20, speedNarrative: "161 км/ч", cost: 20000, armor: 0, weapons: 0 },
    { name: "Спортивный мотоцикл", type: "наземный", psp: 35, seats: 2, speedCombat: 60, speedNarrative: "483 км/ч", cost: 100000, armor: 0, weapons: 0 },
    { name: "Автомобиль", type: "наземный", psp: 50, seats: 4, speedCombat: 20, speedNarrative: "161 км/ч", cost: 30000, armor: 0, weapons: 0 },
    { name: "Спорткар", type: "наземный", psp: 50, seats: 4, speedCombat: 40, speedNarrative: "322 км/ч", cost: 50000, armor: 0, weapons: 0 },
    { name: "Суперкар", type: "наземный", psp: 50, seats: 2, speedCombat: 60, speedNarrative: "483 км/ч", cost: 100000, armor: 0, weapons: 0 },
    { name: "Гидроцикл", type: "водный", psp: 35, seats: 2, speedCombat: 20, speedNarrative: "97 км/ч", cost: 20000, armor: 0, weapons: 0 },
    { name: "Скоростной катер", type: "водный", psp: 50, seats: 4, speedCombat: 20, speedNarrative: "97 км/ч", cost: 30000, armor: 0, weapons: 0 },
    { name: "Круизный катер", type: "водный", psp: 60, seats: "2 в комнате", speedCombat: 10, speedNarrative: "24 км/ч", cost: 30000, armor: 0, weapons: 0 },
    { name: "Яхта", type: "водный", psp: 100, seats: "4 в комнате", speedCombat: 10, speedNarrative: "24 км/ч", cost: 50000, armor: 0, weapons: 0 },
    { name: "Гирокоптер", type: "воздушный", psp: 35, seats: 2, speedCombat: 20, speedNarrative: "161 км/ч", cost: 20000, armor: 0, weapons: 0 },
    { name: "Вертолёт", type: "воздушный", psp: 60, seats: 4, speedCombat: 40, speedNarrative: "322 км/ч", cost: 40000, armor: 0, weapons: 0 },
    { name: "AV-4", type: "воздушный", psp: 100, seats: 6, speedCombat: 40, speedNarrative: "322 км/ч", cost: 50000, armor: 0, weapons: 0 },
    { name: "AV-9", type: "воздушный", psp: 60, seats: 2, speedCombat: 60, speedNarrative: "483 км/ч", cost: 100000, armor: 0, weapons: 0 }
];
export const streetDrugs = [
    { name: "Буст", duration: "24 ч", effect: "+2 ИНТ", sideEffect: "Зависимость, –2 ИНТ", cost: 50 },
    { name: "Голубое стекло", duration: "4 ч", effect: "Галлюцинации (вспышки)", sideEffect: "Зависимость, периодические вспышки", cost: 20 },
    { name: "Синткок", duration: "4 ч", effect: "+1 РЕФ, паранойя", sideEffect: "Зависимость, –2 РЕФ", cost: 20 },
    { name: "Смэш", duration: "4 ч", effect: "+2 к Общению, Убеждению, Акробатике", sideEffect: "Зависимость, –2 к тем же навыкам", cost: 10 },
    { name: "Чёрное кружево", duration: "24 ч", effect: "Игнорирует штрафы тяжёлого ранения, –2d6 человечности", sideEffect: "Зависимость, –2 РЕФ", cost: 50 }
];
export const ammoTypes = [
    { name: "Базовые", effect: "Стандартные", cost: "10 eb за 10 шт." },
    { name: "Бронебойные", effect: "Снижают ОС брони на 2 (вместо 1)", cost: "100 eb за 10 шт." },
    { name: "Зажигательные", effect: "Поджигают цель (2 урона в ход)", cost: "100 eb за 10 шт." },
    { name: "Резиновые", effect: "Нелетальные, не снижают ОС", cost: "10 eb за 10 шт." },
    { name: "Умные", effect: "Повторный бросок при промахе на ≤4", cost: "500 eb за 10 шт." },
    { name: "Светошумовые (гранаты)", effect: "Ослепление и оглушение", cost: "100 eb за гранату" },
    { name: "Дымовые (гранаты)", effect: "Создают облако дыма, –4 к действиям", cost: "50 eb за гранату" }
];
export const weaponAttachments = [
    { name: "Снайперский прицел", effect: "+1 к проверке на дистанции 51+ м", cost: 100 },
    { name: "ИК-прицел", effect: "Игнорирует темноту, дым, туман", cost: 500 },
    { name: "Интерфейс умного оружия", effect: "+1 к проверке (требует нейролинк)", cost: 500 },
    { name: "Подствольный гранатомёт", effect: "Превращает оружие в гранатомёт", cost: 500 },
    { name: "Расширенный магазин", effect: "Увеличивает ёмкость", cost: 100 },
    { name: "Барабанный магазин", effect: "Максимальная ёмкость, нельзя скрыть", cost: 500 },
    { name: "Штык-нож", effect: "Оружие можно использовать как лёгкое холодное", cost: 100 }
];
export const gearItems = [
    { name: "Агент", category: "Коммуникации", cost: 100, description: "Смартфон с ИИ-помощником", effect: "+2 к поиску информации и стилю" },
    { name: "Активные наушники", category: "Защита", cost: 1000, description: "Защита слуха от громких звуков", effect: "Иммунитет к глухоте от взрывов" },
    { name: "Аэрогипо", category: "Медицина", cost: 50, description: "Устройство для инъекций", effect: "Позволяет ввести дозу действием" },
    { name: "Бинокль", category: "Наблюдение", cost: 50, description: "Увеличение ×2 или ×3", effect: "Позволяет видеть детали на дальних дистанциях" },
    { name: "Верёвка (60м)", category: "Инструменты", cost: 20, description: "Нейлоновая верёвка", effect: "Выдерживает до 360 кг" },
    { name: "Детектор жучков", category: "Безопасность", cost: 500, description: "Обнаруживает подслушивающие устройства", effect: "Сигнал при приближении к жучку" },
    { name: "Диктофон", category: "Наблюдение", cost: 100, description: "Запись звука", effect: "24 часа записи на щепку" },
    { name: "Костюм химзащиты", category: "Защита", cost: 1000, description: "Защита от радиации и химикатов", effect: "Иммунитет к радиации и токсинам" },
    { name: "Медсканер", category: "Медицина", cost: 1000, description: "Диагностика травм", effect: "+2 к Первой помощи и Парамедицине" },
    { name: "Мультитул", category: "Инструменты", cost: 100, description: "Многофункциональный инструмент", effect: "Позволяет выполнять мелкий ремонт" },
    { name: "Набор отмычек", category: "Инструменты", cost: 20, description: "Инструменты для взлома замков", effect: "Используется для вскрытия механических замков" },
    { name: "Наручники", category: "Ограничение", cost: 50, description: "Стандартные наручники", effect: "ТЕЛО 10+ может их сломать" },
    { name: "Одноразовый мобильник", category: "Коммуникации", cost: 50, description: "Дешёвый телефон", effect: "Не отслеживается" },
    { name: "Рация", category: "Коммуникации", cost: 100, description: "Радиосвязь", effect: "Дальность 1.6 км" },
    { name: "Респиратор", category: "Защита", cost: 20, description: "Фильтрует токсины и дым", effect: "Иммунитет к вдыхаемым ядам и газам" },
    { name: "Сумка медтеха", category: "Медицина", cost: 100, description: "Медицинский набор", effect: "Необходима для оказания помощи" },
    { name: "Сумка техника", category: "Инструменты", cost: 500, description: "Набор инструментов", effect: "Необходима для ремонта" },
    { name: "Техсканер", category: "Инструменты", cost: 1000, description: "Диагностика техники", effect: "+2 ко всем техническим навыкам" },
    { name: "Фонарь", category: "Разное", cost: 20, description: "Луч до 100 м", effect: "Работает 10 часов" },
    { name: "Химический источник света", category: "Разное", cost: 10, description: "Светится 10 часов", effect: "Освещает 4 м" },
    { name: "Щепка памяти", category: "Электроника", cost: 10, description: "Носитель данных", effect: "Хранит информацию" }
];
export const cyberpsychosisInfo = {
    description: "Киберпсихоз – состояние, при котором персонаж теряет эмпатию и контроль из-за перегрузки имплантами.",
    stages: [{ emp: "3-4", state: "Лёгкая степень" }, { emp: "2", state: "Пограничное расстройство" }, { emp: "1", state: "Тяжёлая степень" }, { emp: "0", state: "Киберпсихоз" }],
    therapy: "Терапия: 500–1000 eb/неделя, восстанавливает 2d6–4d6 человечности."
};
export const reputationInfo = {
    description: "Репутация – мера известности персонажа. Влияет на реакции NPC и исход разборок.",
    confrontation: "Разборка: КРУТ + Репутация + 1d10",
    effect: "При встрече с NPC: бросок d10 < репутации → NPC слышал о вас."
};
export let playerVehicles = [];
export function addVehicle(vehicleName) {
    const vehicle = transport.find(v => v.name === vehicleName);
    if (vehicle) { playerVehicles.push({ ...vehicle, currentPsp: vehicle.psp, upgrades: [] }); saveVehicles(); return true; }
    return false;
}
export function removeVehicle(index) {
    if (index >= 0 && index < playerVehicles.length) {
        playerVehicles.splice(index, 1);
        saveVehicles();
        return true;
    }
    return false;
}
export function saveVehicles() { localStorage.setItem('cpr_vehicles', JSON.stringify(playerVehicles)); }
export function loadVehicles() { const saved = localStorage.getItem('cpr_vehicles'); if (saved) playerVehicles = JSON.parse(saved); }