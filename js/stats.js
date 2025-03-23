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
    FLAT_DAMAGE: statNum++,
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

    INCREASED_DAMAGE_PER_MS: statNum++,
    GLANCING_BLOW_CHANCE: statNum++,
    DODGE_CHANCE_TO_GLANCING_BLOW_CHANCE: statNum++,
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
        case stats.FLAT_DAMAGE: return "Flat Damage";
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
        case stats.MORE_ARMOUR: return "More Armour";
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

        case stats.INCREASED_DAMAGE_PER_MS: return "Increased Damage per MS";
        case stats.GLANCING_BLOW_CHANCE: return "Glancing Blow Chance";
        case stats.DODGE_CHANCE_TO_GLANCING_BLOW_CHANCE: return "Dodge Chance to Glancing Blow Chance";
        
    }
    return "Unknown";
}

function getAllStatNames() {
    return Object.values(stats).map(getStatName);
}

const statNameToIndex = Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [getStatName(value), value])
  );