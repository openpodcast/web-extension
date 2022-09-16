let namespace = window.browser || chrome

class CookieStore {
  // return all cookies for a specified domain (which is allowed in manifest.json)
  async getDomainCookies(domain) {
    const cookies = await browser.cookies.getAll({url: domain})
    return cookies
  }
}

const cookieStore = new CookieStore()

// react on message from content script and sends back found cookies
function handleMessage(request, sender, sendResponse) {
 if (request.type && request.type === "spotifycookies") {
    cookieStore.getDomainCookies("https://podcasters.spotify.com").then((cookies) => {
      sendResponse({ response: cookies })
    })
  }
  return true
}

//register handler for communication with content script
browser.runtime.onMessage.addListener(handleMessage);