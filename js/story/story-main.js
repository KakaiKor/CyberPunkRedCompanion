// js/story/story-main.js

import {loadStoryData, saveStoryData,getCampaigns} from './story-manager.js';
import {
    renderCampaignList,
    switchStorySubTab,
    refreshCampaignSelects,
    renderTree,
    renderTimeline
} from './story-ui.js';
import { renderBoard, clearBoard } from './story-board.js';

export function initStoryModule() {
    console.log('📜 Инициализация Story Master...');
    renderCampaignList();
    refreshCampaignSelects();
    bindStoryEvents();
    switchStorySubTab('story-campaigns');

    const campaigns = getCampaigns();
    const treeSelect = document.getElementById('storyTreeCampaignSelect');
    if (treeSelect && campaigns.length > 0) {
        treeSelect.value = campaigns[0].id;
        renderTree(campaigns[0].id);
    }

    const integrationSelect = document.getElementById('storyIntegrationSceneSelect');
    if (integrationSelect && campaigns.length > 0) {
        const allScenes = [];
        campaigns.forEach(c => {
            c.arcs.forEach(a => {
                a.chapters.forEach(ch => {
                    ch.scenes.forEach(s => {
                        allScenes.push({ id: s.id, name: s.name, campaign: c.name });
                    });
                });
            });
        });
        integrationSelect.innerHTML = '<option value="">— выберите сцену —</option>';
        allScenes.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} (${s.campaign})`;
            integrationSelect.appendChild(opt);
        });
    }

    const boardSelect = document.getElementById('storyBoardCampaignSelect');
    if (boardSelect && campaigns.length > 0) {
        boardSelect.value = campaigns[0].id;
        renderBoard(campaigns[0].id);
    } else {
        clearBoard();
    }

    const timelineSelect = document.getElementById('storyTimelineCampaignSelect');
    if (timelineSelect && campaigns.length > 0) {
        timelineSelect.value = campaigns[0].id;
        renderTimeline(campaigns[0].id);
    }

    // Фильтры дерева
    const treeSearch = document.getElementById('storyTreeSearch');
    const treeStatus = document.getElementById('storyTreeStatusFilter');
    if (treeSearch) {
        treeSearch.addEventListener('input', () => {
            const select = document.getElementById('storyTreeCampaignSelect');
            if (select && select.value) renderTree(select.value);
        });
    }
    if (treeStatus) {
        treeStatus.addEventListener('change', () => {
            const select = document.getElementById('storyTreeCampaignSelect');
            if (select && select.value) renderTree(select.value);
        });
    }

    // Импорт сцены
    const importSceneBtn = document.getElementById('storyImportSceneBtn');
    const importSceneInput = document.getElementById('storyImportSceneInput');
    if (importSceneBtn && importSceneInput) {
        importSceneBtn.addEventListener('click', () => importSceneInput.click());
        importSceneInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const imported = JSON.parse(ev.target.result);
                    if (imported.id && imported.name) {
                        const campaignId = prompt('Введите ID кампании (или оставьте пустым для первой):') || (getCampaigns()[0]?.id);
                        if (!campaignId) { alert('Нет доступных кампаний.'); return; }
                        const arcId = prompt('Введите ID арки:');
                        const chapterId = prompt('Введите ID главы:');
                        if (!arcId || !chapterId) { alert('Импорт отменён.'); return; }
                        import('./story-manager.js').then(module => {
                            const result = module.importScene(campaignId, arcId, chapterId, imported);
                            if (result) {
                                alert('Сцена импортирована!');
                                const select = document.getElementById('storyTreeCampaignSelect');
                                if (select) { select.value = campaignId; renderTree(campaignId); }
                                refreshCampaignSelects();
                            } else {
                                alert('Ошибка импорта сцены.');
                            }
                        });
                    } else {
                        alert('Неверный формат файла сцены.');
                    }
                } catch (err) {
                    alert('Ошибка чтения файла: ' + err.message);
                }
                importSceneInput.value = '';
            };
            reader.readAsText(file);
        });
    }
}

function bindStoryEvents() {
    // Переключение подвкладок
    document.querySelectorAll('#tab-story .sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subId = btn.dataset.sub;
            if (subId) switchStorySubTab(subId);
        });
    });

    // Новая кампания
    const newBtn = document.getElementById('storyNewCampaignBtn');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            const container = document.getElementById('storyCampaignList');
            if (container) {
                container.dataset.showCreateForm = 'true';
                renderCampaignList();
            }
        });
    }

    // Экспорт всех
    const exportBtn = document.getElementById('storyExportAllBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = loadStoryData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `story_backup_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Импорт всех
    const importBtn = document.getElementById('storyImportAllBtn');
    const fileInput = document.getElementById('storyImportFileInput');
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const imported = JSON.parse(ev.target.result);
                    if (imported.campaigns && Array.isArray(imported.campaigns)) {
                        saveStoryData(imported);
                        renderCampaignList();
                        refreshCampaignSelects();
                        const boardSelect = document.getElementById('storyBoardCampaignSelect');
                        if (boardSelect && boardSelect.value) renderBoard(boardSelect.value);
                        alert('✅ Данные импортированы успешно!');
                    } else {
                        alert('❌ Неверный формат файла: отсутствует поле campaigns.');
                    }
                } catch (err) {
                    alert('❌ Ошибка при чтении файла: ' + err.message);
                }
            };
            reader.readAsText(file);
            fileInput.value = '';
        });
    }

    // Выбор кампании в дереве
    const treeSelect = document.getElementById('storyTreeCampaignSelect');
    if (treeSelect) {
        treeSelect.addEventListener('change', () => {
            const val = treeSelect.value;
            if (val) renderTree(val);
            else document.getElementById('storyTreeContainer').innerHTML = `<p class="note">Выберите кампанию.</p>`;
        });
    }

    // Выбор кампании на доске
    const boardSelect = document.getElementById('storyBoardCampaignSelect');
    if (boardSelect) {
        boardSelect.addEventListener('change', () => {
            const val = boardSelect.value;
            if (val) renderBoard(val);
            else clearBoard();
        });
    }

    // Выбор кампании в таймлайне
    const timelineSelect = document.getElementById('storyTimelineCampaignSelect');
    if (timelineSelect) {
        timelineSelect.addEventListener('change', () => {
            const val = timelineSelect.value;
            if (val) renderTimeline(val);
            else document.getElementById('storyTimelineContainer').innerHTML = `<p class="note">Выберите кампанию.</p>`;
        });
    }

    // Привязки (интеграция)
    const integrationSelect = document.getElementById('storyIntegrationSceneSelect');
    if (integrationSelect) {
        integrationSelect.addEventListener('change', () => {
            const val = integrationSelect.value;
            if (val) {
                // Логика отображения деталей сцены в привязках
                const details = document.getElementById('storyIntegrationDetails');
                if (details) {
                    const campaigns = getCampaigns();
                    let found = null;
                    campaigns.forEach(c => {
                        c.arcs.forEach(a => {
                            a.chapters.forEach(ch => {
                                ch.scenes.forEach(s => {
                                    if (s.id === val) found = { scene: s, arc: a, chapter: ch, campaign: c };
                                });
                            });
                        });
                    });
                    if (found) {
                        const s = found.scene;
                        details.innerHTML = `
                            <div class="card" style="margin-top:10px;">
                                <h4>${escapeHtml(s.name)}</h4>
                                <p><strong>Кампания:</strong> ${escapeHtml(found.campaign.name)}</p>
                                <p><strong>Арка:</strong> ${escapeHtml(found.arc.name)}</p>
                                <p><strong>Глава:</strong> ${escapeHtml(found.chapter.name)}</p>
                                <p><strong>Тип:</strong> ${s.beatType || 'development'}</p>
                                <p><strong>Статус:</strong> ${s.status || 'draft'}</p>
                                <p><strong>Описание:</strong> ${escapeHtml(s.description || '—')}</p>
                                <p><strong>Участники:</strong> ${(s.participants || []).join(', ') || '—'}</p>
                                <p><strong>Локация:</strong> ${escapeHtml(s.location || '—')}</p>
                                <p><strong>Архитектура сети:</strong> ${escapeHtml(s.netArchitectureId || '—')}</p>
                                <p><strong>Шаблон встречи:</strong> ${escapeHtml(s.encounterTemplate || '—')}</p>
                                <p><strong>Предыдущие сцены:</strong> ${(s.prerequisites || []).join(', ') || '—'}</p>
                                <p><strong>Открывает:</strong> ${(s.unlocks || []).join(', ') || '—'}</p>
                                ${s.gmNotes ? `<p><strong>Заметки GM:</strong> ${escapeHtml(s.gmNotes)}</p>` : ''}
                            </div>
                        `;
                    } else {
                        details.innerHTML = `<p class="note">Сцена не найдена.</p>`;
                    }
                }
            } else {
                document.getElementById('storyIntegrationDetails').innerHTML = `<p class="note">Выберите сцену.</p>`;
            }
        });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function refreshStoryUI() {
    renderCampaignList();
    refreshCampaignSelects();
    const boardSelect = document.getElementById('storyBoardCampaignSelect');
    if (boardSelect && boardSelect.value) renderBoard(boardSelect.value);
    const timelineSelect = document.getElementById('storyTimelineCampaignSelect');
    if (timelineSelect && timelineSelect.value) renderTimeline(timelineSelect.value);
}