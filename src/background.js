const RUNTIME = chrome || window.browser;
const SPOTIFY_DOMAIN = "https://podcasters.spotify.com";

// Register handler for external communication (new flow)
RUNTIME.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    try {
      if (request?.message) {
        switch (request.message) {
          case "version":
            const manifest = RUNTIME.runtime.getManifest();
            sendResponse({ version: manifest.version });
            break;
          case "credentials":
            const credentials = await retrieveSpotifyCookies();
            sendResponse({ credentials });
            return true; // Keep the message channel open for the asynchronous response
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
      sendResponse({ error: "Failed to process request" });
    }
  }
);

// Register handler for communication with content script (old flow)
RUNTIME.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    if (request.type === "spotifycookies") {
      const spotifyCredentials = await retrieveSpotifyCookies();
      sendResponse({ response: spotifyCredentials });
      if (spotifyCredentials) {
        await removeAllCookies(SPOTIFY_DOMAIN);
      }
      return true; // Indicates that we will respond asynchronously
    }
  } catch (error) {
    sendResponse({ error: "Failed to retrieve credentials" });
  }
});

// Return all cookies for a specified domain
const getDomainCookies = async (domain) => {
  return RUNTIME.cookies.getAll({ url: domain });
};

// Remove a specific cookie
const removeCookie = async (cookie) => {
  await RUNTIME.cookies.remove(cookie);
};

// Remove all cookies for a specified domain
const removeAllCookies = async (domain) => {
  const cookies = await getDomainCookies(domain);
  for (let cookie of cookies) {
    await removeCookie({
      url: domain,
      name: cookie.name,
    });
  }
};

// Retrieve Spotify cookies
const retrieveSpotifyCookies = async () => {
  const cookies = await getDomainCookies(SPOTIFY_DOMAIN);
  const spotifyCredentials = cookies
    .filter((cookie) => ["sp_key", "sp_dc", "anchorpw_s"].includes(cookie.name))
    .reduce((result, cookie) => {
      result[cookie.name] = cookie.value;
      return result;
    }, {});

  return spotifyCredentials.sp_key ||
    spotifyCredentials.sp_dc ||
    spotifyCredentials.anchorpw_s
    ? spotifyCredentials
    : null;
};
