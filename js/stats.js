var statNum = 0;
const stats = Object.freeze({
    STRENGTH: statNum++,
    DEXTERITY: statNum++,
    INTELLIGENCE: statNum++,
    ATTUNEMENT: statNum++,
    VITALITY: statNum++,
    ALL_ATTRIBUTES: statNum++,

    INCREASED_HEALTH: statNum++,
    FLAT_MANA: statNum++,
    INCREASED_MANA: statNum++,
    FLAT_HEALTH_REGEN: statNum++,
    INCREASED_HEALTH_REGEN: statNum++,
    FLAT_MANA_REGEN: statNum++,
    INCREASED_MANA_REGEN: statNum++,

    INCREASED_MOVEMENT_SPEED: statNum++,

    FLAT_HEALTH: statNum++,
    DODGE_CONVERTED_TO_ENDURANCE: statNum++,
    FLAT_ARMOR: statNum++,

    FIRE_RESISTANCE: statNum++,
    COLD_RESISTANCE: statNum++,
    LIGHTNING_RESISTANCE: statNum++,
    PHYSICAL_RESISTANCE: statNum++,
    NECROTIC_RESISTANCE: statNum++,
    POISON_RESISTANCE: statNum++,
    VOID_RESISTANCE: statNum++,
    ALL_RESISTANCES: statNum++,
    
    PENETRATION: statNum++,
    AILMENT_DAMAGE: statNum++,
    CHANCE_TO_APPLY_AILMENT: statNum++,

    ADDITIONAL_RECURVE_CHANCE: statNum++,
    HITS_PER_SECOND: statNum++,

    DAMAGE_EFFECTIVENESS: statNum++,
    INCREASED_DAMAGE: statNum++,
    MORE_DAMAGE: statNum++,
    MORE_ARMOUR: statNum++,
    MORE_HIT_SPEED: statNum++,
    INCREASED_HITS: statNum++,

    DODGE_RATING: statNum++,
    INCREASED_DODGE_RATING: statNum++,
    INCREASED_ARMOUR: statNum++,
    LESS_DAMAGE_TAKEN: statNum++,
    ENDURANCE: statNum++,
    ENDURANCE_THRESHOLD: statNum++,
    MAX_HEALTH_AS_ENDURANCE_THRESHOLD: statNum++,
    REDUCED_CRIT_DAMAGE_TAKEN: statNum++,

    INCREASED_AILMENT_DURATION: statNum++,

    WARD_PER_SECOND: statNum++,

    CHANCE_TO_TAKE_ZERO_DAMAGE: statNum++,
    GLANCING_BLOW_CHANCE: statNum++,
    DODGE_CHANCE_TO_GLANCING_BLOW_CHANCE: statNum++,

    BASE_HIT_DAMAGE: statNum++,
    ADDED_FLAT_DAMAGE: statNum++,
    INCREASED_CRITICAL_STRIKE_CHANCE: statNum++,
    BASE_CRITICAL_STRIKE_CHANCE: statNum++,
    CRITICAL_STRIKE_MULTIPLIER: statNum++,
    
    WARD_RETENTION: statNum++,
    WARD_THRESHOLD: statNum++,
    CRITICAL_STRIKE_AVOIDANCE: statNum++,

    ARMOUR_SHRED_CHANCE_PHYS : statNum++,
    ARMOUR_SHRED_CHANCE_NON_PHYS : statNum++,
    ARMOUR_SHRED_DURATION : statNum++,
    ARMOUR_SHRED_EFFECT : statNum++,
    ARMOUR_MITIGATION_APPLIED_TO_DOT : statNum++,
    LESS_HIT_DAMAGE_TAKEN : statNum++,
    LESS_DOT_DAMAGE_TAKEN : statNum++,

    FLAT_ARMOUR_SHRED : statNum++,

    BLOCK_CHANCE: statNum++,
    BLOCK_EFFECTIVENESS: statNum++,
    INCREASED_BLOCK_EFFECTIVENESS: statNum++,

    MANA_BEFORE_HEALTH: statNum++,
    ENDURANCE_APPLIED_TO_MANA: statNum++,

    INCREASED_ENDURANCE_THRESHOLD: statNum++,

    SKILL_COOLDOWN: statNum++,
    CDR: statNum++,

    LOW_LIFE: statNum++,

    MORE_DAMAGE_1: statNum++,

    ECHO_CHANCE: statNum++,
    ECHO_DAMAGE: statNum++,

    MANA_COST: statNum++,
});

