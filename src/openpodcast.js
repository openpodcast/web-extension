const RUNTIME = window.browser || chrome;
const email = "echo@openpodcast.dev";
let checkInProgress = false;

function createEmailSendButton(email, subject, body) {
  const button = document.createElement("button");
  button.innerHTML =
    "Click here to send credentials to OpenPodcast Team (via Email)";
  button.onclick = () => {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
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
    message = `Spotify Data: key: ${credentials.sp_key}, dc: ${credentials.sp_dc} END`;
  }
  if (credentials.anchorpw_s) {
    message = `Anchor Data: anchorpw_s: ${credentials.anchorpw_s} END`;
  }

  const div = document.createElement("div");
  if (credentials.sp_key || credentials.sp_dc || credentials.anchorpw_s) {
    const button = createEmailSendButton(
      email,
      "OpenPodcast Spotify Credentials",
      message
    );
    button.style.marginBottom = "2em";
    div.appendChild(button);
  }

  const p = document.createElement("p");
  p.innerHTML = message;
  div.appendChild(p);

  const parentElement = document.getElementById("openpodcast-plugin");
  if (parentElement) {
    while (parentElement.firstChild) {
      parentElement.removeChild(parentElement.firstChild);
    }
    parentElement.appendChild(div);
  }
}

// Old flow, which is still used on openpodcast.dev
// Communicate with background script to fetch cookies (only background script
// is allowed to do this)
// Credentials are already validated in the background.js
// This returns `null` if no credentials are found
async function retrieveSpotifyCookiesFromBackground() {
  try {
    const message = await RUNTIME.runtime.sendMessage({
      type: "spotifycookies",
    });
    return message.response;
  } catch (error) {
    // No valid credentials found yet (which is not an error)
    return null;
  }
}

// Check if current website is the Open Podcast website where we want to show the
// credentials. This is only used on openpodcast.dev
function isOnOpenPodcastDevWebsite() {
  return (
    /^(https?:\/\/)?(www\.)?(openpodcast\.dev|localhost)/.test(
      window.location.href
    ) && document.getElementById("openpodcast-plugin") !== null
  );
}

// Function to initiate the loop
function checkForCredentials() {
  setInterval(async () => {
    if (isOnOpenPodcastDevWebsite() && !checkInProgress) {
      checkInProgress = true;
      try {
        const spotifyCredentials = await retrieveSpotifyCookiesFromBackground();
        if (spotifyCredentials) {
          showCredentialsOnWebsite(spotifyCredentials);
        }
      } catch (error) {
        console.error("Error checking for credentials:", error);
      } finally {
        checkInProgress = false;
      }
    }
  }, 1000);
}

checkForCredentials();
