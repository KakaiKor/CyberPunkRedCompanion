// js/story/story-manager.js

const STORAGE_KEY = 'gm_story_data';
const DEFAULT_DATA = { campaigns: [] };

export function loadStoryData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
        const data = JSON.parse(raw);
        if (!data.campaigns) data.campaigns = [];
        return data;
    } catch (e) {
        console.warn('Ошибка загрузки данных сценария:', e);
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
}

export function saveStoryData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCampaigns() {
    return loadStoryData().campaigns || [];
}

export function getCampaign(id) {
    return getCampaigns().find(c => c.id === id) || null;
}

export function createCampaign(name, description = '') {
    const data = loadStoryData();
    const newCampaign = {
        id: 'camp_' + Date.now(),
        name: name.trim() || 'Безымянная кампания',
        description: description.trim(),
        status: 'draft',
        arcs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    data.campaigns.push(newCampaign);
    saveStoryData(data);
    return newCampaign;
}

export function updateCampaign(id, patch) {
    const data = loadStoryData();
    const index = data.campaigns.findIndex(c => c.id === id);
    if (index === -1) return null;
    data.campaigns[index] = { ...data.campaigns[index], ...patch, updatedAt: new Date().toISOString() };
    saveStoryData(data);
    return data.campaigns[index];
}

export function deleteCampaign(id) {
    const data = loadStoryData();
    data.campaigns = data.campaigns.filter(c => c.id !== id);
    saveStoryData(data);
}

// ===== Арки =====
export function addArc(campaignId, arcData) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;
    const newArc = {
        id: 'arc_' + Date.now(),
        name: arcData.name || 'Новая арка',
        description: arcData.description || '',
        status: arcData.status || 'draft',
        chapters: []
    };
    campaign.arcs.push(newArc);
    saveStoryData(data);
    return newArc;
}

export function updateArc(campaignId, arcId, patch) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;
    const arc = campaign.arcs.find(a => a.id === arcId);
    if (!arc) return null;
    Object.assign(arc, patch);
    saveStoryData(data);
    return arc;
}

export function deleteArc(campaignId, arcId) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    campaign.arcs = campaign.arcs.filter(a => a.id !== arcId);
    saveStoryData(data);
}

// ===== Главы =====
export function addChapter(campaignId, arcId, chapterData) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;
    const arc = campaign.arcs.find(a => a.id === arcId);
    if (!arc) return null;
    const newChapter = {
        id: 'ch_' + Date.now(),
        name: chapterData.name || 'Новая глава',
        description: chapterData.description || '',
        status: chapterData.status || 'draft',
        scenes: []
    };
    arc.chapters.push(newChapter);
    saveStoryData(data);
    return newChapter;
}

export function updateChapter(campaignId, arcId, chapterId, patch) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;
    const arc = campaign.arcs.find(a => a.id === arcId);
    if (!arc) return null;
    const chapter = arc.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return null;
    Object.assign(chapter, patch);
    saveStoryData(data);
    return chapter;
}

export function deleteChapter(campaignId, arcId, chapterId) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const arc = campaign.arcs.find(a => a.id === arcId);
    if (!arc) return;
    arc.chapters = arc.chapters.filter(ch => ch.id !== chapterId);
    saveStoryData(data);
}

// ===== Сцены =====
export function addScene(campaignId, arcId, chapterId, sceneData) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;
    const arc = campaign.arcs.find(a => a.id === arcId);
    if (!arc) return null;
    const chapter = arc.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return null;
    const newScene = {
    id: 'sc_' + Date.now(),
    name: sceneData.name || 'Новая сцена',
    description: sceneData.description || '',
    beatType: sceneData.beatType || 'development',
    status: sceneData.status || 'draft',
    participants: sceneData.participants || [],
    location: sceneData.location || '',
    netArchitectureId: sceneData.netArchitectureId || '',
    encounterTemplate: sceneData.encounterTemplate || '',
    prerequisites: sceneData.prerequisites || [],
    unlocks: sceneData.unlocks || [],
    choices: sceneData.choices || [],
    gmNotes: sceneData.gmNotes || '',
    outcome: null,
    order: chapter.scenes.length, // порядковый номер в главе
    timestamp: new Date().toISOString()
};
    chapter.scenes.push(newScene);
    saveStoryData(data);
    return newScene;
}

export function updateScene(campaignId, arcId, chapterId, sceneId, patch) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return null;
    const arc = campaign.arcs.find(a => a.id === arcId);
    if (!arc) return null;
    const chapter = arc.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return null;
    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return null;
    Object.assign(scene, patch);
    saveStoryData(data);
    return scene;
}

export function deleteScene(campaignId, arcId, chapterId, sceneId) {
    const data = loadStoryData();
    const campaign = data.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const arc = campaign.arcs.find(a => a.id === arcId);
    if (!arc) return;
    const chapter = arc.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    chapter.scenes = chapter.scenes.filter(s => s.id !== sceneId);
    saveStoryData(data);
}