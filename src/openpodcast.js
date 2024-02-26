const RUNTIME = window.browser || chrome;

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

// Insert HTML at the beginning of the website
//
// The new flow does not require this function anymore, because it fetches the
// credentials with a message to the background.js, but the old flow is still
// here for backwards compatibility.
function showCredentialsOnWebsite(credentials) {
  let message = `No Spotify credentials found, are you logged in on <a href="https://podcasters.spotify.com" target="_blank">podcasters.spotify.com</a>? (Maybe reload this page.)`;
  if (credentials.sp_key && credentials.sp_dc) {
    message = `Spotify Data: key: ${credentials["sp_key"]}, dc: ${credentials["sp_dc"]} END`;
  }
  if (credentials.anchorpw_s) {
    message = `Anchor Data: anchorpw_s: ${credentials["anchorpw_s"]} END`;
  }

  // create div
  const div = document.createElement("div");

  // if any credentials set, show email button to send credentials to OpenPodcast team
  if (credentials.sp_key || credentials.sp_dc || credentials.anchorpw_s) {
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

  if (!parentElement) {
    // Do nothing if the parent element is not found
    return;
  }

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
  const message = await RUNTIME.runtime.sendMessage({ type: "spotifycookies" });
  // Credentials are returned in the response (and already validated)
  // This returns `null` if no credentials are found
  return message.response;
}

// Check if current website is the Open Podcast website where we want to show the
// credentials. This is only used on openpodcast.dev
function isOnOpenPodcastDevWebsite() {
  const res =
    /^(https?:\/\/)?(www\.)?(openpodcast\.dev|localhost)/.test(
      window.location.href
    ) && document.getElementById("openpodcast-plugin") !== null;
  return res;
}

// Function to initiate the loop
function checkForCredentials() {
  checkLoopTimer = setInterval(async () => {
    if (isOnOpenPodcastDevWebsite()) {
      const spotifyCredentials = await retrieveSpotifyCookies();

      if (spotifyCredentials) {
        showCredentialsOnWebsite(spotifyCredentials);

        // Clear the timer interval since the credentials have been retrieved
        // This will stop the loop
        clearInterval(checkLoopTimer);
      }
    }
  }, 1000);
}

checkForCredentials();
