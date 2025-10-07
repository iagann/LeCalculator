// base64Handler.js

function saveToClipboard() {
    // Ensure we have the latest structure
    updateSaveString();

    navigator.clipboard.writeText(savedBuildCode).then(() => {
        alert("Build code copied to clipboard!");
    }).catch(err => {
        console.error("Clipboard copy failed:", err);
    });
}

// base64Handler.js
let savedBuildCode = "";

// 1) Update the build code from the DOM structure
function updateSaveString() {
    let buildJson = {
      "type": "LECalculator build code",
      "link": "https://iagann.github.io/LeCalculator/LeCalculator.html",
      "build": {
        "name": document.getElementById("buildNameInput").value,
        "data": []
      }
    };

    document.querySelectorAll(".category").forEach(category => {
      const categoryName = category.querySelector('input[placeholder="Category Name"]')?.value || "";
      let categoryJson = {
        "categoryName": categoryName,
         "items": []
      };

      category.querySelectorAll(".section").forEach(section => {
        const sectionName = section.querySelector('input[placeholder="Section Name"]')?.value || "";
        const sectionEnabled = section.querySelector(".section-enabled")?.checked ?? true;

        let sectionJson = {
          "sectionName": sectionName,
          "enabled": sectionEnabled,
          "stats": []
        }
    
        section.querySelectorAll(".stat-entry").forEach(statEntry => {
          const statName = statEntry.querySelector('input[placeholder="Choose Stat..."]')?.value || "";
          const expression = statEntry.querySelector('input[placeholder="Math Expression"]')?.value || "";
          const statEnabled = statEntry.querySelector(".stat-enabled")?.checked ?? true;
          const statKey = statName in statNameToIndex ? statNameToIndex[statName] : NaN;

          let statJson = {
            "statName": statName,
            "expression": expression,
            "statId": statKey,
            "enabled": statEnabled
          };

          sectionJson.stats.push(statJson);
        });

        categoryJson.items.push(sectionJson);
      });

       buildJson.build.data.push(categoryJson);
    });
  
    const jsonStr = JSON.stringify(buildJson, null, 2);
    //savedBuildCode = compressBuild(jsonStr);
    savedBuildCode = jsonStr; // plain
  }
  
function openLoadDialog() {
  document.getElementById("loadDialog").style.display = "block";
  const loadInput = document.getElementById("loadInput");
  loadInput.value = ""; // Clear input field
  loadInput.focus();
}

document.getElementById("loadInput").addEventListener("input", function() {
    const inputStr = this.value; //.trim();
    if (!inputStr) return;

    // Decompress Base64 and parse JSON to check the build name
    try {
        //const jsonStr = decompressBuild(inputStr);
        const jsonStr = inputStr; // plain
        const parsedData = JSON.parse(jsonStr);

        const buildName = parsedData.build.name;

        // Check if a build with the same name already exists in localStorage
        if (localStorage.getItem(buildName)) {
            if(!confirm(`A build named "${buildName}" already exists! Overwrite it?`))
                return;
        }

        // If no conflicts, load the build
        document.getElementById("loadDialog").style.display = "none";
        this.value = ""; // Clear input after closing
        loadFromCode(inputStr);

    } catch (error) {
        alert("Failed to load build: Invalid or corrupted data.");
        console.error("Build Load Error:", error);
    }
});

window.loadFromCode = function(inputStr) {
    try {
      //const jsonStr = decompressBuild(inputStr);
      const jsonStr = inputStr; // plain
      if (!jsonStr) return;
  
      const parsedData = JSON.parse(jsonStr);
      const buildJson = parsedData.build;
      const loadedBuildName = buildJson.name.trim();
      currentBuildName = loadedBuildName;
      document.getElementById("buildNameInput").value = currentBuildName;

      // Clear out current sections
      document.getElementById("sections").innerHTML = "";
      const categories = buildJson.data;
      for (let category of categories) {
        const categoryName = category.categoryName.trim();
        const categoryDiv = addCategory(categoryName, true);

        category.items.forEach(section => {
          const sectionName = section.sectionName.trim();
          const sectionEnabled = section.enabled;
    
          // Create new section
          const sectionDiv = addSection(categoryDiv.children[1], sectionName, null, true);
          const statList = sectionDiv.querySelector(".stat-list");
    
          // Restore section enabled state
          const sectionCheckbox = sectionDiv.querySelector(".section-enabled");
          if (sectionCheckbox) {
            sectionCheckbox.checked = sectionEnabled;
            sectionDiv.classList.toggle("dimmed", !sectionEnabled); // if you're using .dimmed for opacity
          }
    
          section.stats.forEach(stat => {
            const statID = stat.statId;
            const expression = stat.expression.trim();
            const statEnabled = stat.enabled;
    
            const statName = getStatName(statID);
            const statEntry = addStatEntry(statList, statName, expression, true, true);
    
            const statCheckbox = statEntry.querySelector(".stat-enabled");
            if (statCheckbox) {
              statCheckbox.checked = statEnabled;
              statEntry.classList.toggle("dimmed", !statEnabled);
            }
          })
        });
      }
  
      makeCategoriesDraggable();
      makeSectionsDraggable();
      makeStatsDraggable();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("highlight:") && localStorage.getItem(key) === "true") {
          const name = key.slice("highlight:".length);
          highlightSummaryNames.add(name);
        }
      }
      updateSummary();
      validateStatEntries();
      updateSectionSearchOptions();
  
      // Scroll to top
      setTimeout(() => {
        document.getElementsByClassName("main-content")[0].scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
  
    } catch (error) {
      console.error("Failed to parse data:", error);
      alert("Invalid Build Code! Could not load data.");
    }
  };
  

function closeLoadDialog() {
    document.getElementById("loadDialog").style.display = "none";
}

function createNewBuild() {
    const base64Default = "NoIgRghgzgpiA0piVgXQQFwE4FcaIEZ4QBmTXGVRAVmIPLyuAIBY6AGdgAgCouBOBpUQt2xAEzshTFuIlT42RonEA2YqOmpUQA==";

    // Reset the build name
    const buildNameInput = document.getElementById("buildNameInput");

    // Clear current sections
    document.getElementById("sections").innerHTML = "";

    // Remove build name from the URL
    const params = new URLSearchParams(window.location.search);
    params.delete("build");
    window.history.replaceState({}, "", `${window.location.pathname}`);

    // Load the default build structure
    loadFromCode(base64Default);
    buildNameInput.value = "";

    // Focus on the name input
    buildNameInput.focus();
}

