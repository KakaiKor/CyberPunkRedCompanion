// modules/gm/story-generator.js
import { AdvancedContractGenerator } from './gm/advanced-contract-generator.js';
import { EncounterGenerator } from './gm/encounter-generator.js';
import { NPCGenerator } from './gm/npc-generator.js';
import { PlotBuilder } from './gm/plot-builder.js';

// Импортируем данные битов (те, что мы создали)
import { STORY_HOOKS } from '../data/story-hooks.js';
import { STORY_DEVELOPMENTS } from '../data/story-developments.js';
import { STORY_CLIFFHANGERS } from '../data/story-cliffhangers.js';
import { STORY_CLIMAXES } from '../data/story-climaxes.js';
import { STORY_RESOLUTIONS } from '../data/story-resolutions.js';
import { STORY_TWISTS } from '../data/story-twists.js';

export class StoryGenerator {
    /**
     * Генерирует полноценную историю в формате бит-чарта
     * @param {Object} params
     * @param {string} params.type - тип контракта (extraction, elimination, etc.)
     * @param {string} params.difficulty - сложность (easy, medium, hard, deadly)
     * @param {string} params.tone - тон (нуар, кибер-экшн, хоррор, корпоративная драма)
     * @param {string} params.complexity - сложность структуры (short, medium, long)
     * @param {number} params.playerCount - количество игроков (для подстановки NPC)
     * @param {string} params.zone - зона (corporate, moderate, combat, hot)
     * @param {string} params.time - время суток (day, evening, night)
     */
    static generate(params = {}) {
        const {
            type = 'random',
            difficulty = 'medium',
            tone = 'all',
            complexity = 'medium',
            playerCount = 4,
            zone = 'moderate',
            includeTwist = false,
            time = 'day'
        } = params;
         let twist = null;
    if (includeTwist) {
        // Выбираем случайный твист
        twist = this.pickRandom(STORY_TWISTS);
        // Вставляем твист в случайный бит (кроме крюка и развязки)
        if (twist && beats.length > 1) {
            const beatIndex = Math.floor(Math.random() * beats.length);
            const beat = beats[beatIndex];
            if (beat) {
                beat.twist = twist.text;
                beat.text = beat.text + `\n\n🔄 НЕОЖИДАННЫЙ ПОВОРОТ: ${twist.text}`;
            }
        }
    }
        // 1. Генерируем контракт через существующий генератор
        const contract = AdvancedContractGenerator.buildContract(
            type === 'random' ? this.randomType() : type,
            difficulty
        );
        contract.typeLabel = AdvancedContractGenerator.translateType(contract.type);
        contract.difficultyLabel = AdvancedContractGenerator.translateDifficulty(difficulty);

        // 2. Создаём крюк на основе контракта
        const hook = this.buildHookFromContract(contract, tone);

        // 3. Строим биты (развития и клиффхэнгеры)
        const beatCount = this.getBeatCount(complexity);
        const beats = this.buildBeats(contract, beatCount, tone);

        // 4. Выбираем кульминацию
        const climax = this.buildClimax(contract);

        // 5. Выбираем развязку
        const resolution = this.buildResolution(contract);

        // 6. Подбираем врагов и союзников
        const npcs = this.buildNPCs(contract, playerCount);

        // 7. Подбираем случайные встречи
        const encounters = this.buildEncounters(zone, time, playerCount);

        // 8. Собираем результат
        const result = {
            title: contract.title,
            contract: contract,
            hook: hook,
            beats: beats,
            climax: climax,
            resolution: resolution,
            npcs: npcs,
            encounters: encounters,
            meta: {
                type: contract.type,
                difficulty: difficulty,
                tone: tone,
                complexity: complexity,
                playerCount: playerCount,
                generatedAt: new Date().toISOString(),
                timeLimit: contract.timeLimit,
                reward: contract.reward
            }
        };

        return result;
    }

    static randomType() {
        const types = ['extraction', 'elimination', 'protection', 'theft', 'sabotage', 'transport', 'espionage', 'psyop'];
        return types[Math.floor(Math.random() * types.length)];
    }

