function addCategory(name = "", ignoreFocus = false) {
  const sectionsDiv = document.getElementById("sections");

  const categoryDiv = document.createElement("div");
  categoryDiv.classList.add("category");
  categoryDiv.classList.add("collapsed");

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("category-header");

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = name;
  titleInput.placeholder = "Category Name";
  titleInput.oninput = saveCurrentBuildLocally;

  const dragHandle = document.createElement("span");
  dragHandle.classList.add("drag-handle");
  dragHandle.innerHTML = "☰";

  const collapseBtn = document.createElement("button");
  collapseBtn.textContent = "▶";
  collapseBtn.title = "Expand/collapse category";
  collapseBtn.onclick = () => toggleCollapse(categoryDiv, collapseBtn);

  const wrapperDiv = document.createElement("div");
  const addSectionBtn = document.createElement("button");
  addSectionBtn.textContent = "Add Item";
  addSectionBtn.onclick = () => {
      categoryDiv.classList.remove("collapsed");
      collapseBtn.textContent = "▼";

      if (wrapperDiv.innerHTML == "Empty, add more items!")
        wrapperDiv.innerHTML = "";
      const sectionDiv = addSection(wrapperDiv);
      sectionDiv.querySelector("input[type='text']").focus();
  };

  const deleteCategoryBtn = document.createElement("button");
  deleteCategoryBtn.title = "Delete category";
  deleteCategoryBtn.classList.add("btn-delete");
  deleteCategoryBtn.textContent = "✖";
  deleteCategoryBtn.onclick = () => {
      if (confirm("Are you sure you want to delete this category?")) {
          categoryDiv.remove();
          setTimeout(() => {
              updateSummary();
              saveCurrentBuildLocally();
              updateSectionSearchOptions();
          }, 0);
      }
  };

  headerDiv.appendChild(dragHandle);
  headerDiv.appendChild(collapseBtn);
  headerDiv.appendChild(titleInput);
  headerDiv.appendChild(addSectionBtn);
  headerDiv.appendChild(deleteCategoryBtn);
  categoryDiv.appendChild(headerDiv);

  wrapperDiv.classList.add("category-wrapper");
  wrapperDiv.innerHTML = "Empty, add more items!";
  categoryDiv.appendChild(wrapperDiv);

  if (!ignoreFocus)
    titleInput.focus();

  sectionsDiv.appendChild(categoryDiv);
  
  return categoryDiv;
}