function getStatName(key) {
    var numKey = Number(key);
    switch(numKey) {
        case stats.STRENGTH: return "Strength";
        case stats.DEXTERITY: return "Dexterity";
        case stats.INTELLIGENCE: return "Intelligence";
        case stats.ATTUNEMENT: return "Attunement";
        case stats.VITALITY: return "Vitality";
        case stats.ALL_ATTRIBUTES: return "All Attributes";

        case stats.INCREASED_HEALTH: return "Increased Health";
        case stats.FLAT_MANA: return "Flat Mana";
        case stats.INCREASED_MANA: return "Increased Mana";
        case stats.FLAT_HEALTH_REGEN: return "Flat Health Regen";
        case stats.INCREASED_HEALTH_REGEN: return "Increased Health Regen";
        case stats.FLAT_MANA_REGEN: return "Flat Mana Regen";
        case stats.INCREASED_MANA_REGEN: return "Increased Mana Regen";

        case stats.INCREASED_MOVEMENT_SPEED: return "Increased Movement Speed";

        case stats.FLAT_HEALTH: return "Flat Health";
        case stats.FLAT_ARMOR: return "Flat Armor";

        case stats.FIRE_RESISTANCE: return "Fire Resistance";
        case stats.COLD_RESISTANCE: return "Cold Resistance";
        case stats.LIGHTNING_RESISTANCE: return "Lightning Resistance";
        case stats.PHYSICAL_RESISTANCE: return "Physical Resistance";
        case stats.NECROTIC_RESISTANCE: return "Necrotic Resistance";
        case stats.POISON_RESISTANCE: return "Poison Resistance";
        case stats.VOID_RESISTANCE: return "Void Resistance";
        case stats.ALL_RESISTANCES: return "All Resistances";

        case stats.PENETRATION: return "Penetration";
        case stats.AILMENT_DAMAGE: return "AILMENT DAMAGE";
        case stats.CHANCE_TO_APPLY_AILMENT: return "Chance to Apply Ailment";

        case stats.HITS_PER_SECOND: return "HITS PER SECOND";
        case stats.ADDITIONAL_RECURVE_CHANCE: return "ADDITIONAL RECURVE CHANCE";

        case stats.DAMAGE_EFFECTIVENESS: return "DAMAGE EFFECTIVENESS";
        case stats.INCREASED_DAMAGE: return "Increased Damage";
        case stats.MORE_DAMAGE: return "More Damage";
        case stats.MORE_ARMOUR: return "More Armor";
        case stats.MORE_HIT_SPEED: return "More Hit Speed";
        case stats.INCREASED_HITS: return "Increased Hit Speed";

        case stats.DODGE_RATING: return "Dodge Rating";
        case stats.INCREASED_DODGE_RATING: return "Increased Dodge Rating";
        case stats.INCREASED_ARMOUR: return "Increased Armor";
        case stats.LESS_DAMAGE_TAKEN: return "Less Damage Taken";
        case stats.ENDURANCE: return "Endurance";
        case stats.ENDURANCE_THRESHOLD: return "Endurance Threshold";
        case stats.MAX_HEALTH_AS_ENDURANCE_THRESHOLD: return "Max Health as Endurance Threshold";
        case stats.REDUCED_CRIT_DAMAGE_TAKEN: return "Reduced Crit Damage Taken";

        case stats.INCREASED_AILMENT_DURATION: return "Increased Ailment Duration";

        case stats.WARD_PER_SECOND: return "Ward per Second";

        case stats.CHANCE_TO_TAKE_ZERO_DAMAGE: return "Chance to take 0 Damage when Hit";
        case stats.GLANCING_BLOW_CHANCE: return "Glancing Blow Chance";
        case stats.DODGE_CHANCE_TO_GLANCING_BLOW_CHANCE: return "Dodge Chance to Glancing Blow Chance";

        case stats.BASE_HIT_DAMAGE: return "BASE HIT DAMAGE";
        case stats.ADDED_FLAT_DAMAGE: return "Added Flat Damage";
        case stats.INCREASED_CRITICAL_STRIKE_CHANCE: return "Increased Critical Strike Chance";
        case stats.BASE_CRITICAL_STRIKE_CHANCE: return "Base Critical Strike Chance";
        case stats.CRITICAL_STRIKE_MULTIPLIER: return "Critical Strike Multiplier";

        case stats.WARD_RETENTION: return "Ward Retention";
        case stats.WARD_THRESHOLD: return "Ward Decay Threshold";
        case stats.CRITICAL_STRIKE_AVOIDANCE: return "Critical Strike Avoidance";
        case stats.DODGE_CONVERTED_TO_ENDURANCE: return "Dodge Rating converted to Endurance Threshold";
        case stats.ARMOUR_SHRED_CHANCE_PHYS: return "Chance to Shred Armor on Hit (phys)";
        case stats.ARMOUR_SHRED_CHANCE_NON_PHYS: return "Chance to Shred Armor on Hit (non-phys)";
        case stats.ARMOUR_SHRED_DURATION: return "Increased Armor Shred Duration";
        case stats.ARMOUR_SHRED_EFFECT: return "Increased Armor Shred Effect";
        case stats.ARMOUR_MITIGATION_APPLIED_TO_DOT: return "Armor Mitigation Applied to Damage Over Time";
        case stats.LESS_HIT_DAMAGE_TAKEN: return "Less Hit Damage Taken";
        case stats.LESS_DOT_DAMAGE_TAKEN: return "Less Damage Over Time Taken";

        case stats.FLAT_ARMOUR_SHRED: return "Flat Armor Shred";

        case stats.BLOCK_CHANCE: return "Block Chance";
        case stats.BLOCK_EFFECTIVENESS: return "Block Effectiveness";
        case stats.INCREASED_BLOCK_EFFECTIVENESS: return "Increased Block Effectiveness";

        case stats.MANA_BEFORE_HEALTH: return "Damage Dealt to Mana Before Health";
        case stats.ENDURANCE_APPLIED_TO_MANA: return "Endurance applies to all damage dealt to mana";
    
        case stats.INCREASED_ENDURANCE_THRESHOLD: return "Increased Endurance Threshold";

        case stats.SKILL_COOLDOWN: return "SKILL COOLDOWN";
        case stats.CDR: return "Cooldown Reduciton Speed";

        case stats.LOW_LIFE: return "LOW LIFE";

        case stats.MORE_DAMAGE_1: return "More Damage 1";

        case stats.ECHO_CHANCE: return "Echo Chance";
        case stats.ECHO_DAMAGE: return "Increased Echo Damage";

        case stats.MANA_COST: return "Mana Cost";
    }
    return "Unknown";
}

function getAllStatNames() {
    const frequencyMap = {};

    // Count frequencies of used stat names
    document.querySelectorAll(".stat-entry input[list]").forEach(input => {
        const name = input.value.trim();
        if (name) frequencyMap[name] = (frequencyMap[name] || 0) + 1;
    });

    // Get all stat names from stats object
    const allNames = Object.values(stats).map(getStatName);

    // Sort by frequency (desc), fallback alphabetically
    return allNames.slice().sort((a, b) => {
        const freqA = frequencyMap[a] || 0;
        const freqB = frequencyMap[b] || 0;
        if (freqA !== freqB) return freqB - freqA;
        return a.localeCompare(b);
    });
}

const statNameToIndex = Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [getStatName(value), value])
  );