import axios from "axios";
import env from "dotenv";

env.config();

// Backend URL untuk webhook sync
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3300";
const PONDER_API_KEY = process.env.PONDER_SYNC_API_KEY || "ponder-sync-key";

// Log configuration on startup
console.log("🔧 Ponder Sync Configuration:");
console.log(`   BACKEND_URL: ${BACKEND_URL}`);
console.log(
  `   API_KEY: ${PONDER_API_KEY ? "***" + PONDER_API_KEY.slice(-4) : "NOT SET"}`,
);

/**
 * Helper function untuk push data ke Backend PostgreSQL
 * @param endpoint - Endpoint path (e.g., "campaign", "donation", "badge")
 * @param data - Data object to send
 */
export async function pushToBackend(
  endpoint: string,
  data: any,
): Promise<void> {
  try {
    const url = `${BACKEND_URL}/api/sync/${endpoint}`;

    console.log(
      `🚀 Pushing to backend: ${endpoint}`,
      `\n   URL: ${url}`,
      `\n   Data:`,
      JSON.stringify(data, null, 2),
    );

    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        "x-ponder-api-key": PONDER_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    console.log(`✅ Pushed to backend: ${endpoint}`, response.status);
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      console.error(
        `❌ Failed to push to backend: ${endpoint}`,
        `\n   URL: ${BACKEND_URL}/api/sync/${endpoint}`,
        `\n   Status: ${error.response.status}`,
        `\n   Response:`,
        error.response.data,
      );
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        `❌ No response from backend: ${endpoint}`,
        `\n   URL: ${BACKEND_URL}/api/sync/${endpoint}`,
        `\n   Error: Backend might be down or unreachable`,
        `\n   Hint: Check if BACKEND_URL is correct and backend is running`,
      );
    } else {
      // Error setting up request
      console.error(
        `❌ Error pushing to backend: ${endpoint}`,
        `\n   Error:`,
        error.message,
      );
    }
  }
}
