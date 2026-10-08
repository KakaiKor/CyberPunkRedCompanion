// js/modules/ai-companion.js
// ИИ-компаньон ЮКИ. Реагирует на состояние персонажа, меняет реплики по клику.

import { loadCharacter } from '../storage.js';
import { getHP } from '../utils.js';
import { generalTips, contextTips, pickTip } from '../data/ai-tips.js';
const NAME = 'ЮКИ';               // ← имя можно поменять тут
const CYCLE_INTERVAL = 30000;     // автосмена реплики (30 сек)

// ─── Реплики по контексту ────────────────────────────────────
const QUOTES = {
    greeting: [
        'Привет, чумба. Готов к движухе?',
        'Онлайн. Системы в норме.',
        'С возвращением в Найт-Сити.',
        'Смотри-ка, кто вернулся.',
        'Начинаем. Только не сдохни.',
        'Привет. Скучал?'
    ],
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
        'Никогда не знаешь, кто стоит за тобой.'
    ],
    hpLow: [
        'Полегче, чумба. Ты не бессмертный.',
        'ПЗ на исходе. Может, отступим?',
        'Кровь — плохой декор.',
        'Каждый удар может стать последним.',
        'Не рискуй. Сегодня — не твой день.'
    ],
    hpCritical: [
        'ПЗ критично. Уже писал завещание?',
        'Ты на грани. Пора к медтеху.',
        'Пульс падает. Вызываю Trauma Team?',
        'Ещё один выстрел — и всё.',
        'Не двигайся. Дыши. Держись.'
    ],
    hpFull: [
        'Всё в порядке. Продолжаем?',
        'Отдохнул? Двигаемся дальше.',
        'Цел. Пока что.'
    ],
    humanityLow: [
        'Киберпсихоз не за горами…',
        'ЧЕЛ тает. Полегче с имплантами.',
        'Ты ещё человек? Или уже машина?',
        'Держись за людей, пока можешь.',
        'Разум — не расходник.'
    ],
    humanityCritical: [
        'КИБЕРПСИХОЗ. Прячусь.',
        'Психоотряд в пути. Шучу. Или нет.',
        'Слишком много хрома. Слишком мало тебя.',
        'Мастер уже точит карандаш.',
        'Это конец. Или начало конца.'
    ],
    luckZero: [
        'УДЧ кончилась. Удачи.',
        'Пусто в кармане удачи.',
        'Дальше — только на своих.',
        'Без страховки. Будь аккуратнее.',
        'Удача — не бесконечная.'
    ],
    luckLow: [
        'УДЧ на исходе. Поберегись.',
        'Прибереги удачу напоследок.',
        'Ещё пара бросков — и пусто.',
        'Удача тает. Не трать зря.',
        'Держи УДЧ на крайний случай.'
    ],
    ipAvailable: [
        'Столько IP не потратить — грех.',
        'Не забудь про развитие.',
        'Ты растёшь. Я вижу.',
        'Вкладывайся. Сейчас самое время.',
        'IP — это будущее. Не тормози.'
    ],
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
        'Тебе больше нечем заняться?'
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

        // Лог
        this.logList = document.getElementById('aiLogList');
        this.logClearBtn = document.getElementById('aiLogClearBtn');
        if (!this.root || !this.quoteEl) return;

        if (this.nameEl) this.nameEl.textContent = NAME;

        this.currentQuote = '';
        this.cycleTimer = null;
        this.lastTipCategory = null;   // защита от спама одной темой
        this.tipStreak = 0;            // сколько раз подряд одна тема

        this.attachEvents();
        this.updateState(true);
        this.showTip();
        this.refreshInitFormula();
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

          if (this.tipText) {
            const tip = this.pickSmartTip(char);
            this.tipText.textContent = tip;
        }
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
        const char = loadCharacter();
        const ref = (char && char.baseStats && char.baseStats.REF) || (char && char.REF) || 6;
        if (this.initFormula) {
            this.initFormula.textContent = `РЕФ ${ref} + d10`;
        }
    }

    rollInitiative() {
        const char = loadCharacter();
        if (!char) {
            alert('Сначала создайте персонажа.');
            return;
        }
        const ref = (char.baseStats && char.baseStats.REF) || char.REF || 6;
        const d10 = Math.floor(Math.random() * 10) + 1;
        const total = ref + d10;

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
        }

        // В лог
        this.addLog(`Инициатива → ${total} (РЕФ ${ref} + d10 ${d10})`);

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
}