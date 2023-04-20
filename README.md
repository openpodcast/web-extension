# web-extension to retrieve login data from Spotify and Apple

## Testing

Install extension dependencies with

```bash
npm install
```

Now [install web-ext][webext] and run

```bash
web-ext run start:chrome
web-ext run start:firefox
```

A browser window should open.
Navigate to <https://podcasters.spotify.com> and log in.

In a new browser tab, go to <https://openpodcast.dev> and you should see your Spotify keys at the top of the website.

[webext]: https://github.com/mozilla/web-ext

## Deployment

```bash
npm run build
```

This will create e.g. `web-extension/web-ext-artifacts/openpodcast_extension-1.1.zip` which can be uploaded to the Chrome Web Store.
