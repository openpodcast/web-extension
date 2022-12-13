const runtime = chrome || window.browser

//register handler for communication with content script
runtime.runtime.onMessage.addListener((request, sender, sendResponse) => {

  const runtime = chrome || window.browser

  // return all cookies for a specified domain (which is allowed in manifest.json)
  const getDomainCookies = async (domain) => {
    const cookies = await runtime.cookies.getAll({ url: domain })
    return cookies
  }

  if (request.type && request.type === "spotifycookies") {
    getDomainCookies("https://podcasters.spotify.com").then((cookies) => {
      sendResponse({ response: cookies })
    })
  }
  return true
})
