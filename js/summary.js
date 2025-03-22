// summary.js

function updateSummary() {
    const allStats = [];

    document.querySelectorAll(".section").forEach(section => {
        const sectionName = section.querySelector(".section-header input[type='text']:first-of-type").value;

        section.querySelectorAll(".stat-entry").forEach(statEntry => {
            const statName = statEntry.querySelector("input[type='text']").value;
            const statKey = Object.keys(stats).find(key => getStatName(stats[key]) === statName);

            const expressionInput = statEntry.querySelector("input[type='text']:last-of-type");
            const expression = expressionInput ? expressionInput.value : "";

            if (statKey) {
                const statID = stats[statKey];
                allStats.push([statID, expression, sectionName]);  // Now includes section name
            }
        });
    });

    // Process into summary format
    const statSummary = processStats(allStats);

    // Render into the right panel
    renderSummary(statSummary);
}

function statIsMore(statId) {
    return statId == stats.MORE_DAMAGE || statId == stats.MORE_ARMOUR || statId == stats.MORE_HIT_SPEED || statId == stats.LESS_DAMAGE_TAKEN;
}

function statIsOpposite(statId) {
    return statId == stats.LESS_DAMAGE_TAKEN;
}

function processExpressions() {
    let allStatsArray = Object.entries(allStats);
    for (const [statId, statData] of allStatsArray) {
        if (statData.expression) {
            let expression = statData.expression;
            if (dexterity > 0)
                expression = expression.replaceAll("dex", dexterity);
            if (recurveChance > 0)
                expression = expression.replaceAll("recurve", getAvgRecurveHits(recurveChance - 100));
            const statValue = evaluateExpression(expression);
            if (!isNaN(statValue)) {
                statData.expression = null;
                if (statIsMore(statId)) {
                    if (isNaN(statData.total))
                        statData.total = 100;
                    //console.log("more processExpressions", expression, statId, getStatName(statId), statValue, statData.total);
                    statData.total *= (100 + (statIsOpposite(statId) ? -statValue : statValue)) / 100;
                }
                else {
                    if (isNaN(statData.total))
                        statData.total = 0;
                    statData.total += statValue;
                }
            }
        }
    }
}

