// modules/gm/gm-init.js
import { NPCGenerator } from './npc-generator.js';
import { AdvancedContractGenerator } from './advanced-contract-generator.js';
import { checkCyberpsychosis } from './cyberpsychosis.js';
import { generateNetArchitecture } from './net-architecture.js';
import { MookGenerator } from './mook-generator.js';
import { EncounterGenerator } from './encounter-generator.js';
import { ScreamSheetGenerator } from './scream-sheet-generator.js';  // ДОБАВИТЬ
import { PlotBuilder } from './plot-builder.js';


export function initGM() {
    // NPC
    document.getElementById('generateNpcBtn')?.addEventListener('click', () => NPCGenerator.generate());

    // Продвинутый контракт
    document.getElementById('generateAdvancedContractBtn')?.addEventListener('click', () => AdvancedContractGenerator.generate());
    document.getElementById('copyContractBtn')?.addEventListener('click', () => AdvancedContractGenerator.copyToClipboard());
    // Киберпсихоз
    document.getElementById('calcPsychoBtn')?.addEventListener('click', () => checkCyberpsychosis());
    // Архитектура сети
    document.getElementById('genNetArchBtn')?.addEventListener('click', generateNetArchitecture);
    // Мобы (пушечное мясо)
    document.getElementById('generateMooksBtn')?.addEventListener('click', () => MookGenerator.generate());
    // Случайные встречи
    document.getElementById('generateEncounterBtn')?.addEventListener('click', () => EncounterGenerator.generate());
    // Скрим листы
    document.getElementById('generateScreamSheetBtn')?.addEventListener('click', () => ScreamSheetGenerator.render());  // ДОБАВИТЬ

    const addPlotBtn = document.getElementById('addPlotNodeBtn');
    const exportPlotBtn = document.getElementById('exportPlotBtn');
    if (exportPlotBtn) {
        exportPlotBtn.addEventListener('click', () => PlotBuilder.exportToJSON());
    }
    const importPlotInput = document.getElementById('importPlotInput');
    if (importPlotInput) {
        importPlotInput.addEventListener('change', (e) => {
            if (e.target.files[0]) PlotBuilder.importFromJSON(e.target.files[0]);
        });
    }
    if (addPlotBtn) {
        addPlotBtn.addEventListener('click', () => {
            const title = document.getElementById('plotTitle').value.trim();
            const description = document.getElementById('plotDesc').value;
            if (!title) {
                alert('Введите название узла');
                return;
            }
            PlotBuilder.addNode({ title, description });
            document.getElementById('plotTitle').value = '';
            document.getElementById('plotDesc').value = '';
        });
    }
    PlotBuilder.render();
    const mookBtn = document.getElementById('generateMooksBtn');
if (mookBtn) {
    mookBtn.addEventListener('click', () => {
        // Создаём контейнер, если его нет
        let container = document.getElementById('mookResult');
        if (!container) {
            container = document.createElement('div');
            container.id = 'mookResult';
            const pane = document.getElementById('gm-mooks');
            if (pane) pane.querySelector('.card').appendChild(container);
        }
        MookGenerator.generate();
    });
}
}