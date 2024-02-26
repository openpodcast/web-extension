const RUNTIME = chrome || window.browser;
const SPOTIFY_DOMAIN = "https://podcasters.spotify.com";

// Register handler for external communication (new flow)
RUNTIME.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    if (request?.message) {
      switch (request.message) {
        case "version":
          const manifest = RUNTIME.runtime.getManifest();
          sendResponse({ version: manifest.version });
          break;
        case "credentials":
          const credentials = await retrieveSpotifyCookies();
          sendResponse({ credentials: credentials ?? {} }); // Return empty object if no credentials
          return true; // Keep the message channel open for the asynchronous response
      }
    }
  }
);

// Register handler for communication with content script (old flow)
RUNTIME.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "spotifycookies") {
    const spotifyCredentials = await retrieveSpotifyCookies();
    sendResponse({ response: spotifyCredentials ?? {} }); // Return empty object if no credentials
    return true; // Indicates that we will respond asynchronously
  }
});

// Return all cookies for a specified domain
const getDomainCookies = async (domain) => {
  return RUNTIME.cookies.getAll({ url: domain });
};

// Remove all cookies for a specified domain
const removeAllCookies = async (domain) => {
  const cookies = await getDomainCookies(domain);
  for (let cookie of cookies) {
    await RUNTIME.cookies.remove({
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
    .reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {});

  // If no specific credentials are found, it's not an error.
  return Object.keys(spotifyCredentials).length ? spotifyCredentials : null;
};