    static getBeatCount(complexity) {
        const map = { short: 2, medium: 4, long: 6 };
        return map[complexity] || 4;
    }

    static buildHookFromContract(contract, tone) {
        // Берём подходящий крюк из story-hooks.js, подгоняем под контракт
        let available = STORY_HOOKS;
        if (tone !== 'all') {
            available = available.filter(h => h.tags && h.tags.includes(tone));
        }
        if (available.length === 0) available = STORY_HOOKS;
        const template = available[Math.floor(Math.random() * available.length)];

        // Кастомизируем текст под контракт
        let text = template.text;
        // Заменяем плейсхолдеры
        text = text.replace(/цель/g, contract.target || 'цель');
        text = text.replace(/заказчик/g, contract.client || 'заказчик');
        text = text.replace(/локация/g, contract.location || 'город');

        let example = template.example || '';
        if (contract.complication) {
            example += ` ⚠️ Осложнение: ${contract.complication}`;
        }
        if (contract.twist) {
            example += ` 🔄 Поворот: ${contract.twist}`;
        }

        return {
            ...template,
            text: text,
            example: example || undefined
        };
    }
    // modules/story-generator.js – дополнение

static toJSON(story) {
    if (!story) return null;
    return {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        title: story.title,
        meta: story.meta,
        hook: {
            type: story.hook.type,
            text: story.hook.text,
            example: story.hook.example || null
        },
        beats: story.beats.map(beat => ({
            type: beat.type,
            beatType: beat.beatType,
            text: beat.text
        })),
        climax: {
            type: story.climax.type,
            text: story.climax.text
        },
        resolution: {
            type: story.resolution.type,
            text: story.resolution.text
        }
    };
}
    static buildBeats(contract, count, tone) {
        const beats = [];
        const devs = STORY_DEVELOPMENTS.filter(d => {
            if (tone !== 'all') return d.tags && d.tags.includes(tone);
            return true;
        });
        const cliffs = STORY_CLIFFHANGERS.filter(c => {
            if (tone !== 'all') return c.tags && c.tags.includes(tone);
            return true;
        });

        const devPool = devs.length ? devs : STORY_DEVELOPMENTS;
        const cliffPool = cliffs.length ? cliffs : STORY_CLIFFHANGERS;

        // Чередуем: начинаем с развития, если контракт не боевой, иначе с клиффхэнгера
        const isActionType = ['elimination', 'sabotage'].includes(contract.type);
        let nextIsDev = !isActionType;

        for (let i = 0; i < count; i++) {
            let beat;
            if (nextIsDev) {
                const template = devPool[Math.floor(Math.random() * devPool.length)];
                beat = {
                    ...template,
                    beatType: 'Развитие',
                    text: this.customizeBeatText(template.text, contract)
                };
            } else {
                const template = cliffPool[Math.floor(Math.random() * cliffPool.length)];
                beat = {
                    ...template,
                    beatType: 'Клиффхэнгер',
                    text: this.customizeBeatText(template.text, contract)
                };
            }
            beats.push(beat);
            nextIsDev = !nextIsDev;
        }

        return beats;
    }

    static customizeBeatText(text, contract) {
        // Заменяем плейсхолдеры
        return text
            .replace(/цель/g, contract.target || 'цель')
            .replace(/заказчик/g, contract.client || 'заказчик')
            .replace(/локация/g, contract.location || 'город')
            .replace(/\bконтракт\b/g, 'задание');
    }

    static buildClimax(contract) {
        const templates = STORY_CLIMAXES;
        let template;
        
        if (['elimination', 'sabotage'].includes(contract.type)) {
            template = templates.find(c => c.id === 'climax_finalnaya_bitva') || templates[0];
        } else if (['extraction', 'protection'].includes(contract.type)) {
            template = templates.find(c => c.id === 'climax_finalnyy_akt') || templates[0];
        } else {
            template = templates[Math.floor(Math.random() * templates.length)];
        }

        return {
            ...template,
            text: this.customizeBeatText(template.text, contract)
        };
    }

