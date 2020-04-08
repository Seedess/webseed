# Seedess Webseed Server

Open Source P2P Video Streaming BitTorrent Server used by [Seedess.com](https://seedess.com)

## Read First!

Seedess Webseed Server uses BitTorrent technology in a novel way. It creates a secure private P2P network authenticated by 3rd party apps to secure users. It limits video streaming to content available to that within the "domain" or CDNs of the private P2P network. This secures the network from sharing of content not authorized by that domain.

Seedess is an aim to  change the way BitTorrent is viewed - as a secure and efficient P2P video streaming technology. 

## WebSeed

Webseed allows a BitTorrent network to serve files from a server.

## Private BitTorrent Networks

A Private BitTorrent Network allows companies to leverage the BitTorrent technology in a secure, private closed network to distribute video to their viewers.

## Intoduction

Seedess WebSeed Server streams videos into your private BitTtorrent network. 

Traditional BitTorrent is only as effective as the number of "seeds" (peers sharing files) into the network thus not feasible for corporate video streamin networks. 

Seedess creates a network where video files are always available and streamed from the fastest source. That source is usually another viewer (peer) or a CDN (cloudflare, amazon, google cloud etc.) or a cached copy on your server.

This effectively creates an efficient and secure video streaming network topology while reducing your video streaming bandwidth by up to 70%. 

## Reducing video streaming bandwidth by 70%

The major portion of the video streaming is done over P2P while the initial connections are made to your video streaming server or CDN to seed the network with the video stream. 

Imagine there are 1000 simultaneous viewers of your 4K video. Traditionally you would have 1000 streams to your video streaming server. This would be very inefficient and costly. By using BitTorrent for 70% of the videos, you would only be streaming to 300 viewers. These viewers then stream to the other 700 viewers over BitTorrent. This is efficient and cost effective in comparison.

In most cases, a users upload speed is higher than their download speed. This is because the upload link is hardly utilized. Given this a user can utilize this higher speed link to stream more video data then they receive. 

Even the most widely distributed CDN cannot be as efficient as a P2P network. If you are on the same wifi connection as another peer you can use up to the limit of the wifi network speed! This is because your connection is over the local network instead of the broad internet. P2P ensures you get the fastest route to the video stream.

## Security and Authentication

BitTorrent itself is a very secure technology integrity wise. Videos stream integrity is created by a secure encryption that matches each piece of data with a signature (cryptographic hash). The video piece is only shown to the viewer if it is deemed authentic. 

The P2P network created by Seedess requires valid SSL certificates for the domains where videos are served. All communication with these domains is done via secure SSL. 

In order to make the network private see the section on "Private Server Authentication". 

## Install

Node.js is required on the server

```
git clone git@github.com:Seedess/webseed.git
cd webseed
```

## Start

Start with default options

```
npm start
```

## Production

Start with setting host (public interface) and port (http port)

```
sudo HOST=0.0.0.0 PORT=80 npm start
```

Or alternatively use the default settings and create a reverse proxy to serve to the internet. eg: [Nginx reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

# API

## API Variables

Input variables 

* `{infoHash}` - The hash of the torrent. Found in the magnet and can also be found by querying your server.
* `{fileName}` - The name of a specific file. Found by the directory listing for a torrent.
* `{url}` - The full absolute URL to a video file

Response variables

* `{torrentFile}` - The `.torrent` file containing information on downloading a torrent and the piece index. 
* `{videoStream}` - HTTP video stream supporting range requests

Input and Response variables

* `{magnet}` - The magnet URL for a torrent. It contains information on downloading this torrent (without piece index).

## API Routes

### Torrent (.torrent)

The `.torrent` file from `{infoHash}`

* GET - `http://localhost:8002/torrent/{infoHash}.torrent`
* Returns `{torrentFile}`

The `.torrent` file from `{url}`. Note the `domain` must be one approved by configuration `./config/allowedDomains.json`

* GET - `http://localhost:8002/torrent/url/{url}`
* Returns `{torrentFile}`

### Directory

Directory listing of files in a torrent

* GET - `http://localhost:8002/file/{infoHash}`
* Returns HTML `{fileList}`

Directory listing of files in a torrent (JSON)

* GET - `http://localhost:8002/file/{infoHash}?json=1`
* Returns JSON `{fileList}`

### File

Stream a video file

* GET - `http://localhost:8002/file/{infoHash}/{fileName}`
* Returns `{videoStream}`

## Private Server Authentication

You can create a custom private server in your own app by using `app.js`. 

Seedess exposes the express app in `app.js` which is used to start the server. You can hook into the app using [express middleware](https://expressjs.com/en/guide/using-middleware.html). 

* Seedess authentication hook is for hooking into your 3rd party authentication. Not the other way around.
* Seedess then uses your existing authentication to privatize the video stream and P2P network to authenticated users.

This example checks the `token` http header or GET query. Searches the database for the user session with that token. 

Your implementation may vary.

> In this example we assume you cloned the git repository to a folder `webseed`.

```
const app = require('./webseed/app');

const NODE_ENV = process.env.NODE_ENVIRONMENT
const PORT = process.env.PORT || 8002
const HOST = process.env.HOST || 'localhost'

// sample the authentication hook
app.use(async function authentication(req, res, next) {
  const token = req.header.token || req.query.token
  // change to your authentication mechanism
  const user = await Session.findOne({ where: { token }})
  if (user) next()
  else next(new Error('Not authorized'))
})

// necessary initializations
app.addRoutes()
app.catch404()
app.catchErrors()

// start the server
app.listen(PORT, HOST, function() {
	console.log('Seedess server listening at http://' + HOST + ':' + PORT);
});
```

### JWT based authentication

In your external app you need to create a signed token for each user.

```
const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET || 'iloveyouniverse'
const hourSecs = 60 * 60

const data = { userId: 'foo', userName: 'bar' }
const token = jwt.sign(data, SECRET, { expiresIn: hourSecs })
```

When querying Seedess WebSeed Server send your token in the `token` HTTP header or GET query. 

Eg: `http://localhost:8002/?token=foo`

Hook into the authentication process: 

```
const jwt = require("jsonwebtoken");
const app = require('./webseed/app');

const NODE_ENV = process.env.NODE_ENVIRONMENT
const PORT = process.env.PORT || 8002
const HOST = process.env.HOST || 'localhost'

const SECRET = process.env.SECRET || 'iloveyouniverse'
const hourSecs = 60 * 60

// sample JWT authentication hook
app.use(function authentication(req, res, next) {
  const token = req.header.token || req.query.token
  const data = jwt.verify(token, SECRET)
  if (!data.userId) {
    next(new Error('Not authorized'))
  } else {
    req.session = data
    next()
  }
})

// necessary initializations
app.addRoutes()
app.catch404()
app.catchErrors()

// start the server
app.listen(PORT, HOST, function() {
	console.log('Seedess server listening at http://' + HOST + ':' + PORT);
});
```