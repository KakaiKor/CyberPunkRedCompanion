// js/story/story-ui.js

import {
    getCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    addArc,
    addChapter,
    addScene,
    updateArc,
    updateChapter,
    updateScene,
    deleteArc,
    deleteChapter,
    deleteScene,
    duplicateScene,
    exportScene,
    importScene,
    loadStoryData,
    saveStoryData
} from './story-manager.js';
import { renderBoard, clearBoard } from './story-board.js';
import { loadCharacter } from '../storage.js';

// ===== Вспомогательная функция =====
function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== Переключение подвкладок Story =====
export function switchStorySubTab(tabId) {
    const pane = document.getElementById('tab-story');
    if (!pane) return;
    pane.querySelectorAll('.sub-pane').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    pane.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sub === tabId);
    });
    if (tabId === 'story-board') {
        const select = document.getElementById('storyBoardCampaignSelect');
        if (select && select.value) renderBoard(select.value);
        else clearBoard();
    }
    if (tabId === 'story-timeline') {
        const select = document.getElementById('storyTimelineCampaignSelect');
        if (select && select.value) renderTimeline(select.value);
    }
}

// ===== Автоподстановка данных для полей =====
function getAutoCompleteData(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return { participants: [], locations: [], netArchs: [], encounters: [] };
    const participantsSet = new Set();
    const locationsSet = new Set();
    const netArchsSet = new Set();
    const encountersSet = new Set();
    campaign.arcs.forEach(arc => {
        arc.chapters.forEach(ch => {
            ch.scenes.forEach(scene => {
                if (scene.participants) scene.participants.forEach(p => participantsSet.add(p));
                if (scene.location) locationsSet.add(scene.location);
                if (scene.netArchitectureId) netArchsSet.add(scene.netArchitectureId);
                if (scene.encounterTemplate) encountersSet.add(scene.encounterTemplate);
            });
        });
    });
    const char = loadCharacter();
    if (char && char.name) participantsSet.add(char.id || 'current_character');
    return {
        participants: Array.from(participantsSet).filter(Boolean),
        locations: Array.from(locationsSet).filter(Boolean),
        netArchs: Array.from(netArchsSet).filter(Boolean),
        encounters: Array.from(encountersSet).filter(Boolean)
    };
}

