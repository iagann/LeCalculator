// statsManager.js

function addStatEntry(statList, statName = "", mathExpression = "", ignoreSummaryUpdate = false) { 
  const statDiv = document.createElement("div");
  statDiv.classList.add("stat-entry");

  // Drag Handle
  const dragHandle = document.createElement("span");
  dragHandle.classList.add("drag-handle");
  dragHandle.innerHTML = "☰"; // Drag icon

  const enabledCheckbox = document.createElement("input");
  enabledCheckbox.type = "checkbox";
  enabledCheckbox.classList.add("stat-enabled");
  enabledCheckbox.checked = true;
  enabledCheckbox.title = "Enable/Disable this stat";
  enabledCheckbox.onclick = () => {
    updateSummary();
    saveCurrentBuildLocally();
  };

  // Stat Selector (Text Input)
  const statSelect = document.createElement("input");
  statSelect.type = "text";
  statSelect.placeholder = "Choose Stat...";
  statSelect.value = statName;

  // Ensure the stat list is associated with a datalist
  const datalistId = `stat-options-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  statSelect.setAttribute("list", datalistId);

  const datalist = document.createElement("datalist");
  datalist.id = datalistId;

  // Populate datalist
  Object.keys(stats).forEach(statKey => {
      const option = document.createElement("option");
      option.value = getStatName(stats[statKey]); // Ensure getStatName() is working
      datalist.appendChild(option);
  });

  statSelect.appendChild(datalist); // Append the datalist to the input

  // Event Listeners for Filtering & Handling Selection
  statSelect.onfocus = () => showFullStatList(statSelect, datalist);
  statSelect.oninput = () => filterStatOptions(statSelect, datalist);
  statSelect.onchange = () => {
      updateSummary();
      validateStatEntries();
      saveCurrentBuildLocally();
      updateSectionSearchOptions();
  };

  // Math Expression Input
  const mathInput = document.createElement("input");
  mathInput.type = "text";
  mathInput.placeholder = "Math Expression";
  mathInput.value = mathExpression;
  mathInput.oninput = () => {
      updateSummary();
      validateStatEntries();
      saveCurrentBuildLocally();
      updateSectionSearchOptions();
  };

  // Delete Button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✖";
  deleteBtn.classList.add("btn-delete");
  deleteBtn.onclick = (event) => {
      event.stopPropagation();
      if (confirm("Are you sure you want to delete this stat?")) {
          statDiv.remove();
          setTimeout(() => {
              if (!ignoreSummaryUpdate) updateSummary();
              validateStatEntries();
              saveCurrentBuildLocally();
              updateSectionSearchOptions();
          }, 0);
      }
  };

  // Append Elements
  statDiv.appendChild(dragHandle);
  statDiv.appendChild(enabledCheckbox);
  statDiv.appendChild(statSelect);
  statDiv.appendChild(datalist);
  statDiv.appendChild(mathInput);
  statDiv.appendChild(deleteBtn);

  statList.appendChild(statDiv);

  // Auto-focus on new stat
  statSelect.focus();

  // Re-initialize draggable for this section
  makeStatsDraggable();

  return statDiv;
}


  function showFullStatList(input) {
    const datalist = input.nextElementSibling;
    if (!datalist) return;
  
    datalist.innerHTML = ""; // Clear old options
  
    getAllStatNames()
      .sort()
      .forEach(statName => {
        const option = document.createElement("option");
        option.value = statName;
        datalist.appendChild(option);
      });
  
    input.setAttribute("list", datalist.id);
  }
  
  function filterStatOptions(input) {
    const value = input.value.toLowerCase();
    const datalist = input.nextElementSibling;
    if (!datalist) return;
  
    datalist.innerHTML = "";
  
    getAllStatNames()
      .sort()
      .forEach(statName => {
        if (statName.toLowerCase().includes(value)) {
          const option = document.createElement("option");
          option.value = statName;
          datalist.appendChild(option);
        }
      });
  }
  
  function validateStatEntries() {
    document.querySelectorAll(".stat-entry").forEach(statEntry => {
        const statInput = statEntry.querySelector("input[type='text']"); // Stat name
        const expressionInput = statEntry.querySelector("input[placeholder='Math Expression']");
    
        // Check if the stat name is valid
        const statKey = Object.keys(stats).find(key => getStatName(stats[key]) === statInput.value);
        const isValidStat = !!statKey;

        // Check if the expression is valid
        let isValidExpression = true;
        try {
          let expression = expressionInput.value;
            if (expression == "") {
              isValidExpression = false;
            }
            else {
              expression = expression.replaceAll("dex",1);
              expression = expression.replaceAll("recurve",1);
              const result = evaluateExpression(expression);
              if (isNaN(result)) isValidExpression = false;
            }
        } catch {
            isValidExpression = false;
        }

        if (!isValidStat) {
          statInput.classList.add("invalid");
        } else {
          statInput.classList.remove("invalid");
        }

        if (!isValidExpression) {
          expressionInput.classList.add("invalid");
        } else {
          expressionInput.classList.remove("invalid");
        }
    });
}