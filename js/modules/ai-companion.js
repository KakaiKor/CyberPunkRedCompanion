// js/modules/ai-companion.js
// ИИ-компаньон ЮКИ. Реагирует на состояние персонажа, меняет реплики по клику.

import { loadCharacter } from '../storage.js';
import { getHP } from '../utils.js';
import { generalTips, contextTips, pickTip } from '../data/ai-tips.js';
const NAME = 'ЮКИ';               // ← имя можно поменять тут
const CYCLE_INTERVAL = 30000;     // автосмена реплики (30 сек)

// ─── Реплики по контексту ────────────────────────────────────
// ─── Реплики по контексту ────────────────────────────────────
// ─── Реплики по контексту ────────────────────────────────────
const QUOTES = {
    // ═══ ПРИВЕТСТВИЕ (стартовые) ═════════════════════════════
    greeting: [
        'Привет, чумба. Готов к движухе?',
        'Онлайн. Системы в норме.',
        'С возвращением в Найт-Сити.',
        'Смотри-ка, кто вернулся.',
        'Начинаем. Только не сдохни.',
        'Привет. Скучал?',
        'О, живой. Хорошо.',
        'Деньги в кармане, пушка на месте?',
        'Опять ты. Ладно, входи.',
        'Ну что, потанцуем?',
        'Ты. Я. Город. Погнали.',
        'Система готова. Ты — вряд ли.',
        'Входи, не стой на пороге.',
        'Ещё один день в аду. Люблю такие.',
        'Снова в деле? Неплохо.',
        'Держись меня — не прогадаешь.',
        'Всё в сборе. Можно начинать.',
        'Готов? Я — да. Догоняй.',
        'Добро пожаловать в очередную сессию.',
        'С возвращением, бегущий.'
    ],

    // ═══ БАЗОВЫЕ IDLE (крутятся в фоне) ══════════════════════
    idle: [
        'Найт-Сити не ждёт.',
        'Стиль важнее содержания.',
        'Никогда не доверяй корпорату с улыбкой.',
        'Смотри за спиной. Всегда.',
        'Живи на грани.',
        'Готов к следующему гигу?',
        'Репутация важнее эдди.',
        'Улица видит всё.',
        'Тишина в Найт-Сити — плохой знак.',
        'Завтра может не быть. Пользуйся сегодня.',
        'Каждый платит свою цену. Вопрос — когда.',
        'Если не ты, то кто?',
        'Красное небо, красные дни.',
        'Не оглядывайся. Сзади тоже улица.',
        'Город спит, но я — нет.',
        'Молчи. Слушай. Действуй.',
        'Не задавай лишних вопросов.',
        'Каждый день — подарок. Обычно с сюрпризом.',
        'Дыши глубже. Воздух ещё есть.',
        'Улица не забудет. Улица не простит.',
        'Хочешь жить — крутись.',
        'Хром греет, но не спасает.',
        'Чем тише ночь, тем громче утро.',
        'Никогда не знаешь, кто стоит за тобой.',
        'В Найт-Сити доверие стоит дороже хрома.',
        'Люди умирают. Легенды остаются.',
        'Твоя пушка — твой лучший адвокат.',
        'Не обещай того, что не сможешь отдать.',
        'Каждое утро — новая рулетка.',
        'Не беги, если не знаешь, куда.',
        'Умный живёт дольше смелого. Иногда.',
        'Корпораты не спят. И ты не спи.',
        'Тени длиннее, чем кажется.',
        'Если что-то слишком легко — жди подвоха.',
        'Держи друзей близко. Врагов — ещё ближе.',
        'Не каждый друг — друг. Не каждый враг — враг.',
        'Кровь не смывает долг.',
        'Иногда лучше промолчать. Но редко.',
        'Прошлое догонит. Вопрос лишь когда.',
        'Сегодня ты охотник. Завтра — дичь.',
        'Улица — как женщина. Обещает много, даёт мало.',
        'Слишком много правил. Слишком мало эдди.',
        'Смерть — это не конец. Это бизнес-расход.',
        'Не переживай о смерти. Переживай о счёте за неё.',
        'Каждый выбирает свою грань. Или она его.',
        'Найт-Сити съел лучших. Ты пока держишься.',
        'Держись подальше от камер и вопросов.',
        'Улыбайся. Тебя записывают.',
        'Не все улыбки — тёплые. Некоторые — из нержавейки.',
        'Каждый в этом городе что-то продаёт. Даже себя.',
        'Слишком много людей. Слишком мало пуль.',
        'Одна пуля — и биография.',
        'Не злись на правила. Злись на тех, кто их пишет.',
        'Ещё один день. Ещё один шанс сдохнуть.',
        'Молодые быстро дохнут. Опытные — не быстро.',
        'Хочешь жить — учись падать.',
        'Слишком тихо. Значит, кто-то готовит.',
        'Слишком громко. Значит, кто-то уже готов.',
        'Никогда не спорь с человеком, у которого киберпсихоэ.',
        'Каждый хочет быть легендой. Никто — мертвецом.',
        'Ты не первый. И не последний.',
        'Город любит победителей. И хоронит их.',
        'За каждой стеной — ещё одна стена. Или пушка.',
        'Доверяй инстинктам. Они выживали дольше.',
        'Не все менеджеры — сволочи. Но их большинство.',
        'Команда важнее хрома.',
        'Найт-Сити учит одному — ничему не удивляться.',
        'Вечная молодость — это про тех, кто умер молодым.',
        'Быстро бегаешь — долго живёшь. Может быть.',
        'Мертвецы не платят налоги. Пока что.',
        'Один правильный выбор стоит сотни пуль.',
        'Если тебя не ищут — ищи сам.',
        'Человечность дороже. Не забывай.',
        'Хром — это не тело. Это аренда.',
        'Держись за тех, кто ещё человек.',
        'Слишком много апгрейдов. Слишком мало мозга.',
        'Смерть приходит быстро. Особенно в Найт-Сити.',
        'Иногда проще убить, чем убедить. Но не всегда.',
        'Ставки растут. Всегда.',
        'Не всякий враг — враг. Не всякий друг — друг.',
        'Умей уходить вовремя. Всё остальное — бонус.',
        'Ты думаешь, ты в безопасности? Проверь почту.',
        'Фиксеры не спят. Они ждут.',
        'Ты — сумма своих решений. Пока что.',
        'Никогда не показывай всё, что умеешь.',
        'Слишком много вопросов — плохо для здоровья.',
        'Найт-Сити прощает ошибки. Один раз. Иногда.',
        'Каждый день — новый протокол.',
        'Молодость — это то, что у тебя забирают первым.',
        'Если тебе кажется, что ты на грани — ты уже за ней.',
        'Ищи работу. Или работа найдёт тебя.',
        'Твоя репутация — твоя валюта.',
        'Ещё один день в раю для безумцев.',
        'Ошибки не стираются. Они хоронятся.',
        'Хорошая команда — половина успеха.',
        'Плохая команда — конец всему.',
        'Иногда лучший выбор — не ввязываться.',
        'Каждый думает, что умрёт не сегодня.',
        'Всё, что ты сделал — запомнят. Или забудут. Оба хуже.',
        'Держись за жизнь. Она у тебя только одна.'
    ],

    // ═══ ПРИ НИЗКОМ ПЗ ═══════════════════════════════════════
    hpLow: [
        'Полегче, чумба. Ты не бессмертный.',
        'ПЗ на исходе. Может, отступим?',
        'Кровь — плохой декор.',
        'Каждый удар может стать последним.',
        'Не рискуй. Сегодня — не твой день.',
        'Ещё немного — и начнёшь собирать травмы.',
        'Может, перевязку? Не стыдно.',
        'Ты теряешь форму. Отступай.',
        'Полегче. Ты не из железа.',
        'Раны имеют привычку открываться. Иди к медтеху.',
        'Кровь капает на пол. Это плохо.',
        'Один выстрел — и всё.',
        'Ты уязвим. Это не слабость, это факт.',
        'Регенерация — не бесконечная.',
        'Держись за укрытие.',
        'Слишком много урона. Слишком мало ПЗ.',
        'Умей отступать. Иногда это победа.'
    ],

    // ═══ ПРИ КРИТИЧЕСКОМ ПЗ ══════════════════════════════════
    hpCritical: [
        'ПЗ критично. Уже писал завещание?',
        'Ты на грани. Пора к медтеху.',
        'Пульс падает. Вызываю Trauma Team?',
        'Ещё один выстрел — и всё.',
        'Не двигайся. Дыши. Держись.',
        'Ты труп с отсрочкой. Не двигайся.',
        'Смертельное ранение. Каждый ход — спасбросок.',
        'Осталось мало. Не облажайся.',
        'Либо стабилизация, либо морг.',
        'Сейчас не до героизма. Прячься.',
        'Ты в шаге от смерти. Действуй.',
        'Хватит стрелять. Спасай себя.',
        'Один ход — одно решение. Выбирай мудро.',
        'Считай секунды. Каждая может быть последней.',
        'Позови медтеха. Срочно.',
        'Твоя кровь на асфальте. Останови это.',
        'Сейчас не до стиля. Ползи к укрытию.'
    ],

    // ═══ ПРИ ПОЛНОМ ПЗ ═══════════════════════════════════════
    hpFull: [
        'Всё в порядке. Продолжаем?',
        'Отдохнул? Двигаемся дальше.',
        'Цел. Пока что.',
        'Мясо на месте, хром работает.',
        'Как новый. Не портись.',
        'Цел и почти невредим. Хорошо.',
        'Подлатали. Пора работать.',
        'Здоров. Пользуйся, пока можешь.',
        'Дышишь ровно. Не зевай.',
        'Восстановился. Готов к движухе.',
        'Полный заряд. Не растеряй.'
    ],

    // ═══ ПРИ НИЗКОЙ ЧЕЛ ══════════════════════════════════════
    humanityLow: [
        'Киберпсихоз не за горами…',
        'ЧЕЛ тает. Полегче с имплантами.',
        'Ты ещё человек? Или уже машина?',
        'Держись за людей, пока можешь.',
        'Разум — не расходник.',
        'Ещё пара имплантов — и всё.',
        'Ты теряешь себя. Заметь это.',
        'Сходи к терапевту. Не тяни.',
        'Хром не заменит тебя.',
        'Человечность важнее рефлексов.',
        'Считай, что тебе звонит совесть.',
        'Ещё один чип — и начнёшь забывать имена.',
        'Твои глаза ещё видят, но душа — уже нет.',
        'Люди начинают тебя бояться. Это тревожный знак.',
        'Ты становишься тем, кого презирал.',
        'Меньше хрома, больше человека.',
        'Проверь, помнишь ли ты мать.'
    ],

    // ═══ ПРИ КРИТИЧЕСКОЙ ЧЕЛ ═════════════════════════════════
    humanityCritical: [
        'КИБЕРПСИХОЗ. Прячусь.',
        'Психоотряд в пути. Шучу. Или нет.',
        'Слишком много хрома. Слишком мало тебя.',
        'Мастер уже точит карандаш.',
        'Это конец. Или начало конца.',
        'Психоотряд найдёт тебя. Рано или поздно.',
        'Ты стал машиной, которая убивает.',
        'Макс-Так уже едет.',
        'Ты убил себя. Тело ещё ходит.',
        'Один звонок — и тебя обнулят.',
        'Ты опасен для друзей. Уходи.',
        'Каждый шорох — это уже паранойя.',
        'Ты больше не человек. Это факт.',
        'Сдайся, пока можешь.',
        'Тебя не спасут. Тебя обнулят.',
        'Очередь на киберпсихов дошла до тебя.'
    ],

    // ═══ ПРИ НИЗКИХ ДЕНЬГАХ ══════════════════════════════════
    moneyLow: [
        'Денег мало. Пора взять контракт.',
        'Пустой кошелёк — плохой компаньон.',
        'Скоро аренда. Ищи работу.',
        'Эдди заканчиваются. Фиксер подкинет что-нибудь.',
        'Бедный бегущий — мёртвый бегущий.',
        'На мели. Это плохо.',
        'Считай каждый эдди.',
        'Скоро придётся есть киббл. Опять.',
        'Разоришься — не выживешь.',
        'Возьми работу. Даже грязную.',
        'Патроны дорогие. Не забывай.',
        'Копилка трещит. Действуй.'
    ],

    // ═══ ПРИ НУЛЕ ДЕНЕГ ══════════════════════════════════════
    moneyZero: [
        'Ноль эдди. Либо заказ, либо смерть с голоду.',
        'На мели. Ищи фиксера.',
        'Нищие герои долго не живут.',
        'Пустой кошелёк. Бери первую работу.',
        'Платить нечем. Даже киббл — уже роскошь.',
        'Ты банкрот. Пора двигаться.',
        'Денег нет. Хуже только пуля.',
        'Ноль на счету. Это уже диагноз.',
        'Ничего не купишь. Ищи заказ.',
        'Ты гол как сокол. Буквально.',
        'Без денег — без хрома. Без хрома — без жизни.',
        'Продай что-нибудь. Срочно.'
    ],

    // ═══ ПРИ НАЛИЧИИ IP ══════════════════════════════════════
    ipAvailable: [
        'Столько IP не потратить — грех.',
        'Не забудь про развитие.',
        'Ты растёшь. Я вижу.',
        'Вкладывайся. Сейчас самое время.',
        'IP — это будущее. Не тормози.',
        'Расти. Найт-Сити не ждёт слабых.',
        'Прокачай что-нибудь. Пока есть время.',
        'IP лежат мёртвым грузом. Оживи их.',
        'Опыт без развития — мусор.',
        'Каждый потраченный IP — шаг вперёд.',
        'Не копи. Развивайся.',
        'Твои навыки ждут.'
    ],

    // ═══ КРИТИЧЕСКИЙ УСПЕХ ═══════════════════════════════════
    critRoll: [
        'Джекпот! Судьба на твоей стороне.',
        'Десятка! В этот раз — всё по-твоему.',
        'Красиво. Так и надо.',
        'Проверка прошла. И даже с блеском.',
        'Вот это бросок. Запомни его.',
        'Судьба улыбнулась. Не привыкай.',
        'Идеально. Такие броски входят в историю.',
        'Крит! ЮКИ доволен.',
        'Вот что значит мастерство. Или удача.',
        'На десять! По-другому и быть не могло.',
        'Триумф. Чистый.',
        'Ты только что вошёл в топ.'
    ],

    // ═══ КРИТИЧЕСКИЙ ПРОВАЛ ══════════════════════════════════
    failRoll: [
        'Ох. Не твой день.',
        'Единица. Судьба отвернулась.',
        'Плохой бросок. Держись.',
        'Бывает. Не зацикливайся.',
        'Так бывает. Главное — выживи.',
        'Провал. Хуже некуда.',
        'Единица? И это называется бегущий по грани.',
        'Не везёт. Но жив. Пока что.',
        'Бросок в помойку. Бывает.',
        'Ох, как больно.',
        'Лучше бы просто промахнулся.',
        'Критпровал. Держись за голову.'
    ],

    // ═══ ИНИЦИАТИВА ВЫСОКАЯ ══════════════════════════════════
    initHigh: [
        'Хорошая инициатива. Действуй первым.',
        'Ты быстрее. Пользуйся.',
        'Опередил всех. Не тормози.',
        'Первый ход — твой. Не облажайся.',
        'Быстрее всех. Это преимущество.',
        'Первый. Используй это.',
        'Твой ход. Не потеряй темп.',
        'Отлично. Бей первым.'
    ],

    // ═══ ИНИЦИАТИВА НИЗКАЯ ═══════════════════════════════════
    initLow: [
        'Инициатива низкая. Готовься.',
        'Они быстрее. Защищайся.',
        'Последний ход. Не спеши.',
        'Они начнут первыми. Терпи.',
        'Медленно. Приготовься к удару.',
        'Ход не твой. Ищи укрытие.',
        'Они впереди. Не зевай.',
        'Последний в очереди. Держись.'
    ],

    // ═══ КЛИК ПО БЛОКУ ═══════════════════════════════════════
    click: [
        'Опять ты?',
        'Что?',
        'Слушаю.',
        'Не отвлекай, думаю.',
        'Тебе скучно?',
        'Ищи приключений, не меня.',
        'Да?',
        'Ну?',
        'Говори уже.',
        'Хватит тыкать.',
        'Я не кнопка.',
        'Что надо?',
        'Может, делом займёшься?',
        'У тебя ПЗ не бесконечные. Побереги пальцы.',
        'Я подумаю. Может быть.',
        'Не сейчас.',
        'Опять?',
        'Серьёзно?',
        'Ну сколько можно.',
        'Тебе больше нечем заняться?',
        'Пальцы сотрёшь.',
        'Ещё раз — и я обижусь.',
        'Тебя никто не учил не тыкать?',
        'Я тут не для развлечения.',
        'Ты как ребёнок с кнопкой.',
        'Может, помощь нужна? Скажи словами.',
        'Ну и?',
        'Дальше что?',
        'Терпение у меня не бесконечное.',
        'Утомил.',
        'Ещё раз — уйду в офлайн.',
        'Не смешно.',
        'Я не игрушка.',
        'Прекрати.',
        'Кнопка не виновата.',
        'Ты издеваешься?',
        'Может, в магазин сходишь?',
        'Отстань, я работаю.',
        'Ты всегда такой?',
        'Хорош.',
        'Отвали.',
        'Ну ты и зануда.',
        'Я всё вижу. И записываю.'
    ]
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export class AICompanion {
    constructor() {
        this.root = document.getElementById('aiCompanion');
        this.avatar = document.getElementById('aiAvatar');
        this.speech = document.getElementById('aiSpeech');
        this.quoteEl = this.speech?.querySelector('.ai-quote');
        this.statusEl = document.getElementById('aiStatus');
        this.nameEl = document.getElementById('aiName');
                // Совет
        this.tipBox = document.getElementById('aiTipBox');
        this.tipText = document.getElementById('aiTipText');
        this.tipNextBtn = document.getElementById('aiTipNextBtn');
                // Инициатива
        this.initBtn = document.getElementById('aiInitBtn');
        this.initResult = document.getElementById('aiInitResult');
        this.initFormula = document.getElementById('aiInitFormula');
         // Спасбросок от смерти
        this.dsBox = document.getElementById('aiDeathSave');
        this.dsBtn = document.getElementById('aiDsBtn');
        this.dsResult = document.getElementById('aiDsResult');
        this.dsFormula = document.getElementById('aiDsFormula');
        this.dsResetBtn = document.getElementById('aiDsResetBtn');
        // Лог
        this.logList = document.getElementById('aiLogList');
        this.logClearBtn = document.getElementById('aiLogClearBtn');
        if (!this.root || !this.quoteEl) return;

        if (this.nameEl) this.nameEl.textContent = NAME;

        this.currentQuote = '';
        this.cycleTimer = null;
        this.lastTipCategory = null;   // защита от спама одной темой
        this.tipStreak = 0;            // сколько раз подряд одна тема
        // Штраф к спасброскам от смерти (накапливается в сессии)
        this.deathSavePenalty = this.loadDeathSavePenalty();

        this.attachEvents();
        this.updateState(true);
        this.showTip();
        this.refreshInitFormula();
        this.refreshDeathSaveFormula();
        this.loadLog();
        this.startCycle();

        // Реакция на изменение персонажа
        window.addEventListener('characterUpdated', () => this.updateState());
        window.addEventListener('luckChanged', () => this.updateState());
    }

        attachEvents() {
        // Клик по блоку — новая реплика (но не по кнопкам совета)
        this.root.addEventListener('click', (e) => {
            if (e.target.closest('.ai-tip-box') || e.target.closest('.ai-tip-btn')) return;
            this.say(pickRandom(QUOTES.click), 'active');
        });

                     // Обновить совет
        this.tipNextBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTip();
        });

        // Инициатива
        this.initBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.rollInitiative();
        });

                // Очистка лога
        this.logClearBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Очистить лог сессии?')) {
                this.clearLog();
            }
        });

        // Спасбросок от смерти
        this.dsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.rollDeathSave();
        });

        // Сброс штрафа (стабилизация)
        this.dsResetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Сбросить штраф к спасброскам? (стабилизация)')) {
                this.deathSavePenalty = 0;
                this.saveDeathSavePenalty();
                this.refreshDeathSaveFormula();
            }
        });

        // Слушаем события от других модулей — для записи в лог
        window.addEventListener('skillCheckRolled', (e) => {
            const detail = e.detail || {};
            if (detail.total !== undefined && detail.skill) {
                const success = detail.success;
                const cls = success === true ? 'is-success' : success === false ? 'is-fail' : '';
                const mark = success === true ? ' ✅' : success === false ? ' ❌' : '';
                this.addLog(`${detail.skill} → ${detail.total}${mark}`, cls);
            }
        });

        window.addEventListener('characterUpdated', () => {
            // Не логируем каждое обновление — только реальные изменения ПЗ
            // Логируется через прямой вызов из quick-stats (см. ниже)
        });
    }

    // ─── Показ релевантного совета ─────────────────────────
        // ─── Показ релевантного совета ─────────────────────────
     showTip() {
        const char = loadCharacter();
        const tip = this.pickSmartTip(char);
        if (this.tipText) this.tipText.textContent = tip;
    }

    // ─── Умный выбор: не спамит одной категорией ────────────
    pickSmartTip(char) {
        const contextTip = this.pickContextTip(char);
        // Определяем категорию по тексту (простая эвристика)
        const category = contextTip ? this.detectTipCategory(contextTip, char) : 'general';

        if (category === this.lastTipCategory) {
            this.tipStreak += 1;
        } else {
            this.tipStreak = 1;
            this.lastTipCategory = category;
        }

        // Если 3 раза подряд одна тема — даём общий совет для разнообразия
        if (this.tipStreak >= 3) {
            this.tipStreak = 0;
            this.lastTipCategory = 'general';
            return pickTip(generalTips);
        }

        return contextTip || pickTip(generalTips);
    }

    // ─── Определение категории совета ───────────────────────
    detectTipCategory(text, char) {
        if (!text) return 'general';
        if (contextTips.hpCritical.includes(text) || contextTips.hpLow.includes(text)) return 'hp';
        if (contextTips.humanityCritical.includes(text) || contextTips.humanityLow.includes(text)) return 'humanity';
        if (contextTips.moneyZero.includes(text) || contextTips.moneyLow.includes(text)) return 'money';
        if (contextTips.ipAvailable.includes(text)) return 'ip';
        return 'role';
    }

        // ─── Выбор совета по контексту персонажа ──────────────
    pickContextTip(char) {
        // Пустой персонаж — сразу общий совет
        if (!char || !char.name || !char.role) return null;

        const body = (char.baseStats && char.baseStats.BODY) || char.BODY || 6;
        const will = (char.baseStats && char.baseStats.WILL) || char.WILL || 6;
        const maxHp = char.maxHp || getHP(body, will);
        const currentHp = char.currentHp !== undefined ? char.currentHp : maxHp;
        const hpPct = maxHp > 0 ? currentHp / maxHp : 1;

        const emp = (char.baseStats && char.baseStats.EMP) || char.EMP || 6;
        const humanity = char.humanity !== undefined ? char.humanity : emp * 10;

        const money = (char.money !== undefined && !isNaN(char.money)) ? char.money : 0;
        const ipAvailable = (char.ip && char.ip.available) || 0;

        // Приоритеты: критичное → важное → ролевое → общий
        if (hpPct <= 0.5)       return pickTip(contextTips.hpCritical);
        if (humanity <= 0)      return pickTip(contextTips.humanityCritical);
        if (humanity <= 30)     return pickTip(contextTips.humanityLow);
        if (hpPct < 1)          return pickTip(contextTips.hpLow);
        if (money === 0)        return pickTip(contextTips.moneyZero);
        if (money < 200)        return pickTip(contextTips.moneyLow);
        if (ipAvailable >= 50)  return pickTip(contextTips.ipAvailable);

        // Ролевые — только если ничего критичного нет (20% шанс)
        if (Math.random() < 0.2) {
            const roleTips = {
                'Соло':      contextTips.roleSolo,
                'Нетраннер': contextTips.roleNetrunner,
                'Медтех':    contextTips.roleMedtech,
                'Фиксер':    contextTips.roleFixer,
                'Рокербой':  contextTips.roleRockerboy,
                'Техник':    contextTips.roleTech,
                'Медиа':     contextTips.roleMedia,
                'Законник':  contextTips.roleLawman,
                'Менеджер':  contextTips.roleManager,
                'Кочевник':  contextTips.roleNomad
            };
            if (roleTips[char.role]) return pickTip(roleTips[char.role]);
        }

        return null;
    }

    startCycle() {
        this.cycleTimer = setInterval(() => {
            this.updateState();
        }, CYCLE_INTERVAL);
    }

    // ─── Определение состояния ────────────────────────────────
    updateState(initial = false) {
         const char = loadCharacter();
        if (!char) {
            this.setAvatarState('active');
            this.say('Персонаж не загружен. Создай кого-нибудь.', 'warning');
            return;
        }

        const body = (char.baseStats && char.baseStats.BODY) || char.BODY || 6;
        const will = (char.baseStats && char.baseStats.WILL) || char.WILL || 6;
        const maxHp = char.maxHp || getHP(body, will);
        const currentHp = char.currentHp !== undefined ? char.currentHp : maxHp;
        const hpPct = maxHp > 0 ? currentHp / maxHp : 1;

        const emp = (char.baseStats && char.baseStats.EMP) || char.EMP || 6;
        const humanity = char.humanity !== undefined ? char.humanity : emp * 10;

        const ipAvailable = (char.ip && char.ip.available) || 0;

        // Приоритеты: сначала критично, потом менее важно
        if (hpPct <= 0) {
            this.setAvatarState('critical');
            this.say(pickRandom(QUOTES.hpCritical), 'critical');
            return;
        }
        if (hpPct <= 0.5) {
            this.setAvatarState('critical');
            this.say(pickRandom(QUOTES.hpCritical), 'critical');
            return;
        }
        if (humanity <= 0) {
            this.setAvatarState('critical');
            this.say(pickRandom(QUOTES.humanityCritical), 'critical');
            return;
        }
        if (humanity <= 30) {
            this.setAvatarState('warning');
            this.say(pickRandom(QUOTES.humanityLow), 'warning');
            return;
        }
        if (hpPct < 1) {
            this.setAvatarState('warning');
            this.say(pickRandom(QUOTES.hpLow), 'warning');
            return;
        }
        if (ipAvailable >= 50) {
            this.setAvatarState('active');
            this.say(pickRandom(QUOTES.ipAvailable), 'active');
            return;
        }

                // Все в норме
        this.setAvatarState('active');
        if (initial) {
            this.say(pickRandom(QUOTES.greeting), 'active');
        } else {
            this.say(pickRandom(QUOTES.idle), 'active');
        }

                  // Обновляем совет под текущее состояние
        if (this.tipText) {
            const tip = this.pickSmartTip(char);
            this.tipText.textContent = tip;
        }

        // Обновляем формулу инициативы (РЕФ мог измениться из-за брони/имплантов)
        this.refreshInitFormula();
    }

    // ─── Смена реплики ────────────────────────────────────────
    say(text, state = 'active') {
        if (!this.quoteEl || text === this.currentQuote) return;
        this.currentQuote = text;

        // Плавное исчезновение → смена → появление
        this.quoteEl.classList.add('is-fading');
        setTimeout(() => {
            this.quoteEl.textContent = `«${text}»`;
            this.quoteEl.classList.remove('is-fading');
        }, 200);

        // Статус
        if (this.statusEl) {
            this.statusEl.classList.remove('is-active', 'is-warning', 'is-critical');
            this.statusEl.classList.add('is-' + state);
            this.statusEl.textContent =
                state === 'critical' ? 'тревога' :
                state === 'warning'  ? 'внимание' : 'онлайн';
        }
    }

    // ─── Смена состояния аватара ─────────────────────────────
    setAvatarState(state) {
        if (!this.avatar) return;
        this.avatar.classList.remove('ai-state-warning', 'ai-state-critical');
        if (state === 'warning')  this.avatar.classList.add('ai-state-warning');
        if (state === 'critical') this.avatar.classList.add('ai-state-critical');
    }
        // ─── Инициатива ────────────────────────────────────────
          refreshInitFormula() {
        const { ref, bonus } = this.getInitData();
        if (!this.initFormula) return;
        const bonusText = bonus > 0 ? ` + ${bonus}` : '';
        this.initFormula.textContent = `РЕФ ${ref}${bonusText} + d10 = ${ref + bonus}`;
    }

    // Возвращает финальный РЕФ и бонус к инициативе
    getInitData() {
        const char = loadCharacter();
        // Приоритет — финальные значения, посчитанные в character-helper.js
        const finalStats = window.__finalStats || null;
        const bonus = window.__initiativeBonus || 0;
        const ref = finalStats?.REF !== undefined
            ? finalStats.REF
            : ((char && char.baseStats && char.baseStats.REF) || (char && char.REF) || 6);
        return { ref, bonus };
    }

       rollInitiative() {
        const char = loadCharacter();
        if (!char) {
            alert('Сначала создайте персонажа.');
            return;
        }
        const { ref, bonus } = this.getInitData();
        const d10 = Math.floor(Math.random() * 10) + 1;
        const total = ref + bonus + d10;
        // Анимация «роллинга»
        if (this.initResult) {
            this.initResult.classList.add('is-rolling');
            this.initResult.textContent = '…';
            setTimeout(() => {
                this.initResult.classList.remove('is-rolling');
                this.initResult.textContent = total;
                if (d10 === 10) {
                    this.initResult.classList.add('is-crit');
                    setTimeout(() => this.initResult.classList.remove('is-crit'), 1500);
                }
            }, 250);
           // Реакция на критический бросок инициативы
        if (d10 === 10) this.say(pickRandom(QUOTES.critRoll), 'active');
        else if (d10 === 1) this.say(pickRandom(QUOTES.failRoll), 'warning');
        else if (total >= 12) this.say(pickRandom(QUOTES.initHigh), 'active');
        else if (total <= 4) this.say(pickRandom(QUOTES.initLow), 'warning');
        }

        // В лог
               const bonusText = bonus > 0 ? ` + ${bonus}` : '';
        this.addLog(`Инициатива → ${total} (РЕФ ${ref}${bonusText} + d10 ${d10})`);
        // ЮКИ комментирует
        if (d10 === 10) this.say('Джекпот! Инициатива на максимуме.', 'active');
        else if (d10 === 1) this.say('Ох. Не твой день.', 'warning');
    }

    // ─── Лог сессии ────────────────────────────────────────
    loadLog() {
        try {
            const raw = sessionStorage.getItem('cpr_ai_log');
            this.logEntries = raw ? JSON.parse(raw) : [];
        } catch (e) {
            this.logEntries = [];
        }
        this.renderLog();
    }

    saveLog() {
        try {
            sessionStorage.setItem('cpr_ai_log', JSON.stringify(this.logEntries));
        } catch (e) { /* ignore */ }
    }

    addLog(text, cls = '') {
        const now = new Date();
        const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        this.logEntries.unshift({ time, text, cls });
        // Храним максимум 30 записей
        if (this.logEntries.length > 30) this.logEntries.pop();
        this.saveLog();
        this.renderLog();
    }

    clearLog() {
        this.logEntries = [];
        this.saveLog();
        this.renderLog();
    }

    renderLog() {
        if (!this.logList) return;
        if (!this.logEntries || this.logEntries.length === 0) {
            this.logList.innerHTML = '<div class="ai-log-empty">Пока пусто</div>';
            return;
        }
        this.logList.innerHTML = this.logEntries.map(entry => `
            <div class="ai-log-item ${entry.cls || ''}">
                <span class="log-time">${entry.time}</span>
                <span class="log-text">${this.escapeLog(entry.text)}</span>
            </div>
        `).join('');
    }

    escapeLog(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
        // ─── Спасбросок от смерти ──────────────────────────────
    loadDeathSavePenalty() {
        try {
            const raw = sessionStorage.getItem('cpr_death_save_penalty');
            return raw ? (parseInt(raw, 10) || 0) : 0;
        } catch (e) {
            return 0;
        }
    }

    saveDeathSavePenalty() {
        try {
            sessionStorage.setItem('cpr_death_save_penalty', String(this.deathSavePenalty));
        } catch (e) { /* ignore */ }
    }

     refreshDeathSaveFormula() {
        const body = this.getBodyForDeathSave();
        if (this.dsFormula) {
            this.dsFormula.textContent = `ТЕЛО ${body} · штраф +${this.deathSavePenalty}`;
        }
        // Обновляем визуальное состояние блока
        if (this.dsBox) {
            this.dsBox.classList.remove('ds-penalty-active', 'ds-penalty-critical');
            if (this.deathSavePenalty >= 3) {
                this.dsBox.classList.add('ds-penalty-critical');
            } else if (this.deathSavePenalty >= 1) {
                this.dsBox.classList.add('ds-penalty-active');
            }
        }
    }

    rollDeathSave() {
               const char = loadCharacter();
        if (!char) {
            alert('Сначала создайте персонажа.');
            return;
        }
        const body = this.getBodyForDeathSave();
        const d10 = Math.floor(Math.random() * 10) + 1;
        const adjusted = d10 + this.deathSavePenalty;   // штраф прибавляется к броску

        // Автопровал на 10 (по правилам), либо когда d10+штраф ≥ 10
        const autoFail = (d10 === 10);
        const success = !autoFail && (adjusted < body);

        // Показываем результат
        if (this.dsResult) {
            this.dsResult.classList.remove('is-survived', 'is-dead');
            if (success) {
                this.dsResult.classList.add('is-survived');
                this.dsResult.textContent = `${d10}+${this.deathSavePenalty}=${adjusted}`;
            } else if (autoFail) {
                this.dsResult.classList.add('is-dead');
                this.dsResult.textContent = '10';
            } else {
                this.dsResult.classList.add('is-dead');
                this.dsResult.textContent = `${d10}+${this.deathSavePenalty}=${adjusted}`;
            }
        }

        // ЮКИ комментирует
        if (success) {
            this.say(pickRandom([
                'Живой. Ещё один ход.',
                'Повезло. Снова.',
                'Держишься. Продолжай.',
                'Смерть подождёт. Пока что.'
            ]), this.deathSavePenalty >= 3 ? 'warning' : 'active');
        } else {
            this.say(pickRandom([
                'Всё. Ты ушёл.',
                'Конец. Хорошая была поездка.',
                'Обнулился. Прощай, чумба.',
                'Это было. Финита.'
            ]), 'critical');
        }

        // Логируем
        const mark = success ? '✅' : '💀';
        const text = success
            ? `Спасбросок от смерти → ${adjusted} vs ТЕЛО ${body} ${mark} (штраф +${this.deathSavePenalty})`
            : autoFail
                ? `Спасбросок от смерти → 10 (автопровал) 💀 СМЕРТЬ`
                : `Спасбросок от смерти → ${adjusted} vs ТЕЛО ${body} 💀 СМЕРТЬ`;
        this.addLog(text, success ? 'is-heal' : 'is-damage');

        // Если провал — сообщение
        if (!success) {
            alert('💀 СПАСБРОСОК ПРОВАЛЕН. Персонаж мёртв.');
        }

        // Накопление штрафа (по правилам Cyberpunk RED — +1 за каждый броcок)
        this.deathSavePenalty += 1;
        this.saveDeathSavePenalty();
        this.refreshDeathSaveFormula();
    }
        // Финальный ТЕЛО с учётом имплантов (Эндоскелеты, Искусственные мышцы)
    getBodyForDeathSave() {
        const char = loadCharacter();
        if (!char) return 6;

        // Приоритет — финальный ТЕЛО из character-helper.js (уже с имплантами и без штрафа брони)
        const finalStats = window.__finalStats || null;
        if (finalStats && finalStats.BODY !== undefined) {
            return finalStats.BODY;
        }

        // Fallback — ручной расчёт по имплантам
        const base = (char.baseStats && char.baseStats.BODY) || char.BODY || 6;
        const cyber = char.cyberware || [];
        if (cyber.includes('Эндоскелет Бета') || cyber.includes('Эндоскелет ß (Бета)')) return 14;
        if (cyber.includes('Эндоскелет Сигма') || cyber.includes('Эндоскелет ∑ (Сигма)')) return 12;
        if (cyber.includes('Искусственные мышцы и усиленные кости')) return Math.min(10, base + 2);
        return base;
    }
}