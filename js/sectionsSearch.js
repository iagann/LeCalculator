function filterSectionsByName() {
  const query = document.getElementById("section-search").value.trim().toLowerCase();

  document.querySelectorAll(".section").forEach(section => {
    const nameInput = section.querySelector('input[placeholder="Section Name"]');
    const sectionName = nameInput?.value.toLowerCase() || "";

    let sectionMatches = sectionName.includes(query);
    let statMatches = false;

    const statEntries = section.querySelectorAll(".stat-entry");

    // Reset visibility of all stat entries
    statEntries.forEach(entry => {
      entry.style.display = "";
    });

    if (!sectionMatches) {
      // Check if any stat entry matches by stat name OR math expression
      statEntries.forEach(entry => {
        const statInput = entry.querySelector("input[placeholder='Choose Stat...']");
        const exprInput = entry.querySelector("input[placeholder='Math Expression']");

        const statName = statInput?.value.toLowerCase() || "";
        const exprValue = exprInput?.value.toLowerCase() || "";

        const matches = statName.includes(query) || exprValue.includes(query);

        if (matches) {
          statMatches = true;
        } else {
          entry.style.display = "none"; // Hide non-matching stat entry
        }
      });
    }

    // Show or hide section
    section.style.display = (sectionMatches || statMatches) ? "" : "none";
  });

  // Show/hide clear + collapse/expand buttons
  const showExtras = query.length > 0;
  document.getElementById("clear-search").style.display = showExtras ? "flex" : "none";
  document.getElementById("collapse-visible").style.display = showExtras ? "" : "none";
  document.getElementById("expand-visible").style.display = showExtras ? "" : "none";
}

  
  
  function updateSectionSearchOptions() {
    const datalist = document.getElementById("section-stat-options");
    if (!datalist) return;
  
    datalist.innerHTML = "";
  
    // Get all stat names
    const statNames = getAllStatNames();
  
    // Get all section names from inputs
    const sectionNames = Array.from(document.querySelectorAll('.section input[placeholder="Section Name"]'))
      .map(input => input.value)
      .filter(name => name.trim() !== "");
  
    // Merge and sort
    const allOptions = Array.from(new Set([...statNames, ...sectionNames])).sort();
  
    allOptions.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });
  }
  
  function collapseVisibleSections() {
    document.querySelectorAll(".section").forEach(section => {
      if (section.style.display !== "none") {
        section.classList.add("collapsed");
        const collapseButton = section.querySelector(".section-header button");
        if (collapseButton) {
          collapseButton.textContent = "▶";
        }
      }
    });
  }
  
  function expandVisibleSections() {
    document.querySelectorAll(".section").forEach(section => {
      if (section.style.display !== "none") {
        section.classList.remove("collapsed");
        const collapseButton = section.querySelector(".section-header button");
        if (collapseButton) {
          collapseButton.textContent = "▼";
        }
      }
    });
  }

  function setSectionSearch(str) {
    const input = document.getElementById("section-search");
    input.value = str;
    filterSectionsByName();
  }
  
  function clearSectionSearch() {
    setSectionSearch("");
  }