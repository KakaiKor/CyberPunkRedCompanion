// modules/netrunner-interface.js
import { loadCharacter, saveCharacter } from '../storage.js';
import { programs } from '../data/net-programs.js'; // Импорт массива программ (создайте этот файл)

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
                    <summary><strong>🎓 Как играть за нетраннера (краткая сводка)</strong></summary>
                    <div class="guide-content">
                        <p><strong>Интерфейс (ролевой навык):</strong> определяет количество <strong>сетевых действий</strong> за ход. Ранг 1-3 → 2 действия, 4-6 → 3 действия, 7-9 → 4 действия, 10 → 5 действий.</p>
                        <p><strong>Кибердека:</strong> имеет слоты для программ (обычно 7). Программы бывают <strong>усиливающие</strong> (дают бонусы, пока активны), <strong>защитные</strong> (снижают урон или блокируют эффекты), <strong>атакующие</strong> (наносят урон по мозгу или программам). <strong>Чёрный лёд</strong> — мощные программы-убийцы.</p>
                        <p><strong>Сетевые действия:</strong> используются для способностей интерфейса: <em>бэкдор, вирус, идентификация, контроль, плащ, подкат, разряд, сканер, следопыт</em>. Подробнее — в книге правил, стр. 197-200.</p>
                        <p><strong>Проверки в сети:</strong> Интерфейс + 1d10 против СЛ (или защиты чёрного льда). При успехе — эффект срабатывает.</p>
                        <p><strong>Совет:</strong> Всегда имей активную <em>Броню</em> или <em>Щит</em> и не лезь в архитектуру без поддержки команды.</p>
                    </div>
                </details>

                <h3>🖥️ Кибердека</h3>
                <div class="cyberdeck-info">
                    <div>Слотов: ${this.cyberdeck.slots} | Свободно: ${freeSlots}</div>
                    <div>🎭 Интерфейс (ранг): ${this.interfaceRank} | Сетевых действий за ход: ${netActions}</div>
                </div>

                <div class="installed-programs">
                    <h4>📀 Установленные программы</h4>
                    <div class="programs-grid">
                        ${installed.map((prog, idx) => `
                            <div class="program-card ${prog.active ? 'active' : ''}" data-idx="${idx}">
                                <div class="program-name">${this.escapeHtml(prog.name)}</div>
                                <div class="program-type">${prog.type || ''}</div>
                                <div class="program-effects">${prog.effect ? this.escapeHtml(prog.effect) : ''}</div>
                                <div class="program-actions">
                                    <button class="toggle-program" data-idx="${idx}">${prog.active ? '🔴 Деактивировать' : '🟢 Активировать'}</button>
                                    <button class="remove-program" data-idx="${idx}">🗑️ Удалить</button>
                                </div>
                            </div>
                        `).join('')}
                        ${installed.length === 0 ? '<p>Нет установленных программ.</p>' : ''}
                    </div>
                </div>

                <div class="add-program">
                    <h4>➕ Добавить программу</h4>
                    <div class="add-program-controls">
                        <select id="programSelect">
                            <option value="">-- Выберите программу --</option>
                            ${this.getAvailablePrograms().map(p => `<option value="${this.escapeHtml(p.name)}" data-type="${p.type}">${this.escapeHtml(p.name)} (${p.type})</option>`).join('')}
                        </select>
                        <button id="installProgramBtn">Установить</button>
                    </div>
                </div>

                <div class="active-effects">
                    <h4>✨ Активные эффекты</h4>
                    <ul>
                        ${installed.filter(p => p.active).map(p => `<li>${this.escapeHtml(p.name)}: ${this.escapeHtml(p.effect || '')}</li>`).join('')}
                        ${installed.filter(p => p.active).length === 0 ? '<li>Нет активных эффектов</li>' : ''}
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