// modules/gm/gm-init.js
import { NPCGenerator } from './npc-generator.js';
import { generateSimpleContract } from './simple-contract.js';
import { AdvancedContractGenerator } from './advanced-contract-generator.js';
import { checkCyberpsychosis } from './cyberpsychosis.js';
import { generateNetArchitecture } from './net-architecture.js';
import { MookGenerator } from './mook-generator.js';
import { EncounterGenerator } from './encounter-generator.js';

export function initGM() {
    // NPC
    document.getElementById('generateNpcBtn')?.addEventListener('click', () => NPCGenerator.generate());
    // Простой контракт
    document.getElementById('genContractBtn')?.addEventListener('click', generateSimpleContract);
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
}