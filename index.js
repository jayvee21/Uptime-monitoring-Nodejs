/**
 * Primary file
 */

// Dependencies
var server = require('./lib/server')
var worker = require('./lib/worker')
// Declare the app

var app = {}


app.init = function(){
    // start the server
    server.init()
    // start the background worker
    worker.init()
}


// Execute
app.init()


module.exports = app