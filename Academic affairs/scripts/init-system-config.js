/**
 * This script initializes the system config collection for academic year centralization
 */
// Use CommonJS require instead of ESM import
const { initializeSystemConfig } = require("../lib/system-config.js");

async function main() {
  console.log("Starting system config initialization...");
  
  try {
    const result = await initializeSystemConfig();
    
    if (result) {
      console.log("SUCCESS: System config initialized successfully!");
    } else {
      console.log("INFO: System config already exists, no action taken.");
    }
  } catch (error) {
    console.error("ERROR: Failed to initialize system config:", error);
  }
  
  console.log("Initialization process completed.");
}

main().catch(console.error); 