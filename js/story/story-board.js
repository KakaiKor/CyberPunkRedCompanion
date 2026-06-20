// js/story/story-board.js

import { getCampaign, getCampaigns } from './story-manager.js';
import { renderTree, switchStorySubTab } from './story-ui.js';

let network = null;
let currentCampaignId = null;

export function renderBoard(campaignId) {
    const container = document.getElementById('storyBoardCanvas');
    if (!container) return;

    const campaign = getCampaign(campaignId);
    if (!campaign) {
        container.innerHTML = `<p class="note">Кампания не найдена.</p>`;
        return;
    }

    currentCampaignId = campaignId;

    if (network) {
        updateNetworkData(campaign);
    } else {
        createNetwork(container, campaign);
    }
}

function createNetwork(container, campaign) {
    const { nodes, edges } = buildGraphData(campaign);

    const options = {
        nodes: {
            shape: 'box',
            margin: 10,
            font: { color: '#f0e6d3', size: 14, face: 'Orbitron, sans-serif' },
            borderWidth: 2,
            shadow: true,
            widthConstraint: { maximum: 200 }
        },
        edges: {
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            color: { color: '#2a3342', highlight: '#f0c040' },
            smooth: { type: 'cubicBezier', roundness: 0.2 }
        },
        physics: {
            enabled: true,
            stabilization: { iterations: 100 },
            barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 150, springConstant: 0.04, damping: 0.09 }
        },
        interaction: { dragNodes: true, dragView: true, zoomView: true, hover: true, tooltipDelay: 300 },
        layout: { improvedLayout: true, hierarchical: { enabled: true, levelSeparation: 150, nodeSpacing: 100, treeSpacing: 200, direction: 'UD', sortMethod: 'directed' } }
    };

    network = new vis.Network(container, { nodes, edges }, options);

    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            if (node && node.data) {
                showSceneInfoModal(node.data);
            }
        }
    });

    network.on('doubleClick', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            if (node && node.data) {
                switchStorySubTab('story-tree');
                const treeSelect = document.getElementById('storyTreeCampaignSelect');
                if (treeSelect) {
                    treeSelect.value = currentCampaignId;
                    treeSelect.dispatchEvent(new Event('change'));
                    setTimeout(() => {
                        const container = document.getElementById('storyTreeContainer');
                        if (container) {
                            const data = node.data;
                            const id = data.type === 'scene' ? `scene_${data.id}` :
                                       data.type === 'chapter' ? `chapter_${data.id}` :
                                       `arc_${data.id}`;
                            container.dataset.editingId = id;
                            renderTree(currentCampaignId);
                        }
                    }, 100);
                }
            }
        }
    });

    addBoardControls(container);
}

function updateNetworkData(campaign) {
    if (!network) return;
    const { nodes, edges } = buildGraphData(campaign);
    network.setData({ nodes, edges });
    network.setOptions({ physics: { enabled: true, stabilization: { iterations: 50 } } });
}

