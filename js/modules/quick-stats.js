// js/modules/quick-stats.js
// Мини-статус-бар, пул УДЧ, быстрые действия с ПЗ и счётчик сессии.
// Страница «Персонаж → Основное».

import { loadCharacter, saveCharacter } from '../storage.js';
import { getHP } from '../utils.js';

const SESSION_KEY = 'cpr_session_stats';

export class QuickStats {
    constructor() {
        // Элементы чипсов
        this.hpEl = document.getElementById('cqsHp');
        this.humanityEl = document.getElementById('cqsHumanity');
        this.moneyEl = document.getElementById('cqsMoney');
        this.reputationEl = document.getElementById('cqsReputation');
        this.ipEl = document.getElementById('cqsIp');

        // УДЧ
        this.luckBar = document.getElementById('charLuckBar');
        this.luckFill = document.getElementById('luckFill');
        this.luckCurrent = document.getElementById('luckCurrent');
        this.luckMax = document.getElementById('luckMax');

        // Быстрые действия с ПЗ
        this.hpDeltaBtns = document.querySelectorAll('.qa-btn[data-hp-delta]');
        this.healFullBtn = document.getElementById('qaHealFull');

        // Кнопки карточки
        this.syncBtn = document.getElementById('syncCardBtn');
        this.editBtn = document.getElementById('editCardBtn');

        // Сессия
        this.sessionTimeEl = document.getElementById('sessionTime');
        this.sessionRollsEl = document.getElementById('sessionRolls');

        // Сессия: время и счётчик бросков
        this.session = this.loadSession();
        this.sessionTimer = null;

        // Если ничего из UI не найдено — молча выходим
        if (!this.hpEl && !this.luckBar) return;

        this.attachEvents();
        this.refresh();
        this.startSession();

        // Реакция на обновление персонажа
        window.addEventListener('characterUpdated', () => this.refresh());
    }