// ===== Рендер таймлайна с группировкой по аркам и главам =====
export function renderTimeline(campaignId) {
    const container = document.getElementById('storyTimelineContainer');
    if (!container) return;

    const campaign = getCampaign(campaignId);
    if (!campaign) {
        container.innerHTML = `<p class="note">Кампания не найдена.</p>`;
        return;
    }

    // Собираем все сцены с привязкой к арке и главе
    let grouped = [];
    campaign.arcs.forEach(arc => {
        arc.chapters.forEach(chapter => {
            if (chapter.scenes && chapter.scenes.length > 0) {
                const sortedScenes = [...chapter.scenes].sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(a.timestamp) - new Date(b.timestamp));
                grouped.push({
                    arcName: arc.name,
                    arcId: arc.id,
                    chapterName: chapter.name,
                    chapterId: chapter.id,
                    scenes: sortedScenes
                });
            }
        });
    });

    if (grouped.length === 0) {
        container.innerHTML = `<p class="note">В этой кампании пока нет сцен.</p>`;
        return;
    }

    let html = `<div class="timeline">`;

    grouped.forEach(group => {
        // Заголовок арки и главы
        html += `
            <div class="timeline-group-header">
                <span class="timeline-arc-name">📁 ${escapeHtml(group.arcName)}</span>
                <span class="timeline-chapter-name">→ ${escapeHtml(group.chapterName)}</span>
            </div>
        `;

        // Сцены внутри группы
        group.scenes.forEach(scene => {
            const statusColor = scene.status === 'active' ? '#39ff14' :
                                scene.status === 'completed' ? '#4caf50' :
                                scene.status === 'failed' ? '#ff3c5f' :
                                scene.status === 'hidden' ? '#555' : '#6b7b8d';

            const beatIcons = {
                hook: '🎣',
                development: '📈',
                cliffhanger: '🌀',
                climax: '🔥',
                resolution: '✅'
            };
            const beatIcon = beatIcons[scene.beatType] || '📌';

            html += `
                <div class="timeline-item">
                    <div class="timeline-marker" style="background:${statusColor};"></div>
                    <div class="timeline-content" style="border-left: 3px solid ${statusColor};">
                        <div class="timeline-header">
                            <h4>
                                <span class="timeline-beat-icon">${beatIcon}</span>
                                ${escapeHtml(scene.name)} 
                                <span class="beat-tag">${scene.beatType || 'development'}</span>
                            </h4>
                            <span class="timeline-status" style="border-color:${statusColor}; color:${statusColor};">
                                ${scene.status || 'draft'}
                            </span>
                        </div>
                        ${scene.description ? `<p class="timeline-desc">${escapeHtml(scene.description)}</p>` : ''}
                        <div class="timeline-meta">
                            <span>🆔 ${escapeHtml(scene.id)}</span>
                            ${scene.participants?.length ? `👥 ${scene.participants.join(', ')}` : ''}
                        </div>
                        <div class="timeline-actions">
                            <button class="cyber-btn small edit-scene-from-timeline" 
                                    data-campaign="${campaignId}" 
                                    data-arc="${group.arcId}" 
                                    data-chapter="${group.chapterId}" 
                                    data-scene="${scene.id}">
                                ✏️ Редактировать
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    });

    html += `</div>`;
    container.innerHTML = html;

    // Обработчики для кнопок редактирования
    container.querySelectorAll('.edit-scene-from-timeline').forEach(btn => {
        btn.addEventListener('click', () => {
            const cId = btn.dataset.campaign;
            const aId = btn.dataset.arc;
            const chId = btn.dataset.chapter;
            const sId = btn.dataset.scene;
            switchStorySubTab('story-tree');
            const treeSelect = document.getElementById('storyTreeCampaignSelect');
            if (treeSelect) {
                treeSelect.value = cId;
                treeSelect.dispatchEvent(new Event('change'));
                setTimeout(() => {
                    const treeContainer = document.getElementById('storyTreeContainer');
                    if (treeContainer) {
                        treeContainer.dataset.editingId = `scene_${sId}`;
                        renderTree(cId);
                    }
                }, 100);
            }
        });
    });
}

// ===== Рендер списка кампаний =====
// ===== Рендер списка кампаний с прогресс-барами =====
// ===== Рендер списка кампаний с прогресс-барами и обработчиками =====
export function renderCampaignList() {
    const container = document.getElementById('storyCampaignList');
    if (!container) return;

    const campaigns = getCampaigns();
    const editingId = container.dataset.editingCampaignId || null;
    const showCreateForm = container.dataset.showCreateForm === 'true';

    let html = `<div class="campaign-grid">`;

    if (showCreateForm) {
        html += `
            <div class="campaign-card campaign-create-form">
                <div class="campaign-edit-form">
                    <input type="text" class="create-camp-name" placeholder="Название кампании *">
                    <textarea class="create-camp-desc" placeholder="Описание (необязательно)"></textarea>
                    <select class="create-camp-status">
                        <option value="draft">Черновик</option>
                        <option value="active" selected>Активна</option>
                        <option value="completed">Завершена</option>
                        <option value="archived">Архив</option>
                    </select>
                    <div class="edit-actions">
                        <button class="cyber-btn small save-create-campaign">💾 Создать</button>
                        <button class="cyber-btn small cancel-create-campaign">❌ Отмена</button>
                    </div>
                </div>
            </div>
        `;
    }

    campaigns.forEach(c => {
        const isEditing = (editingId === c.id);
        const statusLabel = c.status === 'active' ? '🟢 Активна' :
                            c.status === 'completed' ? '✅ Завершена' :
                            c.status === 'archived' ? '📦 Архив' : '📝 Черновик';

        // Подсчёт статистики
        let totalScenes = 0;
        let completedScenes = 0;
        let activeScenes = 0;
        let totalChapters = 0;
        let totalArcs = c.arcs?.length || 0;

        c.arcs?.forEach(arc => {
            arc.chapters?.forEach(ch => {
                totalChapters++;
                ch.scenes?.forEach(s => {
                    totalScenes++;
                    if (s.status === 'completed') completedScenes++;
                    if (s.status === 'active') activeScenes++;
                });
            });
        });

        const progressPercent = totalScenes > 0 ? Math.round((completedScenes / totalScenes) * 100) : 0;

        html += `<div class="campaign-card" data-id="${c.id}">`;

        if (isEditing) {
            html += `
                <div class="campaign-edit-form">
                    <input type="text" class="edit-camp-name" value="${escapeHtml(c.name)}" placeholder="Название кампании">
                    <textarea class="edit-camp-desc" placeholder="Описание">${escapeHtml(c.description || '')}</textarea>
                    <select class="edit-camp-status">
                        <option value="draft" ${c.status === 'draft' ? 'selected' : ''}>Черновик</option>
                        <option value="active" ${c.status === 'active' ? 'selected' : ''}>Активна</option>
                        <option value="completed" ${c.status === 'completed' ? 'selected' : ''}>Завершена</option>
                        <option value="archived" ${c.status === 'archived' ? 'selected' : ''}>Архив</option>
                    </select>
                    <div class="edit-actions">
                        <button class="cyber-btn small save-campaign-edit" data-id="${c.id}">💾 Сохранить</button>
                        <button class="cyber-btn small cancel-campaign-edit">❌ Отмена</button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="campaign-header">
                    <h4>${escapeHtml(c.name)}</h4>
                    <span class="campaign-status" data-status="${c.status}">${statusLabel}</span>
                </div>
                <p class="campaign-desc">${escapeHtml(c.description || 'Нет описания')}</p>
                
                <!-- Прогресс-бар -->
                <div class="campaign-progress">
                    <div class="campaign-progress-bar">
                        <div class="campaign-progress-fill" style="width:${progressPercent}%;"></div>
                    </div>
                    <span class="campaign-progress-text">${completedScenes}/${totalScenes} сцен завершено (${progressPercent}%)</span>
                </div>

                <div class="campaign-meta">
                    <span>📁 Арок: ${totalArcs}</span>
                    <span>📄 Глав: ${totalChapters}</span>
                    <span>🎬 Сцен: ${totalScenes}</span>
                    ${activeScenes > 0 ? `<span style="color:#39ff14;">● ${activeScenes} активны</span>` : ''}
                </div>
                <div class="campaign-actions">
                    <button class="cyber-btn small open-campaign" data-id="${c.id}">📂 Открыть</button>
                    <button class="cyber-btn small edit-campaign-btn" data-id="${c.id}">✏️</button>
                    <button class="cyber-btn small delete-campaign" data-id="${c.id}">🗑️</button>
                </div>
            `;
        }

        html += `</div>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // ===== ВСЕ ОБРАБОТЧИКИ СОБЫТИЙ (восстановлены) =====

    // --- Создание кампании ---
    container.querySelectorAll('.save-create-campaign').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('.campaign-create-form');
            const name = form.querySelector('.create-camp-name').value.trim();
            const desc = form.querySelector('.create-camp-desc').value.trim();
            const status = form.querySelector('.create-camp-status').value;
            if (!name) return alert('Название обязательно.');
            import('./story-manager.js').then(module => {
                module.createCampaign(name, desc);
                const campaigns = module.getCampaigns();
                const created = campaigns.find(c => c.name === name && c.description === desc);
                if (created && status) module.updateCampaign(created.id, { status });
                delete container.dataset.showCreateForm;
                renderCampaignList();
                refreshCampaignSelects();
            });
        });
    });

    container.querySelectorAll('.cancel-create-campaign').forEach(btn => {
        btn.addEventListener('click', () => {
            delete container.dataset.showCreateForm;
            renderCampaignList();
        });
    });

    // --- Редактирование кампании ---
    container.querySelectorAll('.edit-campaign-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            container.dataset.editingCampaignId = btn.dataset.id;
            renderCampaignList();
        });
    });

    container.querySelectorAll('.cancel-campaign-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            delete container.dataset.editingCampaignId;
            renderCampaignList();
        });
    });

    container.querySelectorAll('.save-campaign-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const card = btn.closest('.campaign-card');
            const name = card.querySelector('.edit-camp-name').value.trim();
            const desc = card.querySelector('.edit-camp-desc').value.trim();
            const status = card.querySelector('.edit-camp-status').value;
            if (!name) return alert('Название не может быть пустым.');
            updateCampaign(id, { name, description: desc, status });
            delete container.dataset.editingCampaignId;
            renderCampaignList();
        });
    });

    // --- Открытие кампании (переход в дерево) ---
    container.querySelectorAll('.open-campaign').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            switchStorySubTab('story-tree');
            const treeSelect = document.getElementById('storyTreeCampaignSelect');
            if (treeSelect) {
                treeSelect.value = id;
                treeSelect.dispatchEvent(new Event('change'));
            }
        });
    });

    // --- Удаление кампании ---
    container.querySelectorAll('.delete-campaign').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (confirm('Удалить кампанию и все её данные?')) {
                deleteCampaign(id);
                renderCampaignList();
                refreshCampaignSelects();
            }
        });
    });
}