function buildGraphData(campaign) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    const arcs = campaign.arcs || [];
    arcs.forEach(arc => {
        const arcId = `arc_${arc.id}`;
        nodes.push({
            id: arcId,
            label: `📁 ${arc.name}`,
            data: { type: 'arc', id: arc.id, campaignId: campaign.id },
            color: { background: '#1a2332', border: '#f0c040' },
            shape: 'box',
            title: `Арка: ${arc.name}\nСтатус: ${arc.status || 'draft'}\nГлав: ${(arc.chapters || []).length}`
        });
        nodeMap.set(arc.id, { id: arcId, type: 'arc' });

        const chapters = arc.chapters || [];
        chapters.forEach(chapter => {
            const chapterId = `chapter_${chapter.id}`;
            nodes.push({
                id: chapterId,
                label: `📄 ${chapter.name}`,
                data: { type: 'chapter', id: chapter.id, arcId: arc.id, campaignId: campaign.id },
                color: { background: '#2a1a33', border: '#a070c0' },
                shape: 'box',
                title: `Глава: ${chapter.name}\nСтатус: ${chapter.status || 'draft'}\nСцен: ${(chapter.scenes || []).length}`
            });
            nodeMap.set(chapter.id, { id: chapterId, type: 'chapter' });

            edges.push({ from: arcId, to: chapterId, arrows: 'to', color: { color: '#2a3342' } });

            const scenes = chapter.scenes || [];
            scenes.forEach(scene => {
                const sceneId = `scene_${scene.id}`;
                const beatLabels = {
                    hook: '🔴 Крюк',
                    development: '🟡 Развитие',
                    cliffhanger: '🔵 Клиффхэнгер',
                    climax: '🟣 Кульминация',
                    resolution: '🟢 Развязка'
                };
                const beatLabel = scene.beatType ? beatLabels[scene.beatType] || scene.beatType : '';
                const statusColors = {
                    draft: '#6b7b8d',
                    active: '#f0c040',
                    completed: '#4caf50',
                    failed: '#f44336',
                    hidden: '#555'
                };
                const statusColor = statusColors[scene.status] || '#6b7b8d';

                nodes.push({
                    id: sceneId,
                    label: `🎬 ${scene.name}`,
                    data: { type: 'scene', id: scene.id, chapterId: chapter.id, arcId: arc.id, campaignId: campaign.id },
                    color: { background: '#1a2a1a', border: statusColor },
                    shape: 'box',
                    title: `Сцена: ${scene.name}\nТип: ${scene.beatType || 'development'}\nСтатус: ${scene.status || 'draft'}\nУчастников: ${(scene.participants || []).length}`
                });
                nodeMap.set(scene.id, { id: sceneId, type: 'scene' });

                edges.push({ from: chapterId, to: sceneId, arrows: 'to', color: { color: '#2a3342' } });

                if (scene.prerequisites && scene.prerequisites.length > 0) {
                    scene.prerequisites.forEach(prereqId => {
                        const prereqNode = nodeMap.get(prereqId);
                        if (prereqNode && prereqNode.type === 'scene') {
                            edges.push({
                                from: `scene_${prereqId}`,
                                to: sceneId,
                                arrows: 'to',
                                color: { color: '#f0c040' },
                                dashes: true,
                                label: 'требует'
                            });
                        }
                    });
                }

                if (scene.unlocks && scene.unlocks.length > 0) {
                    scene.unlocks.forEach(unlockId => {
                        const unlockNode = nodeMap.get(unlockId);
                        if (unlockNode && unlockNode.type === 'scene') {
                            edges.push({
                                from: sceneId,
                                to: `scene_${unlockId}`,
                                arrows: 'to',
                                color: { color: '#4caf50' },
                                dashes: true,
                                label: 'открывает'
                            });
                        }
                    });
                }
            });
        });
    });

    return { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
}

function addBoardControls(container) {
    let controls = container.parentElement.querySelector('.board-controls');
    if (!controls) {
        controls = document.createElement('div');
        controls.className = 'board-controls';
        controls.style.cssText = `
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            background: rgba(13, 17, 23, 0.9);
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid #2a3342;
            z-index: 10;
        `;
        controls.innerHTML = `
            <button class="cyber-btn small" id="boardZoomIn">🔍+</button>
            <button class="cyber-btn small" id="boardZoomOut">🔍−</button>
            <button class="cyber-btn small" id="boardFit">⊡ Вписать</button>
            <button class="cyber-btn small" id="boardRefresh">🔄 Обновить</button>
        `;
        container.parentElement.style.position = 'relative';
        container.parentElement.appendChild(controls);

        controls.querySelector('#boardZoomIn').addEventListener('click', () => {
            if (network) {
                const scale = network.getScale();
                network.moveTo({ scale: scale * 1.2 });
            }
        });
        controls.querySelector('#boardZoomOut').addEventListener('click', () => {
            if (network) {
                const scale = network.getScale();
                network.moveTo({ scale: scale / 1.2 });
            }
        });
        controls.querySelector('#boardFit').addEventListener('click', () => {
            if (network) network.fit();
        });
        controls.querySelector('#boardRefresh').addEventListener('click', () => {
            if (currentCampaignId) renderBoard(currentCampaignId);
        });
    }
}

