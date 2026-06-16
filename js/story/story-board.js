// js/story/story-board.js

import { getCampaign, getCampaigns } from './story-manager.js';
import { renderTree } from './story-ui.js';

let network = null;
let currentCampaignId = null;

/**
 * Инициализирует или обновляет доску для выбранной кампании.
 */
export function renderBoard(campaignId) {
    const container = document.getElementById('storyBoardCanvas');
    if (!container) return;

    const campaign = getCampaign(campaignId);
    if (!campaign) {
        container.innerHTML = `<p class="note">Кампания не найдена.</p>`;
        return;
    }

    currentCampaignId = campaignId;

    // Если сеть уже создана, обновляем данные, иначе создаём новую
    if (network) {
        updateNetworkData(campaign);
    } else {
        createNetwork(container, campaign);
    }
}

/**
 * Создаёт новую сеть vis-network.
 */
function createNetwork(container, campaign) {
    const { nodes, edges } = buildGraphData(campaign);

    const options = {
        nodes: {
            shape: 'box',
            margin: 10,
            font: {
                color: '#f0e6d3',
                size: 14,
                face: 'Orbitron, sans-serif'
            },
            borderWidth: 2,
            shadow: true,
            widthConstraint: {
                maximum: 200
            }
        },
        edges: {
            arrows: {
                to: { enabled: true, scaleFactor: 0.8 }
            },
            color: {
                color: '#2a3342',
                highlight: '#f0c040'
            },
            smooth: {
                type: 'cubicBezier',
                roundness: 0.2
            }
        },
        physics: {
            enabled: true,
            stabilization: {
                iterations: 100
            },
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 150,
                springConstant: 0.04,
                damping: 0.09
            }
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true,
            hover: true,
            tooltipDelay: 300
        },
        layout: {
            improvedLayout: true,
            hierarchical: {
                enabled: true,
                levelSeparation: 150,
                nodeSpacing: 100,
                treeSpacing: 200,
                direction: 'UD', // Up-Down
                sortMethod: 'directed'
            }
        }
    };

    network = new vis.Network(container, { nodes, edges }, options);

    // Обработчик клика по узлу
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            if (node) {
                // Открываем редактор для этого элемента
                const data = node.data;
                if (data) {
                    // Определяем тип и открываем соответствующее редактирование
                    // Для простоты пока просто показываем информацию
                    alert(`Элемент: ${node.label}\nТип: ${data.type}\nID: ${nodeId}`);
                    // В будущем здесь можно открыть inline-редактор или модалку
                }
            }
        }
    });

    // Обработчик двойного клика для открытия редактора
    network.on('doubleClick', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            if (node && node.data) {
                // Переключаемся на вкладку "Дерево" и открываем редактирование этого элемента
                // Это упрощённая версия, можно улучшить
                switchStorySubTab('story-tree');
                const treeContainer = document.getElementById('storyTreeContainer');
                if (treeContainer) {
                    treeContainer.dataset.editingId = nodeId;
                    renderTree(currentCampaignId);
                }
            }
        }
    });

    // Добавляем кнопки управления на контейнер
    addBoardControls(container);
}

/**
 * Обновляет данные существующей сети.
 */
function updateNetworkData(campaign) {
    if (!network) return;
    const { nodes, edges } = buildGraphData(campaign);
    network.setData({ nodes, edges });
    // Перенастраиваем физику для лучшего отображения
    network.setOptions({
        physics: {
            enabled: true,
            stabilization: { iterations: 50 }
        }
    });
}

/**
 * Строит граф из данных кампании.
 */
function buildGraphData(campaign) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // Добавляем все арки, главы и сцены как узлы
    const arcs = campaign.arcs || [];
    arcs.forEach(arc => {
        const arcId = `arc_${arc.id}`;
        nodes.push({
            id: arcId,
            label: `📁 ${arc.name}`,
            data: { type: 'arc', id: arc.id, campaignId: campaign.id },
            color: {
                background: '#1a2332',
                border: '#f0c040'
            },
            shape: 'box',
            title: `Арка: ${arc.name}\nСтатус: ${arc.status || 'draft'}\nГлав: ${(arc.chapters || []).length}`
        });
        nodeMap.set(arc.id, { id: arcId, type: 'arc' });

        // Добавляем главы
        const chapters = arc.chapters || [];
        chapters.forEach(chapter => {
            const chapterId = `chapter_${chapter.id}`;
            nodes.push({
                id: chapterId,
                label: `📄 ${chapter.name}`,
                data: { type: 'chapter', id: chapter.id, arcId: arc.id, campaignId: campaign.id },
                color: {
                    background: '#2a1a33',
                    border: '#a070c0'
                },
                shape: 'box',
                title: `Глава: ${chapter.name}\nСтатус: ${chapter.status || 'draft'}\nСцен: ${(chapter.scenes || []).length}`
            });
            nodeMap.set(chapter.id, { id: chapterId, type: 'chapter' });

            // Связь арка → глава
            edges.push({
                from: arcId,
                to: chapterId,
                arrows: 'to',
                color: { color: '#2a3342' }
            });

            // Добавляем сцены
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
                    color: {
                        background: '#1a2a1a',
                        border: statusColor
                    },
                    shape: 'box',
                    title: `Сцена: ${scene.name}\nТип: ${scene.beatType || 'development'}\nСтатус: ${scene.status || 'draft'}\nУчастников: ${(scene.participants || []).length}`
                });
                nodeMap.set(scene.id, { id: sceneId, type: 'scene' });

                // Связь глава → сцена
                edges.push({
                    from: chapterId,
                    to: sceneId,
                    arrows: 'to',
                    color: { color: '#2a3342' }
                });

                // Связи между сценами (если указаны)
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

                // Связи открываемых сцен
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

/**
 * Добавляет элементы управления на доску.
 */
function addBoardControls(container) {
    // Создаём панель управления, если её нет
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

        // Обработчики кнопок
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
            if (network) {
                network.fit();
            }
        });

        controls.querySelector('#boardRefresh').addEventListener('click', () => {
            if (currentCampaignId) {
                renderBoard(currentCampaignId);
            }
        });
    }
}

/**
 * Переключает вкладку (импортируем из story-ui)
 */
function switchStorySubTab(tabId) {
    // Импортируем динамически, чтобы избежать циклических зависимостей
    import('./story-ui.js').then(module => {
        module.switchStorySubTab(tabId);
    });
}

/**
 * Очищает доску.
 */
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