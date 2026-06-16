// js/story/story-editor.js

import { addArc, addChapter, addScene, updateArc, updateChapter, updateScene, deleteArc, deleteChapter, deleteScene } from './story-manager.js';
import { renderTree } from './story-ui.js';

/**
 * Открывает редактор арки.
 */
export function openArcEditor(campaignId, arcData = null) {
    const isEdit = !!arcData;
    const name = prompt(isEdit ? 'Редактировать название арки:' : 'Название новой арки:', isEdit ? arcData.name : '');
    if (name === null) return; // отмена
    const desc = prompt('Описание (необязательно):', isEdit ? arcData.description : '');
    if (isEdit) {
        updateArc(campaignId, arcData.id, { name: name.trim() || arcData.name, description: desc });
    } else {
        addArc(campaignId, { name: name.trim() || 'Новая арка', description: desc || '' });
    }
    renderTree(campaignId);
}

/**
 * Открывает редактор главы.
 */
export function openChapterEditor(campaignId, arcId, chapterData = null) {
    const isEdit = !!chapterData;
    const name = prompt(isEdit ? 'Редактировать название главы:' : 'Название новой главы:', isEdit ? chapterData.name : '');
    if (name === null) return;
    const desc = prompt('Описание (необязательно):', isEdit ? chapterData.description : '');
    if (isEdit) {
        updateChapter(campaignId, arcId, chapterData.id, { name: name.trim() || chapterData.name, description: desc });
    } else {
        addChapter(campaignId, arcId, { name: name.trim() || 'Новая глава', description: desc || '' });
    }
    renderTree(campaignId);
}

/**
 * Открывает редактор сцены.
 */
export function openSceneEditor(campaignId, arcId, chapterId, sceneData = null) {
    const isEdit = !!sceneData;
    const name = prompt(isEdit ? 'Редактировать название сцены:' : 'Название новой сцены:', isEdit ? sceneData.name : '');
    if (name === null) return;
    // Тип бита (выбор из списка)
    const beatTypes = ['hook', 'development', 'cliffhanger', 'climax', 'resolution'];
    const currentBeat = isEdit ? sceneData.beatType : 'development';
    const beatChoice = prompt(`Тип бита (${beatTypes.join(', ')}):`, currentBeat);
    const beatType = beatChoice && beatTypes.includes(beatChoice) ? beatChoice : 'development';
    const desc = prompt('Описание сцены (необязательно):', isEdit ? sceneData.description : '');
    const gmNotes = prompt('Заметки для GM (необязательно):', isEdit ? sceneData.gmNotes : '');
    const status = prompt('Статус (draft/active/completed/failed/hidden):', isEdit ? sceneData.status : 'draft');

    if (isEdit) {
        updateScene(campaignId, arcId, chapterId, sceneData.id, {
            name: name.trim() || sceneData.name,
            beatType: beatType,
            description: desc || '',
            gmNotes: gmNotes || '',
            status: status || 'draft'
        });
    } else {
        addScene(campaignId, arcId, chapterId, {
            name: name.trim() || 'Новая сцена',
            beatType: beatType,
            description: desc || '',
            gmNotes: gmNotes || '',
            status: status || 'draft'
        });
    }
    renderTree(campaignId);
}