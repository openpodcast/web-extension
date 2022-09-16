//insert html at the beginning of the website
function showCredentialsOnWebsite(creds) {
  let message = "No Spotify credentials found, are you logged in on podcasters.spotify.com? (reload needed)"
  if (creds.sp_key && creds.sp_dc) {
    message = `Spotify Credentials: key: ${creds['sp_key']}, dc: ${creds['sp_dc']}`
  }
  const credsHTMLElement = document.createTextNode(message);
  document.body.prepend(credsHTMLElement)
}

//communicate with background script to fetch cookies (only background script is allowed to do this)
async function retrieveSpotifyCookies() {
  // sends a message to the background.js and retrieve cookies
  const message = await browser.runtime.sendMessage({type: "spotifycookies"})
  const cookies = message.response
  const spotifyCreds = cookies
    //filter what cookies we need and map to a simple lookupobject
    .filter((cookie) => cookie.name === "sp_key" || cookie.name === "sp_dc")
    .reduce((result, cookie) => { result[cookie.name]=cookie.value; return result; },{})
  //show credentials in the HTML code of the OpenPodcast website
  showCredentialsOnWebsite(spotifyCreds)
}

//init
retrieveSpotifyCookies()