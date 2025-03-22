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
    // Collect all sections in an array-of-arrays
    const allSections = [document.getElementById("buildNameInput").value];

    document.querySelectorAll(".section").forEach(section => {
        // Start this section array with the section name
        const sectionName = section.querySelector("input[type='text']").value;
        const sectionArray = [ sectionName ];

        // For each stat-entry, push [statID, expression] pairs
        section.querySelectorAll(".stat-entry").forEach(statEntry => {
            const statName = statEntry.querySelector("input[type='text']:first-of-type").value;
            // Look up the numeric stat ID from the stats enum
            const statKey = Object.keys(stats).find(key => getStatName(stats[key]) === statName);

            const expressionInput = statEntry.querySelector("input[type='text']:last-of-type");
            const expression = expressionInput ? expressionInput.value : "";

            // Only push if we found a valid stat ID
            if (statKey) {
                // e.g. stats.FLAT_DAMAGE = 1
                const statID = stats[statKey];
                sectionArray.push(statID, expression);
            }
        });

        allSections.push(sectionArray);
    });

    // Convert to JSON, then compress
    const jsonStr = JSON.stringify(allSections);
    //console.log("save JSON", allSections);
    savedBuildCode = LZString.compressToBase64(jsonStr);
}

function openLoadDialog() {
  document.getElementById("loadDialog").style.display = "block";
  const loadInput = document.getElementById("loadInput");
  loadInput.value = ""; // Clear input field
  loadInput.focus();
}

document.getElementById("loadInput").addEventListener("input", function() {
    const inputStr = this.value.trim();
    if (!inputStr) return;

    // Decompress Base64 and parse JSON to check the build name
    try {
        const jsonStr = LZString.decompressFromBase64(inputStr);
        const parsedData = JSON.parse(jsonStr);

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
            alert("Invalid build data!");
            return;
        }

        const buildName = parsedData[0]; // First element in array should be the build name

        // Check if a build with the same name already exists in localStorage
        if (localStorage.getItem(buildName)) {
            if(!confirm(`A build named "${buildName}" already exists! Overwrite it?`))
                return;
        }

        // If no conflicts, load the build
        document.getElementById("loadDialog").style.display = "none";
        this.value = ""; // Clear input after closing
        loadFromBase64(inputStr);

    } catch (error) {
        alert("Failed to load build: Invalid or corrupted data.");
        console.error("Build Load Error:", error);
    }
});

window.loadFromBase64 = function(inputStr) {
    try {
        const jsonStr = LZString.decompressFromBase64(inputStr);
        if (!jsonStr) return;

        // allSections is an array of arrays
        // e.g. [ [ "SectionName", 0, "expr", 1, "expr2" ], [ "AnotherSection", ... ] ]
        const parsedData = JSON.parse(jsonStr);
        const loadedBuildName = parsedData[0]; 
        const allSections = parsedData.slice(1); // Everything except the first element
        currentBuildName = loadedBuildName;
        document.getElementById("buildNameInput").value = currentBuildName;

        // Clear out the current sections
        document.getElementById("sections").innerHTML = "";

        // For each section array => reconstruct the DOM
        allSections.forEach(sectionArr => {
            // 1) The first element is the section name
            const sectionName = sectionArr[0];
            // 2) Create a new section in the DOM
            const sectionDiv = addSection(sectionName); 
            const statList = sectionDiv.querySelector(".stat-list");

            // 3) The rest are in [statID, expression, statID, expression, ...] pairs
            for (let i = 1; i < sectionArr.length; i += 2) {
                const statID = sectionArr[i];
                const expression = sectionArr[i + 1];

                // Convert the numeric ID to a display name
                const statName = getStatName(statID); 
                // Add the stat to the DOM
                addStatEntry(statList, statName, expression, true);
            }
        });

        // Re-init dragging for all sections & stats
        makeSectionsDraggable();
        updateSummary();
        updateSummary();
        validateStatEntries();
        updateSectionSearchOptions();

    } catch (error) {
        console.error("Failed to parse data:", error);
        alert("Invalid Build Code! Could not load data.");
    }
};

function closeLoadDialog() {
    document.getElementById("loadDialog").style.display = "none";
}

function createNewBuild() {
    const base64Default = "NoIgRghgzgpiA0pKwQRniAzAgrB1aALPgAwkAEAVOQJwKEkYBMJ9TzrAup0A";

    // Reset the build name
    const buildNameInput = document.getElementById("buildNameInput");

    // Clear current sections
    document.getElementById("sections").innerHTML = "";

    // Remove build name from the URL
    const params = new URLSearchParams(window.location.search);
    params.delete("build");
    window.history.replaceState({}, "", `${window.location.pathname}`);

    // Load the default build structure
    loadFromBase64(base64Default);
    buildNameInput.value = "";

    // Focus on the name input
    buildNameInput.focus();
}

