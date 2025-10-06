// summary.js

let highlightSummaryNames = new Set();
function updateSummary() {
    const allStats = [];
  
    document.querySelectorAll(".section").forEach(section => {
      const sectionEnabled = section.querySelector(".section-enabled")?.checked;
      if (!sectionEnabled) return;
  
      const sectionName = section.querySelector(".section-header input[placeholder='Section Name']").value;

      //if (sectionName == "[item][relic] Vessel of Strife")
      //  console.log(1);

      section.querySelectorAll(".stat-entry").forEach(statEntry => {
        const statEnabled = statEntry.querySelector(".stat-enabled")?.checked;
        if (!statEnabled) return;
  
        const statName = statEntry.querySelector("input[placeholder='Choose Stat...']")?.value;
        const statKey = Object.keys(stats).find(key => getStatName(stats[key]) === statName);
  
        const expressionInput = statEntry.querySelector("input[placeholder='Math Expression']");
        const expression = expressionInput?.value || "";
        if (expressionInput) expressionInput.title = "";
  
        if (statKey) {
          const statID = stats[statKey];
          allStats.push([statID, expression, sectionName]);
        }
      });
    });
  
    const baseSummary = processStats(allStats);
    document.querySelectorAll("input[placeholder='Math Expression']").forEach(input => {
        let expression = input.value;
        expression = replaceExpressionAll(expression);
        const statValue = evaluateExpression(expression);
        if (!isNaN(statValue)) {
            input.title = statValue;
        }
       
    });
    renderSummary(baseSummary);
  
    const baseMap = {};
    highlightSummaryNames.forEach(name => {
        const found = baseSummary.find(s => s.name === name && s.type !== "section" && s.type !== "hr");
        baseMap[name] = found ? found.total : 0;
      });

    function collectSectionCache() {
        const sectionCache = [];
      
        document.querySelectorAll(".section").forEach((sec) => {
          const sectionEnabled = sec.querySelector(".section-enabled")?.checked;
          const sectionName = sec.querySelector(".section-header input[placeholder='Section Name']")?.value || "";
      
          const statEntries = Array.from(sec.querySelectorAll(".stat-entry")).map(stat => {
            const statEnabled = stat.querySelector(".stat-enabled")?.checked;
            const statName = stat.querySelector("input[placeholder='Choose Stat...']")?.value;
            const statKey = Object.keys(stats).find(k => getStatName(stats[k]) === statName);
            const statID = statKey ? stats[statKey] : null;
            const expr = stat.querySelector("input[placeholder='Math Expression']")?.value || "";
      
            return { element: stat, enabled: statEnabled, statID, expr };
          });
      
          sectionCache.push({ element: sec, enabled: sectionEnabled, name: sectionName, statEntries: statEntries });
        });
      
        return sectionCache;
      }
      
      function computeDelta(element, sectionCache) {
        // 1) Build final states after toggling
        const finalSectionEnabled = new Map();
        const finalStatEnabled = new Map();
      
        sectionCache.forEach(sec => {
          let secEnabled = sec.enabled;
          finalSectionEnabled.set(sec.element, secEnabled);
          sec.statEntries.forEach(stat => {
            let stEnabled = stat.enabled;
            finalStatEnabled.set(stat.element, stEnabled);
          });
        });
      
        // 2) Collect toggledStats
        const toggledStats = [];
      
        sectionCache.forEach(sec => {
          const secIsEnabled = finalSectionEnabled.get(sec.element);
      
          sec.statEntries.forEach(stat => {
            const statIsEnabled = finalStatEnabled.get(stat.element);

            let includeThisStat = false;
            let invertExpr = false;
            // if everything is enabled and nothing is toggled
            if (secIsEnabled && statIsEnabled && sec.element!= element && stat.element != element) {
                includeThisStat = true;
            }
            // section is enabled, but stat is disabled and toggled, not enabled in base, need to enable for delta
            else if (secIsEnabled && !statIsEnabled && stat.element == element) {
                includeThisStat = true;
            }
            // if toggled section is disabled, add enabled stats
            else if (!secIsEnabled && statIsEnabled && sec.element == element) {
                includeThisStat = true;
            }
            // if toggling stat in disabled section
            else if (!secIsEnabled && stat.element == element) {
                includeThisStat = true;
                // enabled stat is not counted in base, so to calculate delta need to add the opposite expression
                invertExpr = statIsEnabled;
            }
            
            if (includeThisStat) {
                // if toggling a disabled stat, whether this section is enabled or not, invert expression
                const expr = (invertExpr) ? `-(${stat.expr})` : stat.expr;
                toggledStats.push([stat.statID, expr, sec.name]);
            }
          });
        });
      
        // 3) Compute new summary from toggledStats
        const newSummary = processStats(toggledStats);
      
        // 4) Compare vs baseMap for each highlight stat
        const deltas = {};
        highlightSummaryNames.forEach(name => {
          const oldVal = baseMap[name] || 0;
          const newVal = newSummary.find(s => s.name === name && s.type !== "section" && s.type !== "hr")?.total || 0;
          if (isNaN(newVal))
            console.log("isNan");
      
          let perc = 0;
          if (Math.abs(oldVal) < 1e-12) {
            perc = newVal === 0 ? 0 : 100;
          } else {
            perc = ((newVal - oldVal) / oldVal) * 100;
          }
          deltas[name] = perc;
        });
      
        return deltas;
      }
      
  
    function formatPercent(value, wasEnabled) {
        const pct = value.toFixed(2) + "%";
      
        if (Math.abs(value) < 0.05) {
          return `<span style="color:gray">+0.0%</span>`;
        }
      
        const isPositive = value >= 0;
      
        if (wasEnabled) {
          // The stat/section is currently ENABLED.
          // If removing it results in a negative delta → it contributes positively → green
          return isPositive
            ? `<span style="color:#267526;">+${pct}</span>`
            : `<span style="color:#ff4e4e;">${pct}</span>`;
        } else {
          // The stat/section is currently DISABLED.
          // If adding it results in a positive delta → it would contribute → green
          return isPositive
            ? `<span style="color:#267526;">+${pct}</span>`
            : `<span style="color:#ff4e4e;">${pct}</span>`;
        }
      }
      
  
    document.querySelectorAll(".contribution-info").forEach(el => el.remove());
  
    function addContribInfo(parentElem, deltas, wasEnabled) {
        const container = document.createElement("span");
        container.classList.add("contribution-info");
        container.style.borderLeft = "1px solid #888";
        container.style.marginLeft = "8px";
        container.style.paddingLeft = "8px";
        container.style.display = "inline-block";
        container.style.verticalAlign = "middle";
    
        const itemWidth = "120px";
    
        highlightSummaryNames.forEach(name => {
            const val = deltas[name];
            const span = document.createElement("span");
            span.style.display = "inline-block";
            span.style.width = itemWidth;
            span.style.marginRight = "5px";
            span.style.verticalAlign = "top";
            span.innerHTML = `<div style="text-align:right">${name}:<br>${formatPercent(val, wasEnabled)}</div>`;
            container.appendChild(span);
        });
    
        parentElem.insertAdjacentElement("afterend", container);
    }
    
    const sectionCache = collectSectionCache();
    document.querySelectorAll(".section").forEach(sec => {
        const secCopy = sec;
        const deltas = computeDelta(secCopy, sectionCache);
        const deleteBtn = secCopy.querySelector(".btn-delete");
        if (deleteBtn) {
          addContribInfo(deleteBtn, deltas, secCopy.querySelector(".section-enabled")?.checked);
        }
      
        sec.querySelectorAll(".stat-entry").forEach(stat => {
          const statDeltas = computeDelta(stat, sectionCache);
          const statDeleteBtn = stat.querySelector(".btn-delete");
          if (statDeleteBtn) {
            addContribInfo(statDeleteBtn, statDeltas, stat.querySelector(".stat-enabled")?.checked);
          }
        });
      });
      
    updateSortDropdown();
    applySectionSort();
  }
  
