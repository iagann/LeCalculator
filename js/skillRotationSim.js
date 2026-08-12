/**
 * Simulates a priority-ordered set of skills (e.g. a minion using multiple
 * attacks, some on cooldown, one fallback with cooldown 0) and returns
 * steady-state average stats: average base damage per hit, average damage
 * effectiveness per hit, and average hits per second.
 *
 * Skill row format: [baseDamage, baseAttackSpeed, effectiveness, cooldown]
 * Array order = priority order (index 0 = tried first each "tick").
 * cooldown === 0 means no cooldown (always available - used for fallback).
 */

function simulateSkillRotation(skills, increasedHitSpeed, moreHits, crd) {
    const n = skills.length;

    // Per-skill effective attack speed & cast duration
    const hitSpeedMult = (100 + increasedHitSpeed) / 100;
    const moreHitsMult = moreHits / 100;
    const effAtkSpd = skills.map(s => s[1] * hitSpeedMult * moreHitsMult);
    const castDuration = effAtkSpd.map(v => (v > 0 ? 1 / v : Infinity));

    // Effective cooldown (increased CDR reduces cooldown duration)
    const cdrMult = 1 + crd / 100;
    const effCooldown = skills.map(s => (s[3] > 0 ? s[3] / cdrMult : 0));

    const readyAt = new Array(n).fill(0);
    const history = []; // { skillIdx, startTime }
    const seenStates = new Map(); // stateKey -> { cast, time }

    const MAX_CASTS = 20000;
    const EPS = 1e-6;
    const ROUND = 1e4; // state rounding precision (0.0001s) for cycle detection

    let t = 0;
    let cycleStartIdx = -1;
    let cycleStartTime = 0;

    for (let cast = 0; cast < MAX_CASTS; cast++) {
        // Pick the highest-priority skill that's off cooldown
        let chosen = -1;
        for (let i = 0; i < n; i++) {
            if (readyAt[i] <= t + EPS) { chosen = i; break; }
        }
        if (chosen === -1) {
            // Shouldn't happen if a fallback (cooldown 0) exists, but guard anyway
            let minReady = Math.min(...readyAt);
            t = minReady;
            chosen = readyAt.indexOf(minReady);
        }

        // State = how much time remains on each skill's cooldown, rounded
        const stateKey = readyAt
            .map((r, i) => (effCooldown[i] > 0 ? Math.round((r - t) * ROUND) / ROUND : 0))
            .join(',');

        if (seenStates.has(stateKey)) {
            const prev = seenStates.get(stateKey);
            cycleStartIdx = prev.cast;
            cycleStartTime = prev.time;
            break;
        }
        seenStates.set(stateKey, { cast, time: t });

        const dur = castDuration[chosen];
        history.push({ skillIdx: chosen, startTime: t });

        if (effCooldown[chosen] > 0) {
            readyAt[chosen] = t + effCooldown[chosen];
        }
        t += dur;
    }

    // Determine the steady-state window to average over
    let startIdx, startTime;
    if (cycleStartIdx >= 0) {
        startIdx = cycleStartIdx;
        startTime = cycleStartTime;
    } else {
        // No exact repeat found (e.g. irrational-ish ratios) - approximate
        // steady state using the back half of the simulated run.
        startIdx = Math.floor(history.length / 2);
        startTime = history[startIdx].startTime;
    }

    const window = history.slice(startIdx);
    const hits = window.length;
    const totalTime = t - startTime;

    let sumBaseDamage = 0;
    let sumEffectiveness = 0;
    for (const h of window) {
        sumBaseDamage += skills[h.skillIdx][0];
        sumEffectiveness += skills[h.skillIdx][2];
    }

    return {
        avgBaseDamage: hits ? sumBaseDamage / hits : 0,
        avgEffectiveness: hits ? sumEffectiveness / hits : 0,
        hitsPerSecond: totalTime > 0 ? hits / totalTime : 0,
    };
}

// ---- Caching layer ----
// Outer map keyed by the raw damageEffectivenessExpr string (so we never
// store the skill array more than once). Inner map keyed by the 3 values
// that actually vary between calls.
const skillSetCache = new Map();

function getAverageSkillStats(damageEffectivenessExpr, increasedHitSpeed, moreHits, crd) {
    let innerCache = skillSetCache.get(damageEffectivenessExpr);
    if (!innerCache) {
        innerCache = new Map();
        skillSetCache.set(damageEffectivenessExpr, innerCache);
    }

    const key = `${increasedHitSpeed}|${moreHits}|${crd}`;
    if (innerCache.has(key)) {
        return innerCache.get(key);
    }

    const skills = JSON.parse(damageEffectivenessExpr);
    const result = simulateSkillRotation(skills, increasedHitSpeed, moreHits, crd);
    innerCache.set(key, result);
    console.log(damageEffectivenessExpr, increasedHitSpeed, moreHits, crd, result);
    return result;
}