const app = require('./app');
const { torrentFilterMiddleware } = require('./middleware/torrent/torrentFilterMiddleware')

const PORT = process.env.PORT || 8002
const HOST = process.env.HOST || 'localhost'

// necessary initializations
app.addRoutes()
app.catch404()
app.catchErrors()

// blacklist torrents
app.use(torrentFilterMiddleware)

const server = app.listen(PORT, HOST, function() {
  const { address, port } = HOST === 'localhost' 
    ? { address: 'localhost', port: PORT } 
    : server.address()
	console.log('Seedess server listening at http://' + address + ':' + port);
});