function statIsMore(statId) {
    return statId == stats.MORE_DAMAGE
    || statId == stats.MORE_ARMOUR
    || statId == stats.MORE_HIT_SPEED
    || statId == stats.LESS_DAMAGE_TAKEN
    || statId == stats.LESS_HIT_DAMAGE_TAKEN
    || statId == stats.LESS_DOT_DAMAGE_TAKEN;
}

function statIsOpposite(statId) {
    return statId == stats.LESS_DAMAGE_TAKEN
    || statId == stats.LESS_HIT_DAMAGE_TAKEN
    || statId == stats.LESS_DOT_DAMAGE_TAKEN;
}

var processExpressionsCount = 0;
function replaceExpressionAll(expression) {
    function containsLetters(str) {
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            // A-Z: 65–90, a-z: 97–122
            if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
                return true;
            }
        }
        return false;
    }
    function replaceExpression(key, value) {
        if (expression.includes(key) && value > 0)
            expression = expression.replaceAll(key, value);
    }

    if (containsLetters(expression))
    {
        replaceExpression("str", strength);
        replaceExpression("dex", dexterity);
        replaceExpression("int", intelligence);
        replaceExpression("attu", attunement);
        replaceExpression("vit", vitality);
        replaceExpression("recurve", getAvgRecurveHits(recurveChance - 100));
        replaceExpression("hps", hitsPerSecond);
        replaceExpression("maxHP", maxHealth);
        replaceExpression("enduranceThreshold", totalEnduranceThreshold);
        replaceExpression("endurance", totalEndurance);
        replaceExpression("ms", increasedMS);
        replaceExpression("dodgeRating", totalDodgeRating);
        replaceExpression("cdr", cdr);
        replaceExpression("fireRes", fireResist);
        replaceExpression("coldRes", coldResist);
        replaceExpression("lightningRes", lightningResist);
        replaceExpression("physRes", physResist);
        replaceExpression("necroticRes", necroticResist);
        replaceExpression("poisonRes", poisonResist);
        replaceExpression("voidRes", voidResist);
        replaceExpression("HpRegen", hpRegen);
        //wasExpression = wasExpression || expression != statData.expression;
    }
    return expression;
}
function processExpressions() {
    let expression = "";
    
    
    let allStatsArray = Object.entries(allStats);
    //let wasExpression = false;
    for (const [statId, statData] of allStatsArray) {
        if (statData.expression) {
            expression = statData.expression;
            
            //if (expression.includes("HpRegen"))
            //    console.log(1);
            expression = replaceExpressionAll(expression);            
            //if (statId == 50)
                //console.log("expression", statId, getStatName(statId), processExpressionsCount, "=>" ,statData.expression, expression);
            
            const statValue = evaluateExpression(expression);
            if (!isNaN(statValue)) {
                statData.expression = null;
                if (statIsMore(statId)) {
                    if (isNaN(statData.total))
                        statData.total = 100;
                    statData.total *= (100 + (statIsOpposite(statId) ? -statValue : statValue)) / 100;
                    //console.log("more processExpressions", expression, statId, getStatName(statId), statValue, statData.total);
                }
                else {
                    if (isNaN(statData.total))
                        statData.total = 0;
                    statData.total += statValue;
                    /*
                    if (statId == 50)
                        console.log("statData.total", statId, getStatName(statId), statData.total - statValue, "=>", statData.total);
                    */
                }
            }
            
        }
    }
/*
    if (wasExpression)
        processExpressions();
*/
    processExpressionsCount++;
}

function armorDr(value, isPhys) {
    const x = value;
    const x2 = Math.pow(x, 2);
    const a = 100;
    totalArmorDrPhys = 1.2 * x / (80 + 0.05 * Math.pow(a + 5, 2) + 1.2 * x) * 0.3;
    totalArmorDrPhys += 0.0012 * x2 / (180 * (a + 5) + 0.0015 * x2) * 0.55;

    totalArmorDrPhys *= 100;

    totalArmorDr = totalArmorDrPhys * 0.7;

    totalArmorDrPhys = Math.min(totalArmorDrPhys, 85);
    totalArmorDr = Math.min(totalArmorDr, 85);

    if (isPhys)
        return totalArmorDrPhys;
    else
        return totalArmorDr; 
}

let allStats = {};
let strength = 0;
let dexterity = 0;
let intelligence = 0;
let attunement = 0;
let vitality = 0;
let recurveChance = 0;
let hitsPerSecond = 0;
let maxHealth = 0;
let totalEndurance = 0;
let totalEnduranceThreshold = 0;
let increasedMS = 0;
let totalDodgeRating = 0;
let cdr = 0;
let fireResist = 0;
let coldResist = 0;
let lightningResist = 0;
let physResist = 0;
let necroticResist = 0;
let poisonResist = 0;
let voidResist = 0;
let hpRegen = 0;

