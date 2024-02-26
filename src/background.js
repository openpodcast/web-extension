const RUNTIME = chrome || window.browser;
const SPOTIFY_DOMAIN = "https://podcasters.spotify.com";

// register handler for external communication (new flow)
RUNTIME.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request) {
    if (request.message) {
      if (request.message == "version") {
        // Retrieve the extension version
        const manifest = chrome.runtime.getManifest();
        sendResponse({ version: manifest.version });
      } else if (request.message == "credentials") {
        retrieveSpotifyCookies()
          .then((credentials) => {
            sendResponse({ credentials: credentials });
          })
          .catch((error) => {
            console.error("Error retrieving Spotify credentials:", error);
            sendResponse({ error: "Failed to retrieve credentials" });
          });
        return true; // keep the message channel open for the asynchronous response
      }
    }
  }
});

// register handler for communication with content script (old flow)
RUNTIME.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type && request.type === "spotifycookies") {
    retrieveSpotifyCookies()
      .then((spotifyCredentials) => {
        sendResponse({ response: spotifyCredentials });
        if (spotifyCredentials !== null) {
          removeAllCookies(SPOTIFY_DOMAIN);
        }
      })
      .catch((error) => {
        console.error("Error retrieving Spotify credentials:", error);
        sendResponse({ error: "Failed to retrieve credentials" });
      });
    return true; // Indicates that we will respond asynchronously
  }
});

// return all cookies for a specified domain (which is allowed in manifest.json)
const getDomainCookies = async (domain) => {
  return await RUNTIME.cookies.getAll({ url: domain });
};

// remove a specific cookie
const removeCookie = async (cookie) => {
  await RUNTIME.cookies.remove(cookie);
};

// remove all cookies for a specified domain
const removeAllCookies = async (domain) => {
  const cookies = await getDomainCookies(domain);
  cookies.forEach((cookie) => {
    removeCookie({
      url: domain,
      name: cookie.name,
    });
  });
};

// retrieve Spotify cookies
const retrieveSpotifyCookies = async () => {
  return getDomainCookies(SPOTIFY_DOMAIN).then((cookies) => {
    const spotifyCredentials = cookies
      .filter((cookie) =>
        ["sp_key", "sp_dc", "anchorpw_s"].includes(cookie.name)
      )
      .reduce((result, cookie) => {
        result[cookie.name] = cookie.value;
        return result;
      }, {});

    if (
      spotifyCredentials.sp_key ||
      spotifyCredentials.sp_dc ||
      spotifyCredentials.anchorpw_s
    ) {
      return spotifyCredentials;
    } else {
      // No valid credentials found yet (which is not an error)
      return null;
    }
  });
};
