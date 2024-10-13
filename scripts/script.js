
let defaultRem = 48;//can change, might need to be updated or automated

const rootFontSize = parseFloat(//used to reset back to normal
    getComputedStyle(document.documentElement).fontSize
);
let currentVal = defaultRem * rootFontSize;

chrome.storage.sync.get(["maxWidth"], function (result) {//init page before load
  if (result.maxWidth) {
    updateMaxWidthOnPage(result.maxWidth);
    currentVal = result.maxWidth;
  } 
});

function updateMaxWidthOnPage(value) {
  let styleElement = document.getElementById("dynamicMaxWidthStyle");

  // Create style tag if it doesn't exist
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "dynamicMaxWidthStyle";
    document.head.appendChild(styleElement);
  }

  // Update max-width inside the media query
  const biggerVal = parseInt(value) * 1.1;// no sidebar is larger 
  styleElement.textContent = `
        .xl\\:max-w-\\[48rem\\] {
            max-width: ${value}px;
        }
    
        .lg\\:gap-6 {
        max-width: ${biggerVal}px;
    }
}`;
}

document.addEventListener("DOMContentLoaded", function () {

  const slider = document.getElementById("maxWidthSlider");
  const numInput = document.getElementById("num");
  const maxButton = document.getElementById("max");
  const resetButton = document.getElementById("reset");
  const darkModeToggle = document.getElementById("darkModeToggle");

  slider.max = screen.width + 201;

  // Check the stored dark mode preference when the page loads
  chrome.storage.sync.get("darkMode", function (result) {
    const isDarkMode = result.darkMode || false; 
    darkModeToggle.checked = isDarkMode; 
    document.body.classList.toggle("dark-mode", isDarkMode);
  });

  chrome.storage.sync.get(["maxWidth"], function (result) {//double check and update 
    if (result.maxWidth) {
      updateMaxWidthOnPage(result.maxWidth);
      currentVal = result.maxWidth;
      numInput.value = currentVal;
      slider.value = currentVal;
    } 
});
  
  function changeNSave(isSlider = false) {
    numInput.value = currentVal;
    slider.value = currentVal;

    if (isSlider == false) {
      chrome.storage.sync.set({ maxWidth: currentVal });
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: updateMaxWidthOnPage,
        args: [currentVal],
      });
    });
  }

  numInput.value = currentVal;//init values
  slider.value = currentVal;

  numInput.addEventListener("input", function () {
    currentVal = numInput.value;
    changeNSave(true);
  });

  numInput.addEventListener("blur", function () {
    //save on blur to prevent too many storage calls
    chrome.storage.sync.set({ maxWidth: currentVal });
  });


  resetButton.addEventListener("click", function () {
    // Convert rem to px
    currentVal = defaultRem * rootFontSize;
    changeNSave();
  });

  maxButton.addEventListener("click", function () {
    currentVal = screen.width;
    changeNSave();
  });

  slider.addEventListener("input", function () {
    currentVal = slider.value;
    changeNSave(true);
  });

  slider.addEventListener("blur", function () {
    //save on blur to prevent too many storage calls
    chrome.storage.sync.set({ maxWidth: currentVal });
  });

  darkModeToggle.addEventListener("change", function () {
    const isDarkMode = darkModeToggle.checked;//get current val

    document.body.classList.toggle("dark-mode", isDarkMode);

    chrome.storage.sync.set({ darkMode: isDarkMode });
  });
  
});