    static buildResolution(contract) {
        const templates = STORY_RESOLUTIONS;
        let template;
        
        // Если контракт сложный, часто антагонист сбегает
        if (contract.difficulty === 'hard' || contract.difficulty === 'deadly') {
            const candidates = templates.filter(r => 
                r.id === 'res_antagonist_sbegaet' || 
                r.id === 'res_edgerunny_sbegayut'
            );
            template = candidates[Math.floor(Math.random() * candidates.length)] || templates[0];
        } else {
            template = templates[Math.floor(Math.random() * templates.length)];
        }

        return {
            ...template,
            text: this.customizeBeatText(template.text, contract)
        };
    }

    static buildNPCs(contract, playerCount) {
        const npcs = {
            allies: [],
            enemies: [],
            neutral: []
        };

        // Берём шаблоны из npc-templates.js
        const templates = NPCGenerator.getTemplates();
        const mookKeys = Object.keys(templates).filter(k => templates[k].threat === 'Mook');
        const lieutenantKeys = Object.keys(templates).filter(k => templates[k].threat === 'Lieutenant');
        const minibossKeys = Object.keys(templates).filter(k => templates[k].threat === 'Mini-Boss');

        // Враги: Mooks и лейтенанты
        const enemyCount = Math.max(2, Math.floor(playerCount / 2));
        for (let i = 0; i < enemyCount; i++) {
            const key = mookKeys[Math.floor(Math.random() * mookKeys.length)];
            const template = templates[key];
            if (template) npcs.enemies.push({ ...template, name: this.randomName() });
        }

        // Лейтенант
        if (lieutenantKeys.length) {
            const key = lieutenantKeys[Math.floor(Math.random() * lieutenantKeys.length)];
            const template = templates[key];
            if (template) npcs.enemies.push({ ...template, name: this.randomName() });
        }

        // Мини-босс для сложных контрактов
        if (contract.difficulty === 'hard' || contract.difficulty === 'deadly') {
            if (minibossKeys.length) {
                const key = minibossKeys[Math.floor(Math.random() * minibossKeys.length)];
                const template = templates[key];
                if (template) npcs.enemies.push({ ...template, name: this.randomName() });
            }
        }

        // Союзник (иногда)
        if (Math.random() > 0.5) {
            const key = mookKeys[Math.floor(Math.random() * mookKeys.length)];
            const template = templates[key];
            if (template) npcs.allies.push({ ...template, name: this.randomName() });
        }

        return npcs;
    }
    static generateFullAdventure(params = {}) {
    const story = this.generate(params);
    if (!story) return null;

    // Генерируем контракт на основе истории
    // (используем advanced-contract-generator)
    // Здесь нужен импорт AdvancedContractGenerator
    // Но чтобы избежать циклических зависимостей, можно вызвать через window или динамический импорт

    // Для простоты вернём только историю, а контракт сгенерируем отдельно
    return story;
}
    static buildEncounters(zone, time, playerCount) {
        // Используем EncounterGenerator для подстановки встреч
        // Но нам нужно получить данные, а не рендерить
        // EncounterGenerator.generate() не возвращает данные, поэтому мы эмулируем логику
        // В идеале нужно рефакторить EncounterGenerator, чтобы он возвращал объект
        
        // Пока просто генерируем 1-2 встречи
        const encounters = [];
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * 100) + 1;
            let encounter = null;
            // Упрощённо берём из дневной корпоративной зоны
            // В идеале нужно использовать полную логику из encounter-generator
            if (roll < 30) {
                encounter = { title: 'Патруль NCPD', description: 'Полицейский патруль проверяет документы.', threat: 'Низкая' };
            } else if (roll < 60) {
                encounter = { title: 'Банда бустеров', description: 'Группа бустеров ищет неприятности.', threat: 'Средняя' };
            } else {
                encounter = { title: 'Кочевники', description: 'Караван кочевников проезжает мимо.', threat: 'Низкая' };
            }
            encounters.push(encounter);
        }
        return encounters;
    }

    static randomName() {
        const first = ['Джек', 'Майк', 'Кира', 'Сара', 'Виктор', 'Елена', 'Маркус', 'Зоя', 'Иван', 'Ли', 'Алекс', 'Джейн', 'Стив', 'Ника', 'Оскар', 'Рико', 'Мия', 'Джей', 'Том', 'Эмма', 'Хуан', 'Ким'];
        const last = ['Смит', 'Джонсон', 'Ли', 'Ким', 'Браун', 'Гарсия', 'Мюллер', 'Дюбуа', 'Иванов', 'Чжан', 'Коэн', 'Судзуки', 'О\'Коннор', 'Дюваль', 'Фернандес', 'Ву'];
        return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
    }

    // ==================== РЕНДЕРИНГ ====================

    static renderToHTML(story) {
        if (!story) return '<p>Ошибка генерации истории.</p>';

        const contract = story.contract;
        let html = `
            <div class="story-card">
                <div class="story-header">
                    <h3>📖 ${this.escapeHtml(story.title)}</h3>
                    <div class="story-meta">
                        <span class="badge">${contract.typeLabel}</span>
                        <span class="badge diff-${contract.difficulty}">${contract.difficultyLabel}</span>
                        <span class="badge">${story.meta.tone !== 'all' ? story.meta.tone : 'Любой'}</span>
                        <span class="badge">💰 ${contract.reward} eb</span>
                        <span class="badge">⏱️ ${contract.timeLimit}</span>
                    </div>
                </div>
                <div class="story-body">
                    <!-- Контракт -->
                    <div class="story-contract">
                        <div class="contract-summary">
                            <strong>Заказчик:</strong> ${this.escapeHtml(contract.client)}<br>
                            <strong>Цель:</strong> ${this.escapeHtml(contract.target)}<br>
                            <strong>Место:</strong> ${this.escapeHtml(contract.location)}
                        </div>
                        <div class="contract-description">${this.escapeHtml(contract.description)}</div>
                        ${contract.complication ? `<div class="complication">⚠️ <strong>Осложнение:</strong> ${this.escapeHtml(contract.complication)}</div>` : ''}
                        ${contract.twist ? `<div class="twist">🔄 <strong>Поворот:</strong> ${this.escapeHtml(contract.twist)}</div>` : ''}
                    </div>

                    <!-- Крюк -->
                    <div class="story-beat story-hook">
                        <div class="beat-label">🔹 КРЮК (${story.hook.type})</div>
                        <div class="beat-text">${this.escapeHtml(story.hook.text)}</div>
                        ${story.hook.example ? `<div class="beat-example">💡 Пример: ${this.escapeHtml(story.hook.example)}</div>` : ''}
                    </div>
        `;

        // Биты
        story.beats.forEach((beat, index) => {
            const icon = beat.beatType === 'Развитие' ? '📌' : '⚡';
            html += `
                <div class="story-beat">
                    <div class="beat-label">${icon} БИТ ${index + 1}: ${beat.beatType} (${beat.type})</div>
                    <div class="beat-text">${this.escapeHtml(beat.text)}</div>
                </div>
            `;
        });

        // Кульминация
        html += `
                    <div class="story-beat story-climax">
                        <div class="beat-label">🔥 КУЛЬМИНАЦИЯ (${story.climax.type})</div>
                        <div class="beat-text">${this.escapeHtml(story.climax.text)}</div>
                    </div>
                    <div class="story-beat story-resolution">
                        <div class="beat-label">🏁 РАЗВЯЗКА (${story.resolution.type})</div>
                        <div class="beat-text">${this.escapeHtml(story.resolution.text)}</div>
                    </div>
        `;

        // NPC
        if (story.npcs && (story.npcs.enemies.length || story.npcs.allies.length)) {
            html += `<div class="story-npcs"><div class="beat-label">👥 NPC</div><div class="npc-list">`;
            if (story.npcs.enemies.length) {
                html += `<div class="npc-group enemies"><strong>Враги:</strong> ${story.npcs.enemies.map(n => n.name).join(', ')}</div>`;
            }
            if (story.npcs.allies.length) {
                html += `<div class="npc-group allies"><strong>Союзники:</strong> ${story.npcs.allies.map(n => n.name).join(', ')}</div>`;
            }
            html += `</div></div>`;
        }

        // Встречи
        if (story.encounters && story.encounters.length) {
            html += `<div class="story-encounters"><div class="beat-label">🎲 Случайные встречи</div><ul>`;
            story.encounters.forEach(e => {
                html += `<li><strong>${e.title}</strong> — ${e.description} <span class="threat-badge">${e.threat}</span></li>`;
            });
            html += `</ul></div>`;
        }

        html += `
                    <div class="story-meta-footer">
                        <span>🆔 Сгенерировано: ${new Date(story.meta.generatedAt).toLocaleString()}</span>
                        <span>🎯 Рекомендуемый ранг: ${contract.recommendedRank}</span>
                    </div>
                </div>
            </div>
        `;

        return html;
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
    // modules/story-generator.js
// modules/story-generator.js

static contractToStory(contract) {
    if (!contract) return null;

    // Создаём бит-чарт на основе контракта
    const hook = {
        type: 'Контракт',
        text: `Заказчик ${contract.client} нанимает команду для ${contract.type === 'extraction' ? 'извлечения' : contract.type === 'elimination' ? 'устранения' : contract.type}. Цель: ${contract.target}. Место: ${contract.location}. Награда: ${contract.reward} eb.`,
        example: contract.description || ''
    };

    const developments = [
        { type: 'Подготовка', text: 'Команда собирает информацию о цели и месте, изучает маршруты и систему безопасности.', beatType: 'Развитие' },
        { type: 'Проникновение', text: 'Персонажи проникают на объект или приближаются к цели, избегая обнаружения.', beatType: 'Развитие' },
    ];

    const cliffhanger = contract.complication ? {
        type: 'Осложнение',
        text: contract.complication,
        beatType: 'Клиффхэнгер'
    } : {
        type: 'Столкновение',
        text: 'Персонажи сталкиваются с охраной или неожиданным препятствием на пути к цели.',
        beatType: 'Клиффхэнгер'
    };

    const climax = {
        type: 'Выполнение',
        text: `Команда выполняет задание: ${contract.type === 'extraction' ? 'извлекает' : contract.type === 'elimination' ? 'устраняет' : 'завершает'} ${contract.target}.`,
        beatType: 'Кульминация'
    };

    const resolution = {
        type: contract.twist ? 'Неожиданный поворот' : 'Завершение',
        text: contract.twist || `Команда получает награду ${contract.reward} eb и завершает контракт.`,
        beatType: 'Развязка'
    };

    return {
        title: contract.title || 'Контракт',
        hook,
        beats: [developments[0], cliffhanger, developments[1], climax],
        climax,
        resolution,
        meta: { type: 'контракт', difficulty: contract.difficulty }
    };
}
static toCampaign(story, campaignName = null) {
    if (!story) return null;

    const id = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const now = new Date().toISOString();

    const name = campaignName || story.title || 'Сгенерированная кампания';

    // Собираем все биты в массив
    const beats = [
        { type: 'Крюк', data: story.hook },
        ...story.beats.map(b => ({ type: b.beatType || 'Бит', data: b })),
        { type: 'Кульминация', data: story.climax },
        { type: 'Развязка', data: story.resolution }
    ];

    // Преобразуем в сцены
    const scenes = beats.map((beat, index) => {
        const text = beat.data.text || '';
        const example = beat.data.example || '';
        const description = example ? `${text}\n\n💡 Пример: ${example}` : text;
        return {
            id: id(),
            name: `${beat.type} ${index + 1}`,
            description: description,
            status: 'active',
            beatType: beat.type,
            createdAt: now,
            // дополнительные поля – можно расширить
            participants: [],
            location: '',
            netArchitectureId: '',
            encounterTemplate: '',
            prerequisites: [],
            unlocks: [],
            gmNotes: ''
        };
    });

    // Глава
    const chapter = {
        id: id(),
        name: 'Основная цепочка',
        scenes: scenes,
        createdAt: now
    };

    // Арка
    const arc = {
        id: id(),
        name: 'Сгенерированная арка',
        chapters: [chapter],
        createdAt: now
    };

    // Кампания
    const campaign = {
        id: id(),
        name: name,
        description: `Сгенерировано из бит-чарта ${now}`,
        arcs: [arc],
        status: 'active',
        createdAt: now
    };

    return campaign;
}
}