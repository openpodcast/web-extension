const runtime = window.browser || chrome;

const email = "echo@openpodcast.dev";
let lastMessage = "";

// Store the ID of the interval, which we can later use to clear
let checkLoopTimer;

function createEmailSendButton(email, subject, body) {
  const button = document.createElement("button");
  button.innerHTML =
    "Click here to send credentials to OpenPodcast Team (via Email)";
  button.onclick = () => {
    window.location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(
      body
    )}`;
  };
  return button;
}

//insert html at the beginning of the website
function showCredentialsOnWebsite(creds) {
  let message = `No Spotify credentials found, are you logged in on <a href="https://podcasters.spotify.com" target="_blank">podcasters.spotify.com</a>? (Maybe reload this page.)`;
  if (creds.sp_key && creds.sp_dc) {
    message = `Spotify Data: key: ${creds["sp_key"]}, dc: ${creds["sp_dc"]} END`;
  }
  if (creds.anchorpw_s) {
    message = `Anchor Data: anchorpw_s: ${creds["anchorpw_s"]} END`;
  }

  // create div
  const div = document.createElement("div");

  // if any creds set, show email button to send credentials to OpenPodcast team
  if (creds.sp_key || creds.sp_dc || creds.anchorpw_s) {
    const button = createEmailSendButton(
      email,
      "OpenPodcast Spotify Credentials",
      message
    );
    button.style.marginBottom = "2em";
    button.style.display = "block";
    div.appendChild(button);
  }

  // show message
  const p = document.createElement("p");
  p.innerHTML = message;
  div.appendChild(p);

  const parentElement = document.getElementById("openpodcast-plugin");
  // remove all children and set new content
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild);
  }
  parentElement.appendChild(div);
}

// Communicate with background script to fetch cookies (only background script
// is allowed to do this)
async function retrieveSpotifyCookies() {
  // sends a message to the background.js and retrieve cookies
  const message = await chrome.runtime.sendMessage({ type: "spotifycookies" });

  const cookies = message.response;
  const spotifyCreds = cookies
    //filter for cookies we need and map to a simple lookupobject
    .filter(
      (cookie) =>
        cookie.name === "sp_key" ||
        cookie.name === "sp_dc" ||
        cookie.name === "anchorpw_s"
    )
    .reduce((result, cookie) => {
      result[cookie.name] = cookie.value;
      return result;
    }, {});

  return spotifyCreds;
}

// check if current website is the OpenPodcast website where we want to show the credentials
function isOnOpenPodcastWebsite() {
  return (
    window.location.href.match(/https:\/\/openpodcast.dev\/.*connect/) &&
    document.getElementById("openpodcast-plugin")
  );
}

// Function to initiate the loop
function checkForCredentials() {
  checkLoopTimer = setInterval(async () => {
    if (isOnOpenPodcastWebsite()) {
      const spotifyCreds = await retrieveSpotifyCookies();

      // Check if the retrieved credentials are valid
      if (
        spotifyCreds &&
        (spotifyCreds.sp_key || spotifyCreds.sp_dc || spotifyCreds.anchorpw_s)
      ) {
        showCredentialsOnWebsite(spotifyCreds);

        // Clear the timer interval since the credentials have been retrieved
        // This will stop the loop
        clearInterval(checkLoopTimer);
      }
    }
  }, 1000);
}

checkForCredentials();