// ===== Модальное окно для просмотра сцены =====
function showSceneInfoModal(data) {
    const campaign = getCampaign(data.campaignId);
    if (!campaign) return;

    let scene = null, arc = null, chapter = null;
    if (data.type === 'scene') {
        campaign.arcs.forEach(a => {
            a.chapters.forEach(ch => {
                ch.scenes.forEach(s => {
                    if (s.id === data.id) {
                        scene = s;
                        arc = a;
                        chapter = ch;
                    }
                });
            });
        });
    }

    if (!scene) {
        alert('Сцена не найдена.');
        return;
    }

    let modal = document.getElementById('storySceneModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'storySceneModal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <span class="modal-title">🎬 Сцена</span>
                    <button class="modal-close" id="closeSceneModalBtn">&times;</button>
                </div>
                <div class="modal-body" id="sceneModalBody"></div>
                <div class="modal-footer">
                    <button class="cyber-btn small" id="editSceneFromModalBtn">✏️ Редактировать</button>
                    <button class="modal-close-btn" id="closeSceneModalFooterBtn">Закрыть</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('closeSceneModalBtn').addEventListener('click', () => modal.style.display = 'none');
        document.getElementById('closeSceneModalFooterBtn').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

        document.getElementById('editSceneFromModalBtn').addEventListener('click', () => {
            const sceneId = modal.dataset.sceneId;
            const campaignId = modal.dataset.campaignId;
            modal.style.display = 'none';
            switchStorySubTab('story-tree');
            const treeSelect = document.getElementById('storyTreeCampaignSelect');
            if (treeSelect) {
                treeSelect.value = campaignId;
                treeSelect.dispatchEvent(new Event('change'));
                setTimeout(() => {
                    const container = document.getElementById('storyTreeContainer');
                    if (container) {
                        container.dataset.editingId = `scene_${sceneId}`;
                        renderTree(campaignId);
                    }
                }, 100);
            }
        });
    }

    fillSceneModal(modal, scene, arc, chapter, data.campaignId);
}

function fillSceneModal(modal, scene, arc, chapter, campaignId) {
    const body = document.getElementById('sceneModalBody');
    body.innerHTML = `
        <h4>${escapeHtml(scene.name)}</h4>
        <p><strong>Тип бита:</strong> ${scene.beatType || 'development'}</p>
        <p><strong>Статус:</strong> ${scene.status || 'draft'}</p>
        <p><strong>Описание:</strong> ${escapeHtml(scene.description || '—')}</p>
        <p><strong>Арка:</strong> ${escapeHtml(arc.name)} → <strong>Глава:</strong> ${escapeHtml(chapter.name)}</p>
        <p><strong>Участники (ID):</strong> ${(scene.participants || []).join(', ') || '—'}</p>
        <p><strong>Локация:</strong> ${escapeHtml(scene.location || '—')}</p>
        <p><strong>Архитектура сети:</strong> ${escapeHtml(scene.netArchitectureId || '—')}</p>
        <p><strong>Шаблон встречи:</strong> ${escapeHtml(scene.encounterTemplate || '—')}</p>
        <p><strong>Предыдущие сцены:</strong> ${(scene.prerequisites || []).join(', ') || '—'}</p>
        <p><strong>Открывает сцены:</strong> ${(scene.unlocks || []).join(', ') || '—'}</p>
        <p><strong>Ветвления:</strong> ${scene.choices ? JSON.stringify(scene.choices) : '—'}</p>
        ${scene.gmNotes ? `<p><strong>Заметки GM:</strong> ${escapeHtml(scene.gmNotes)}</p>` : ''}
    `;
    modal.dataset.sceneId = scene.id;
    modal.dataset.campaignId = campaignId;
    modal.style.display = 'flex';
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function clearBoard() {
    if (network) {
        network.destroy();
        network = null;
    }
    const container = document.getElementById('storyBoardCanvas');
    if (container) {
        container.innerHTML = '<p class="note">Доска не инициализирована. Выберите кампанию.</p>';
    }
    currentCampaignId = null;
}