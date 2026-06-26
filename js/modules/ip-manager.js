// modules/ip-manager.js
import { allSkills } from '../data/skills-data.js';
import { loadCharacter, saveCharacter } from '../storage.js';

/**
 * Получить персонажа с гарантированными полями IP
 */
export function getCharacterWithIP() {
    const char = loadCharacter();
    if (!char) return null;
    if (!char.ip) {
        char.ip = { totalEarned: 0, spent: 0, available: 0, history: [] };
    }
    if (typeof char.roleRank !== 'number' || char.roleRank < 1) {
        char.roleRank = 4;
    }
    if (!char.skills) {
        char.skills = {};
    }
    return char;
}

/**
 * Добавить IP персонажу (для GM или наград)
 */
export function addIP(char, amount) {
    if (!char.ip) {
        char.ip = { totalEarned: 0, spent: 0, available: 0, history: [] };
    }
    char.ip.totalEarned += amount;
    char.ip.available += amount;
    saveCharacter(char);
    return char.ip.available;
}

/**
 * Повысить навык на указанное количество уровней (по умолчанию 1)
 */
export function upgradeSkill(char, skillName, levels = 1) {
    const skillDef = allSkills.find(s => s.name === skillName);
    if (!skillDef) {
        return { success: false, message: `Навык "${skillName}" не найден.` };
    }

    const currentLevel = char.skills[skillName] || 0;
    const targetLevel = currentLevel + levels;

    if (targetLevel > 10) {
        return { success: false, message: `Максимальный уровень навыка — 10.` };
    }

    // Рассчитываем стоимость за все уровни
    let totalCost = 0;
    for (let lvl = currentLevel + 1; lvl <= targetLevel; lvl++) {
        totalCost += lvl * 20 * (skillDef.costMult || 1);
    }

    if (char.ip.available < totalCost) {
        return {
            success: false,
            message: `Недостаточно IP. Нужно ${totalCost}, доступно ${char.ip.available}.`
        };
    }

    // Применяем повышение
    char.skills[skillName] = targetLevel;
    char.ip.spent += totalCost;
    char.ip.available -= totalCost;
    char.ip.history.push({
        date: new Date().toISOString(),
        type: 'skill',
        name: skillName,
        from: currentLevel,
        to: targetLevel,
        cost: totalCost,
        levels: levels
    });

    saveCharacter(char);
    return {
        success: true,
        message: `Навык "${skillName}" повышен с ${currentLevel} до ${targetLevel}. Потрачено ${totalCost} IP.`,
        newLevel: targetLevel,
        cost: totalCost
    };
}

/**
 * Повысить ролевой ранг на указанное количество уровней
 */
export function upgradeRoleRank(char, levels = 1) {
    const currentRank = char.roleRank || 4;
    const targetRank = currentRank + levels;

    if (targetRank > 10) {
        return { success: false, message: `Максимальный ролевой ранг — 10.` };
    }

    let totalCost = 0;
    for (let r = currentRank + 1; r <= targetRank; r++) {
        totalCost += r * 60;
    }

    if (char.ip.available < totalCost) {
        return {
            success: false,
            message: `Недостаточно IP. Нужно ${totalCost}, доступно ${char.ip.available}.`
        };
    }

    char.roleRank = targetRank;
    char.ip.spent += totalCost;
    char.ip.available -= totalCost;
    char.ip.history.push({
        date: new Date().toISOString(),
        type: 'role',
        name: char.role || 'Ролевой навык',
        from: currentRank,
        to: targetRank,
        cost: totalCost,
        levels: levels
    });

    saveCharacter(char);
    return {
        success: true,
        message: `Ролевой ранг повышен с ${currentRank} до ${targetRank}. Потрачено ${totalCost} IP.`,
        newRank: targetRank,
        cost: totalCost
    };
}

/**
 * Получить список навыков с информацией о повышении
 */
export function getUpgradeableSkills(char) {
    const result = [];
    for (const skillDef of allSkills) {
        const currentLevel = char.skills[skillDef.name] || 0;
        if (currentLevel >= 10) continue;
        // Стоимость для +1 уровня
        const costForOne = (currentLevel + 1) * 20 * (skillDef.costMult || 1);
        // Максимальное количество уровней, которое можно повысить
        let maxLevels = 0;
        let tempCost = 0;
        for (let lvl = currentLevel + 1; lvl <= 10; lvl++) {
            const cost = lvl * 20 * (skillDef.costMult || 1);
            if (tempCost + cost > char.ip.available) break;
            tempCost += cost;
            maxLevels++;
        }
        result.push({
            name: skillDef.name,
            stat: skillDef.stat,
            costMult: skillDef.costMult || 1,
            currentLevel: currentLevel,
            nextLevel: currentLevel + 1,
            costForOne: costForOne,
            maxLevels: maxLevels,
            canAfford: char.ip.available >= costForOne
        });
    }
    return result;
}