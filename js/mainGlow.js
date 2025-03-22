function applyGlowAndFade(sectionNames, statNames) {
    // Glow matching sections and fade others
    document.querySelectorAll(".section").forEach(section => {
      const input = section.querySelector('input[placeholder="Section Name"]');
      const name = input?.value || "";
  
      if (sectionNames.has(name)) {
        section.classList.add("section-glow");
      } else {
        section.classList.add("section-fade");
      }
  
      // Check all stat entries inside
      section.querySelectorAll(".stat-entry").forEach(statEntry => {
        const statInput = statEntry.querySelector('input[placeholder="Choose Stat..."]');
        if (statInput && statNames.has(statInput.value)) {
          statEntry.classList.add("stat-glow");
        }
      });
    });
  }
  
  function clearGlowAndFade() {
    document.querySelectorAll(".section.section-glow").forEach(section => section.classList.remove("section-glow"));
    document.querySelectorAll(".section.section-fade").forEach(section => section.classList.remove("section-fade"));
    document.querySelectorAll(".stat-entry.stat-glow").forEach(entry => entry.classList.remove("stat-glow"));
  }
  
  function extractNamesFromTooltip(tooltip) {
    const sectionNames = new Set();
    const statNames = new Set();
  
    const lines = tooltip.innerHTML.split("<br>");
    lines.forEach(line => {
      const sectionMatch = line.match(/^\[([^\]]+)\]/);
      const statMatch = line.match(/\]([^:]+):/);
  
      if (sectionMatch) sectionNames.add(sectionMatch[1].trim());
      if (statMatch) statNames.add(statMatch[1].trim());
    });
  
    return { sectionNames, statNames };
  }
  
  function setupHoverGlow(sourceElement, tooltip) {
    const { sectionNames, statNames } = extractNamesFromTooltip(tooltip);
  
    sourceElement.addEventListener("mouseenter", () => {
      applyGlowAndFade(sectionNames, statNames);
    });
  
    sourceElement.addEventListener("mouseleave", () => {
      clearGlowAndFade();
    });
  }
  