// ===== Рендер дерева с визуализацией связей и редактированием =====
export function renderTree(campaignId) {
    const container = document.getElementById('storyTreeContainer');
    if (!container) return;
    const campaign = getCampaign(campaignId);
    if (!campaign) {
        container.innerHTML = `<p class="note">Кампания не найдена.</p>`;
        return;
    }

    const editingId = container.dataset.editingId || null;
    const creatingType = container.dataset.creatingType || null;
    const creatingParentId = container.dataset.creatingParentId || null;

    const searchTerm = (document.getElementById('storyTreeSearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('storyTreeStatusFilter')?.value || 'all';

    function sceneMatches(scene) {
        if (statusFilter !== 'all' && scene.status !== statusFilter) return false;
        if (searchTerm && !scene.name.toLowerCase().includes(searchTerm) && !(scene.description || '').toLowerCase().includes(searchTerm)) return false;
        return true;
    }

    // ---- список всех глав для выпадающего списка переноса ----
    const allChapters = [];
    campaign.arcs.forEach(arc => {
        arc.chapters.forEach(ch => {
            allChapters.push({
                id: ch.id,
                name: ch.name,
                arcId: arc.id,
                arcName: arc.name
            });
        });
    });

    let html = `<div class="tree-container">`;
    campaign.arcs.forEach(arc => {
        const isEditingArc = (editingId === `arc_${arc.id}`);
        html += `<div class="tree-arc">`;
        if (isEditingArc) {
            html += renderEditArcForm(campaignId, arc);
        } else {
            html += `<div class="tree-item-header">
                        <span class="tree-item-name">📁 ${escapeHtml(arc.name)}</span>
                        <span class="tree-item-status">${arc.status || 'draft'}</span>
                        <div class="tree-item-actions">
                            <button class="cyber-btn small edit-arc" data-campaign="${campaignId}" data-arc="${arc.id}">✏️</button>
                            <button class="cyber-btn small delete-arc" data-campaign="${campaignId}" data-arc="${arc.id}">🗑️</button>
                            <button class="cyber-btn small create-chapter-btn" data-campaign="${campaignId}" data-arc="${arc.id}">➕ Глава</button>
                        </div>
                    </div>`;
        }

        if (arc.chapters && arc.chapters.length > 0) {
            html += `<div class="tree-chapters" style="padding-left:20px;">`;
            arc.chapters.forEach(chapter => {
                const isEditingChapter = (editingId === `chapter_${chapter.id}`);
                html += `<div class="tree-chapter">`;
                if (isEditingChapter) {
                    html += renderEditChapterForm(campaignId, arc.id, chapter);
                } else {
                    html += `<div class="tree-item-header">
                                <span class="tree-item-name">📄 ${escapeHtml(chapter.name)}</span>
                                <span class="tree-item-status">${chapter.status || 'draft'}</span>
                                <div class="tree-item-actions">
                                    <button class="cyber-btn small edit-chapter" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}">✏️</button>
                                    <button class="cyber-btn small delete-chapter" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}">🗑️</button>
                                    <button class="cyber-btn small create-scene-btn" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}">➕ Сцена</button>
                                </div>
                            </div>`;
                }

                // Сцены внутри главы
                if (chapter.scenes && chapter.scenes.length > 0) {
                    const sortedScenes = [...chapter.scenes].sort((a, b) => (a.order || 0) - (b.order || 0));
                    html += `<div class="tree-scenes" style="padding-left:20px;">`;
                    sortedScenes.forEach((scene, index) => {
                        if (!sceneMatches(scene)) {
                            html += `<div class="tree-scene hidden-filtered" style="display:none;"></div>`;
                            return;
                        }
                        const isEditingScene = (editingId === `scene_${scene.id}`);
                        html += `<div class="tree-scene">`;
                        if (isEditingScene) {
                            html += renderEditSceneForm(campaignId, arc.id, chapter.id, scene);
                        } else {
                            const beatLabel = scene.beatType ? ` (${scene.beatType})` : '';
                            // Визуализация связей
                            let linksHtml = '';
                            if (scene.unlocks && scene.unlocks.length > 0) {
                                linksHtml += `<span class="link-tag unlock-tag" title="Открывает">🔓 ${scene.unlocks.join(', ')}</span>`;
                            }
                            if (scene.prerequisites && scene.prerequisites.length > 0) {
                                linksHtml += `<span class="link-tag prereq-tag" title="Зависит от">🔗 ${scene.prerequisites.join(', ')}</span>`;
                            }
                            // Выпадающий список для переноса
                            const chapterOptions = allChapters.map(ch =>
                                `<option value="${ch.id}" ${ch.id === chapter.id ? 'selected' : ''}>${escapeHtml(ch.arcName)} → ${escapeHtml(ch.name)}</option>`
                            ).join('');
                            html += `
                                <div class="tree-item-header">
                                    <span class="tree-item-name">🎬 ${escapeHtml(scene.name)}${beatLabel}</span>
                                    <span class="tree-item-status">${scene.status || 'draft'}</span>
                                    <div class="tree-item-actions" style="display:flex; flex-wrap:wrap; gap:4px;">
                                        <button class="cyber-btn small move-scene-up" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
                                        <button class="cyber-btn small move-scene-down" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}" data-index="${index}" ${index === sortedScenes.length - 1 ? 'disabled' : ''}>↓</button>
                                        <select class="move-scene-chapter" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}" style="font-size:0.7rem; padding:2px 4px;">
                                            ${chapterOptions}
                                        </select>
                                        <button class="cyber-btn small move-scene-to-chapter" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}">↪</button>
                                        <button class="cyber-btn small edit-scene" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}">✏️</button>
                                        <button class="cyber-btn small duplicate-scene-btn" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}">📋</button>
                                        <button class="cyber-btn small delete-scene" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}">🗑️</button>
                                        <button class="cyber-btn small export-scene-btn" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}">📤</button>
                                    </div>
                                </div>
                                ${linksHtml ? `<div class="scene-links">${linksHtml}</div>` : ''}
                            `;
                        }
                        html += `</div>`;
                    });
                    html += `</div>`;
                } else {
                    if (creatingType === 'scene' && creatingParentId === chapter.id) {
                        html += `<div style="padding-left:20px;">${renderCreateSceneForm(campaignId, arc.id, chapter.id)}</div>`;
                    } else {
                        html += `<div class="tree-empty-scenes" style="padding-left:20px; color:#8b949e; font-size:0.9rem;">Нет сцен. Добавьте первую.</div>`;
                    }
                }

                html += `</div>`;
            });
            html += `</div>`;
        } else {
            if (creatingType === 'chapter' && creatingParentId === arc.id) {
                html += `<div style="padding-left:20px;">${renderCreateChapterForm(campaignId, arc.id)}</div>`;
            } else {
                html += `<div class="tree-empty-chapters" style="padding-left:20px; color:#8b949e; font-size:0.9rem;">Нет глав. Добавьте первую.</div>`;
            }
        }

        html += `</div>`;
    });

    if (creatingType === 'arc') {
        html += `<div class="tree-arc">${renderCreateArcForm(campaignId)}</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;

    if (editingId) container.dataset.editingId = editingId;
    else delete container.dataset.editingId;
    if (creatingType) container.dataset.creatingType = creatingType;
    else delete container.dataset.creatingType;
    if (creatingParentId) container.dataset.creatingParentId = creatingParentId;
    else delete container.dataset.creatingParentId;

    bindTreeEvents(campaignId);
}

// ===== Формы создания и редактирования =====
function renderCreateArcForm(campaignId) {
    return `
        <div class="tree-edit-form">
            <input type="text" class="create-arc-name" placeholder="Название арки *">
            <textarea class="create-arc-desc" placeholder="Описание (необязательно)"></textarea>
            <div class="edit-actions">
                <button class="cyber-btn small save-create-arc" data-campaign="${campaignId}">💾 Создать</button>
                <button class="cyber-btn small cancel-create">❌ Отмена</button>
            </div>
        </div>
    `;
}

function renderCreateChapterForm(campaignId, arcId) {
    return `
        <div class="tree-edit-form">
            <input type="text" class="create-chapter-name" placeholder="Название главы *">
            <textarea class="create-chapter-desc" placeholder="Описание (необязательно)"></textarea>
            <div class="edit-actions">
                <button class="cyber-btn small save-create-chapter" data-campaign="${campaignId}" data-arc="${arcId}">💾 Создать</button>
                <button class="cyber-btn small cancel-create">❌ Отмена</button>
            </div>
        </div>
    `;
}

function renderCreateSceneForm(campaignId, arcId, chapterId) {
    return `
        <div class="tree-edit-form scene-create-form">
            <div class="form-row">
                <input type="text" class="create-scene-name" placeholder="Название сцены *">
                <select class="create-scene-beat">
                    <option value="hook">Крюк</option>
                    <option value="development" selected>Развитие</option>
                    <option value="cliffhanger">Клиффхэнгер</option>
                    <option value="climax">Кульминация</option>
                    <option value="resolution">Развязка</option>
                </select>
            </div>
            <div class="form-row">
                <textarea class="create-scene-desc" placeholder="Описание" rows="2"></textarea>
            </div>
            <details class="form-details">
                <summary>⚙️ Дополнительные параметры</summary>
                <div class="form-row">
                    <input type="text" class="create-participants" placeholder="Участники (ID через запятую)">
                </div>
                <div class="form-row">
                    <input type="text" class="create-location" placeholder="Локация (ID)">
                    <input type="text" class="create-net" placeholder="Архитектура сети (ID)">
                    <input type="text" class="create-encounter" placeholder="Шаблон встречи (ID)">
                </div>
                <div class="form-row">
                    <input type="text" class="create-prereqs" placeholder="Предыдущие сцены (ID через запятую)">
                    <input type="text" class="create-unlocks" placeholder="Открывает сцены (ID через запятую)">
                </div>
                <div class="form-row">
                    <textarea class="create-choices" placeholder="Ветвления (JSON)" rows="2"></textarea>
                </div>
                <div class="form-row">
                    <textarea class="create-gmnotes" placeholder="Заметки ГМ" rows="2"></textarea>
                </div>
            </details>
            <div class="edit-actions">
                <button class="cyber-btn small save-create-scene" data-campaign="${campaignId}" data-arc="${arcId}" data-chapter="${chapterId}">💾 Создать</button>
                <button class="cyber-btn small cancel-create">❌ Отмена</button>
            </div>
        </div>
    `;
}

function renderEditArcForm(campaignId, arc) {
    return `
        <div class="tree-edit-form">
            <input type="text" class="edit-name" value="${escapeHtml(arc.name)}" placeholder="Название арки">
            <textarea class="edit-desc" placeholder="Описание">${escapeHtml(arc.description || '')}</textarea>
            <div class="edit-actions">
                <button class="cyber-btn small save-edit" data-type="arc" data-campaign="${campaignId}" data-arc="${arc.id}">💾 Сохранить</button>
                <button class="cyber-btn small cancel-edit">❌ Отмена</button>
            </div>
        </div>
    `;
}

function renderEditChapterForm(campaignId, arcId, chapter) {
    return `
        <div class="tree-edit-form">
            <input type="text" class="edit-name" value="${escapeHtml(chapter.name)}" placeholder="Название главы">
            <textarea class="edit-desc" placeholder="Описание">${escapeHtml(chapter.description || '')}</textarea>
            <div class="edit-actions">
                <button class="cyber-btn small save-edit" data-type="chapter" data-campaign="${campaignId}" data-arc="${arcId}" data-chapter="${chapter.id}">💾 Сохранить</button>
                <button class="cyber-btn small cancel-edit">❌ Отмена</button>
            </div>
        </div>
    `;
}

function renderEditSceneForm(campaignId, arcId, chapterId, scene) {
    const beatOptions = ['hook','development','cliffhanger','climax','resolution']
        .map(b => `<option value="${b}" ${scene.beatType === b ? 'selected' : ''}>${b}</option>`).join('');

    const autoData = getAutoCompleteData(campaignId);
    const datalistId = `scene_edit_datalist_${scene.id}`;

    function datalistOptions(items, id) {
        if (!items || items.length === 0) return '';
        return `<datalist id="${id}">${items.map(v => `<option value="${escapeHtml(v)}">`).join('')}</datalist>`;
    }

    return `
        <div class="tree-edit-form scene-edit-form" data-scene-id="${scene.id}">
            <div class="form-row">
                <input type="text" class="edit-name" value="${escapeHtml(scene.name)}" placeholder="Название сцены *">
                <select class="edit-beat">${beatOptions}</select>
                <select class="edit-status">
                    <option value="draft" ${scene.status === 'draft' ? 'selected' : ''}>Черновик</option>
                    <option value="active" ${scene.status === 'active' ? 'selected' : ''}>Активна</option>
                    <option value="completed" ${scene.status === 'completed' ? 'selected' : ''}>Завершена</option>
                    <option value="failed" ${scene.status === 'failed' ? 'selected' : ''}>Провалена</option>
                    <option value="hidden" ${scene.status === 'hidden' ? 'selected' : ''}>Скрыта</option>
                </select>
            </div>
            <div class="form-row">
                <textarea class="edit-desc" placeholder="Описание" rows="2">${escapeHtml(scene.description || '')}</textarea>
            </div>
            <details class="form-details" open>
                <summary>⚙️ Дополнительные параметры</summary>
                <div class="form-row">
                    <input type="text" class="edit-participants" value="${(scene.participants || []).join(', ')}" placeholder="Участники (ID через запятую)" list="${datalistId}_participants">
                    ${datalistOptions(autoData.participants, `${datalistId}_participants`)}
                </div>
                <div class="form-row">
                    <input type="text" class="edit-location" value="${scene.location || ''}" placeholder="Локация (ID)" list="${datalistId}_locations">
                    ${datalistOptions(autoData.locations, `${datalistId}_locations`)}
                    <input type="text" class="edit-net" value="${scene.netArchitectureId || ''}" placeholder="Архитектура сети (ID)" list="${datalistId}_net">
                    ${datalistOptions(autoData.netArchs, `${datalistId}_net`)}
                    <input type="text" class="edit-encounter" value="${scene.encounterTemplate || ''}" placeholder="Шаблон встречи (ID)" list="${datalistId}_encounters">
                    ${datalistOptions(autoData.encounters, `${datalistId}_encounters`)}
                </div>
                <div class="form-row">
                    <input type="text" class="edit-prereqs" value="${(scene.prerequisites || []).join(', ')}" placeholder="Предыдущие сцены (ID через запятую)">
                    <input type="text" class="edit-unlocks" value="${(scene.unlocks || []).join(', ')}" placeholder="Открывает сцены (ID через запятую)">
                </div>
                <div class="form-row">
                    <textarea class="edit-choices" placeholder="Ветвления (JSON)" rows="2">${JSON.stringify(scene.choices || [], null, 2)}</textarea>
                </div>
                <div class="form-row">
                    <textarea class="edit-gmnotes" placeholder="Заметки ГМ" rows="2">${escapeHtml(scene.gmNotes || '')}</textarea>
                </div>
            </details>
            <div class="edit-actions">
                <button class="cyber-btn small save-edit" data-type="scene" data-campaign="${campaignId}" data-arc="${arcId}" data-chapter="${chapterId}" data-scene="${scene.id}">💾 Сохранить</button>
                <button class="cyber-btn small duplicate-scene" data-campaign="${campaignId}" data-arc="${arcId}" data-chapter="${chapterId}" data-scene="${scene.id}">📋 Дублировать</button>
                <button class="cyber-btn small cancel-edit">❌ Закрыть</button>
            </div>
        </div>
    `;
}

// ===== Привязка событий дерева =====
function bindTreeEvents(campaignId) {
    const container = document.getElementById('storyTreeContainer');
    if (!container) return;

    // ---- Редактирование ----
    container.querySelectorAll('.edit-arc, .edit-chapter, .edit-scene').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let id;
            if (btn.classList.contains('edit-arc')) id = `arc_${btn.dataset.arc}`;
            else if (btn.classList.contains('edit-chapter')) id = `chapter_${btn.dataset.chapter}`;
            else if (btn.classList.contains('edit-scene')) id = `scene_${btn.dataset.scene}`;
            container.dataset.editingId = id;
            delete container.dataset.creatingType;
            delete container.dataset.creatingParentId;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.cancel-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            delete container.dataset.editingId;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.save-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const form = btn.closest('.tree-edit-form');
            const name = form.querySelector('.edit-name').value.trim();
            const desc = form.querySelector('.edit-desc').value.trim();
            if (!name) return alert('Название не может быть пустым.');

            const patch = { name, description: desc };

            if (type === 'arc') {
                updateArc(campaignId, btn.dataset.arc, patch);
                delete container.dataset.editingId;
                renderTree(campaignId);
            } else if (type === 'chapter') {
                updateChapter(campaignId, btn.dataset.arc, btn.dataset.chapter, patch);
                delete container.dataset.editingId;
                renderTree(campaignId);
            } else if (type === 'scene') {
                const arcId = btn.dataset.arc;
                const chapterId = btn.dataset.chapter;
                const sceneId = btn.dataset.scene;
                const beat = form.querySelector('.edit-beat').value;
                const status = form.querySelector('.edit-status').value;
                const participants = form.querySelector('.edit-participants').value.split(',').map(s => s.trim()).filter(Boolean);
                const location = form.querySelector('.edit-location').value.trim();
                const netArch = form.querySelector('.edit-net').value.trim();
                const encounter = form.querySelector('.edit-encounter').value.trim();
                const prereqs = form.querySelector('.edit-prereqs').value.split(',').map(s => s.trim()).filter(Boolean);
                const unlocks = form.querySelector('.edit-unlocks').value.split(',').map(s => s.trim()).filter(Boolean);
                let choices = [];
                try {
                    const choicesRaw = form.querySelector('.edit-choices').value.trim();
                    if (choicesRaw) choices = JSON.parse(choicesRaw);
                } catch(e) {}
                const gmNotes = form.querySelector('.edit-gmnotes').value.trim();

                const scenePatch = {
                    name, description: desc, beatType: beat, status,
                    participants, location, netArchitectureId: netArch,
                    encounterTemplate: encounter, prerequisites: prereqs,
                    unlocks, choices, gmNotes
                };
                updateScene(campaignId, arcId, chapterId, sceneId, scenePatch);
                delete container.dataset.editingId;
                renderTree(campaignId);
            }
        });
    });

    // ---- Создание ----
    container.querySelectorAll('.create-arc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.dataset.creatingType = 'arc';
            delete container.dataset.creatingParentId;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.create-chapter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.dataset.creatingType = 'chapter';
            container.dataset.creatingParentId = btn.dataset.arc;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.create-scene-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.dataset.creatingType = 'scene';
            container.dataset.creatingParentId = btn.dataset.chapter;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.cancel-create').forEach(btn => {
        btn.addEventListener('click', () => {
            delete container.dataset.creatingType;
            delete container.dataset.creatingParentId;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.save-create-arc').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('.tree-edit-form');
            const name = form.querySelector('.create-arc-name').value.trim();
            const desc = form.querySelector('.create-arc-desc').value.trim();
            if (!name) return alert('Название обязательно.');
            addArc(campaignId, { name, description: desc });
            delete container.dataset.creatingType;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.save-create-chapter').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('.tree-edit-form');
            const name = form.querySelector('.create-chapter-name').value.trim();
            const desc = form.querySelector('.create-chapter-desc').value.trim();
            const arcId = btn.dataset.arc;
            if (!name) return alert('Название обязательно.');
            addChapter(campaignId, arcId, { name, description: desc });
            delete container.dataset.creatingType;
            delete container.dataset.creatingParentId;
            renderTree(campaignId);
        });
    });

    container.querySelectorAll('.save-create-scene').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('.tree-edit-form');
            const name = form.querySelector('.create-scene-name').value.trim();
            const desc = form.querySelector('.create-scene-desc').value.trim();
            const beat = form.querySelector('.create-scene-beat').value;
            const arcId = btn.dataset.arc;
            const chapterId = btn.dataset.chapter;
            if (!name) return alert('Название обязательно.');
            addScene(campaignId, arcId, chapterId, { name, description: desc, beatType: beat });
            delete container.dataset.creatingType;
            delete container.dataset.creatingParentId;
            renderTree(campaignId);
        });
    });

    // ---- Удаление ----
    container.querySelectorAll('.delete-arc').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить арку и все её главы и сцены?')) {
                deleteArc(campaignId, btn.dataset.arc);
                renderTree(campaignId);
            }
        });
    });

    container.querySelectorAll('.delete-chapter').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить главу и все её сцены?')) {
                deleteChapter(campaignId, btn.dataset.arc, btn.dataset.chapter);
                renderTree(campaignId);
            }
        });
    });

    container.querySelectorAll('.delete-scene').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить сцену?')) {
                deleteScene(campaignId, btn.dataset.arc, btn.dataset.chapter, btn.dataset.scene);
                renderTree(campaignId);
            }
        });
    });

    // ---- Дублирование сцены ----
    container.querySelectorAll('.duplicate-scene-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const { campaign, arc, chapter, scene } = btn.dataset;
            duplicateScene(campaign, arc, chapter, scene);
            renderTree(campaignId);
        });
    });

    // ---- Экспорт сцены ----
    container.querySelectorAll('.export-scene-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const { campaign, arc, chapter, scene } = btn.dataset;
            const json = exportScene(campaign, arc, chapter, scene);
            if (json) {
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scene_${scene}_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    });

    // ---- Перемещение сцены вверх/вниз ----
    container.querySelectorAll('.move-scene-up, .move-scene-down').forEach(btn => {
        btn.addEventListener('click', () => {
            const { campaign, arc, chapter, scene, index } = btn.dataset;
            const direction = btn.classList.contains('move-scene-up') ? -1 : 1;
            const campaignObj = getCampaign(campaign);
            if (!campaignObj) return;
            const arcObj = campaignObj.arcs.find(a => a.id === arc);
            if (!arcObj) return;
            const chapterObj = arcObj.chapters.find(ch => ch.id === chapter);
            if (!chapterObj) return;
            const scenes = chapterObj.scenes;
            const currentIndex = scenes.findIndex(s => s.id === scene);
            if (currentIndex === -1) return;
            const newIndex = currentIndex + direction;
            if (newIndex < 0 || newIndex >= scenes.length) return;
            // меняем местами
            [scenes[currentIndex], scenes[newIndex]] = [scenes[newIndex], scenes[currentIndex]];
            // обновляем порядок
            scenes.forEach((s, i) => s.order = i);
            // сохраняем
            const data = loadStoryData();
            saveStoryData(data);
            renderTree(campaignId);
        });
    });

    // ---- Перемещение сцены в другую главу ----
    container.querySelectorAll('.move-scene-to-chapter').forEach(btn => {
        btn.addEventListener('click', () => {
            const { campaign, arc, chapter, scene } = btn.dataset;
            const select = btn.closest('.tree-item-header').querySelector('.move-scene-chapter');
            const targetChapterId = select.value;
            if (targetChapterId === chapter) {
                alert('Сцена уже в этой главе.');
                return;
            }
            const data = loadStoryData();
            const camp = data.campaigns.find(c => c.id === campaign);
            if (!camp) return;
            const srcArc = camp.arcs.find(a => a.id === arc);
            const srcChapter = srcArc?.chapters.find(ch => ch.id === chapter);
            const targetChapter = camp.arcs.flatMap(a => a.chapters).find(ch => ch.id === targetChapterId);
            if (!srcChapter || !targetChapter) {
                alert('Ошибка: не найдена целевая глава.');
                return;
            }
            const sceneIndex = srcChapter.scenes.findIndex(s => s.id === scene);
            if (sceneIndex === -1) return;
            const [movedScene] = srcChapter.scenes.splice(sceneIndex, 1);
            targetChapter.scenes.push(movedScene);
            // перенумеровываем порядок в обеих главах
            srcChapter.scenes.forEach((s, i) => s.order = i);
            targetChapter.scenes.forEach((s, i) => s.order = i);
            saveStoryData(data);
            renderTree(campaignId);
        });
    });
}

// ===== Обновление селектов кампаний =====
export function refreshCampaignSelects() {
    const campaigns = getCampaigns();
    const selects = document.querySelectorAll('#storyBoardCampaignSelect, #storyTreeCampaignSelect, #storyTimelineCampaignSelect');
    selects.forEach(sel => {
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">— выберите кампанию —</option>';
        campaigns.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });
        if (currentVal && campaigns.some(c => c.id === currentVal)) sel.value = currentVal;
    });
}