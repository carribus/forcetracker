var restify = require('restify')

server = restify.createServer({
    name: 'Force Tracker Server'
});

server.get('/song/list', getSongList);
server.listen(8000);

function getSongList(req, res, next) {
    res.send({
        songs: [
            {
                id: 1,
                name: 'Test Song',
                samples: []
            }
        ]
    });
    return next();
}