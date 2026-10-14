// js/modules/combat/trauma-tracker.js
// Активные критические травмы персонажа.
// Хранится в char.traumas, синхронизируется с карточкой.

import { loadCharacter, saveCharacter } from '../../storage.js';
import { critBody, critHead } from '../../data.js';

export class TraumaTracker {
    constructor() {
        this.list = document.getElementById('activeTraumasList');
        this.zoneSelect = document.getElementById('traumaZoneSelect');
        this.nameSelect = document.getElementById('traumaNameSelect');
        this.addBtn = document.getElementById('addTraumaBtn');
        this.clearAllBtn = document.getElementById('clearAllTraumasBtn');

        if (!this.list) return;

        this.traumas = this.loadTraumas();
        this.populateSelect();
        this.render();
        this.attachEvents();

        // Реакция на импорт/обновление персонажа
        window.addEventListener('characterUpdated', () => {
            this.traumas = this.loadTraumas();
            this.render();
        });
    }

    // ─── Загрузка/сохранение ──────────────────────────────────
    loadTraumas() {
        const char = loadCharacter();
        return (char && Array.isArray(char.traumas)) ? char.traumas : [];
    }

    saveTraumas() {
        const char = loadCharacter();
        if (!char) return;
        char.traumas = this.traumas;
        saveCharacter(char);
        window.dispatchEvent(new Event('characterUpdated'));
    }

    // ─── Заполнение селекта травм по зоне ────────────────────
    populateSelect() {
        if (!this.nameSelect || !this.zoneSelect) return;
        const zone = this.zoneSelect.value;
        const list = zone === 'head' ? critHead : critBody;

        let html = '<option value="">— выберите травму —</option>';
        list.forEach(item => {
            html += `<option value="${item.roll}">${item.roll}: ${item.name}</option>`;
        });
        this.nameSelect.innerHTML = html;
    }

    // ─── Рендер списка активных травм ────────────────────────
    render() {
        if (!this.list) return;
        if (!this.traumas || this.traumas.length === 0) {
            this.list.innerHTML = '<div class="trauma-empty">Пока нет активных травм</div>';
            return;
        }

        this.list.innerHTML = this.traumas.map((t, idx) => {
            const zoneLabel = t.zone === 'head' ? '🧠 Голова' : '💪 Тело';
            return `
                <div class="trauma-item" data-idx="${idx}">
                    <div class="trauma-header">
                        <span class="trauma-zone">${zoneLabel}</span>
                        <span class="trauma-name">${this.escapeHtml(t.name)}</span>
                        <button type="button" class="trauma-remove" data-idx="${idx}" title="Снять травму">✖</button>
                    </div>
                    <div class="trauma-effect">${this.escapeHtml(t.effect || '')}</div>
                    ${t.treat ? `<div class="trauma-treat">Лечение: ${this.escapeHtml(t.treat)}</div>` : ''}
                </div>
            `;
        }).join('');

        this.list.querySelectorAll('.trauma-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                this.removeTrauma(idx);
            });
        });
    }

    // ─── Добавление травмы ───────────────────────────────────
    addTrauma() {
        if (!this.zoneSelect || !this.nameSelect) return;
        const zone = this.zoneSelect.value;
        const roll = parseInt(this.nameSelect.value);
        if (isNaN(roll)) {
            alert('Выберите травму из списка.');
            return;
        }

        const list = zone === 'head' ? critHead : critBody;
        const crit = list.find(c => c.roll === roll);
        if (!crit) return;

        this.traumas.push({
            zone,
            roll: crit.roll,
            name: crit.name,
            effect: crit.effect,
            quick: crit.quick || '',
            treat: crit.treat || '',
            addedAt: new Date().toISOString()
        });

        this.saveTraumas();
        this.render();
        this.nameSelect.value = '';
    }

    // ─── Удаление ────────────────────────────────────────────
    removeTrauma(idx) {
        if (idx < 0 || idx >= this.traumas.length) return;
        this.traumas.splice(idx, 1);
        this.saveTraumas();
        this.render();
    }

    // ─── Снять все (полное лечение) ─────────────────────────
    clearAll() {
        if (this.traumas.length === 0) return;
        if (!confirm('Снять все активные травмы (полное лечение)?')) return;
        this.traumas = [];
        this.saveTraumas();
        this.render();
    }

    // ─── Обработчики ────────────────────────────────────────
    attachEvents() {
        this.zoneSelect?.addEventListener('change', () => this.populateSelect());
        this.addBtn?.addEventListener('click', () => this.addTrauma());
        this.clearAllBtn?.addEventListener('click', () => this.clearAll());
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
    }
}