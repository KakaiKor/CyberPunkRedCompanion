// modules/netrunner-interface.js
import { loadCharacter, saveCharacter } from '../storage.js';
import { programs } from '../data/net-programs.js';
import { icon } from './ui/icons.js';

export class NetrunnerInterface {
    constructor(containerId = 'netrunnerInterfaceContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Контейнер #${containerId} не найден для NetrunnerInterface`);
            return;
        }
        this.cyberdeck = null;   // { slots, programs: [] }
        this.interfaceRank = 4;  // ранг ролевого навыка нетраннера
        this.init();
    }

    init() {
        this.loadFromCharacter();
        this.render();
        // Подписываемся на событие загрузки/изменения персонажа, если нужно
        window.addEventListener('characterUpdated', () => {
            this.loadFromCharacter();
            this.render();
        });
    }

    loadFromCharacter() {
        const char = loadCharacter();
        if (!char) return;
        // Кибердека
        if (!char.cyberdeck) {
            char.cyberdeck = {
                slots: 7,      // стандартная кибердека
                programs: []   // массив установленных программ
            };
            saveCharacter(char);
        }
        this.cyberdeck = char.cyberdeck;
        // Ранг интерфейса – предполагаем, что у персонажа есть поле interfaceRank
        // Если нет – получаем из ролевого навыка (можно доработать)
        this.interfaceRank = char.interfaceRank || 4;
    }

    getNetActions() {
        // 1-3 → 2, 4-6 → 3, 7-9 → 4, 10 → 5
        if (this.interfaceRank >= 10) return 5;
        if (this.interfaceRank >= 7) return 4;
        if (this.interfaceRank >= 4) return 3;
        return 2;
    }

    getAvailablePrograms() {
        // Возвращает массив программ из импортированного файла
        return programs || [];
    }

        render() {
        if (!this.cyberdeck) return;
        const installed = this.cyberdeck.programs || [];
        const freeSlots = this.cyberdeck.slots - installed.length;
        const netActions = this.getNetActions();

        let html = `
            <div class="netrunner-panel">
                <!-- Краткая сводка -->
                <details class="netrunner-quick-guide">
                    <summary>${icon('bookOpen', { size: 16 })} <strong>Как играть за нетраннера (краткая сводка)</strong></summary>
                    <div class="guide-content">
                        <div class="guide-item">
                            <div class="guide-icon">${icon('zap', { size: 20 })}</div>
                            <div class="guide-text">
                                <strong>Интерфейс (ролевой навык)</strong>
                                <span>Определяет количество <em>сетевых действий</em> за ход. Ранг 1-3 → 2 действия, 4-6 → 3 действия, 7-9 → 4 действия, 10 → 5 действий.</span>
                            </div>
                        </div>
                        <div class="guide-item">
                            <div class="guide-icon">${icon('cpu', { size: 20 })}</div>
                            <div class="guide-text">
                                <strong>Кибердека</strong>
                                <span>Имеет слоты для программ (обычно 7). Программы бывают <em>усиливающие</em> (баффы), <em>защитные</em> (снижают урон) и <em>атакующие</em> (урон по мозгу/программам). <em>Чёрный лёд</em> — мощные программы-убийцы.</span>
                            </div>
                        </div>
                        <div class="guide-item">
                            <div class="guide-icon">${icon('target', { size: 20 })}</div>
                            <div class="guide-text">
                                <strong>Сетевые действия</strong>
                                <span>Используются для способностей: <em>бэкдор, вирус, идентификация, контроль, плащ, подкат, разряд, сканер, следопыт</em>. Подробнее — в книге правил, стр. 197-200.</span>
                            </div>
                        </div>
                        <div class="guide-item">
                            <div class="guide-icon">${icon('dice', { size: 20 })}</div>
                            <div class="guide-text">
                                <strong>Проверки в сети</strong>
                                <span>Интерфейс + 1d10 против СЛ (или защиты чёрного льда). При успехе — эффект срабатывает.</span>
                            </div>
                        </div>
                        <div class="guide-item">
                            <div class="guide-icon">${icon('lightbulb', { size: 20 })}</div>
                            <div class="guide-text">
                                <strong>Совет</strong>
                                <span>Всегда имей активную <em>Броню</em> или <em>Щит</em> и не лезь в архитектуру без поддержки команды.</span>
                            </div>
                        </div>
                    </div>
                </details>

                <h3>${icon('cpu', { size: 20 })} Кибердека</h3>
                
                <div class="cyberdeck-info">
                    <div class="cyberdeck-stat">
                        ${icon('briefcase', { size: 14 })} Слотов: <strong>${this.cyberdeck.slots}</strong> 
                        <span class="stat-sep">|</span> Свободно: <strong>${freeSlots}</strong>
                    </div>
                    <div class="cyberdeck-stat">
                        ${icon('user', { size: 14 })} Интерфейс: <strong>${this.interfaceRank}</strong>
                    </div>
                    <div class="cyberdeck-stat highlight">
                        ${icon('zap', { size: 14 })} Сетевых действий за ход: <strong>${netActions}</strong>
                    </div>
                </div>

                <div class="installed-programs">
                    <h4>${icon('database', { size: 16 })} Установленные программы</h4>
                    <div class="programs-grid">
                        ${installed.map((prog, idx) => `
                            <div class="program-card ${prog.active ? 'active' : ''}" data-idx="${idx}">
                                <div class="program-header">
                                    <div class="program-name">${this.escapeHtml(prog.name)}</div>
                                    <div class="program-type">${prog.type || 'Программа'}</div>
                                </div>
                                <div class="program-effects">${prog.effect ? this.escapeHtml(prog.effect) : ''}</div>
                                <div class="program-actions">
                                    <button class="toggle-program ${prog.active ? 'is-active' : ''}" data-idx="${idx}">
                                        ${prog.active ? icon('x', { size: 12 }) + ' Деактивировать' : icon('check', { size: 12 }) + ' Активировать'}
                                    </button>
                                    <button class="remove-program" data-idx="${idx}" title="Удалить">
                                        ${icon('trash', { size: 12 })}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        ${installed.length === 0 ? '<div class="empty-state">Нет установленных программ.</div>' : ''}
                    </div>
                </div>

                <div class="add-program">
                    <h4>${icon('plus', { size: 16 })} Добавить программу</h4>
                    <div class="add-program-controls">
                        <select id="programSelect">
                            <option value="">-- Выберите программу --</option>
                            ${this.getAvailablePrograms().map(p => `<option value="${this.escapeHtml(p.name)}" data-type="${p.type}">${this.escapeHtml(p.name)} (${p.type})</option>`).join('')}
                        </select>
                        <button id="installProgramBtn">${icon('download', { size: 14 })} Установить</button>
                    </div>
                </div>

                <div class="active-effects">
                    <h4>${icon('sparkles', { size: 16 })} Активные эффекты</h4>
                    <ul>
                        ${installed.filter(p => p.active).map(p => `<li>${icon('zap', { size: 12 })} <strong>${this.escapeHtml(p.name)}</strong>: ${this.escapeHtml(p.effect || '')}</li>`).join('')}
                        ${installed.filter(p => p.active).length === 0 ? '<li class="empty-state">Нет активных эффектов</li>' : ''}
                    </ul>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEvents();
    }

    attachEvents() {
        // Активация/деактивация программы
        document.querySelectorAll('.toggle-program').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                this.toggleProgram(idx);
            });
        });
        // Удаление программы
        document.querySelectorAll('.remove-program').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                this.removeProgram(idx);
            });
        });
        // Установка новой программы
        const installBtn = document.getElementById('installProgramBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installProgram());
        }
    }

    toggleProgram(idx) {
        const programs = this.cyberdeck.programs;
        if (programs[idx]) {
            programs[idx].active = !programs[idx].active;
            this.saveAndRender();
        }
    }

    removeProgram(idx) {
        this.cyberdeck.programs.splice(idx, 1);
        this.saveAndRender();
    }

    installProgram() {
    const select = document.getElementById('programSelect');
    const programName = select.value;
    if (!programName) return;
    const program = this.getAvailablePrograms().find(p => p.name === programName);
    if (!program) return;
    if (this.cyberdeck.programs.length >= this.cyberdeck.slots) {
        alert('Недостаточно свободных слотов в кибердеке!');
        return;
    }
    // Копируем ВСЕ поля программы, включая type, atk, damage
    this.cyberdeck.programs.push({
        name: program.name,
        type: program.type,      // обязательно!
        effect: program.effect,
        active: false,
        cost: program.cost,
        atk: program.atk || 0,
        def: program.def || 0,
        hp: program.hp || 7,
        damage: program.damage || '',
        target: program.target || ''
    });
    this.saveAndRender();
}
    saveAndRender() {
        const char = loadCharacter();
        if (char) {
            char.cyberdeck = this.cyberdeck;
            saveCharacter(char);
        }
        this.render();
        // Генерируем событие для обновления других модулей
        window.dispatchEvent(new Event('characterUpdated'));
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
}