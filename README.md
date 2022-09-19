# web-extension to retrieve login data from Spotify and Apple

## Testing

Install extension dependencies with 

```
yarn install
```

Now [install web-ext][webext] and run

```
web-ext run --source-dir ./src/
```

A browser window should open.
Navigate to <https://podcasters.spotify.com> and log in.

In a new browser tab, go to <https://openpodcast.dev> and you should see your Spotify keys at the top of the website.

[webext]: https://github.com/mozilla/web-ext
