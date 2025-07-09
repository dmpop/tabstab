// Default settings
const DEFAULT_SETTINGS = {
  daysThreshold: 7,
  checkInterval: 60, // minutes
};

// Initialize settings
async function initSettings() {
  const settings = await browser.storage.local.get();
  if (!settings.daysThreshold) {
    await browser.storage.local.set(DEFAULT_SETTINGS);
  }
}

// Check and close old tabs
async function checkAndCloseOldTabs() {
  const { daysThreshold } = await browser.storage.local.get("daysThreshold");
  const threshold = daysThreshold || DEFAULT_SETTINGS.daysThreshold;
  const thresholdMs = threshold * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const now = Date.now();

  const tabs = await browser.tabs.query({});

  for (const tab of tabs) {
    // Skip pinned tabs
    if (tab.pinned) {
      continue;
    }

    // Check if tab has been open longer than the threshold
    if (tab.lastAccessed && now - tab.lastAccessed > thresholdMs) {
      try {
        await browser.tabs.remove(tab.id);
        console.log(
          `Closed tab: ${tab.title} (last accessed: ${new Date(
            tab.lastAccessed
          ).toLocaleString()})`
        );
      } catch (error) {
        console.error(`Error closing tab: ${error}`);
      }
    }
  }
}

// Set up alarm for periodic checking
async function setupAlarm() {
  const { checkInterval } = await browser.storage.local.get("checkInterval");
  const interval = checkInterval || DEFAULT_SETTINGS.checkInterval;

  // Clear any existing alarm
  await browser.alarms.clear("checkOldTabs");

  // Create new alarm
  await browser.alarms.create("checkOldTabs", {
    periodInMinutes: Number(interval),
  });
}

// Initialize
initSettings().then(() => {
  setupAlarm();
  checkAndCloseOldTabs(); // Run immediately on startup
});

// Listen for alarm
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkOldTabs") {
    checkAndCloseOldTabs();
  }
});

// Listen for settings changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.checkInterval) {
    setupAlarm();
  }
});
