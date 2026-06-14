export class TabManager {
    constructor() {
        this.initMainTabs();
        this.initSubTabs();
    }
    initMainTabs() {
        const btns = document.querySelectorAll('.main-tabs .tab-btn');
        const panes = document.querySelectorAll('.main-pane');
        btns.forEach(btn => btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            btns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetPane = document.getElementById(tabId);
            if (targetPane) targetPane.classList.add('active');
        }));
    }
    initSubTabs() {
        document.querySelectorAll('.main-pane').forEach(container => {
            const btns = container.querySelectorAll('.sub-tab-btn');
            const panes = container.querySelectorAll('.sub-pane');
            btns.forEach(btn => btn.addEventListener('click', () => {
                const targetId = btn.dataset.sub;
                const targetPane = container.querySelector(`#${targetId}`);
                if (!targetPane) {
                    console.warn(`Подпанель с id="${targetId}" не найдена в`, container);
                    return;
                }
                btns.forEach(b => b.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                targetPane.classList.add('active');
            }));
        });
    }
}