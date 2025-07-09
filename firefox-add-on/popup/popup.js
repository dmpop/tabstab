// Load current settings
async function loadSettings() {
  const settings = await browser.storage.local.get();
  document.getElementById("daysThreshold").value = settings.daysThreshold || 7;
  document.getElementById("checkInterval").value = settings.checkInterval || 60;
}

// Save settings
async function saveSettings() {
  const daysThreshold = parseInt(
    document.getElementById("daysThreshold").value
  );
  const checkInterval = parseInt(
    document.getElementById("checkInterval").value
  );

  if (isNaN(daysThreshold) || daysThreshold < 1) {
    alert("Please enter a valid number of days (1 or more)");
    return;
  }

  if (isNaN(checkInterval) || checkInterval < 1) {
    alert("Please enter a valid check interval in minutes (1 or more)");
    return;
  }

  await browser.storage.local.set({
    daysThreshold,
    checkInterval,
  });

  window.close();
}

// Initialize
document.addEventListener("DOMContentLoaded", loadSettings);
document.getElementById("save").addEventListener("click", saveSettings);
document
  .getElementById("close")
  .addEventListener("click", () => window.close());
