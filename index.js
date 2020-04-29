/**
 * Primary file
 */

// Dependencies
var server = require('./lib/server')

// Declare the app

var app = {}


app.init = function(){
    // start the server
    server.init()
}


// Execute
app.init()


module.exports = app