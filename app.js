// ==========================================
// WORLDFINDER CORE ENGINE: IDENTITY & SYNC
// ==========================================

// Configuration Constants
const CONFIG = {
    POCKETBASE_URL: 'http://127.0.0.1:8090', // Your local PocketBase instance
    STORAGE_KEY: 'wf_device_secret'         // The local cookie-alternative passport
};

// Global Application State
let appState = {
    userSecret: null, // The private key (NEVER sent to the DB)
    userId: null      // The public signature (Sent to the DB)
};

/**
 * 🔑 DEVICE IDENTITY BOOTSTRAPPER
 * Generates or retrieves the user's anonymous cryptographic passport.
 */
function initDeviceIdentity() {
    // 1. Check if this browser already has a secret identity passport
    let existingSecret = localStorage.getItem(CONFIG.STORAGE_KEY);

    if (!existingSecret) {
        // 2. First Open: Generate a high-entropy cryptographically secure random string
        const buffer = new Uint8Array(16);
        window.crypto.getRandomValues(buffer);
        
        // Convert the random bytes to a clean hex text string
        existingSecret = Array.from(buffer)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        // 3. Bake it into the browser's local storage permanently
        localStorage.setItem(CONFIG.STORAGE_KEY, existingSecret);
        console.log("✨ New WorldFinder Identity generated locally.");
    } else {
        console.log("💾 Existing WorldFinder Identity loaded from storage.");
    }

    // 4. Set our global state
    appState.userSecret = existingSecret;
    
    // 5. Slice out the first 15 characters to act as the Public User ID
    // This allows users to manage their pins without exposing their private key
    appState.userId = existingSecret.substring(0, 15);

    console.log(`👤 Anonymous Signature: wf_guest_${appState.userId}`);
}

/**
 * DIRECT EXPORT UTILITY (For the Lifeline Panel)
 * Allows users to copy their key to their notes for cross-device backup.
 */
function getRecoveryToken() {
    return appState.userSecret;
}

/**
 * DIRECT IMPORT UTILITY (For Session Recovery)
 * Overwrites local storage with a backup token to restore an identity.
 */
function importRecoveryToken(newToken) {
    if (newToken && newToken.length === 32) {
        localStorage.setItem(CONFIG.STORAGE_KEY, newToken);
        initDeviceIdentity(); // Re-initialize the state with the new token
        return true;
    }
    return false;
}

// Kick off the identity engine immediately on page load
document.addEventListener('DOMContentLoaded', () => {
    initDeviceIdentity();
});