function addSection(category, name = "", cloneFrom = null, ignoreFocus = false) {
  const sectionsDiv = category;
  if (category.innerHTML == "Empty, add more items!") {
    category.innerHTML = "";
  }

  const sectionDiv = document.createElement("div");
  sectionDiv.classList.add("section");

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("section-header");

  const enabledCheckbox = document.createElement("input");
  enabledCheckbox.type = "checkbox";
  enabledCheckbox.classList.add("section-enabled");
  enabledCheckbox.checked = true; // enabled by default
  enabledCheckbox.title = "Enable/Disable this section";
  enabledCheckbox.onclick = () => {
    updateSummary();
    saveCurrentBuildLocally();
  };

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = name;
  titleInput.placeholder = "Section Name";
  titleInput.oninput = saveCurrentBuildLocally;

  const dragHandle = document.createElement("span");
  dragHandle.classList.add("drag-handle");
  dragHandle.innerHTML = "☰";

  const collapseBtn = document.createElement("button");
  collapseBtn.textContent = "▼";
  collapseBtn.title = "Expand/collapse section";
  collapseBtn.onclick = () => toggleCollapse(sectionDiv, collapseBtn);

  const addStatBtn = document.createElement("button");
  addStatBtn.textContent = "Add Stat";
  addStatBtn.onclick = () => {
      sectionDiv.classList.remove("collapsed");
      collapseBtn.textContent = "▼";

      if (statList.innerHTML == "Empty, add more stats!")
            statList.innerHTML = "";
      const statDiv = addStatEntry(statList);
      statDiv.querySelector("input[type='text']").focus();
  };

  const duplicateSectionBtn = document.createElement("button");
  duplicateSectionBtn.title = "Duplicate section";
  duplicateSectionBtn.textContent = "📋";
  duplicateSectionBtn.onclick = () => {
      const clonedSection = addSection(sectionsDiv, titleInput.value, sectionDiv);
      
      // Clone each stat entry
      const originalStats = statList.querySelectorAll(".stat-entry");
      originalStats.forEach(originalStat => {
          const statName = originalStat.querySelector("input[placeholder='Choose Stat...']").value;
          const expression = originalStat.querySelector("input[placeholder='Math Expression']").value;

          if (statList.innerHTML == "Empty, add more stats!")
            statList.innerHTML = "";
          const newStat = addStatEntry(clonedSection.querySelector(".stat-list"));
          newStat.querySelector("input[placeholder='Choose Stat...']").value = statName;
          newStat.querySelector("input[placeholder='Math Expression']").value = expression;
      });

      updateSummary();
      saveCurrentBuildLocally();
      updateSectionSearchOptions();

      alert(`Section ${titleInput.value} was duplicated!`);
  };

  const deleteSectionBtn = document.createElement("button");
  deleteSectionBtn.title = "Delete section";
  deleteSectionBtn.classList.add("btn-delete");
  deleteSectionBtn.textContent = "✖";
  deleteSectionBtn.onclick = () => {
      if (confirm("Are you sure you want to delete this section?")) {
          if (sectionDiv.parentElement.parentElement.children.length == 1) {
            sectionDiv.parentElement.parentElement.innerHTML = "Empty, add more items!";
          }
          sectionDiv.remove();
          setTimeout(() => {
              updateSummary();
              saveCurrentBuildLocally();
              updateSectionSearchOptions();
          }, 0);
      }
  };

  headerDiv.appendChild(dragHandle);
  headerDiv.appendChild(enabledCheckbox);
  headerDiv.appendChild(collapseBtn);
  headerDiv.appendChild(titleInput);
  headerDiv.appendChild(addStatBtn);
  headerDiv.appendChild(duplicateSectionBtn); // ← 📋 goes here
  headerDiv.appendChild(deleteSectionBtn);

  sectionDiv.appendChild(headerDiv);

  const statList = document.createElement("div");
  statList.classList.add("stat-list");
  statList.innerHTML = "Empty, add more stats!";
  sectionDiv.appendChild(statList);

  const wrapperDiv = document.createElement("div");
  wrapperDiv.classList.add("section-wrapper");
  wrapperDiv.appendChild(sectionDiv);
  if (cloneFrom) {
    sectionsDiv.insertBefore(wrapperDiv, cloneFrom.parentElement.nextSibling);
  }
  else {
    sectionsDiv.appendChild(wrapperDiv);
  }

  if (!ignoreFocus)
    titleInput.focus();
  
  return sectionDiv;
}
  
function toggleCollapse(sectionDiv, btn) {
  const collapsed = sectionDiv.classList.toggle("collapsed");
  btn.textContent = collapsed ? "▶" : "▼";
}
  
function collapseAllSections() {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.add("collapsed");
    const collapseButton = section.querySelector(".section-header button");
    if (collapseButton) {
      collapseButton.textContent = "▶";
    }
  });
}

function expandAllSections() {
  document.querySelectorAll(".section").forEach(section => {
      section.classList.remove("collapsed");
      const collapseButton = section.querySelector(".section-header button");
      if (collapseButton) {
          collapseButton.textContent = "▼";
      }
  });
}


  
function collapseAllCategories() {
  document.querySelectorAll(".category").forEach(section => {
    section.classList.add("collapsed");
    const collapseButton = section.querySelector(".category-header button");
    if (collapseButton) {
      collapseButton.textContent = "▶";
    }
  });
}

function expandAllCategories() {
  document.querySelectorAll(".category").forEach(section => {
      section.classList.remove("collapsed");
      const collapseButton = section.querySelector(".category-header button");
      if (collapseButton) {
          collapseButton.textContent = "▼";
      }
  });
}