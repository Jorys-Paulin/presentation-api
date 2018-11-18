# Presentation API

These pages are experiments with the `Presentation API`

## About

### The remote

The remote is the page that controls the screen. It creates one or connects to an already-existing one, can send messages to it, close its connection or terminate it.

### The screen

The screen is the page that is controlled by the remote. It receives messages from the remote and can send back messages to it.

## Running

### Requirements

- A supported browser: Chrome works best, for Firefox enable `dom.presentation.controller.enabled` in [about:config](about:config)
- A web server with HTTPS, as required by the browser (localhost excluded)
- A second monitor or any wireless display, like a Chromecast

### Architecture

- `index.html`: Links to the two next pages
- `remote.html`: Exposes the remote control interface
- `screen.html`: Exposes the screen control interface

Each page has its own `.css` and `.js` file. Framework used is [Bootstrap](http://getbootstrap.com/)
