// localStorageManager.js

// We'll keep a global variable for the "current build name"
let currentBuildName = "";  // You can default it to something if you like

document.addEventListener("DOMContentLoaded", () => {
    // After DOM loads, let's populate the build list
    refreshBuildList();

    // Load build name from the URL on page load
    const params = new URLSearchParams(window.location.search);
    const savedBuildName = params.get("build");

    if (savedBuildName) {
        document.getElementById("buildNameInput").value = savedBuildName;
        currentBuildName = savedBuildName;
        loadBuildByName(currentBuildName);
    }

    const buildNameInput = document.getElementById("buildNameInput");

    if (!buildNameInput) return;

    // Update URL while typing
    buildNameInput.addEventListener("input", () => {
        //updateBuildNameInURL();
    });

    // Save when user presses Enter
    buildNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents form submission if inside a form
            saveCurrentBuildLocally();
            updateBuildNameInURL();
            updateSectionSearchOptions();
            buildNameInput.blur(); // Remove focus after saving
        }
    });

    // Save when focus is lost
    buildNameInput.addEventListener("blur", () => {
        saveCurrentBuildLocally();
        updateBuildNameInURL();
        updateSectionSearchOptions();
    });

    document.getElementById("section-search").addEventListener("keydown", e => {
        if (e.key === "Escape") {
          e.target.value = "";
          filterSectionsByName();
        }
      });

    const searchInput = document.getElementById("section-search");
    if (searchInput) {
    searchInput.value = "";
    filterSectionsByName(); // Reapply filtering to show everything
    }

    document.addEventListener("change", e => {
        if (e.target.matches(".section-enabled")) {
            const section = e.target.closest(".section");
            section.classList.toggle("dimmed", !e.target.checked);
        }
    });

    document.addEventListener("change", e => {
        if (e.target.matches(".stat-enabled")) {
          const statEntry = e.target.closest(".stat-entry");
          statEntry.classList.toggle("dimmed", !e.target.checked);
        }
      });

    document.getElementById("sort-select").addEventListener("change", function () {
        const defaultOption = this.options[0];
      
        if (this.value === "") {
          defaultOption.textContent = "Sort by Contribution...";
          applySectionSort(null); // Reset sort
        } else {
          defaultOption.textContent = "Disable Sorting";
          applySectionSort(this.value); // Apply selected sort
        }
      });
});

function updateBuildNameInURL() {
    const buildNameInput = document.getElementById("buildNameInput");
    const newName = buildNameInput.value.trim();

    if (!newName) return;

    const params = new URLSearchParams(window.location.search);
    params.set("build", newName);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);

    currentBuildName = newName;
}

// 1) Toggle left panel
function toggleLeftPanel() {
    const panel = document.getElementById("left-panel");
    const button = document.getElementById("toggle-panel-btn");
  
    panel.classList.toggle("collapsed");
  
    // Toggle button icon
    if (panel.classList.contains("collapsed")) {
      button.textContent = "►";
    } else {
      button.textContent = "◄";
    }
  }

function handleBuildNameChange() {
    const buildNameInput = document.getElementById("buildNameInput");
    const newName = buildNameInput.value.trim();

    if (!newName) return; // Ignore empty names

    // Update URL without reloading the page
    const params = new URLSearchParams(window.location.search);
    params.set("build", newName);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);

    // Update the local build name reference
    currentBuildName = newName;
}

function getBuildKey(buildName) {
    return `build:${buildName}`;
  }

