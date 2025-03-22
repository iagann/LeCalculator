document.addEventListener("DOMContentLoaded", () => {
    makeSectionsDraggable();
    refreshBuildList();
    makeBuildListDraggable();
  });
  
  // Called once on DOMContentLoaded
  function makeSectionsDraggable() {
    const sectionsContainer = document.getElementById("sections");
  
    // 1) Enable section dragging
    new Sortable(sectionsContainer, {
      animation: 150,
      handle: ".section-header", // Drag from section header
      ghostClass: "sortable-ghost",
      //filter: "input, select, textarea",
      handle: '.drag-handle',
    });
  
    // 2) Enable stat dragging for all existing sections in the DOM
    document.querySelectorAll(".section").forEach(section => {
      makeStatsDraggable(section);
    });
  }
  
  // Called whenever we create a new section (see sections.js -> addSection)
  function makeStatsDraggable() {
    document.querySelectorAll(".stat-list").forEach(statList => {
        if (!statList.classList.contains("sortable-applied")) {
            new Sortable(statList, {
              animation: 150,
              ghostClass: "sortable-ghost",
              //filter: "input, select, textarea",
              handle: '.drag-handle',
              onEnd: (evt) => saveCurrentBuildLocally()
            });
            statList.classList.add("sortable-applied");
        }
    });
}

  // After you populate #build-list in refreshBuildList:
function makeBuildListDraggable() {
  const buildListElem = document.getElementById("build-list");
  new Sortable(buildListElem, {
    animation: 150,
    ghostClass: "sortable-ghost",
    // If you want to allow reordering only:
    group: { name: "localBuilds", pull: false, put: false }
  });
}

// Then call it after building the list
function refreshBuildList() {
  const buildList = document.getElementById("build-list");
  buildList.innerHTML = "";

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const li = document.createElement("li");
    li.textContent = key;
    li.onclick = () => loadBuildByName(key);
    buildList.appendChild(li);
  }

  // Call after populating
  makeBuildListDraggable();
}
  