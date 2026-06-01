// modules/npc-generator.js
import { getHP } from '../../utils.js';

export class NPCGenerator {
    static generate() {
        const roles = ["Рокербой","Соло","Нетраннер","Техник","Медтех","Медиа","Законник","Менеджер","Фиксер","Кочевник"];
        const names = ["Кибер-Джек","Леди Смерть","Стальной Кулак","Рейвен","Молния","Гроза","Тень","Фантом","Рико","Зара"];
        let role = roles[Math.floor(Math.random()*roles.length)];
        let stats = {};
        ['INT','REF','DEX','TECH','COOL','WILL','LUCK','MOVE','BODY','EMP'].forEach(s=>stats[s]=Math.floor(Math.random()*7)+2);
        let hp = getHP(stats.BODY, stats.WILL);
        let severe = Math.ceil(hp/2);
        let humanity = stats.EMP*10;
        let empFrom = Math.floor(humanity/10);
        let name = names[Math.floor(Math.random()*names.length)] + " " + Math.floor(Math.random()*100);
        let html = `<strong>${name}</strong> (${role})<br>ХАР: ${Object.entries(stats).map(([k,v])=>`${k}=${v}`).join(', ')}<br>ПЗ = ${hp} (тяж. ≤ ${severe}), Спасбросок = ${stats.BODY}<br>Человечность = ${humanity} (ЭМП = ${empFrom})`;
        document.getElementById('npcResult').innerHTML = html;
    }
}