// 3) Save current build to localStorage using "currentBuildName" as the key
function saveCurrentBuildLocally() {
    currentBuildName = document.getElementById("buildNameInput").value;
    // If there's no build name, we can't store it
    if (!currentBuildName) {
        alert("Please enter a build name first.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const savedBuildName = params.get("build");
    if (currentBuildName != savedBuildName)  {
        if (localStorage.getItem(currentBuildName)) {
            if(!confirm(`A build named "${currentBuildName}" already exists! Overwrite it?`))
                return;
        }
    }

    // 1) Generate the base64 code from the DOM
    //    Make sure your "updateSaveString()" sets a global or returns the code
    //    For example:
    const base64Code = getCurrentBuildBase64(); // We'll define a helper below

    // 2) Store in localStorage
    window.localStorage.setItem(getBuildKey(currentBuildName), base64Code);

    //alert(`Saved "${currentBuildName}" successfully!`);
    refreshBuildList();
}

// 4) Load the build from localStorage based on "currentBuildName"
function loadBuildLocally() {
    if (!currentBuildName) {
        alert("Please enter a build name you want to load!");
        return;
    }
    loadBuildByName(currentBuildName);
}

// 5) Actually load from localStorage by a specific name
function loadBuildByName(name) {
    const code = window.localStorage.getItem(getBuildKey(name));
    if (!code) {
        alert(`No saved build found for "${name}"!`);
        return;
    }

    // Optionally set currentBuildName = name so the input is updated
    currentBuildName = name;
    document.getElementById("buildNameInput").value = name;

    // call your existing "loadFromBase64(code)" function
    loadFromBase64(code);
    collapseAllSections();
    //alert(`Loaded build: "${name}"`);
    handleBuildNameChange();

    document.querySelectorAll("#build-list li").forEach(item => {
        if (item.dataset.buildName === currentBuildName) {
            item.classList.add("active-build"); // Add highlight class
        } else {
            item.classList.remove("active-build"); // Remove from others
        }
    });
}

// 6) Renames a local build from oldName to newName
function renameLocalBuild(oldName, newName) {
    if (!oldName || !newName) return;

    const oldData = window.localStorage.getItem(getBuildKey(oldName));
    if (oldData) {
        window.localStorage.setItem(getBuildKey(newName), oldData);
        window.localStorage.removeItem(getBuildKey(oldName));
    }
    refreshBuildList();
}

// 7) Refresh the list of all saved builds
function refreshBuildList() {
    const buildList = document.getElementById("build-list");
    buildList.innerHTML = "";

    const currentBuildName = new URLSearchParams(window.location.search).get("build");

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key.startsWith("build:")) continue; // Skip non-build items

        const buildName = key.slice("build:".length); // Remove prefix for display

        // Create list item
        const li = document.createElement("li");
        li.setAttribute("data-build-name", buildName);
        li.onclick = () => loadBuildByName(buildName);

        if (buildName === currentBuildName) {
            li.classList.add("active-build");
        }

        const buildNameSpan = document.createElement("span");
        buildNameSpan.textContent = buildName;
        buildNameSpan.classList.add("build-name");

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn-delete");
        deleteBtn.innerHTML = "&#10006;";
        deleteBtn.onclick = (event) => {
            event.stopPropagation();
            if (confirm(`Delete build "${buildName}"?`)) {
                deleteBuild(buildName);
            }
        };

        li.appendChild(buildNameSpan);
        li.appendChild(deleteBtn);
        buildList.appendChild(li);
    }
}


// Delete function
function deleteBuild(buildName) {
    localStorage.removeItem(getBuildKey(buildName));
    refreshBuildList();
    createNewBuild();
}

// 8) A helper to get the current build's base64
//    If your "updateSaveString()" sets a global variable (like 'savedBuildCode'),
//    you can just return that. Or you can replicate the logic here.
function getCurrentBuildBase64() {
    // Let's assume "updateSaveString()" sets "savedBuildCode" globally:
    updateSaveString();
    return savedBuildCode; 
}

function copyBuildCodeToClipboard() {
    // Ensure a build exists
    if (!currentBuildName) {
        alert("Please enter a build name first.");
        return;
    }

    // Generate base64 code (modify this if your function is different)
    updateSaveString();
    const buildCode = savedBuildCode; // Ensure `updateSaveString()` sets this

    if (!buildCode) {
        alert("Failed to generate build code.");
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(buildCode)
        .then(() => {
            alert("Build code copied to clipboard!");
        })
        .catch(err => {
            console.error("Failed to copy:", err);
            alert("Failed to copy build code.");
        });
}