let allStats = {};
let dexterity = 0;
let recurveChance = 0;
function processStats(statsArray) {
    allStats = {};

    statsArray.forEach(([statId, expression, sectionName]) => {
        const statValue = evaluateExpression(expression);
        const statName = getStatName(statId);

        if (!allStats[statId]) {
            allStats[statId] = { name: statName, total: statIsMore(statId) ? 100 : 0, sources: [] };
        }

        if (isNaN(statValue)) {
            allStats[statId].expression = expression;
            allStats[statId].sources.push(`[${sectionName}] ${getStatName(statId)}: ${expression}`);
        }
        else {
            if (statIsMore(statId)) {
                //console.log("more processStats", statId, getStatName(statId), statValue, allStats[statId].total);
                allStats[statId].total *= (100 + (statIsOpposite(statId) ? -statValue : statValue)) / 100;
            }
            else {
                allStats[statId].total += statValue;
            }
            
            allStats[statId].sources.push(`[${sectionName}] ${getStatName(statId)}: ${statValue}`);
        }
    });

    let summary = [];

    // attributes
    summary.push({name:"Attributes", type:"section"});
    const allAttributes = allStats[stats.ALL_ATTRIBUTES]?.total || 0;
    const strength = allAttributes + (allStats[stats.STRENGTH]?.total || 0);
        dexterity = allAttributes + (allStats[stats.DEXTERITY]?.total || 0);
    const intelligence = allAttributes + (allStats[stats.INTELLIGENCE]?.total || 0);
    const attunement = allAttributes + (allStats[stats.ATTUNEMENT]?.total || 0);
    const vitality = allAttributes + (allStats[stats.VITALITY]?.total || 0);
    {
        processExpressions();

        recurveChance = 100 + (allStats[stats.ADDITIONAL_RECURVE_CHANCE]?.total || -100);

        processExpressions();

        summary.push({ 
            name: "Strength", 
            total: strength, 
            type: "stat",
            sources: [
                ...(allStats[stats.STRENGTH]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || [])
            ]
        });
        summary.push({ 
            name: "Dexterity", 
            total: dexterity, 
            type: "stat",
            sources: [
                ...(allStats[stats.DEXTERITY]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || [])
            ]
        });
        summary.push({ 
            name: "Intelligence", 
            total: intelligence, 
            type: "stat",
            sources: [
                ...(allStats[stats.INTELLIGENCE]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || [])
            ]
        });
        summary.push({ 
            name: "Attunement", 
            total: attunement, 
            type: "stat",
            sources: [
                ...(allStats[stats.ATTUNEMENT]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || [])
            ]
        });
        summary.push({ 
            name: "Vitality", 
            total: vitality, 
            type: "stat",
            sources: [
                ...(allStats[stats.VITALITY]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || [])
            ]
        });
    }
    // general
    summary.push({name:"General", type:"section"});
    let totalHealth = 0;
    {
        // health
        const flatHealth = vitality * 6 + (allStats[stats.FLAT_HEALTH]?.total || 0);
        const increasedHealth = allStats[stats.INCREASED_HEALTH]?.total || 0;
        totalHealth = flatHealth * (1 + increasedHealth / 100);
        summary.push({ 
            name: "Health", 
            total: totalHealth, 
            type: "stat",
            sources: [
                ...(allStats[stats.FLAT_HEALTH]?.sources || []), 
                ...(allStats[stats.VITALITY]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []), 
                ...(allStats[stats.INCREASED_HEALTH]?.sources || [])
            ]
        });

        // mana
        const flatMana = attunement * 2 + (allStats[stats.FLAT_MANA]?.total || 0);
        const increasedMana = allStats[stats.INCREASED_MANA]?.total || 0;
        const totalMana = flatMana * (1 + increasedMana / 100);
        if (totalMana > 100)
            summary.push({ 
                name: "Mana", 
                total: totalMana, 
                type: "stat",
                sources: [
                    ...(allStats[stats.FLAT_MANA]?.sources || []), 
                    ...(allStats[stats.ATTUNEMENT]?.sources || []), 
                    ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []), 
                    ...(allStats[stats.INCREASED_MANA]?.sources || [])
                ]
            });

        // health regen
        const flatHealthRegen = (allStats[stats.FLAT_HEALTH_REGEN]?.total || 0);
        const increasedHealthRegen = allStats[stats.INCREASED_HEALTH_REGEN]?.total || 0;
        const totalHealthRegen = flatHealthRegen * (1 + increasedHealthRegen / 100);
        summary.push({ 
            name: "Health Regen", 
            total: totalHealthRegen, 
            type: "stat",
            sources: [
                ...(allStats[stats.FLAT_HEALTH_REGEN]?.sources || []), 
                ...(allStats[stats.INCREASED_HEALTH_REGEN]?.sources || [])
            ]
        });

        // mana regen
        const flatManaRegen = allStats[stats.FLAT_MANA_REGEN]?.total || 0;
        const increasedManaRegen = allStats[stats.INCREASED_MANA_REGEN]?.total || 0;
        const totalManaRegen = flatManaRegen * (1 + increasedManaRegen / 100);
        summary.push({ 
            name: "Mana Regen", 
            total: totalManaRegen, 
            type: "stat",
            sources: [
                ...(allStats[stats.FLAT_MANA_REGEN]?.sources || []),
                ...(allStats[stats.INCREASED_MANA_REGEN]?.sources || [])
            ]
        });
    }

    summary.push({name:"Damage", type:"section"});
    // increased damage
    const increasedMS = allStats[stats.INCREASED_MOVEMENT_SPEED]?.total || 0;
    let increasedDamage = (allStats[stats.INCREASED_DAMAGE]?.total || 0)
        + (allStats[stats.INCREASED_DAMAGE_PER_MS]?.total || 0) * increasedMS;
    {
        summary.push({ 
            name: "Increased Damage", 
            total: increasedDamage, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_DAMAGE]?.sources || []),
                ...(allStats[stats.INCREASED_DAMAGE_PER_MS]?.sources || []),
            ]
        });
    }

    // more damage
    let moreDamage = 100;
    {
        moreDamage *= (allStats[stats.MORE_DAMAGE]?.total || 100)/100;
        if (moreDamage > 100) {
            summary.push({ 
                name: "More Damage", 
                total: moreDamage - 100, 
                type: "stat",
                sources: [
                    ...(allStats[stats.MORE_DAMAGE]?.sources || []),
                ]
            });
        }
    }

    let penetration = allStats[stats.PENETRATION]?.total || 0;
    {
        summary.push({ 
            name: "Penetration", 
            total: penetration,
            type: "stat",
            sources: [
                ...(allStats[stats.PENETRATION]?.sources || []),
            ]
        });
    }

    summary.push({name:"Speed", type:"section"});
    // movement speed
    {
        summary.push({ 
            name: "Increased MS", 
            total: increasedMS, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_MANA_REGEN]?.sources || [])
            ]
        });
    }     

    let increasedHitSpeed = allStats[stats.INCREASED_HITS]?.total || 0;
    {
        summary.push({ 
            name: "Increased Hit Speed", 
            total: increasedHitSpeed, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_HITS]?.sources || []),
            ]
        });
    }

    // more hits
    let moreHits = 100;
    {
        moreHits *= (allStats[stats.MORE_HIT_SPEED]?.total || 100)/100;
        if (moreHits > 100) {
            summary.push({ 
                name: "More Hits", 
                total: moreHits - 100, 
                type: "stat",
                sources: [
                    ...(allStats[stats.MORE_HIT_SPEED]?.sources || []),
                ]
            });
        }
    }

    // hits per second
    let hitsPerSecond = allStats[stats.HITS_PER_SECOND]?.total || 0;
    let hitSpeedSummary = `${hitsPerSecond.toFixed(3)}`; 
    {
        hitsPerSecond *= (100 + increasedHitSpeed) / 100;
        hitSpeedSummary += ` * (100 + ${increasedHitSpeed})/100`;
        hitsPerSecond *= moreHits/100;
        hitSpeedSummary += ` * (${moreHits}/100) = ${hitsPerSecond.toFixed(3)}`;

        var recurveSummary = `recurve chance: ${recurveChance}\navg hits: ${getAvgRecurveHits(recurveChance-100).toFixed(3)}`;
        allStats[stats.HITS_PER_SECOND]?.sources.push(recurveSummary);
        if (recurveChance > 0) {
            summary.push({ 
                name: "Recurve chance", 
                total: recurveChance, 
                type: "stat",
                sources: [
                    ...(allStats[stats.ADDITIONAL_RECURVE_CHANCE]?.sources || []),
                    ...(allStats[stats.DEXTERITY]?.sources || []),
                    ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []),
                ]
            });
        }

        summary.push({ 
            name: "Hits per Second", 
            total: hitsPerSecond, 
            type: "stat",
            sources: [
                hitSpeedSummary,
                ...(allStats[stats.HITS_PER_SECOND]?.sources || []),
                ...(allStats[stats.INCREASED_HITS]?.sources || []),
                ...(allStats[stats.MORE_HIT_SPEED]?.sources || []),
            ]
        });
    }

    // chance to apply ailment
    summary.push({name:"Ailments", type:"section"});
    const chanceToAilment = allStats[stats.CHANCE_TO_APPLY_AILMENT]?.total || 0;
    {
        summary.push({ 
            name: "Chance to Apply Ailment", 
            total: chanceToAilment, 
            type: "stat",
            sources: [
                ...(allStats[stats.CHANCE_TO_APPLY_AILMENT]?.sources || []),
            ]
        });
    }
    const increasedAilmentDUration = allStats[stats.INCREASED_AILMENT_DURATION]?.total || 0;
    {
        if (increasedAilmentDUration > 0)
            summary.push({ 
                name: "Increased Ailment Duration", 
                total: increasedAilmentDUration, 
                type: "stat",
                sources: [
                    ...(allStats[stats.INCREASED_AILMENT_DURATION]?.sources || []),
                ]
            });
    }

    summary.push({name:"Resistances", type:"section"});
    const fireRes = (allStats[stats.FIRE_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    const coldRes = (allStats[stats.COLD_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    const lightningRes = (allStats[stats.LIGHTNING_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    const physicalRes = (allStats[stats.PHYSICAL_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    const necroticRes = (allStats[stats.NECROTIC_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    const poisonRes = (allStats[stats.POISON_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    const voidRes = (allStats[stats.VOID_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    {
        summary.push({ 
            name: "Fire Resistance", 
            total: fireRes, 
            type: "stat",
            sources: [
                ...(allStats[stats.FIRE_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Cold Resistance", 
            total: coldRes, 
            type: "stat",
            sources: [
                ...(allStats[stats.COLD_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Lightning Resistance", 
            total: lightningRes, 
            type: "stat",
            sources: [
                ...(allStats[stats.LIGHTNING_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Physical Resistance", 
            total: physicalRes, 
            type: "stat",
            sources: [
                ...(allStats[stats.PHYSICAL_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Necrotic Resistance", 
            total: necroticRes, 
            type: "stat",
            sources: [
                ...(allStats[stats.NECROTIC_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Poison Resistance", 
            total: poisonRes, 
            type: "stat",
            sources: [
                ...(allStats[stats.POISON_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Void Resistance", 
            total: voidRes, 
            type: "stat",
            sources: [
                ...(allStats[stats.VOID_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
    }

    summary.push({name:"Armor", type:"section"});
    const flatArmour = allStats[stats.FLAT_ARMOR]?.total || 0;
    {
        summary.push({ 
            name: "Flat Armour", 
            total: flatArmour, 
            type: "stat",
            sources: [
                ...(allStats[stats.FLAT_ARMOR]?.sources || []),
            ]
        });
    }
    const increasedArmour = (allStats[stats.INCREASED_ARMOUR]?.total || 0) + strength * 4;
    {
        summary.push({ 
            name: "Increased Armour", 
            total: increasedArmour, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_ARMOUR]?.sources || []),
                ...(allStats[stats.STRENGTH]?.sources || []),
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []),
            ]
        });
    }
    const moreArmour = allStats[stats.MORE_ARMOUR]?.total || 0;
    {
        summary.push({ 
            name: "More Armour", 
            total: moreArmour - 100, 
            type: "stat",
            sources: [
                ...(allStats[stats.MORE_ARMOUR]?.sources || []),
            ]
        });
    }
    let totalArmour = flatArmour * (100 + increasedArmour) / 100 * moreArmour / 100;
    {
        summary.push({ 
            name: "Total Armour", 
            total: totalArmour, 
            type: "stat",
            sources: []
        });
    }
    let totalArmourDrPhys = 0;
    let totalArmourDr = 0;
    {
        const x = totalArmour;
        const x2 = Math.pow(x, 2);
        const a = 100;
        totalArmourDrPhys = 1.2 * x / (80 + 0.05 * Math.pow(a + 5, 2) + 1.2 * x) * 0.3;
        totalArmourDrPhys += 0.0012 * x2 / (180 * (a + 5) + 0.0015 * x2) * 0.55;

        totalArmourDrPhys *= 100;

        totalArmourDr = totalArmourDrPhys * 0.7;

        totalArmourDrPhys = Math.min(totalArmourDrPhys, 85);
        totalArmourDr = Math.min(totalArmourDr, 85);
        
        summary.push({ 
            name: "Total Armour Dr", 
            total: totalArmourDr, 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Total Armour Dr Phys", 
            total: totalArmourDrPhys, 
            type: "stat",
            sources: []
        });
    }
    // endurance
    summary.push({name:"Endurance", type:"section"});
    //summary.push({type:"hr"});
    const endurance = Math.min(60, allStats[stats.ENDURANCE]?.total || 0);
    {
        summary.push({ 
            name: "Endurance", 
            total: endurance, 
            type: "stat",
            sources: [
                ...(allStats[stats.ENDURANCE]?.sources || []),
            ]
        });
    }
    const enduranceThreshold = allStats[stats.ENDURANCE_THRESHOLD]?.total || 0;
    {
        summary.push({ 
            name: "Endurance Threshold", 
            total: enduranceThreshold, 
            type: "stat",
            sources: [
                ...(allStats[stats.ENDURANCE_THRESHOLD]?.sources || []),
            ]
        });
    }
    const hpAsEnduranceThreshold = (allStats[stats.MAX_HEALTH_AS_ENDURANCE_THRESHOLD]?.total || 0) / 100 * totalHealth;
    {
        summary.push({ 
            name: "Maximum Health as Endurance Threshold", 
            total: hpAsEnduranceThreshold, 
            type: "stat",
            sources: [
                ...(allStats[stats.MAX_HEALTH_AS_ENDURANCE_THRESHOLD]?.sources || []),
            ]
        });
    }
    const totalEnduranceThreshold = Math.min(totalHealth, enduranceThreshold + hpAsEnduranceThreshold);
    {
        summary.push({ 
            name: "Total Endurance Threshold", 
            total: totalEnduranceThreshold, 
            type: "stat",
            sources: [
                ...(allStats[stats.ENDURANCE_THRESHOLD]?.sources || []),
                ...(allStats[stats.MAX_HEALTH_AS_ENDURANCE_THRESHOLD]?.sources || []),
            ]
        });
    }
    let preusoHpAfterEndurance = totalHealth - totalEnduranceThreshold + totalEnduranceThreshold * 100 / (100 - endurance);
    {
        summary.push({ 
            name: "Preudo HP after Endurance", 
            total: preusoHpAfterEndurance, 
            type: "stat",
            sources: [
                `HP part without Endurance: total HP - endurance threshold = ${(totalHealth - totalEnduranceThreshold).toFixed(3)}`,
                `Preudo Endurance HP: endurance threshold * (100 - endurance) / 100 
                    = ${totalEnduranceThreshold.toFixed(3)} * (100 - ${endurance}) / 100 
                    = ${(totalEnduranceThreshold * 100 / (100 - endurance)).toFixed(3)}`
            ]
        });
    }
    // vs crits
    summary.push({name:"Other Defences", type:"section"});
    //summary.push({type:"hr"});
    const reducedCritDmgTaken = Math.min(100, allStats[stats.REDUCED_CRIT_DAMAGE_TAKEN]?.total || 0);
    {
        summary.push({ 
            name: "Reduced Crit Damage Taken", 
            total: reducedCritDmgTaken, 
            type: "stat",
            sources: [
                ...(allStats[stats.REDUCED_CRIT_DAMAGE_TAKEN]?.sources || []),
            ]
        });
    }
    // dodge
    summary.push({type:"hr"});
    const flatDodge = (allStats[stats.DODGE_RATING]?.total || 0) + dexterity * 4;
    {
        summary.push({ 
            name: "Dodge Rating", 
            total: flatDodge, 
            type: "stat",
            sources: [
                ...(allStats[stats.DODGE_RATING]?.sources || []),
                ...(allStats[stats.DEXTERITY]?.sources || []),
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []),
            ]
        });
    }
    const increasedDodge = allStats[stats.INCREASED_DODGE_RATING]?.total || 0;
    {
        summary.push({ 
            name: "Increased Dodge Rating", 
            total: increasedDodge, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_DODGE_RATING]?.sources || []),
            ]
        });
    }
    let totalDodgeRating = flatDodge * (100 + increasedDodge) / 100;
    {
        summary.push({ 
            name: "Total Dodge Rating", 
            total: totalDodgeRating, 
            type: "stat",
            sources: [
                ...(allStats[stats.MORE_ARMOUR]?.sources || []),
            ]
        });
    }
    let dodgeChance = 0;
    let glancingBlowChance = (allStats[stats.GLANCING_BLOW_CHANCE]?.total || 0);
    let dodgeToGlancingBlowChance = (allStats[stats.DODGE_CHANCE_TO_GLANCING_BLOW_CHANCE]?.total || 0);
    {
        const x = totalDodgeRating;
        const x2 = Math.pow(x, 2);
        const a = 100;
        dodgeChance = 1 * x / (80 + 0.05 * Math.pow(a + 5, 2) + 1 * x) * 0.25;
        dodgeChance += 0.001 * x2 / (32 * (a + 5) + 0.001 * x2) * 0.6;
        dodgeChance *= 100;
        dodgeChance = Math.min(dodgeChance, 85);
        if (dodgeToGlancingBlowChance > 0) {
            glancingBlowChance += dodgeChance * dodgeToGlancingBlowChance/100;
            dodgeChance = 0;
        }
        glancingBlowChance = Math.min(100, glancingBlowChance);

        summary.push({ 
            name: "Dodge Chance", 
            total: dodgeChance, 
            type: "stat",
            sources: []
        });
    }
    let lessDamageTaken =  (allStats[stats.LESS_DAMAGE_TAKEN]?.total || 100);
    if (glancingBlowChance == 100)
        lessDamageTaken *= (1 - 0.35);
    lessDamageTaken =  100 - lessDamageTaken;
    if (lessDamageTaken > 0) {
        summary.push({type:"hr"});
        
        if (glancingBlowChance > 0) {
            summary.push({ 
                name: "Glancing Blow Chance", 
                total: glancingBlowChance, 
                type: "stat",
                sources: [
                    ...(allStats[stats.GLANCING_BLOW_CHANCE]?.sources || []),
                    (dodgeToGlancingBlowChance > 0) ? (allStats[stats.DODGE_CHANCE_TO_GLANCING_BLOW_CHANCE]?.sources || []) : []
                ]
            });
        }

        summary.push({ 
            name: "Less Damage Taken", 
            total: lessDamageTaken, 
            type: "stat",
            sources: [
                ...(allStats[stats.LESS_DAMAGE_TAKEN]?.sources || []),
                (glancingBlowChance == 100) ? `100% glancing blow chance, Less Damage Taken: 35` : []
            ]
        });
    }

    summary.push({name:"DPS", type:"section"});
    // dps
    {
        let dpsAilment = allStats[stats.AILMENT_DAMAGE]?.total || 0;
        if (dpsAilment > 0) {
            dpsAilment *= hitsPerSecond;
            dpsAilment *= chanceToAilment / 100;
            dpsAilment *= (100 + increasedDamage) / 100;
            dpsAilment *= moreDamage / 100;
            dpsAilment *= (100 + penetration) / 100;
            if (increasedAilmentDUration > 0)
                dpsAilment *= (100 + increasedAilmentDUration) / 100;
        }
        summary.push({ 
            name: "DPS Ailment", 
            total: dpsAilment, 
            type: "stat",
            sources: [
                `dpsAilment * chanceToAilment/100 * hitsPerSecond 
                    * (100+increasedDamage)/100 * (moreDamage)/100 * (100+penetration)/100${(increasedAilmentDUration > 0) ? ` * (100+duration)/100` : ""}= 
                    ${dpsAilment.toFixed(3)} * ${chanceToAilment}/100 * ${hitsPerSecond.toFixed(3)} 
                    * (100+${increasedDamage})/100 * (${moreDamage.toFixed(3)})/100 * (100+${penetration})/100
                    ${(increasedAilmentDUration > 0) ? ` * (100+${increasedAilmentDUration})/100` : ""}
                     = ${dpsAilment.toFixed(3)}`,
                ...(allStats[stats.AILMENT_DAMAGE]?.sources || []),
            ]
        });
    }

    Object.values(summary).forEach(stat => {
        stat.total = formatNumber(stat.total);
    });

    return Object.values(summary); // Convert object to array
}

function formatNumber(value) {
    const rounded = Math.round(value * 100) / 100; // Round to 2 decimal places
    return (rounded % 1 === 0) ? rounded.toFixed(0) : rounded.toFixed(2);
}

function evaluateExpression(expr) {
    if (!expr.trim()) return 0;

    // Convert commas to dots for float compatibility
    let cleanedExpr = expr.replace(/,/g, ".");

    try {
        return Function(`"use strict"; return (${cleanedExpr});`)();
    } catch (error) {
        //console.error("Invalid expression:", expr);
        return NaN;
    }
}

function renderSummary(summaryArray) {
    const summaryContainer = document.getElementById("summary-content");

    // 1) Gather which tooltips & sections are open from the old DOM
    const openTooltips = {};
    const openSections = {};

    // For each tooltip that’s currently visible
    document.querySelectorAll(".tooltip.visible").forEach(tooltip => {
        // Use the same dataset.index as your summary array index
        openTooltips[tooltip.dataset.index] = true;
    });

    // For each section-content that is *not* collapsed
    document.querySelectorAll(".section-content:not(.collapsed)").forEach(sec => {
        // We’ll set sec.dataset.index below (see Step 2)
        openSections[sec.dataset.index] = true;
    });

    // 2) Clear previous summary
    summaryContainer.innerHTML = "";

    let insideSection = false;
    let sectionContainer = null;
    let sectionContentWrapper = null;
    let sectionIndex = 0; // We'll increment this each time we encounter a "section" type

    summaryArray.forEach((summaryStat, index) => {
        // If we encounter an "hr", just insert an <hr>
        if (summaryStat.type === "hr") {
            if (sectionContentWrapper) {
                // Insert HR *inside* current section, or do summaryContainer.appendChild(...) if you prefer
                sectionContentWrapper.appendChild(document.createElement("hr"));
            } else {
                summaryContainer.appendChild(document.createElement("hr"));
            }
            return;
        }

        // 3) If "section", create a collapsible section
        if (summaryStat.type === "section") {
            // Close previous if it was still open
            insideSection = true;
            sectionContainer = document.createElement("div");
            sectionContainer.classList.add("summary-section");

            // Header
            const sectionHeader = document.createElement("div");
            sectionHeader.classList.add("summary-entry", "summary-section-header");

            // Collapse button
            const collapseBtn = document.createElement("button");
            collapseBtn.classList.add("collapse-btn");
            collapseBtn.textContent = "▼";

            // Section title
            const sectionTitle = document.createElement("span");
            sectionTitle.classList.add("summary-text");
            sectionTitle.innerHTML = `<strong>${summaryStat.name}</strong>`;

            sectionHeader.appendChild(collapseBtn);
            sectionHeader.appendChild(sectionTitle);

            // Collapsible content
            sectionContentWrapper = document.createElement("div");
            sectionContentWrapper.classList.add("section-content", "collapsed");

            // Give this section-content a dataset.index so we know how to restore it
            // We can use "sectionIndex" for sections or reuse "index" if each section in summaryArray is unique.
            sectionContentWrapper.dataset.index = `section-${sectionIndex}`;
            sectionIndex++;

            // Toggle on click
            const localSectionContentWrapper = sectionContentWrapper;
            collapseBtn.onclick = () => {
                localSectionContentWrapper.classList.toggle("collapsed");
            };

            // Restore the previous open state if we had it
            if (openSections[sectionContentWrapper.dataset.index]) {
                localSectionContentWrapper.classList.remove("collapsed");
            }

            // Build the container
            sectionContainer.appendChild(sectionHeader);
            sectionContainer.appendChild(sectionContentWrapper);
            summaryContainer.appendChild(sectionContainer);

            // Don’t render a normal stat line for "type: section"
            return;
        }

        // Skip stats with total=0
        if (summaryStat.total === "0") {
            return;
        }

        // 4) Normal stat line
        const statDiv = document.createElement("div");
        statDiv.classList.add("summary-entry");

        // Tooltip button
        const collapseButton = document.createElement("button");
        collapseButton.classList.add("collapse-btn");
        collapseButton.textContent = "▼";
        collapseButton.onclick = () => toggleTooltip(index);

        // Stat text
        const statText = document.createElement("span");
        statText.classList.add("summary-text");
        statText.innerHTML = `<strong>${summaryStat.name}:</strong> ${summaryStat.total.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

        // Tooltip
        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.dataset.index = index;
        tooltip.innerHTML = summaryStat.sources.length > 0
            ? summaryStat.sources.join("<br>")
            : "Nothing!";

        // If this tooltip was open before, restore it
        if (openTooltips[index]) {
            tooltip.classList.add("visible");
            tooltip.style.maxHeight = "none";
            tooltip.style.padding = "10px 12px";
        }

        statDiv.appendChild(collapseButton);
        statDiv.appendChild(statText);

        // If we’re inside a section, place them there
        if (insideSection && sectionContentWrapper) {
            sectionContentWrapper.appendChild(statDiv);
            sectionContentWrapper.appendChild(tooltip);
        } else {
            // Otherwise directly in summary
            summaryContainer.appendChild(statDiv);
            summaryContainer.appendChild(tooltip);
        }
    });
    /*
    // Hook into tooltips
    document.querySelectorAll(".tooltip").forEach(tooltip => {
        setupHoverGlow(tooltip, tooltip);
    });
    
    // Hook into summary entries
    document.querySelectorAll(".summary-entry").forEach(entry => {
        const tooltip = entry.nextElementSibling;
        if (tooltip?.classList.contains("tooltip")) {
        setupHoverGlow(entry, tooltip);
        }
    });
    */
}

function toggleTooltip(index) {
    const tooltip = document.querySelector(`.tooltip[data-index='${index}']`);
    if (!tooltip) return;

    const isVisible = tooltip.classList.contains("visible");

    if (isVisible) {
        tooltip.classList.remove("visible");
        tooltip.style.maxHeight = "0px"; // Collapse smoothly
    } else {
        tooltip.classList.add("visible");
        tooltip.style.maxHeight = tooltip.scrollHeight + "px"; // Expand smoothly
    }
}


// You can copy/paste this entire object into your code if needed:
const avgHitsLookup = {
    "0": 3.35292742385827,
    "0.5": 3.36469206097756,
    "1": 3.37645669809685,
    "1.5": 3.38822133521614,
    "2": 3.39998597233543,
    "2.5": 3.41175060945472,
    "3": 3.42351524657401,
    "3.5": 3.44112453781583,
    "4": 3.46074792886798,
    "4.5": 3.48044661337098,
    "5": 3.50022059132484,
    "5.5": 3.52006986272955,
    "6": 3.53999442758511,
    "6.5": 3.55999428589153,
    "7": 3.5800694376488,
    "7.5": 3.60021988285693,
    "8": 3.62044562151591,
    "8.5": 3.64074665362574,
    "9": 3.66112297918643,
    "9.5": 3.68157459819797,
    "10": 3.70210151066037,
    "10.5": 3.72270371657361,
    "11": 3.74338121593772,
    "11.5": 3.76413400875267,
    "12": 3.78496209501848,
    "12.5": 3.80586547473515,
    "13": 3.82684414790266,
    "13.5": 3.84789811452103,
    "14": 3.86902737459026,
    "14.5": 3.89023192811034,
    "15": 3.91151177508127,
    "15.5": 3.93286691550305,
    "16": 3.95429734937569,
    "16.5": 3.97580307669919,
    "17": 3.99738409747353,
    "17.5": 4.01904041169873,
    "18": 4.04077201937479,
    "18.5": 4.0625789205017,
    "19": 4.08446111507946,
    "19.5": 4.10641860310807,
    "20": 4.12845138458754,
    "20.5": 4.15055945951787,
    "21": 4.17274282789904,
    "21.5": 4.19500148973108,
    "22": 4.21733544501396,
    "22.5": 4.2397446937477,
    "23": 4.26222923593229,
    "23.5": 4.28478907156773,
    "24": 4.30742420065403,
    "24.5": 4.33013462319119,
    "25": 4.35292033917919,
    "25.5": 4.36233202053591,
    "26": 4.37174370189263,
    "26.5": 4.38115538324934,
    "27": 4.39056706460606,
    "27.5": 4.39997874596278,
    "28": 4.40939042731949,
    "28.5": 4.41880210867621,
    "29": 4.42937932733477,
    "29.5": 4.44503581901544,
    "30": 4.46074049828481,
    "30.5": 4.4764933651429,
    "31": 4.49229441958969,
    "31.5": 4.50814366162518,
    "32": 4.52404109124938,
    "32.5": 4.53998670846229,
    "33": 4.55598051326391,
    "33.5": 4.57202250565423,
    "34": 4.58811268563326,
    "34.5": 4.604251053201,
    "35": 4.62043760835744,
    "35.5": 4.63667235110259,
    "36": 4.65295528143644,
    "36.5": 4.66928639935901,
    "37": 4.68566570487028,
    "37.5": 4.70209319797025,
    "38": 4.71856887865893,
    "38.5": 4.73509274693632,
    "39": 4.75166480280242,
    "39.5": 4.76828504625722,
    "40": 4.78495347730073,
    "40.5": 4.80167009593295,
    "41": 4.81843490215387,
    "41.5": 4.8352478959635,
    "42": 4.85210907736183,
    "42.5": 4.86901844634888,
    "43": 4.88597600292462,
    "43.5": 4.90298174708908,
    "44": 4.92003567884224,
    "44.5": 4.93713779818411,
    "45": 4.95428810511469,
    "45.5": 4.97148659963397,
    "46": 4.98873328174196,
    "46.5": 5.00602815143865,
    "47": 5.02337120872406,
    "47.5": 5.04076245359816,
    "48": 5.05820188606098,
    "48.5": 5.0756895061125,
    "49": 5.09322531375273,
    "49.5": 5.11080930898167,
    "50": 5.12844149179931,
    "50.5": 5.14612186220566,
    "51": 5.16385042020071,
    "51.5": 5.18162716578447,
    "52": 5.19945209895694,
    "52.5": 5.21732521971812,
    "53": 5.235246528068,
    "53.5": 5.25321602400659,
    "54": 5.27123370753388,
    "54.5": 5.28929957864989,
    "55": 5.3074136373546,
    "55.5": 5.32557588364801,
    "56": 5.34378631753013,
    "56.5": 5.35667426018466,
    "57": 5.36420357092008,
    "57.5": 5.37173288165549,
    "58": 5.37926219239091,
    "58.5": 5.38679150312632,
    "59": 5.39432081386174,
    "59.5": 5.40185012459715,
    "60": 5.40937943533256,
    "60.5": 5.41690874606798,
    "61": 5.42443805680339,
    "61.5": 5.43562502117635,
    "62": 5.44816171057912,
    "62.5": 5.46072923982548,
    "63": 5.47332760891543,
    "63.5": 5.48595681784898,
    "64": 5.49861686662612,
    "64.5": 5.51130775524686,
    "65": 5.52402948371119,
    "65.5": 5.53678205201911,
    "66": 5.54956546017063,
    "66.5": 5.56237970816575,
    "67": 5.57522479600446,
    "67.5": 5.58810072368676,
    "68": 5.60100749121266,
    "68.5": 5.61394509858215,
    "69": 5.62691354579523,
    "69.5": 5.63991283285191,
    "70": 5.65294295975219,
    "70.5": 5.66600392649606,
    "71": 5.67909573308352,
    "71.5": 5.69221837951458,
    "72": 5.70537186578923,
    "72.5": 5.71855619190748,
    "73": 5.73177135786932,
    "73.5": 5.74501736367475,
    "74": 5.75829420932378,
    "74.5": 5.7716018948164,
    "75": 5.78494042015262,
    "75.5": 5.79830978533243,
    "76": 5.81170999035584,
    "76.5": 5.82514103522284,
    "77": 5.83860291993344,
    "77.5": 5.85209564448763,
    "78": 5.86561920888541,
    "78.5": 5.87917361312679,
    "79": 5.89275885721176,
    "79.5": 5.90637494114033,
    "80": 5.92002186491249,
    "80.5": 5.93369962852824,
    "81": 5.94740823198759,
    "81.5": 5.96114767529054,
    "82": 5.97491795843708,
    "82.5": 5.98871908142721,
    "83": 6.00255104426094,
    "83.5": 6.01641384693826,
    "84": 6.03030748945917,
    "84.5": 6.04423197182368,
    "85": 6.05818729403179,
    "85.5": 6.07217345608349,
    "86": 6.08619045797878,
    "86.5": 6.10023829971767,
    "87": 6.11431698130015,
    "87.5": 6.12842650272622,
    "88": 6.14256686399589,
    "88.5": 6.15673806510916,
    "89": 6.17094010606602,
    "89.5": 6.18517298686647,
    "90": 6.19943670751052,
    "90.5": 6.21373126799816,
    "91": 6.2280566683294,
    "91.5": 6.24241290850423,
    "92": 6.25679998852265,
    "92.5": 6.27121790838467,
    "93": 6.28566666809029,
    "93.5": 6.30014626763949,
    "94": 6.3146567070323,
    "94.5": 6.32919798626869,
    "95": 6.34377010534868,
    "95.5": 6.35515211823876,
    "96": 6.36117552519078,
    "96.5": 6.36719893214279,
    "97": 6.37322233909481,
    "97.5": 6.37924574604683,
    "98": 6.38526915299885,
    "98.5": 6.39129255995086,
    "99": 6.39731596690288,
    "99.5": 6.4033393738549,
    "100": 6.40936278080691,
    "100.5": 6.41538618775893,
    "101": 6.42140959471095,
    "101.5": 6.42810102422851,
    "102": 6.4381130220276,
    "102.5": 6.44814475711987,
    "103": 6.45819622950533,
    "103.5": 6.46826743918396,
    "104": 6.47835838615578,
    "104.5": 6.48846907042078,
    "105": 6.49859949197897,
    "105.5": 6.50874965083034,
    "106": 6.51891954697488,
    "106.5": 6.52910918041262,
    "107": 6.53931855114353,
    "107.5": 6.54954765916763,
    "108": 6.5597965044849,
    "108.5": 6.57006508709537,
    "109": 6.58035340699901,
    "109.5": 6.59066146419583,
    "110": 6.60098925868584,
    "110.5": 6.61133679046903,
    "111": 6.62170405954541,
    "111.5": 6.63209106591496,
    "112": 6.6424978095777,
    "112.5": 6.65292429053362,
    "113": 6.66337050878272,
    "113.5": 6.67383646432501,
    "114": 6.68432215716047,
    "114.5": 6.69482758728912,
    "115": 6.70535275471095,
    "115.5": 6.71589765942597,
    "116": 6.72646230143416,
    "116.5": 6.73704668073554,
    "117": 6.7476507973301,
    "117.5": 6.75827465121785,
    "118": 6.76891824239878,
    "118.5": 6.77958157087288,
    "119": 6.79026463664017,
    "119.5": 6.80096743970065,
    "120": 6.8116899800543,
    "120.5": 6.82243225770114,
    "121": 6.83319427264116,
    "121.5": 6.84397602487436,
    "122": 6.85477751440075,
    "122.5": 6.86559874122032,
    "123": 6.87643970533307,
    "123.5": 6.887300406739,
    "124": 6.89818084543811,
    "124.5": 6.90908102143041,
    "125": 6.92000093471589,
    "125.5": 6.93094058529455,
    "126": 6.9418999731664,
    "126.5": 6.95287909833142,
    "127": 6.96387796078963,
    "127.5": 6.97489656054102,
    "128": 6.9859348975856,
    "128.5": 6.99699297192335,
    "129": 7.00807078355429,
    "129.5": 7.01916833247841,
    "130": 7.03028561869571,
    "130.5": 7.0414226422062,
    "131": 7.05257940300987,
    "131.5": 7.06375590110672,
    "132": 7.07495213649675,
    "132.5": 7.08616810917997,
    "133": 7.09740381915636,
    "133.5": 7.10865926642595,
    "134": 7.11993445098871,
    "134.5": 7.13122937284465,
    "135": 7.14254403199378,
    "135.5": 7.15387842843609,
    "136": 7.16523256217158,
    "136.5": 7.17660643320025,
    "137": 7.18800004152211,
    "137.5": 7.19941338713715,
    "138": 7.21084647004537,
    "138.5": 7.22229929024677,
    "139": 7.23377184774136,
    "139.5": 7.24526414252913,
    "140": 7.25677617461008,
    "140.5": 7.26830794398421,
    "141": 7.27985945065153,
    "141.5": 7.29143069461203,
    "142": 7.30302167586571,
    "142.5": 7.31463239441257,
    "143": 7.32626285025261,
    "143.5": 7.33791304338584,
    "144": 7.34958297381225,
    "144.5": 7.35633212065025,
    "145": 7.3611507957436,
    "145.5": 7.36596947083695,
    "146": 7.37078814593031,
    "146.5": 7.37560682102366,
    "147": 7.38042549611702,
    "147.5": 7.38524417121037,
    "148": 7.39006284630373,
    "148.5": 7.39488152139708,
    "149": 7.39970019649044,
    "149.5": 7.40451887158379,
    "150": 7.40933754667714,
    "150.5": 7.4141562217705,
    "151": 7.41897489686385,
    "151.5": 7.42379357195721,
    "152": 7.43007638556743,
    "152.5": 7.43808746166121,
    "153": 7.44611116942217,
    "153.5": 7.45414750885032,
    "154": 7.46219647994565,
    "154.5": 7.47025808270816,
    "155": 7.47833231713785,
    "155.5": 7.48641918323473,
    "156": 7.49451868099879,
    "156.5": 7.50263081043003,
    "157": 7.51075557152846,
    "157.5": 7.51889296429407,
    "158": 7.52704298872686,
    "158.5": 7.53520564482683,
    "159": 7.54338093259399,
    "159.5": 7.55156885202833,
    "160": 7.55976940312986,
    "160.5": 7.56798258589856,
    "161": 7.57620840033445,
    "161.5": 7.58444684643752,
    "162": 7.59269792420778,
    "162.5": 7.60096163364522,
    "163": 7.60923797474984,
    "163.5": 7.61752694752164,
    "164": 7.62582855196063,
    "164.5": 7.6341427880668,
    "165": 7.64246965584015
  };
  
  function getAvgRecurveHits(recurveChance) {
    // Convert numeric chance to a string key that exactly matches
    // the object’s keys. If you are certain "chance" is always exactly
    // a multiple of 0.5, you can use chance.toString() or toFixed(1).
    //
    // But be careful with floating-point edge cases in JavaScript:
    //  (e.g. 3.5 might be internally 3.499999999999).
    // If in doubt, consider rounding to 1 decimal place carefully.
    
    const key = String(recurveChance);
    
    if (Object.prototype.hasOwnProperty.call(avgHitsLookup, key)) {
      return avgHitsLookup[key];
    }
    return NaN;
  }
  