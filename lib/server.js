/**
 * Server related
 */

// Dependencies
var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var conf = require('./conf')



// Define the api
var server = {}
server.httpServer = express()

server.httpServer.use(cors())

server.httpServer.use(bodyParser.urlencoded({ extended: false}))
// Parse the application JSON
server.httpServer.use(bodyParser.json())

// Index page
server.httpServer.get('/', function(req, res){
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ id: 'You are on index page'}))
})



/** Routers */

// Users
let userRouter = require('./../routers/users')
server.httpServer.use('/api/users', userRouter)

// Auth 
let authRouter = require('./../routers/auth')
server.httpServer.use('/api/auth', authRouter)

// Checks
let checkRouter = require('./../routers/checks')
server.httpServer.use('/api/checks', checkRouter)



// Initialize the server
server.init = function(){
    server.httpServer.listen(conf.port, function(){
        console.log(`Server is listening at port: ${conf.port}`)
    })
}

module.exports = server