// modules/gm/plot-builder.js
export class PlotBuilder {
    static STORAGE_KEY = 'gm_plot_nodes';

    static getNodes() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        let nodes = saved ? JSON.parse(saved) : [];
        // Нормализация: приводим к формату { id, title, description, next: [{targetId, description}] }
        nodes = nodes.map(node => {
            // Если есть поле nextIds (старый формат)
            if (node.nextIds && !node.next) {
                node.next = node.nextIds.map(targetId => ({ targetId, description: '' }));
                delete node.nextIds;
            }
            if (!node.next) node.next = [];
            // Нормализуем элементы next: если это число, превращаем в объект
            node.next = node.next.map(link => {
                if (typeof link === 'number') return { targetId: link, description: '' };
                return { targetId: link.targetId, description: link.description || '' };
            });
            return node;
        });
        return nodes;
    }

    static saveNodes(nodes) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(nodes));
    }

    static addNode(node) {
        const nodes = this.getNodes();
        const newId = Date.now();
        nodes.push({ id: newId, ...node, next: [] });
        this.saveNodes(nodes);
        this.render();
    }

    static updateNode(id, updates) {
        let nodes = this.getNodes();
        const index = nodes.findIndex(n => n.id == id);
        if (index !== -1) {
            nodes[index] = { ...nodes[index], ...updates };
            this.saveNodes(nodes);
            this.render();
        }
    }

    static deleteNode(id) {
        let nodes = this.getNodes();
        nodes = nodes.filter(n => n.id != id);
        // удаляем ссылки на этот узел из других узлов
        nodes.forEach(node => {
            node.next = node.next.filter(link => link.targetId != id);
        });
        this.saveNodes(nodes);
        this.render();
    }

    static addNextNode(parentId, targetId, description) {
        const nodes = this.getNodes();
        const parent = nodes.find(n => n.id == parentId);
        if (parent && !parent.next.some(link => link.targetId == targetId)) {
            parent.next.push({ targetId, description: description || '' });
            this.saveNodes(nodes);
            this.render();
        }
    }

    static updateNextDescription(parentId, targetId, newDescription) {
        const nodes = this.getNodes();
        const parent = nodes.find(n => n.id == parentId);
        if (parent) {
            const link = parent.next.find(l => l.targetId == targetId);
            if (link) link.description = newDescription;
            this.saveNodes(nodes);
            this.render();
        }
    }

    static removeNextNode(parentId, targetId) {
        const nodes = this.getNodes();
        const parent = nodes.find(n => n.id == parentId);
        if (parent) {
            parent.next = parent.next.filter(link => link.targetId != targetId);
            this.saveNodes(nodes);
            this.render();
        }
    }

    static render() {
        const container = document.getElementById('plotBuilderContainer');
        if (!container) return;
        const nodes = this.getNodes();
        if (nodes.length === 0) {
            container.innerHTML = '<p>Сюжет пуст. Добавьте первый узел (сцену).</p>';
            return;
        }
        let html = '<div class="plot-nodes-list">';
        nodes.forEach(node => {
            const otherNodes = nodes.filter(n => n.id !== node.id);
            // родительские узлы (откуда приходят связи)
            const parents = nodes.filter(n => n.next.some(link => link.targetId == node.id));
            const parentLinksHtml = parents.map(p => {
                const linkDesc = p.next.find(l => l.targetId == node.id)?.description || '—';
                return `<li>← из "${p.title}" (${linkDesc})</li>`;
            }).join('');

            const nextList = node.next.map(link => {
                const child = nodes.find(n => n.id == link.targetId);
                const childTitle = child ? child.title : '[удалённый узел]';
                return `
                    <li>
                        <strong>➡️ ${childTitle}</strong>
                        <div class="link-desc">${this.escapeHtml(link.description)}</div>
                        <div class="link-actions">
                            <button class="edit-link-desc" data-parent="${node.id}" data-target="${link.targetId}">✏️ описание</button>
                            <button class="remove-link" data-parent="${node.id}" data-target="${link.targetId}">🗑️ удалить</button>
                        </div>
                    </li>
                `;
            }).join('');

            const isStart = parents.length === 0;
            const isEnd = node.next.length === 0;

            html += `
                <div class="plot-node ${isStart ? 'start-node' : ''} ${isEnd ? 'end-node' : ''}" data-id="${node.id}">
                    <div class="plot-node-header">
                        <input type="text" class="plot-node-title" value="${this.escapeHtml(node.title)}" data-id="${node.id}" placeholder="Название сцены">
                        <button class="delete-node-btn" data-id="${node.id}">🗑️</button>
                    </div>
                    <textarea class="plot-node-desc" data-id="${node.id}" rows="2" placeholder="Описание сцены / заметки ГМ...">${this.escapeHtml(node.description || '')}</textarea>
                    <div class="plot-node-links">
                        <div class="incoming-links"><strong>📥 Откуда прийти:</strong> <ul>${parentLinksHtml || '<li>— это стартовый узел —</li>'}</ul></div>
                        <div class="outgoing-links"><strong>📤 Ветки (следующие события):</strong>
                            <ul>${nextList || '<li>— нет —</li>'}</ul>
                            <div class="add-link">
                                <select class="next-node-select" data-id="${node.id}">
                                    <option value="">-- выбрать узел --</option>
                                    ${otherNodes.map(n => `<option value="${n.id}">${n.title}</option>`).join('')}
                                </select>
                                <input type="text" class="link-desc-input" placeholder="Описание ветки (условие, действие...)" style="flex:2;">
                                <button class="add-link-btn" data-id="${node.id}">➕ Добавить</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

        // Обработчики
        document.querySelectorAll('.plot-node-title').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const id = parseInt(inp.dataset.id);
                this.updateNode(id, { title: inp.value });
            });
        });
        document.querySelectorAll('.plot-node-desc').forEach(ta => {
            ta.addEventListener('change', (e) => {
                const id = parseInt(ta.dataset.id);
                this.updateNode(id, { description: ta.value });
            });
        });
        document.querySelectorAll('.delete-node-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                if (confirm('Удалить узел? Все связи к нему также будут разорваны.')) {
                    this.deleteNode(id);
                }
            });
        });
        document.querySelectorAll('.add-link-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parentId = parseInt(btn.dataset.id);
                const select = btn.parentElement.querySelector('.next-node-select');
                const descInput = btn.parentElement.querySelector('.link-desc-input');
                const targetId = parseInt(select.value);
                const description = descInput.value.trim();
                if (targetId) {
                    this.addNextNode(parentId, targetId, description);
                    select.value = '';
                    descInput.value = '';
                } else {
                    alert('Выберите целевой узел');
                }
            });
        });
        document.querySelectorAll('.edit-link-desc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parentId = parseInt(btn.dataset.parent);
                const targetId = parseInt(btn.dataset.target);
                const newDesc = prompt('Введите новое описание ветки:');
                if (newDesc !== null) {
                    this.updateNextDescription(parentId, targetId, newDesc);
                }
            });
        });
        document.querySelectorAll('.remove-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parentId = parseInt(btn.dataset.parent);
                const targetId = parseInt(btn.dataset.target);
                if (confirm('Удалить эту ветку?')) {
                    this.removeNextNode(parentId, targetId);
                }
            });
        });
    }

    static exportToJSON() {
        const data = { nodes: this.getNodes(), version: '1.0' };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `plot_${new Date().toISOString().slice(0,19)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    static importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.nodes && Array.isArray(data.nodes)) {
                    this.saveNodes(data.nodes);
                    this.render();
                    alert('Сюжет импортирован!');
                } else {
                    alert('Неверный формат файла');
                }
            } catch (err) {
                alert('Ошибка чтения файла');
            }
        };
        reader.readAsText(file);
    }

    static escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
}