// modules/gear.js
import { rangedWeapons, meleeWeapons, armors, detailedCyberware, critBody, critHead, gearItems, streetDrugs, ammoTypes, weaponAttachments, transport } from '../data.js';
import { renderRanged } from './gear/renderRanged.js';
import { renderMelee } from './gear/renderMelee.js';
import { renderArmor } from './gear/renderArmor.js';
import { renderCrit } from './gear/renderCrit.js';
import { renderCyberware } from './gear/renderCyberware.js';
import { renderSkills } from './gear/renderSkills.js';
import { renderGear } from './gear/renderGear.js';
import { renderDrugs } from './gear/renderDrugs.js';
import { renderAmmo } from './gear/renderAmmo.js';
import { renderAttachments } from './gear/renderAttachments.js';
import { renderTransport } from './gear/renderTransport.js';

export function renderFilteredCyberware() {
    const filterValue = document.getElementById('cyberFilter')?.value || 'all';
    let filtered = detailedCyberware;
    if (filterValue !== 'all') {
        filtered = detailedCyberware.filter(c => c.type === filterValue);
    }
    const html = renderCyberware(filtered);
    if (document.getElementById('cyber-detailed-table')) {
        document.getElementById('cyber-detailed-table').innerHTML = html;
    }
    if (document.getElementById('cyber-detailed-table-gear')) {
        document.getElementById('cyber-detailed-table-gear').innerHTML = html;
    }
}

export function updateAllTables() {
    if (document.getElementById('ranged-table')) document.getElementById('ranged-table').innerHTML = renderRanged(rangedWeapons);
    if (document.getElementById('melee-table')) document.getElementById('melee-table').innerHTML = renderMelee(meleeWeapons);
    if (document.getElementById('armor-table')) document.getElementById('armor-table').innerHTML = renderArmor(armors);
    if (document.getElementById('crit-body-table')) document.getElementById('crit-body-table').innerHTML = renderCrit(critBody);
    if (document.getElementById('crit-head-table')) document.getElementById('crit-head-table').innerHTML = renderCrit(critHead);
    if (document.getElementById('skillsTable')) document.getElementById('skillsTable').innerHTML = renderSkills();
    if (document.getElementById('transport-table')) document.getElementById('transport-table').innerHTML = renderTransport(transport);
    if (document.getElementById('drugs-table')) document.getElementById('drugs-table').innerHTML = renderDrugs(streetDrugs);
    if (document.getElementById('ammo-table')) document.getElementById('ammo-table').innerHTML = renderAmmo(ammoTypes);
    if (document.getElementById('attachments-table')) document.getElementById('attachments-table').innerHTML = renderAttachments(weaponAttachments);
    if (document.getElementById('gear-table')) document.getElementById('gear-table').innerHTML = renderGear(gearItems);
    renderFilteredCyberware();
}

export function filterTables(term) {
    const flt = arr => arr.filter(i => JSON.stringify(i).toLowerCase().includes(term));
    if (document.getElementById('ranged-table')) document.getElementById('ranged-table').innerHTML = renderRanged(flt(rangedWeapons));
    if (document.getElementById('melee-table')) document.getElementById('melee-table').innerHTML = renderMelee(flt(meleeWeapons));
    if (document.getElementById('armor-table')) document.getElementById('armor-table').innerHTML = renderArmor(flt(armors));
    if (document.getElementById('crit-body-table')) document.getElementById('crit-body-table').innerHTML = renderCrit(flt(critBody));
    if (document.getElementById('crit-head-table')) document.getElementById('crit-head-table').innerHTML = renderCrit(flt(critHead));
    if (document.getElementById('transport-table')) document.getElementById('transport-table').innerHTML = renderTransport(flt(transport));
    if (document.getElementById('drugs-table')) document.getElementById('drugs-table').innerHTML = renderDrugs(flt(streetDrugs));
    if (document.getElementById('ammo-table')) document.getElementById('ammo-table').innerHTML = renderAmmo(flt(ammoTypes));
    if (document.getElementById('attachments-table')) document.getElementById('attachments-table').innerHTML = renderAttachments(flt(weaponAttachments));
    if (document.getElementById('gear-table')) document.getElementById('gear-table').innerHTML = renderGear(flt(gearItems));
    if (document.getElementById('cyber-detailed-table-gear')) document.getElementById('cyber-detailed-table-gear').innerHTML = renderCyberware(flt(detailedCyberware));
}
export { renderGear } from './gear/renderGear.js';