function processStats(statsArray, firstRun = true) {
    processExpressionsCount = 0;

    allStats = {};
    dexterity = 0;
    intelligence = 0;
    attunement = 0;
    recurveChance = 0;
    hitsPerSecond = 0;
    maxHealth = 0;
    totalEnduranceThreshold = 0;
    increasedMS = 0;
    totalDodgeRating = 0;

    var passiveCount = new Map();
    var passiveSources = new Map();

    statsArray.forEach(([statId, expression, sectionName]) => {
        //if (statId == stats.WARD_PER_SECOND)
        //    console.log(1);

        if (sectionName.includes("[passive]") && expression.includes("*")) {
            let lastIndex = expression.lastIndexOf("*");
            let result = "0";

            if (lastIndex !== -1 && lastIndex < expression.length - 1) {
                const tail = expression.substring(lastIndex + 1);
                let ok = tail.length > 0; // require non-empty (adjust if you want empty allowed)
                for (let i = 0; ok && i < tail.length; i++) {
                    const c = tail[i];
                    const code = c.charCodeAt(0);
                    const isDigit = code >= 48 && code <= 57; // '0'..'9'
                    const isSpace = c === " ";                // ASCII space only
                    if (!isDigit && !isSpace) ok = false;
                }
                if (ok) result = tail;
            }
            let intResult = evaluateExpression(result);
            if (!isNaN(intResult) && intResult > 0) {
                var passiveSectionName = sectionName.substr("[passive]".length).trim();
                if (!passiveCount.has(passiveSectionName)) {
                    passiveCount.set(passiveSectionName, 0);
                }
                if (!passiveSources.has(passiveSectionName)) {
                    passiveSources.set(passiveSectionName, []);
                }

                passiveCount.set(passiveSectionName, passiveCount.get(passiveSectionName) + intResult);
                passiveSources.get(passiveSectionName).push(`${sectionName} — ${getStatName(statId)}: ${expression}`);
            }
        }

        const statValue = evaluateExpression(expression);
        const statName = getStatName(statId);

        if (!allStats[statId]) {
            allStats[statId] = { name: statName, total: statIsMore(statId) ? 100 : 0, sources: [] };
        }

        if (isNaN(statValue)) {
            if (allStats[statId].expression) {
                allStats[statId].expression += " + " + expression;
            }
            else {
                allStats[statId].expression = expression;
            }
            allStats[statId].sources.push(`${sectionName} — ${getStatName(statId)}: ${expression}`);
            /*
            if (statId == 50)
                console.log("allStats[statId].total expression", statId, getStatName(statId), expression);
            */
        }
        else {
            if (statIsMore(statId)) {
                var was = allStats[statId].total;
                allStats[statId].total *= (100 + (statIsOpposite(statId) ? -statValue : statValue)) / 100;
                //console.log("more processStats", statId, getStatName(statId), statValue, was, "=>", allStats[statId].total);
            }
            else {
                allStats[statId].total += statValue;
            }
            /*
            if (statId == 50)
                console.log("allStats[statId].total", statId, getStatName(statId), allStats[statId].total - statValue, "=>", allStats[statId].total);
            */
            allStats[statId].sources.push(`${sectionName} — ${getStatName(statId)}: ${statValue}`);
        }
    });

    let summary = [];

    // attributes
    summary.push({name:"Attributes", type:"section"});
    const allAttributes = allStats[stats.ALL_ATTRIBUTES]?.total || 0;
    strength = allAttributes + (allStats[stats.STRENGTH]?.total || 0);
    dexterity = allAttributes + (allStats[stats.DEXTERITY]?.total || 0);
    intelligence = allAttributes + (allStats[stats.INTELLIGENCE]?.total || 0);
    attunement = allAttributes + (allStats[stats.ATTUNEMENT]?.total || 0);
    vitality = allAttributes + (allStats[stats.VITALITY]?.total || 0);
    hpRegen = NaN; // process later
    processExpressions();

    fireResist = (allStats[stats.FIRE_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    coldResist = (allStats[stats.COLD_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    lightningResist = (allStats[stats.LIGHTNING_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    physResist = (allStats[stats.PHYSICAL_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    necroticResist = vitality + (allStats[stats.NECROTIC_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    poisonResist = vitality + (allStats[stats.POISON_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);
    voidResist = (allStats[stats.VOID_RESISTANCE]?.total || 0) + (allStats[stats.ALL_RESISTANCES]?.total || 0);

    processExpressions();
    intelligence = allAttributes + (allStats[stats.INTELLIGENCE]?.total || 0);

    const flatDodge = (allStats[stats.DODGE_RATING]?.total || 0) + dexterity * 4;
    const increasedDodge = allStats[stats.INCREASED_DODGE_RATING]?.total || 0;
    totalDodgeRating = flatDodge * (100 + increasedDodge) / 100;

    const flatHealth = vitality * 6 + (allStats[stats.FLAT_HEALTH]?.total || 0);
    const increasedHealth = allStats[stats.INCREASED_HEALTH]?.total || 0;
    maxHealth = flatHealth * (1 + increasedHealth / 100);

    const enduranceThreshold = allStats[stats.ENDURANCE_THRESHOLD]?.total || 0;
    const hpAsEnduranceThreshold = (allStats[stats.MAX_HEALTH_AS_ENDURANCE_THRESHOLD]?.total || 0) / 100 * maxHealth;
    increasedMS = allStats[stats.INCREASED_MOVEMENT_SPEED]?.total || 0;

    const increasedHitSpeed = allStats[stats.INCREASED_HITS]?.total || 0;
    const moreHits = (allStats[stats.MORE_HIT_SPEED]?.total || 100);
    
    const cd = allStats[stats.SKILL_COOLDOWN]?.total || 0;
    cdr = allStats[stats.CDR]?.total || 0;

    {
        totalEnduranceThreshold = enduranceThreshold + hpAsEnduranceThreshold;
        totalEnduranceThreshold *= (100 + (allStats[stats.INCREASED_ENDURANCE_THRESHOLD]?.total || 0)) / 100;
        if ((allStats[stats.DODGE_CONVERTED_TO_ENDURANCE]?.total || 0)) {
            totalEnduranceThreshold += totalDodgeRating;
        }
        totalEnduranceThreshold = Math.min(maxHealth, totalEnduranceThreshold);

        totalEndurance = allStats[stats.ENDURANCE]?.total || 0;

        processExpressions();

        recurveChance = 100 + (allStats[stats.ADDITIONAL_RECURVE_CHANCE]?.total || -100);

        processExpressions();

        if (cd > 0) {
            hitsPerSecond = (1 / cd) * (100 + cdr) / 100;
        }
        else {
            hitsPerSecond = allStats[stats.HITS_PER_SECOND]?.total || 0;
            hitsPerSecond *= (100 + increasedHitSpeed) / 100;
            hitsPerSecond *= moreHits/100;
        }

        processExpressions();

        if (firstRun) 
            return processStats(statsArray, false);

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

        summary.push({ 
            name: "Total", 
            total: strength + dexterity + intelligence + attunement + vitality, 
            type: "stat",
            sources: [
                ...(allStats[stats.VITALITY]?.sources || []), 
                ...(allStats[stats.DEXTERITY]?.sources || []), 
                ...(allStats[stats.INTELLIGENCE]?.sources || []), 
                ...(allStats[stats.ATTUNEMENT]?.sources || []), 
                ...(allStats[stats.VITALITY]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || [])
            ]
        });
    }

    let stableWard = 0;
    let totalMana = 0;
    let wps = 0;
    summary.push({name:"HP, mana, ward", type:"section"});
    {
        // health
        summary.push({ 
            name: "Flat Health", 
            total: flatHealth, 
            type: "stat",
            sources: [
                ...(allStats[stats.FLAT_HEALTH]?.sources || []), 
                ...(allStats[stats.VITALITY]?.sources || []), 
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []), 
            ]
        });
        summary.push({ 
            name: "Increased Health", 
            total: increasedHealth, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_HEALTH]?.sources || [])
            ]
        });
        summary.push({ 
            name: "Total Health", 
            total: maxHealth, 
            type: "stat",
            sources: [
            ]
        });

         // health regen
         const flatHealthRegen = (allStats[stats.FLAT_HEALTH_REGEN]?.total || 0);
         const increasedHealthRegen = allStats[stats.INCREASED_HEALTH_REGEN]?.total || 0;
         hpRegen = flatHealthRegen * (1 + increasedHealthRegen / 100);
         processExpressions();
          summary.push({ 
             name: "Flat Health Regen", 
             total: flatHealthRegen, 
             type: "stat",
             sources: [
                 ...(allStats[stats.FLAT_HEALTH_REGEN]?.sources || []), 
             ]
         });
          summary.push({ 
             name: "Increased Health Regen", 
             total: increasedHealthRegen, 
             type: "stat",
             sources: [
                 ...(allStats[stats.INCREASED_HEALTH_REGEN]?.sources || []), 
             ]
         });
         summary.push({ 
             name: "Total Health Regen", 
             total: hpRegen, 
             type: "stat",
             sources: [
             ]
         });

        

        // mana
        {
            const flatMana = attunement * 2 + (allStats[stats.FLAT_MANA]?.total || 0);
            const increasedMana = allStats[stats.INCREASED_MANA]?.total || 0;
            totalMana = flatMana * (1 + increasedMana / 100);
            const wasManaHr = totalMana > 100;
            if (wasManaHr) {
                summary.push({type: "hr"});
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
            }

            // mana regen
            const flatManaRegen = allStats[stats.FLAT_MANA_REGEN]?.total || 0;
            const increasedManaRegen = allStats[stats.INCREASED_MANA_REGEN]?.total || 0;
            const totalManaRegen = flatManaRegen * (1 + increasedManaRegen / 100);
            if (totalManaRegen > 0) {
                if (!wasManaHr)
                    summary.push({type: "hr"});

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

            const manaCost = allStats[stats.MANA_COST]?.total || 0;
            if (manaCost > 0) {
                if (!wasManaHr)
                    summary.push({type: "hr"});
                summary.push({ 
                    name: "Mana Cost", 
                    total: manaCost, 
                    type: "stat",
                    sources: [
                        ...(allStats[stats.MANA_COST]?.sources || []),
                    ]
                });
            }
        }

        wps = allStats[stats.WARD_PER_SECOND]?.total || 0;
        const wardThreshold = (allStats[stats.WARD_THRESHOLD]?.total || 0);
        if (wps > 0 || wardThreshold > 0) {
            summary.push({type: "hr"});
            summary.push({ 
                name: "Ward Per Second", 
                total: wps, 
                type: "stat",
                sources: [
                    ...(allStats[stats.WARD_PER_SECOND]?.sources || []),
                ]
            });

            const retention = intelligence * 2 + (allStats[stats.WARD_RETENTION]?.total || 0);
            if (wps > 0) {
                summary.push({ 
                    name: "Ward Retention", 
                    total: retention, 
                    type: "stat",
                    sources: [
                        ...(allStats[stats.WARD_RETENTION]?.sources || []),
                        ...(allStats[stats.INTELLIGENCE]?.sources || []),
                        ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []),
                    ]
                });
            }

            summary.push({ 
                name: "Ward Threshold", 
                total: wardThreshold, 
                type: "stat",
                sources: [
                    ...(allStats[stats.WARD_THRESHOLD]?.sources || []),
                ]
            });

            if (wps > 0) {
                stableWard = wardThreshold + 10000 * (- 0.2 + Math.sqrt(0.04 + 0.0002 * (wps * (1 + 0.5 * retention / 100))));
                summary.push({ 
                    name: "Stable Ward", 
                    total: stableWard, 
                    type: "stat",
                    sources: [
                        `wardThreshold + 10000 * (- 0.2 + Math.sqrt(0.04 + 0.0002 * (ward per second * (1 + 0.5 * retention / 100))))`
                    ]
                });
            }
        }
        
    }

    let baseFlat = (allStats[stats.BASE_HIT_DAMAGE]?.total || 0);
    // increased damage
    let damageEffectiveness = (allStats[stats.DAMAGE_EFFECTIVENESS]?.total || 0);
    let totalFlat = 0;
    let moreFromCrits = 0;
    if (baseFlat > 0 && damageEffectiveness > 0) {
        summary.push({name:"Flat Damage", type:"section"});
        totalFlat = baseFlat + (allStats[stats.ADDED_FLAT_DAMAGE]?.total || 0) * damageEffectiveness / 100;
        summary.push({ 
            name: "Total Flat Damage", 
            total: totalFlat, 
            type: "stat",
            sources: [
                ...(allStats[stats.BASE_HIT_DAMAGE]?.sources || []),
                ...(allStats[stats.DAMAGE_EFFECTIVENESS]?.sources || []),
                ...(allStats[stats.ADDED_FLAT_DAMAGE]?.sources || []),
            ]
        });

        summary.push({name:"Crits", type:"section"});
        let baseCrit = (allStats[stats.BASE_CRITICAL_STRIKE_CHANCE]?.total || 0);
        let increasedCrit = (allStats[stats.INCREASED_CRITICAL_STRIKE_CHANCE]?.total || 0);
        let critMulti = 200 + (allStats[stats.CRITICAL_STRIKE_MULTIPLIER]?.total || 0);
        summary.push({ 
            name: "Total Base Crit Chance", 
            total: baseCrit, 
            type: "stat",
            sources: [
                ...(allStats[stats.BASE_CRITICAL_STRIKE_CHANCE]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Total Increased Crit Chance", 
            total: increasedCrit, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_CRITICAL_STRIKE_CHANCE]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Total Increased Crit Multi", 
            total: critMulti - 200, 
            type: "stat",
            sources: [
                ...(allStats[stats.CRITICAL_STRIKE_MULTIPLIER]?.sources || []),
            ]
        });
        let totalCritChance = baseCrit * (increasedCrit + 100) / 100;
        summary.push({type:"hr"});
        summary.push({ 
            name: "Total Crit Chance", 
            total: totalCritChance, 
            type: "stat",
            sources: []
        });
        totalCritChance = Math.min(100, totalCritChance);
        moreFromCrits = - totalCritChance + totalCritChance * critMulti / 100;
        summary.push({ 
            name: "Total More Damage from Crits", 
            total: moreFromCrits, 
            type: "stat",
            sources: []
        });
    }

    summary.push({name:"Damage increases", type:"section"});
    let increasedDamage = allStats[stats.INCREASED_DAMAGE]?.total || 0;
    {
        summary.push({ 
            name: "Increased Damage", 
            total: increasedDamage, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_DAMAGE]?.sources || [])
            ]
        });
    }

    // more damage
    let moreDamage1 = 0;
    {
        moreDamage1 = (allStats[stats.MORE_DAMAGE_1]?.total || 0);
        if (moreDamage1 > 0) {
            summary.push({ 
                name: "More Damage 1", 
                total: moreDamage1, 
                type: "stat",
                sources: [
                    ...(allStats[stats.MORE_DAMAGE_1]?.sources || []),
                ]
            });
        }
    }
    let moreDamage = 100;
    {
        moreDamage *= (allStats[stats.MORE_DAMAGE]?.total || 100)/100;
        moreDamage *= (moreDamage1 + 100) / 100;
        if (moreDamage > 100) {
            summary.push({ 
                name: "More Damage", 
                total: moreDamage - 100, 
                type: "stat",
                sources: [
                    ...(allStats[stats.MORE_DAMAGE_1]?.sources || []),
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
                ...(allStats[stats.INCREASED_MOVEMENT_SPEED]?.sources || [])
            ]
        });
    }
    // hit speed
    if (cd > 0) {
        summary.push({ 
            name: "Cooldown", 
            total: cd, 
            type: "stat",
            sources: [
                ...(allStats[stats.SKILL_COOLDOWN]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Increased Cooldown Recovery Speed", 
            total: cdr, 
            type: "stat",
            sources: [
                ...(allStats[stats.CDR]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Uses per second", 
            total: hitsPerSecond, 
            type: "stat",
            sources: []
        });
    }
    else {
        summary.push({ 
            name: "Increased Hit Speed", 
            total: increasedHitSpeed, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_HITS]?.sources || []),
            ]
        });

        // more hits
        if (moreHits > 0) {
            summary.push({ 
                name: "More Hits", 
                total: moreHits - 100, 
                type: "stat",
                sources: [
                    ...(allStats[stats.MORE_HIT_SPEED]?.sources || []),
                ]
            });
        }

        hitsPerSecond = allStats[stats.HITS_PER_SECOND]?.total || 0;
        hitsPerSecond *= (100 + increasedHitSpeed) / 100;
        hitsPerSecond *= moreHits/100;

        // hits per second
        let hitSpeedSummary = `${hitsPerSecond.toFixed(3)}`; 
        {
            hitSpeedSummary += ` * (100 + ${increasedHitSpeed})/100`;
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
    const increasedAilmentDuration = allStats[stats.INCREASED_AILMENT_DURATION]?.total || 0;
    {
        if (increasedAilmentDuration > 0)
            summary.push({ 
                name: "Increased Ailment Duration", 
                total: increasedAilmentDuration, 
                type: "stat",
                sources: [
                    ...(allStats[stats.INCREASED_AILMENT_DURATION]?.sources || []),
                ]
            });
    }

    let armorShredDr = 0;
    {

        const chanceToShredArmorPhys = allStats[stats.ARMOUR_SHRED_CHANCE_PHYS]?.total || 0;
        const chanceToShredArmorNonPhys = allStats[stats.ARMOUR_SHRED_CHANCE_NON_PHYS]?.total || 0;
        const armorShredDuration = allStats[stats.ARMOUR_SHRED_DURATION]?.total || 0;
        const armorShredStacksPhys = hitsPerSecond * chanceToShredArmorPhys / 100 * 4 *(100 + armorShredDuration) / 100;
        const armorShredStacksNonPhys = hitsPerSecond * chanceToShredArmorNonPhys / 100 * 4 * (100 + armorShredDuration) / 100;
        const armorShredEffect = allStats[stats.ARMOUR_SHRED_EFFECT]?.total || 0;
        const flatArmorShred = allStats[stats.FLAT_ARMOUR_SHRED]?.total || 0;
        const armorShredDrPhys = armorDr(flatArmorShred + 100 * armorShredStacksPhys * (100 + armorShredEffect) / 100, true);
        const armorShredDrNonPhys = armorDr(flatArmorShred + 100 * armorShredStacksNonPhys * (100 + armorShredEffect) / 100, false);
        armorShredDr = Math.max(armorShredDrPhys, armorShredDrNonPhys);
        summary.push({ 
            name: "Chance to Shred Armor Phys", 
            total: chanceToShredArmorPhys, 
            type: "stat",
            sources: [
                ...(allStats[stats.ARMOUR_SHRED_CHANCE_PHYS]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Chance to Shred Armor Non-Phys", 
            total: chanceToShredArmorNonPhys, 
            type: "stat",
            sources: [
                ...(allStats[stats.ARMOUR_SHRED_CHANCE_NON_PHYS]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Increased Armor Shred Duration", 
            total: armorShredDuration, 
            type: "stat",
            sources: [
                ...(allStats[stats.ARMOUR_SHRED_DURATION]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Average Armor Shred stacks Phys", 
            total: armorShredStacksPhys, 
            type: "stat",
            sources: [
                ...(allStats[stats.ARMOUR_SHRED_DURATION]?.sources || []),
                ...(allStats[stats.HITS_PER_SECOND]?.sources || []),
                ...(allStats[stats.INCREASED_HITS]?.sources || []),
                ...(allStats[stats.MORE_HIT_SPEED]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Average Armor Shred stacks Non-Phys", 
            total: armorShredStacksNonPhys, 
            type: "stat",
            sources: [
                ...(allStats[stats.HITS_PER_SECOND]?.sources || []),
                ...(allStats[stats.INCREASED_HITS]?.sources || []),
                ...(allStats[stats.MORE_HIT_SPEED]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Increased Armor Shred Effect", 
            total: armorShredEffect, 
            type: "stat",
            sources: [
                ...(allStats[stats.ARMOUR_SHRED_EFFECT]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Flat Armor Shred", 
            total: flatArmorShred, 
            type: "stat",
            sources: [
                ...(allStats[stats.FLAT_ARMOUR_SHRED]?.sources || []),
            ]
        });
        summary.push({ 
            name: "More Physical Damage from Armor Shred", 
            total: armorShredDrPhys, 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "More Non-Physical Damage from Armor Shred", 
            total: armorShredDrNonPhys, 
            type: "stat",
            sources: []
        });
    }
   

    summary.push({name:"Resistances", type:"section"});
    {
        summary.push({ 
            name: "Fire Resistance", 
            total: fireResist, 
            type: "stat",
            sources: [
                ...(allStats[stats.FIRE_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Cold Resistance", 
            total: coldResist, 
            type: "stat",
            sources: [
                ...(allStats[stats.COLD_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Lightning Resistance", 
            total: lightningResist, 
            type: "stat",
            sources: [
                ...(allStats[stats.LIGHTNING_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Physical Resistance", 
            total: physResist, 
            type: "stat",
            sources: [
                ...(allStats[stats.PHYSICAL_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Necrotic Resistance", 
            total: necroticResist, 
            type: "stat",
            sources: [
                ...(allStats[stats.NECROTIC_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
                ...(allStats[stats.VITALITY]?.sources || []),
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Poison Resistance", 
            total: poisonResist, 
            type: "stat",
            sources: [
                ...(allStats[stats.POISON_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
                ...(allStats[stats.VITALITY]?.sources || []),
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Void Resistance", 
            total: voidResist, 
            type: "stat",
            sources: [
                ...(allStats[stats.VOID_RESISTANCE]?.sources || []),
                ...(allStats[stats.ALL_RESISTANCES]?.sources || []),
            ]
        });
    }

    summary.push({name:"Armor", type:"section"});
    const flatArmor = allStats[stats.FLAT_ARMOR]?.total || 0;
    {
        summary.push({ 
            name: "Flat Armor", 
            total: flatArmor, 
            type: "stat",
            sources: [
                ...(allStats[stats.FLAT_ARMOR]?.sources || []),
            ]
        });
    }
    const increasedArmor = (allStats[stats.INCREASED_ARMOUR]?.total || 0) + strength * 4;
    {
        summary.push({ 
            name: "Increased Armor", 
            total: increasedArmor, 
            type: "stat",
            sources: [
                ...(allStats[stats.INCREASED_ARMOUR]?.sources || []),
                ...(allStats[stats.STRENGTH]?.sources || []),
                ...(allStats[stats.ALL_ATTRIBUTES]?.sources || []),
            ]
        });
    }
    const moreArmor = allStats[stats.MORE_ARMOUR]?.total || 100;
    {
        summary.push({ 
            name: "More Armor", 
            total: moreArmor - 100, 
            type: "stat",
            sources: [
                ...(allStats[stats.MORE_ARMOUR]?.sources || []),
            ]
        });
    }
    let totalArmor = flatArmor * (100 + increasedArmor) / 100 * moreArmor / 100;
    {
        summary.push({ 
            name: "Total Armor", 
            total: totalArmor, 
            type: "stat",
            sources: []
        });
    }
    let totalArmorDrPhys = armorDr(totalArmor, true);
    let totalArmorDrNonPhys = armorDr(totalArmor, false);
    {
        summary.push({ 
            name: "Total Armor Dr", 
            total: totalArmorDrNonPhys, 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Total Armor Dr Phys", 
            total: totalArmorDrPhys, 
            type: "stat",
            sources: []
        });
    }
    // endurance
    summary.push({name:"Endurance", type:"section"});
    //summary.push({type:"hr"});
    {
        summary.push({ 
            name: "Endurance", 
            total: totalEndurance, 
            type: "stat",
            sources: [
                ...(allStats[stats.ENDURANCE]?.sources || []),
            ]
        });
    }
    //const enduranceThreshold = allStats[stats.ENDURANCE_THRESHOLD]?.total || 0;
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
    //const hpAsEnduranceThreshold = (allStats[stats.MAX_HEALTH_AS_ENDURANCE_THRESHOLD]?.total || 0) / 100 * maxHealth;
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
    //const totalEnduranceThreshold = Math.min(maxHealth, enduranceThreshold + hpAsEnduranceThreshold);
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

    let manaBeforeHealth = (allStats[stats.MANA_BEFORE_HEALTH]?.total || 0);
    let enduranceAppliedToMana = (allStats[stats.ENDURANCE_APPLIED_TO_MANA]?.total || 0);

    let preusoHp = maxHealth
        - totalEnduranceThreshold 
        + totalEnduranceThreshold * 100 / (100 - Math.min(60, totalEndurance));
    let maxManaDeplete = 0;
    if (manaBeforeHealth > 0) {
        const ratio = manaBeforeHealth / 100;
        const maxHitBeforeHpDepletes = preusoHp / (1 - ratio);
        const maxTheoreticalManaDeplete = maxHitBeforeHpDepletes * ratio / 5;
        const enduranceRatio = (100 + enduranceAppliedToMana / 100 * Math.min(60, totalEndurance)) / 100;
        maxManaDeplete = Math.min(totalMana * enduranceRatio, maxTheoreticalManaDeplete / enduranceRatio);
    }
    preusoHp += maxManaDeplete * 5;

    {
        summary.push({ 
            name: "Preudo HP after Endurance", 
            total: preusoHp, 
            type: "stat",
            sources: [
                `HP part without Endurance: total HP - endurance threshold = ${(maxHealth - totalEnduranceThreshold).toFixed(3)}`,
                `Preudo Endurance HP: endurance threshold * (100 - endurance) / 100 
                    = ${totalEnduranceThreshold.toFixed(3)} * (100 - ${Math.min(60, totalEndurance)}) / 100 
                    = ${(totalEnduranceThreshold * 100 / (100 - Math.min(60, totalEndurance))).toFixed(3)}`
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
    const critAvoidance = Math.min(100, allStats[stats.CRITICAL_STRIKE_AVOIDANCE]?.total || 0);
    {
        summary.push({ 
            name: "Critical Strike Avoidance", 
            total: critAvoidance, 
            type: "stat",
            sources: [
                ...(allStats[stats.CRITICAL_STRIKE_AVOIDANCE]?.sources || []),
            ]
        });
    }
    // dodge
    //summary.push({type:"hr"});
    //const flatDodge = (allStats[stats.DODGE_RATING]?.total || 0) + dexterity * 4;
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
    //const increasedDodge = allStats[stats.INCREASED_DODGE_RATING]?.total || 0;
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
    //let totalDodgeRating = flatDodge * (100 + increasedDodge) / 100;
    {
        if ((allStats[stats.DODGE_CONVERTED_TO_ENDURANCE]?.total || 0)) {
            summary.push({
                name: "Total Endurance Threshold from Dodge Rating", 
                total: totalDodgeRating, 
                type: "stat",
                sources: [
                    ...(allStats[stats.MORE_ARMOUR]?.sources || []),
                ]
            });
            totalDodgeRating = 0;
        }

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

    let blockChance = allStats[stats.BLOCK_CHANCE]?.total || 0;
    let blockEffect = (allStats[stats.BLOCK_EFFECTIVENESS]?.total || 0)
        * (100 + (allStats[stats.INCREASED_BLOCK_EFFECTIVENESS]?.total || 0)) / 100;
    let blockDr = 0;
    {
        const x = blockEffect;
        const x2 = x*x;
        const a = 100;

        blockDr = 3 * x / (40 + 0.03 * Math.pow(a + 5, 2) + 3 * x) * 0.25;
        blockDr += (1.2 * x + 0.0006 * x2) / (60 * (a + 5) + 1.2 * x + 0.0006 * x2) * 0.6;
        blockDr *= 100;
        blockDr = Math.min(85, blockDr);

        summary.push({ 
            name: "Block Chance", 
            total: blockChance, 
            type: "stat",
            sources: [
                ...(allStats[stats.BLOCK_CHANCE]?.sources || []),
            ]
        });
        blockChance = Math.min(100, blockChance);
        summary.push({ 
            name: "Block Effectiveness", 
            total: blockEffect, 
            type: "stat",
            sources: [
                ...(allStats[stats.BLOCK_EFFECTIVENESS]?.sources || []),
                ...(allStats[stats.INCREASED_BLOCK_EFFECTIVENESS]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Block Dr", 
            total: blockDr, 
            type: "stat",
            sources: []
        });
    }

    let chanceToTake0 = (allStats[stats.CHANCE_TO_TAKE_ZERO_DAMAGE]?.total || 0);
    {
        
        summary.push({ 
            name: "Chance to take 0 Damage when Hit", 
            total: chanceToTake0, 
            type: "stat",
            sources: []
        });
    }

    {
        summary.push({ 
            name: "Damage Dealt to Mana Before Health", 
            total: manaBeforeHealth, 
            type: "stat",
            sources: [
                ...(allStats[stats.MANA_BEFORE_HEALTH]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Endurance applies to all damage dealt to mana", 
            total: enduranceAppliedToMana, 
            type: "stat",
            sources: [
                ...(allStats[stats.ENDURANCE_APPLIED_TO_MANA]?.sources || []),
            ]
        });
        summary.push({ 
            name: "Max Mana consumed before dead", 
            total: maxManaDeplete, 
            type: "stat",
            sources: [
                ...(allStats[stats.ENDURANCE_APPLIED_TO_MANA]?.sources || []),
            ]
        });
        
    }

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

    let lessDamageTaken = (allStats[stats.LESS_DAMAGE_TAKEN]?.total || 100);
    let lessHitDamageTaken = lessDamageTaken * (allStats[stats.LESS_HIT_DAMAGE_TAKEN]?.total || 100) / 100;
    const lessDotDamageTaken = lessDamageTaken * (allStats[stats.LESS_DOT_DAMAGE_TAKEN]?.total || 100) / 100;
    if (glancingBlowChance == 100)
        lessHitDamageTaken *= (1 - 0.35);
    if (blockChance == 100)
        lessHitDamageTaken *= (100 - blockDr) / 100;
    const armorAppliedToDots = (allStats[stats.ARMOUR_MITIGATION_APPLIED_TO_DOT]?.total || 0);
    let lessDotDamageTakenPhys = (100 - armorAppliedToDots / 100 * totalArmorDrPhys) * lessDotDamageTaken / 100;
    let lessDotDamageTakenNonPhys = (100 - armorAppliedToDots / 100 * totalArmorDrNonPhys) * lessDotDamageTaken / 100;
    lessDamageTaken = 100 - lessDamageTaken;
    lessHitDamageTaken = 100 - lessHitDamageTaken;
    lessDotDamageTakenPhys = 100 - lessDotDamageTakenPhys;
    lessDotDamageTakenNonPhys = 100 - lessDotDamageTakenNonPhys;

    if (lessHitDamageTaken > 0 || lessDotDamageTakenNonPhys > 0) {
        summary.push({type:"hr"});
/*
        summary.push({ 
            name: "Less Damage Taken", 
            total: lessDamageTaken, 
            type: "stat",
            sources: [
                ...(allStats[stats.LESS_DAMAGE_TAKEN]?.sources || []),
            ]
        });
*/
        summary.push({ 
            name: "Less Hit Damage Taken", 
            total: lessHitDamageTaken, 
            type: "stat",
            sources: [
                ...(allStats[stats.LESS_DAMAGE_TAKEN]?.sources || []),
                (glancingBlowChance == 100) ? `100% glancing blow chance, Less Damage Taken: 35` : []
            ]
        });

        summary.push({ 
            name: "Less Dot Damage Taken", 
            total: lessDotDamageTakenNonPhys, 
            type: "stat",
            sources: [
                ...(allStats[stats.LESS_DAMAGE_TAKEN]?.sources || []),
                ...(allStats[stats.ARMOUR_MITIGATION_APPLIED_TO_DOT]?.sources || []),
                ...(allStats[stats.LESS_DOT_DAMAGE_TAKEN]?.sources || []),
            ]
        });

        summary.push({ 
            name: "Less Phys Dot Damage Taken", 
            total: lessDotDamageTakenPhys, 
            type: "stat",
            sources: [
                ...(allStats[stats.LESS_DAMAGE_TAKEN]?.sources || []),
                ...(allStats[stats.ARMOUR_MITIGATION_APPLIED_TO_DOT]?.sources || []),
                ...(allStats[stats.LESS_DOT_DAMAGE_TAKEN]?.sources || []),
            ]
        });
    }

    summary.push({name:"DPS", type:"section"});
    // dps
    var dps = 0;
    {
        let dpsAilment = allStats[stats.AILMENT_DAMAGE]?.total || 0;
        const echoChance = allStats[stats.ECHO_CHANCE]?.total || 0;
        const echoDamage = allStats[stats.ECHO_DAMAGE]?.total || 0;
        if (dpsAilment > 0) {
            dpsAilment *= hitsPerSecond;
            dpsAilment *= chanceToAilment / 100;
            dpsAilment *= (100 + increasedDamage + echoChance / 100 * (100 + increasedDamage + echoDamage)) / 100;
            dpsAilment *= moreDamage / 100;
            dpsAilment *= (100 + penetration) / 100;
            if (increasedAilmentDuration > 0)
                dpsAilment *= (100 + increasedAilmentDuration) / 100;
        }
        dps += dpsAilment;
        summary.push({ 
            name: "DPS Ailment", 
            total: dpsAilment, 
            type: "stat",
            sources: [
                `dpsAilment * chanceToAilment/100 * hitsPerSecond 
                    * (100+increasedDamage)/100 * (moreDamage)/100 * (100+penetration)/100${(increasedAilmentDuration > 0) ? ` * (100+duration)/100` : ""}= 
                    ${dpsAilment.toFixed(3)} * ${chanceToAilment}/100 * ${hitsPerSecond.toFixed(3)} 
                    * (100+${increasedDamage})/100 * (${moreDamage.toFixed(3)})/100 * (100+${penetration})/100
                    ${(increasedAilmentDuration > 0) ? ` * (100+${increasedAilmentDuration})/100` : ""}
                     = ${dpsAilment.toFixed(3)}`,
                ...(allStats[stats.AILMENT_DAMAGE]?.sources || []),
            ]
        });


        if (baseFlat > 0 && damageEffectiveness > 0) {
            let dpsHit = totalFlat;
            dpsHit *= (moreFromCrits + 100) / 100;
            dpsHit *= (100 + increasedDamage + echoChance / 100 * (100 + increasedDamage + echoDamage)) / 100;
            dpsHit *= moreDamage / 100;
            dpsHit *= (100 + penetration) / 100;
            dpsHit *= (100 + armorShredDr) / 100;
            summary.push({ 
                name: "Hit Speed", 
                total: hitsPerSecond, 
                type: "stat",
                sources: []
            });
            summary.push({ 
                name: "Hit Damage", 
                total: dpsHit, 
                type: "stat",
                sources: []
            });

            dpsHit *= hitsPerSecond;
            dps += dpsHit;
            summary.push({ 
                name: "DPS", 
                total: dpsHit, 
                type: "stat",
                sources: []
            });
        }
    }

    summary.push({name:"EHP", type:"section"});
    // ehp
    var avgMaxHit = 0;
    {
        const lowLife = (allStats[stats.LOW_LIFE]?.total || 0);
        const a = ((lowLife ? 0 : preusoHp) + stableWard);
        let r = [];
        const m = Math.pow(100,3);
        r[stats.FIRE_RESISTANCE] = m / (175 - Math.min(75,fireResist)) / (100 - totalArmorDrNonPhys) / (100 - lessHitDamageTaken);
        r[stats.COLD_RESISTANCE] = m / (175 - Math.min(75,coldResist)) / (100 - totalArmorDrNonPhys) / (100 - lessHitDamageTaken);
        r[stats.LIGHTNING_RESISTANCE] = m / (175 - Math.min(75,lightningResist)) / (100 - totalArmorDrNonPhys) / (100 - lessHitDamageTaken);
        r[stats.PHYSICAL_RESISTANCE] = m / (175 - Math.min(75,physResist)) / (100 - totalArmorDrPhys) / (100 - lessHitDamageTaken);
        r[stats.NECROTIC_RESISTANCE] = m / (175 - Math.min(75,necroticResist)) / (100 - totalArmorDrNonPhys) / (100 - lessHitDamageTaken);
        r[stats.POISON_RESISTANCE] = m / (175 - Math.min(75,poisonResist)) / (100 - totalArmorDrNonPhys) / (100 - lessHitDamageTaken);
        r[stats.VOID_RESISTANCE] = m / (175 - Math.min(75,voidResist)) / (100 - totalArmorDrNonPhys) / (100 - lessHitDamageTaken);
        let b = (r[stats.FIRE_RESISTANCE] 
            + r[stats.COLD_RESISTANCE] 
            + r[stats.LIGHTNING_RESISTANCE] 
            + r[stats.PHYSICAL_RESISTANCE] 
            + r[stats.NECROTIC_RESISTANCE] 
            + r[stats.POISON_RESISTANCE] 
            + r[stats.VOID_RESISTANCE])
            / 7;
        b = b;

        avgMaxHit = a * b;
        summary.push({ 
            name: "Avg Max Hit", 
            total: a * b, 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Max Fire Hit", 
            total: a * r[stats.FIRE_RESISTANCE], 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Max Cold Hit", 
            total: a * r[stats.COLD_RESISTANCE], 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Max Lightning Hit", 
            total: a * r[stats.LIGHTNING_RESISTANCE], 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Max Physical Hit", 
            total: a * r[stats.PHYSICAL_RESISTANCE], 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Max Poison Hit?", 
            total: a * r[stats.POISON_RESISTANCE], 
            type: "stat",
            sources: []
        });
        summary.push({ 
            name: "Max Void Hit", 
            total: a * r[stats.VOID_RESISTANCE], 
            type: "stat",
            sources: []
        });

        let ehpHits = a * b;
        if (glancingBlowChance < 100)
            ehpHits *= 100 / (100 - (1 - 0.35)*(glancingBlowChance));
        if (blockChance < 100)
            ehpHits *= 100 / (100 - blockDr * blockChance / 100);
            
        ehpHits *= 100 / (100 - dodgeChance);
        ehpHits *= 100 / (100 - chanceToTake0);
        summary.push({type: "hr"});
        summary.push({ 
            name: "EHP vs hits", 
            total: ehpHits, 
            type: "stat",
            sources: [`including dodge, glancing blow, chance to take 0 damage`]
        });

        
        let r2 = [];
        r2[stats.FIRE_RESISTANCE] = (100 / (175 - Math.min(75,fireResist))) / (100 - lessDotDamageTakenNonPhys) * 100;
        r2[stats.COLD_RESISTANCE] = (100 / (175 - Math.min(75,coldResist))) / (100 - lessDotDamageTakenNonPhys) * 100;
        r2[stats.LIGHTNING_RESISTANCE] = (100 / (175 - Math.min(75,lightningResist))) / (100 - lessDotDamageTakenNonPhys) * 100;
        r2[stats.PHYSICAL_RESISTANCE] = (100 / (175 - Math.min(75,physResist))) / (100 - lessDotDamageTakenPhys) * 100;
        r2[stats.NECROTIC_RESISTANCE] = (100 / (175 - Math.min(75,necroticResist))) / (100 - lessDotDamageTakenNonPhys) * 100;
        r2[stats.POISON_RESISTANCE] = (100 / (175 - Math.min(75,poisonResist))) / (100 - lessDotDamageTakenNonPhys) * 100;
        r2[stats.VOID_RESISTANCE] = (100 / (175 - Math.min(75,voidResist))) / (100 - lessDotDamageTakenNonPhys) * 100;
        const b2 = (r2[stats.FIRE_RESISTANCE] 
            + r2[stats.COLD_RESISTANCE] 
            + r2[stats.LIGHTNING_RESISTANCE] 
            + r2[stats.PHYSICAL_RESISTANCE] 
            + r2[stats.NECROTIC_RESISTANCE] 
            + r2[stats.POISON_RESISTANCE] 
            + r2[stats.VOID_RESISTANCE])
            / 7;
        let ehpDots = a * b2;
        summary.push({ 
            name: "EHP vs DoTs", 
            total: ehpDots, 
            type: "stat",
            sources: [`including armor mitigation applied to DoTs`]
        });
    }

    summary.push({name:"Passives", type:"section"});
    let totalPassiveCount = 0;
    for (const [name, total] of passiveCount) {
        summary.push({
            name: name,
            total: total,
            type: "stat",
            sources: passiveSources.get(name)
        });
        totalPassiveCount += total;
    }
    summary.push({
        name: "Total",
        total: totalPassiveCount,
        type: "stat",
        sources: []
    });


    summary.push({name:"POWER", type:"section"});
    summary.push({ 
            name: "regen coefficient", 
            total: regenCoeff(hpRegen + wps), 
            type: "stat",
            sources: [`health regen + ward regen`]
        });
    summary.push({ 
            name: "POWER", 
            total: avgMaxHit * dps * regenCoeff(hpRegen + wps), 
            type: "stat",
            sources: [`avgMaxHit * dps * regen coefficient`]
        });



    Object.values(summary).forEach(stat => {
        stat.total = formatNumber(stat.total);
    });

    return Object.values(summary); // Convert object to array
}

function regenCoeff(regen, opts = {}) {
  const R  = Math.max(0, Number(regen) || 0);
  const Rb = (opts.baseline ?? 100); // neutral regen: coefficient = 1
  const K  = (opts.K ?? 500);        // scale: larger K => slower rise
  const p  = (opts.power ?? 1);      // curvature: >1 slower start, <1 faster
  const cap = (opts.cap ?? 2);       // asymptotic cap

  // base saturating curve in [0,1): b(R) = (R/(K+R))^p
  const b  = Math.pow(R  / (K + R ), p);
  const bb = Math.pow(Rb / (K + Rb), p);

  // shift/scale so that h(0)=0, h(Rb)=0, h(∞)=1
  const hRaw = (b - bb) / (1 - bb);
  const h    = Math.max(0, Math.min(1, hRaw)); // clamp to [0,1]

  // final coefficient in [1, cap]
  const M = 1 + (cap - 1) * h;
  return Math.min(cap, M);
}

function formatNumber(value) {
    const rounded = Math.round(value * 100) / 100; // Round to 2 decimal places
    return (rounded % 1 === 0) ? rounded.toFixed(0) : rounded.toFixed(2);
}

const expressionCache = new Map();

function evaluateExpression(expr) {
    if (!expr.trim()) return 0;

    // Convert commas to dots for float compatibility
    const cleanedExpr = expr.replaceAll(" ",""); // expr.replace(/,/g, ".");

    // Check cache
    if (expressionCache.has(cleanedExpr)) {
        return expressionCache.get(cleanedExpr);
    }

    try {
        //console.log("evaluate", cleanedExpr);
        const result = Function(`"use strict"; return (${cleanedExpr});`)();
        //console.log("evaluate", result);
        expressionCache.set(cleanedExpr, result);
        return result;
    } catch (error) {
        expressionCache.set(cleanedExpr, NaN); // Avoid retrying bad expressions
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
            sectionContentWrapper.dataset.index = `section-${summaryStat.name}`;

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
        collapseButton.title = "Expand/collaps details";
        collapseButton.classList.add("collapse-btn");
        collapseButton.textContent = "▼";
        collapseButton.onclick = () => toggleTooltip(index);

        // Create and restore checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.title = "Enable/disable tracking";
        checkbox.classList.add("highlight-toggle");
        checkbox.dataset.summaryName = summaryStat.name;
        checkbox.style.marginRight = "5px";

        // Restore saved state from localStorage
        checkbox.checked = localStorage.getItem(`highlight:${summaryStat.name}`) === "true";

        // Save state on toggle
        checkbox.addEventListener("change", () => {
            localStorage.setItem(`highlight:${summaryStat.name}`, checkbox.checked);
        
            // Clear the old highlight list
            highlightSummaryNames = new Set();
        
            // Rebuild from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith("highlight:") && localStorage.getItem(key) === "true") {
                    const name = key.slice("highlight:".length);
                    highlightSummaryNames.add(name);
                }
            }
        
            updateSummary();
        });
        

        // Stat text
        const statText = document.createElement("span");
        statText.classList.add("summary-text");

        const value = Number(summaryStat.total);

        let displayValue;
        if (value >= 1e9 || statText == "POWER") {
        // Scientific notation with 3 significant digits
        displayValue = value.toExponential(3);
        } else {
        // Format with space as thousands separator
        displayValue = value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }

        statText.innerHTML = `<strong>${summaryStat.name}: </strong><span class="stat-number">${displayValue}</span>`;

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

        statDiv.appendChild(checkbox);
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
  
  function updateSortDropdown() {
    const select = document.getElementById("sort-select");
    const reset = document.getElementById("reset-contributions");
  
    // Cache current non-default options
    const currentOptions = Array.from(select.options)
      .slice(1)
      .map(opt => opt.value);
  
    const newOptions = [...highlightSummaryNames];
    const hasChanged = currentOptions.length !== newOptions.length ||
                       currentOptions.some((val, i) => val !== newOptions[i]);
  
    if (!hasChanged) {
        select.style.display = highlightSummaryNames.size > 0 ? "inline-block" : "none";
        reset.style.display = highlightSummaryNames.size > 0 ? "inline-block" : "none";
        return;
    }
  
    // Save current selection before rebuilding
    const currentValue = select.value;
  
    // Rebuild options
    select.innerHTML = "";
  
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = currentValue === "" ? "Sort by Impact..." : "Disable Sorting";
    select.appendChild(defaultOption);
  
    highlightSummaryNames.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  
    select.value = currentValue;
    select.style.display = highlightSummaryNames.size > 0 ? "inline-block" : "none";
    reset.style.display = highlightSummaryNames.size > 0 ? "inline-block" : "none";
  }
  
  function applySectionSort() {
    const sortSelect = document.getElementById("sort-select");
  const selected = sortSelect.value;
  const reverseLabel = document.getElementById("sort-reverse-label");
  
  // If no sort selected, hide reverse checkbox, reset orders
  if (!selected) {
    reverseLabel.style.display = "none"; // Hide checkbox
    document.querySelectorAll(".section-wrapper").forEach(wrapper => {
      wrapper.style.order = 0;
    });
    return;
  }

  // Otherwise, show the reverse checkbox
  reverseLabel.style.display = "inline-block";
  
    const sectionContribs = [];
  
    document.querySelectorAll(".section").forEach(section => {
      const contribSpans = Array.from(section.querySelectorAll(".contribution-info span"));
      const targetSpan = contribSpans.find(span => span.textContent.startsWith(selected + ":"));
  
      if (!targetSpan) return;
  
      const match = targetSpan.textContent.match(/([+-]?[0-9.]+)%/);
      const value = match ? parseFloat(match[1]) : 0;
  
      sectionContribs.push({
        wrapper: section.closest(".section-wrapper"),
        value: value
      });
    });
  
    // Sort descending by value
    sectionContribs.sort((a, b) => a.value - b.value);

    if (document.getElementById("sort-reverse-cb").checked) {
        sectionContribs.reverse(); // or: .sort((a,b) => a.value - b.value)
      }
  
    sectionContribs.forEach((entry, index) => {
      entry.wrapper.style.order = index + 1;
      //console.log(entry.wrapper.children[0], entry.wrapper.style.order);
    });
  }
  

  function resetAllContributions() {
    highlightSummaryNames.forEach(name => {
        const highlight = `highlight:${name}`;
        //console.log(highlight);
        localStorage.removeItem(highlight);
    });

    highlightSummaryNames.clear();
    updateSummary(); // Recalculate with everything disabled
  }