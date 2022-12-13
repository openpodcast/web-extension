const runtime = window.browser || chrome

//insert html at the beginning of the website
function showCredentialsOnWebsite(creds) {
  let message = "No Spotify credentials found, are you logged in on podcasters.spotify.com? (Maybe reload this page.)"
  if (creds.sp_key && creds.sp_dc) {
    message = `Spotify Data: key: ${creds['sp_key']}, dc: ${creds['sp_dc']} END`
  }
  document.getElementById("openpodcast-plugin").innerHTML = message
}

//communicate with background script to fetch cookies (only background script is allowed to do this)
async function retrieveSpotifyCookies() {
  console.log("retrieving spotify keys from service worker")
  // sends a message to the background.js and retrieve cookies

  const message = await chrome.runtime.sendMessage({ type: "spotifycookies" })

  const cookies = message.response
  const spotifyCreds = cookies
    //filter what cookies we need and map to a simple lookupobject
    .filter((cookie) => cookie.name === "sp_key" || cookie.name === "sp_dc")
    .reduce((result, cookie) => { result[cookie.name] = cookie.value; return result; }, {})
  //show credentials in the HTML code of the OpenPodcast website
  showCredentialsOnWebsite(spotifyCreds)
}

// check if current website is the OpenPodcast website where we want to show the credentials
function isOnOpenPodcastWebsite() {
  return window.location.href.match(/https:\/\/openpodcast.dev\/.*connect/) && document.getElementById("openpodcast-plugin")
}

//wait 1sec until the website is loaded (maybe a problem with docsify) and then check if we are on the right website
setInterval(() => {
  if (isOnOpenPodcastWebsite()) {
    retrieveSpotifyCookies()
  }
}, 1000)
