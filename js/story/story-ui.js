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
    deleteScene
} from './story-manager.js';

// Импортируем функции доски (они будут использоваться в переключении вкладок)
import { renderBoard, clearBoard } from './story-board.js';

/**
 * Рендерит список кампаний.
 * Поддерживает inline-редактирование и форму создания.
 */
export function renderCampaignList() {
    const container = document.getElementById('storyCampaignList');
    if (!container) return;

    const campaigns = getCampaigns();
    const editingId = container.dataset.editingCampaignId || null;
    const showCreateForm = container.dataset.showCreateForm === 'true';

    let html = `<div class="campaign-grid">`;

    // --- Форма создания новой кампании ---
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

    // --- Существующие кампании ---
    campaigns.forEach(c => {
        const isEditing = (editingId === c.id);
        const statusLabel = c.status === 'active' ? '🟢 Активна' :
                            c.status === 'completed' ? '✅ Завершена' :
                            c.status === 'archived' ? '📦 Архив' : '📝 Черновик';

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
                    <h4>${c.name}</h4>
                    <span class="campaign-status">${statusLabel}</span>
                </div>
                <p class="campaign-desc">${c.description || 'Нет описания'}</p>
                <div class="campaign-meta">
                    <span>Арки: ${(c.arcs || []).length}</span>
                    <span>Обновлена: ${new Date(c.updatedAt).toLocaleDateString()}</span>
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

    // --- Обработчики для формы создания кампании ---
    container.querySelectorAll('.save-create-campaign').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('.campaign-create-form');
            const name = form.querySelector('.create-camp-name').value.trim();
            const desc = form.querySelector('.create-camp-desc').value.trim();
            const status = form.querySelector('.create-camp-status').value;
            if (!name) return alert('Название обязательно.');
            import('./story-manager.js').then(module => {
                module.createCampaign(name, desc);
                // Обновляем статус, если нужно
                const campaigns = module.getCampaigns();
                const created = campaigns.find(c => c.name === name && c.description === desc);
                if (created && status) {
                    module.updateCampaign(created.id, { status });
                }
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

    // --- Обработчики для редактирования кампании ---
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

// ===== Дерево с поддержкой inline-создания =====

export function renderTree(campaignId) {
    const container = document.getElementById('storyTreeContainer');
    if (!container) return;

    const campaign = getCampaign(campaignId);
    if (!campaign) {
        container.innerHTML = `<p class="note">Кампания не найдена.</p>`;
        return;
    }

    const editingId = container.dataset.editingId || null;
    const creatingType = container.dataset.creatingType || null; // 'arc', 'chapter', 'scene'
    const creatingParentId = container.dataset.creatingParentId || null; // arcId или chapterId

    if (!campaign.arcs || campaign.arcs.length === 0) {
        // Если нет арок, показываем кнопку "Добавить арку" и форму создания, если активна
        let html = `<div class="tree-empty">`;
        if (creatingType === 'arc') {
            html += renderCreateArcForm(campaignId);
        } else {
            html += `<p>В кампании нет арок. Создайте первую арку.</p>
                     <button class="cyber-btn small create-arc-btn" data-campaign="${campaignId}">➕ Добавить арку</button>`;
        }
        html += `</div>`;
        container.innerHTML = html;
        bindTreeEvents(campaignId);
        return;
    }

    let html = `<div class="tree-container">`;
    campaign.arcs.forEach(arc => {
        const isEditingArc = (editingId === `arc_${arc.id}`);
        html += `<div class="tree-arc">`;

        // Арка
        if (isEditingArc) {
            html += renderEditArcForm(campaignId, arc);
        } else {
            html += `<div class="tree-item-header">
                        <span class="tree-item-name">📁 ${arc.name}</span>
                        <span class="tree-item-status">${arc.status || 'draft'}</span>
                        <div class="tree-item-actions">
                            <button class="cyber-btn small edit-arc" data-campaign="${campaignId}" data-arc="${arc.id}">✏️</button>
                            <button class="cyber-btn small delete-arc" data-campaign="${campaignId}" data-arc="${arc.id}">🗑️</button>
                            <button class="cyber-btn small create-chapter-btn" data-campaign="${campaignId}" data-arc="${arc.id}">➕ Глава</button>
                        </div>
                    </div>`;
        }

        // Главы
        if (arc.chapters && arc.chapters.length > 0) {
            html += `<div class="tree-chapters" style="padding-left:20px;">`;
            arc.chapters.forEach(chapter => {
                const isEditingChapter = (editingId === `chapter_${chapter.id}`);
                html += `<div class="tree-chapter">`;

                if (isEditingChapter) {
                    html += renderEditChapterForm(campaignId, arc.id, chapter);
                } else {
                    html += `<div class="tree-item-header">
                                <span class="tree-item-name">📄 ${chapter.name}</span>
                                <span class="tree-item-status">${chapter.status || 'draft'}</span>
                                <div class="tree-item-actions">
                                    <button class="cyber-btn small edit-chapter" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}">✏️</button>
                                    <button class="cyber-btn small delete-chapter" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}">🗑️</button>
                                    <button class="cyber-btn small create-scene-btn" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}">➕ Сцена</button>
                                </div>
                            </div>`;
                }

                // Сцены
                if (chapter.scenes && chapter.scenes.length > 0) {
                    html += `<div class="tree-scenes" style="padding-left:20px;">`;
                    chapter.scenes.forEach(scene => {
                        const isEditingScene = (editingId === `scene_${scene.id}`);
                        html += `<div class="tree-scene">`;
                        if (isEditingScene) {
                            html += renderEditSceneForm(campaignId, arc.id, chapter.id, scene);
                        } else {
                            const beatLabel = scene.beatType ? ` (${scene.beatType})` : '';
                            html += `<div class="tree-item-header">
                                        <span class="tree-item-name">🎬 ${scene.name}${beatLabel}</span>
                                        <span class="tree-item-status">${scene.status || 'draft'}</span>
                                        <div class="tree-item-actions">
                                            <button class="cyber-btn small edit-scene" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}">✏️</button>
                                            <button class="cyber-btn small delete-scene" data-campaign="${campaignId}" data-arc="${arc.id}" data-chapter="${chapter.id}" data-scene="${scene.id}">🗑️</button>
                                        </div>
                                    </div>`;
                        }
                        html += `</div>`;
                    });
                    html += `</div>`;
                } else {
                    // Если нет сцен, но создаём новую сцену в этой главе
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
            // Если нет глав, но создаём новую главу в этой арке
            if (creatingType === 'chapter' && creatingParentId === arc.id) {
                html += `<div style="padding-left:20px;">${renderCreateChapterForm(campaignId, arc.id)}</div>`;
            } else {
                html += `<div class="tree-empty-chapters" style="padding-left:20px; color:#8b949e; font-size:0.9rem;">Нет глав. Добавьте первую.</div>`;
            }
        }

        html += `</div>`;
    });

    // Если создаём новую арку (в корне)
    if (creatingType === 'arc') {
        html += `<div class="tree-arc">${renderCreateArcForm(campaignId)}</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Сохраняем состояние редактирования/создания
    if (editingId) container.dataset.editingId = editingId;
    else delete container.dataset.editingId;
    if (creatingType) container.dataset.creatingType = creatingType;
    else delete container.dataset.creatingType;
    if (creatingParentId) container.dataset.creatingParentId = creatingParentId;
    else delete container.dataset.creatingParentId;

    bindTreeEvents(campaignId);
}

// ===== Вспомогательные функции для рендеринга форм =====

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
        <div class="tree-edit-form">
            <input type="text" class="create-scene-name" placeholder="Название сцены *">
            <textarea class="create-scene-desc" placeholder="Описание (необязательно)"></textarea>
            <select class="create-scene-beat">
                <option value="hook">Крюк</option>
                <option value="development" selected>Развитие</option>
                <option value="cliffhanger">Клиффхэнгер</option>
                <option value="climax">Кульминация</option>
                <option value="resolution">Развязка</option>
            </select>
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
    return `
        <div class="tree-edit-form">
            <input type="text" class="edit-name" value="${escapeHtml(scene.name)}" placeholder="Название сцены">
            <textarea class="edit-desc" placeholder="Описание">${escapeHtml(scene.description || '')}</textarea>
            <select class="edit-beat">${beatOptions}</select>
            <select class="edit-status">
                <option value="draft" ${scene.status === 'draft' ? 'selected' : ''}>Черновик</option>
                <option value="active" ${scene.status === 'active' ? 'selected' : ''}>Активна</option>
                <option value="completed" ${scene.status === 'completed' ? 'selected' : ''}>Завершена</option>
                <option value="failed" ${scene.status === 'failed' ? 'selected' : ''}>Провалена</option>
                <option value="hidden" ${scene.status === 'hidden' ? 'selected' : ''}>Скрыта</option>
            </select>
            <input type="text" class="edit-participants" value="${(scene.participants || []).join(', ')}" placeholder="Участники (ID через запятую)">
            <input type="text" class="edit-location" value="${scene.location || ''}" placeholder="Локация (ID)">
            <input type="text" class="edit-net" value="${scene.netArchitectureId || ''}" placeholder="Архитектура сети (ID)">
            <input type="text" class="edit-encounter" value="${scene.encounterTemplate || ''}" placeholder="Шаблон встречи (ID)">
            <input type="text" class="edit-prereqs" value="${(scene.prerequisites || []).join(', ')}" placeholder="Предыдущие сцены (ID через запятую)">
            <input type="text" class="edit-unlocks" value="${(scene.unlocks || []).join(', ')}" placeholder="Открывает сцены (ID через запятую)">
            <textarea class="edit-choices" placeholder="Ветвления (JSON)">${JSON.stringify(scene.choices || [], null, 2)}</textarea>
            <textarea class="edit-gmnotes" placeholder="Заметки ГМ">${escapeHtml(scene.gmNotes || '')}</textarea>
            <div class="edit-actions">
                <button class="cyber-btn small save-edit" data-type="scene" data-campaign="${campaignId}" data-arc="${arcId}" data-chapter="${chapterId}" data-scene="${scene.id}">💾 Сохранить</button>
                <button class="cyber-btn small cancel-edit">❌ Отмена</button>
            </div>
        </div>
    `;
}

// ===== Привязка событий для дерева =====

function bindTreeEvents(campaignId) {
    const container = document.getElementById('storyTreeContainer');
    if (!container) return;

    // --- Кнопки редактирования ---
    container.querySelectorAll('.edit-arc, .edit-chapter, .edit-scene').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let id;
            if (btn.classList.contains('edit-arc')) id = `arc_${btn.dataset.arc}`;
            else if (btn.classList.contains('edit-chapter')) id = `chapter_${btn.dataset.chapter}`;
            else if (btn.classList.contains('edit-scene')) id = `scene_${btn.dataset.scene}`;
            container.dataset.editingId = id;
            // Очищаем создание, если оно было
            delete container.dataset.creatingType;
            delete container.dataset.creatingParentId;
            renderTree(campaignId);
        });
    });

    // --- Отмена редактирования ---
    container.querySelectorAll('.cancel-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            delete container.dataset.editingId;
            renderTree(campaignId);
        });
    });

    // --- Сохранение редактирования ---
    container.querySelectorAll('.save-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const form = btn.closest('.tree-edit-form');
            const name = form.querySelector('.edit-name').value.trim();
            const desc = form.querySelector('.edit-desc').value.trim();
            if (!name) return alert('Название не может быть пустым.');

            const patch = { name, description: desc };

            if (type === 'arc') {
                const arcId = btn.dataset.arc;
                updateArc(campaignId, arcId, patch);
                delete container.dataset.editingId;
                renderTree(campaignId);
            } else if (type === 'chapter') {
                const arcId = btn.dataset.arc;
                const chapterId = btn.dataset.chapter;
                updateChapter(campaignId, arcId, chapterId, patch);
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
                    name,
                    description: desc,
                    beatType: beat,
                    status,
                    participants,
                    location,
                    netArchitectureId: netArch,
                    encounterTemplate: encounter,
                    prerequisites: prereqs,
                    unlocks,
                    choices,
                    gmNotes
                };
                updateScene(campaignId, arcId, chapterId, sceneId, scenePatch);
                delete container.dataset.editingId;
                renderTree(campaignId);
            }
        });
    });

    // --- Кнопки создания (показывают формы) ---
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

    // --- Отмена создания ---
    container.querySelectorAll('.cancel-create').forEach(btn => {
        btn.addEventListener('click', () => {
            delete container.dataset.creatingType;
            delete container.dataset.creatingParentId;
            renderTree(campaignId);
        });
    });

    // --- Сохранение создания ---
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

    // --- Удаление ---
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
}

// ===== Вспомогательные функции =====

export function switchStorySubTab(tabId) {
    const pane = document.getElementById('tab-story');
    if (!pane) return;
    pane.querySelectorAll('.sub-pane').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    pane.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sub === tabId);
    });

    // Если переключились на доску, обновляем её
    if (tabId === 'story-board') {
        const select = document.getElementById('storyBoardCampaignSelect');
        if (select && select.value) {
            renderBoard(select.value);
        } else {
            clearBoard();
        }
    }
}

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
        if (currentVal && campaigns.some(c => c.id === currentVal)) {
            sel.value = currentVal;
        }
    });
}

// ===== Утилита экранирования =====
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}