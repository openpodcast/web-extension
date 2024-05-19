# Browser-Extension to retrieve login data from Spotify

## Production

If you have Chrome installed, you can download the latest version of the extension from the [Chrome Web Store][ext].

## Local Development

Install extension dependencies with

```bash
npm install
```

Now [install web-ext][webext] and run

```bash
make run-chrome
make run-firefox
```

A browser window should open.
Navigate to <https://podcasters.spotify.com> and log in.

In a new browser tab, go to <https://openpodcast.dev> and you should see your Spotify keys at the top of the website.

[webext]: https://github.com/mozilla/web-ext

## Deployment

```bash
npm run build
```

This will create a bundled version of the extension (e.g. `web-extension/web-ext-artifacts/openpodcast_extension-1.1.zip`), which can be uploaded to the Chrome Web Store.

[ext]: https://chromewebstore.google.com/detail/openpodcast-extension/kdgmkjmggjefccigfbeidmaamhbfnkhh
