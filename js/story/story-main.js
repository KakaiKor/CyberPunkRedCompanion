// js/story/story-main.js

import {
    loadStoryData, saveStoryData,
    getCampaigns
} from './story-manager.js';
import {
    renderCampaignList,
    switchStorySubTab,
    refreshCampaignSelects,
    renderTree
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
    // Заполняем селект привязок
const integrationSelect = document.getElementById('storyIntegrationSceneSelect');
if (integrationSelect && campaigns.length > 0) {
    // Собираем все сцены из всех кампаний
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

    // Инициализация доски с первой кампанией
    const boardSelect = document.getElementById('storyBoardCampaignSelect');
    if (boardSelect && campaigns.length > 0) {
        boardSelect.value = campaigns[0].id;
        renderBoard(campaigns[0].id);
    } else {
        clearBoard();
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

    // Экспорт
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

    // Импорт
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
                        // Обновляем доску, если она открыта
                        const boardSelect = document.getElementById('storyBoardCampaignSelect');
                        if (boardSelect && boardSelect.value) {
                            renderBoard(boardSelect.value);
                        }
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
            if (val) {
                renderTree(val);
            } else {
                document.getElementById('storyTreeContainer').innerHTML = `<p class="note">Выберите кампанию.</p>`;
            }
        });
    }

    // Выбор кампании на доске
    const boardSelect = document.getElementById('storyBoardCampaignSelect');
    if (boardSelect) {
        boardSelect.addEventListener('change', () => {
            const val = boardSelect.value;
            if (val) {
                renderBoard(val);
            } else {
                clearBoard();
            }
        });
    }
}
// В bindStoryEvents добавить:

// --- Выбор сцены в привязках ---
const integrationSelect = document.getElementById('storyIntegrationSceneSelect');
if (integrationSelect) {
    integrationSelect.addEventListener('change', () => {
        const val = integrationSelect.value;
        if (val) {
            renderIntegration(val);
        } else {
            document.getElementById('storyIntegrationDetails').innerHTML = `<p class="note">Выберите сцену.</p>`;
        }
    });
}
export function refreshStoryUI() {
    renderCampaignList();
    refreshCampaignSelects();
    // Обновляем доску, если она открыта
    const boardSelect = document.getElementById('storyBoardCampaignSelect');
    if (boardSelect && boardSelect.value) {
        renderBoard(boardSelect.value);
    }
}