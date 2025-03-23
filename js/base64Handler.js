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

/*
NoIgEgpghgTgLgZwhA1hGACAkgcwHYCWcEIANKMAEZRIC6ZAjKSAMxkCszDjALFwAz8MAKgwBOMj37MATP0kzZ80jIBszKSFrkQwBCgIAbQ7QyRYiZGhhkZADmar2GANQYAJhAAeGAPQYZMhZFEBgIAGMAVxgANwgRDAZ2WwB2ASF/QNIWPhAGQVSudnltCn0jEwwAZQALaII0PAQghxA7BJYSnT0DY1NaggAzOEYWZmKtbvK+jABBcIJ3DAAxQxoUUeZO204QOUmy3sqABUi8cLhokmyQhiyZNJAACiSEngBKBKeWVwwWT9E3FKuiIEAAtqYAMJQNZgogAT0Y6hAyVITDaOy2ymRdyC6LsygeRS6FFBEIwADkCDUjARmqQcVkGGMMSpHilVLxmCllCwWfsVLkkkFdvtgcAyaZIMYMAAlaDhGq2MRcAB0/GcojCUVi1xY6PyqJYu3Y90eDAYPEKKKyxoEmL2JJBxHJAHV4TAwTTPBhIQB7KAjNE41R2IKPCbZdGRmSiq1orhMoW44NbMTKBjI1RsUg8flA7qS6pQPA4SIEPDxMABmDua0pZyZRhcTlsrHW7bZXKxrkgHjJcVF+VLWUVnAYAAyEGGm1ZBtbJts3d5jwFLBVeSdEpdpmHcrH+5wNSDzOYYYTeQX4yXSnDt+yG/yB2d4NMxxgUAgcD9MAIJYwABCECGCeyKxry6IyGu6KqNiia9qGZDIgOhY7hgACyn41IYFYAOQIGYkSUL+9KZtyqJSEUzaXr2DYIeeyF4o4yi5K2IScoOaHLAQ6DwhgAAiH44H6eDVDUfoQKRyLprOnb4rOAqxlsRrosakgsnYKGkmhADSwFwDU/4AWsCBwAesw4BAeBBvqGjxkSeytuujgdLRqIOTw7RNrmQqKbsDBhoO7h+pUAAqNQwCJ8R+oMcxgpQRAECJQQhJo2QspoQUhaYE6wJZYlQMFADu2DBYYiRIcwEhRu2WWVLlMD5bUhV+iVWBlQElUgNVtmsFuizZZOeXxM1xWlSFfxdT1qn9WVOXDQVY3tRN8bSUxfXPhKc3VN+kRwENwmEP+y3ldwDLXmiuTbHV/S7ftuWHX+oknZ150or213dJQhiSQgY6mMZUDhCg1RnNa+Rbt9v3/XKEAEPgGAxQJQkifSMjLptUMIH9pb9AADgQv6IIjsXcWEkjSBt4pYzjOCmOF8QWdFsWuhWxA2LmBoTNTP3YzDACieDuAeBkjd+nqSLsPCBOKeM0H9cQYJFZYQLd0DuHxYAlnWF4MAk56WuM+ubXLfOK8rkSqxgADi5Y/UEOJCICtghJqFWy/LBDm36KumPzMQ0EleCSDiQQbjwCRabopsK/EFtW/xfruPl2sYMcsAwIi2RZpHkiPD8ohR8AMde/EYKwCgCDl3gpiCVAFbmTAkVFfSdqsMbHtm2XFdVyWpjLH6UQEWT1wGh33Ql4r5cwJX1dQiJ4RWXAH5mclNyyOPFCT93M+9zXaeRYYImWUs/HgnSeroikCRPp3scYNPs99xhEDC3AgZBw7Ag3ybntTz3c9YaDB+hcT+2QIy5zRPySBzlNy/y7g/ABz9ZhN1ajtH8YIRTf38GwO+pdEG70Af6OIv5SwrEJiQPBitvqFVfiWReMAoRHygCDJGo1WqkS4MbXMq5N7Rz/vEGhnh3D0PQG+aICBywng0vA++Qi6HnDEWJSKkQlhI34pEfQvZ8h8OLgIjA8iRGKMYXMPGfpTJAyzp5JQW5t4YEGDCcIUUTGs0MJ4GAlZsbVCcXtbRTsMDnhYMhXRdiHGGCcZWExsooB43FvhDArNSyt1uLnKh8QwkRKUQAeT2msIW6AEC4QwKFKyQMERfxANfQuCgtipInvojJzjTAWSMFWM4J4uGiBSFoWgQA
*/

// 1) Update the build code from the DOM structure
function updateSaveString() {
    const allSections = [document.getElementById("buildNameInput").value];
  
    document.querySelectorAll(".section").forEach(section => {
      const sectionName = section.querySelector('input[placeholder="Section Name"]')?.value || "";
      const sectionEnabled = section.querySelector(".section-enabled")?.checked ?? true;
  
      const sectionArray = [sectionName, sectionEnabled];
  
      section.querySelectorAll(".stat-entry").forEach(statEntry => {
        const statName = statEntry.querySelector('input[placeholder="Choose Stat..."]')?.value || "";
        const expression = statEntry.querySelector('input[placeholder="Math Expression"]')?.value || "";
        const statEnabled = statEntry.querySelector(".stat-enabled")?.checked ?? true;
  
        const statKey = Object.keys(stats).find(key => getStatName(stats[key]) === statName);
  
        if (statKey) {
          const statID = stats[statKey];
          sectionArray.push([statID, expression, statEnabled]);
        }
      });
  
      allSections.push(sectionArray);
    });
  
    const jsonStr = JSON.stringify(allSections);
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
  
      const parsedData = JSON.parse(jsonStr);
      const loadedBuildName = parsedData[0]; 
      const allSections = parsedData.slice(1);
      currentBuildName = loadedBuildName;
      document.getElementById("buildNameInput").value = currentBuildName;
  
      // Clear out current sections
      document.getElementById("sections").innerHTML = "";
  
      allSections.forEach(sectionArr => {
        const sectionName = sectionArr[0];
        const sectionEnabled = sectionArr[1] ?? true;
  
        // Create new section
        const sectionDiv = addSection(sectionName);
        const statList = sectionDiv.querySelector(".stat-list");
  
        // Restore section enabled state
        const sectionCheckbox = sectionDiv.querySelector(".section-enabled");
        if (sectionCheckbox) {
          sectionCheckbox.checked = sectionEnabled;
          sectionDiv.classList.toggle("dimmed", !sectionEnabled); // if you're using .dimmed for opacity
        }
  
        // Loop through remaining items (triplets: [statID, expression, statEnabled])
        for (let i = 2; i < sectionArr.length; i++) {
          const entry = sectionArr[i];
          const statID = entry[0];
          const expression = entry[1];
          const statEnabled = entry[2] ?? true;
  
          const statName = getStatName(statID);
          const statEntry = addStatEntry(statList, statName, expression, true);
  
          const statCheckbox = statEntry.querySelector(".stat-enabled");
          if (statCheckbox) {
            statCheckbox.checked = statEnabled;
            statEntry.classList.toggle("dimmed", !statEnabled);
          }
        }
      });
  
      makeSectionsDraggable();
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
    loadFromBase64(base64Default);
    buildNameInput.value = "";

    // Focus on the name input
    buildNameInput.focus();
}