    // ─── Загрузка / сохранение сессии ──────────────────────────
    loadSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Если сессия длится больше 12 часов — начинаем новую
                if (parsed.startedAt && (Date.now() - parsed.startedAt) < 12 * 60 * 60 * 1000) {
                    return parsed;
                }
            }
        } catch (e) { /* ignore */ }
        return { startedAt: Date.now(), rolls: 0 };
    }

    saveSession() {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
        } catch (e) { /* ignore */ }
    }

    startSession() {
        this.updateSessionUI();
        // Обновляем таймер каждые 30 секунд
        this.sessionTimer = setInterval(() => this.updateSessionUI(), 30000);
    }

    updateSessionUI() {
        if (this.sessionTimeEl) {
            const elapsed = Date.now() - this.session.startedAt;
            const totalMin = Math.floor(elapsed / 60000);
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            this.sessionTimeEl.textContent = `${h}ч ${String(m).padStart(2, '0')}мин`;
        }
        if (this.sessionRollsEl) {
            this.sessionRollsEl.textContent = this.session.rolls;
        }
    }

    bumpRolls() {
        this.session.rolls += 1;
        this.saveSession();
        this.updateSessionUI();
    }

    // ─── Обработчики ───────────────────────────────────────────
    attachEvents() {
        // Быстрые действия с ПЗ
        this.hpDeltaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const delta = parseInt(btn.dataset.hpDelta) || 0;
                this.applyHpDelta(delta);
            });
        });

        // Полное лечение
        this.healFullBtn?.addEventListener('click', () => {
            const char = loadCharacter();
            if (!char) return;
            const body = (char.baseStats && char.baseStats.BODY) || char.BODY || 6;
            this.applyHpDelta(body);
        });

        // Синхронизация карточки
        this.syncBtn?.addEventListener('click', () => {
            if (window.characterHelper) {
                window.characterHelper.displaySavedCharacterCard();
            }
        });

        // Программный клик по ✏️ в карточке
        this.editBtn?.addEventListener('click', () => {
            // Сначала убеждаемся, что карточка есть
            if (window.characterHelper && !document.querySelector('.character-card')) {
                window.characterHelper.displaySavedCharacterCard();
            }
            // Даём карточке отрисоваться
            setTimeout(() => {
                const card = document.querySelector('.character-card');
                if (!card) {
                    alert('Сначала создайте персонажа.');
                    return;
                }
                // Скроллим к карточке
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Программно открываем режим редактирования
                const editBtnInCard = card.querySelector('.edit-card-btn');
                if (editBtnInCard) editBtnInCard.click();
            }, 80);
        });

        // Счётчик бросков из калькулятора
        window.addEventListener('skillCheckRolled', () => this.bumpRolls());
    }

    // ─── Изменение ПЗ ──────────────────────────────────────────
    applyHpDelta(delta) {
        const char = loadCharacter();
        if (!char) {
            alert('Сначала создайте или загрузите персонажа.');
            return;
        }

        // Определяем maxHp
        const body = (char.baseStats && char.baseStats.BODY) || char.BODY || 6;
        const will = (char.baseStats && char.baseStats.WILL) || char.WILL || 6;
        const maxHp = char.maxHp || getHP(body, will);
        if (!char.maxHp) char.maxHp = maxHp;

        const current = char.currentHp !== undefined ? char.currentHp : maxHp;
        let newHp = Math.max(0, Math.min(maxHp, current + delta));
        char.currentHp = newHp;

        saveCharacter(char);

        // Уведомляем всё приложение — карточка и чипсы обновятся
        window.dispatchEvent(new Event('characterUpdated'));

        // Предупреждения по порогам
        const severe = Math.ceil(maxHp / 2);
        if (newHp <= 0) {
            alert('💀 Смертельное ранение! Требуется спасбросок.');
        } else if (newHp <= severe && current > severe) {
            alert('⚠️ Тяжёлое ранение! Штраф –2 ко всем действиям.');
        }
    }

    // ─── Обновление чипсов и УДЧ ───────────────────────────────
    refresh() {
        const char = loadCharacter();
        if (!char) {
            this.setEmpty();
            return;
        }

        const body = (char.baseStats && char.baseStats.BODY) || char.BODY || 6;
        const will = (char.baseStats && char.baseStats.WILL) || char.WILL || 6;
        const maxHp = char.maxHp || getHP(body, will);
        const currentHp = char.currentHp !== undefined ? char.currentHp : maxHp;

        // ── ПЗ ──
        if (this.hpEl) {
            this.hpEl.textContent = `${currentHp}/${maxHp}`;
            const hpChip = this.hpEl.closest('.cqs-chip');
            if (hpChip) {
                const severe = Math.ceil(maxHp / 2);
                hpChip.classList.toggle('cqs-critical', currentHp <= severe);
            }
        }

        // ── Человечность ──
        if (this.humanityEl) {
            const emp = (char.baseStats && char.baseStats.EMP) || char.EMP || 6;
            const maxHumanity = emp * 10;
            let currentHumanity = char.humanity;
            if (currentHumanity === undefined) {
                // Считаем по имплантам
                const cyberware = char.cyberware || [];
                let loss = 0;
                // dynamic import чтобы не тянуть зависимость жёстко
                try {
                    const data = window.__detailedCyberware || [];
                    for (const name of cyberware) {
                        const item = data.find(i => i.name === name);
                        if (item) loss += parseInt(item.humanity) || 0;
                    }
                } catch (e) { /* ignore */ }
                currentHumanity = Math.max(0, maxHumanity - loss);
            }
            this.humanityEl.textContent = `${currentHumanity}/${maxHumanity}`;
            const chip = this.humanityEl.closest('.cqs-chip');
            if (chip) {
                chip.classList.toggle('cqs-critical', currentHumanity <= 0);
            }
        }

        // ── Деньги ──
        if (this.moneyEl) {
            const money = (char.money !== undefined && !isNaN(char.money)) ? char.money : 0;
            this.moneyEl.textContent = `${money}`;
        }

        // ── Репутация ──
        if (this.reputationEl) {
            this.reputationEl.textContent = `${char.reputation ?? 0}`;
        }

        // ── IP ──
        if (this.ipEl) {
            const available = (char.ip && char.ip.available) || 0;
            this.ipEl.textContent = `${available}`;
        }

        // ── УДЧ ──
        this.refreshLuck(char);
    }

    refreshLuck(char) {
        if (!this.luckBar) return;
        const luckStat = (char.baseStats && char.baseStats.LUCK) || char.LUCK || 6;
        // Если нет отдельного currentLuck — используем максимум
        const current = char.currentLuck !== undefined ? char.currentLuck : luckStat;
        const max = luckStat;

        if (this.luckCurrent) this.luckCurrent.textContent = current;
        if (this.luckMax) this.luckMax.textContent = max;

        const pct = max > 0 ? (current / max) * 100 : 0;
        if (this.luckFill) this.luckFill.style.width = `${pct}%`;

        this.luckBar.classList.remove('luck-low', 'luck-mid');
        const ratio = max > 0 ? current / max : 0;
        if (ratio <= 0.25) this.luckBar.classList.add('luck-low');
        else if (ratio <= 0.6) this.luckBar.classList.add('luck-mid');
    }

    setEmpty() {
        if (this.hpEl) this.hpEl.textContent = '—';
        if (this.humanityEl) this.humanityEl.textContent = '—';
        if (this.moneyEl) this.moneyEl.textContent = '—';
        if (this.reputationEl) this.reputationEl.textContent = '—';
        if (this.ipEl) this.ipEl.textContent = '—';
        if (this.luckFill) this.luckFill.style.width = '0%';
        if (this.luckCurrent) this.luckCurrent.textContent = '0';
        if (this.luckMax) this.luckMax.textContent = '0';
    }
}