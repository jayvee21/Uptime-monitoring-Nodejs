/**
 * Router that will handle all checks related request
 */
let express = require('express')
let router = express.Router()
var helpers = require('./../lib/helpers')
var checksHandler = require('./../lib/checksHandler')
var tokenVerifier = require('./../middleware/tokenVerifier')


/**
 * Creating a new checks
 */
router.post('/', tokenVerifier.checkToken, function( req, res ){
    checksHandler.create( req, function( statusCode, payload ){
        helpers.handleServerResponse(res, statusCode, payload)
    })
})

/**
 * List all user checks
 */
router.get('/', tokenVerifier.checkToken, function( req, res ){
    checksHandler.list( req, function( statusCode, payload ){
        helpers.handleServerResponse( res, statusCode, payload)
    })
})

/**
 * View checks record
 */
router.get('/:checkId', tokenVerifier.checkToken, function(req, res){
    checksHandler.get( req, function( statusCode, payload){
        helpers.handleServerResponse(res, statusCode, payload)
    })
})


/**
 * Update a check
 */
router.put('/:checkId', tokenVerifier.checkToken, function( req, res ){
    checksHandler.update( req, function (statusCode, payload){
        helpers.handleServerResponse( res, statusCode, payload )
    })
})

/**
 * Delete a check
 */
router.delete('/:checkId', tokenVerifier.checkToken, function( req, res ){
    checksHandler.delete( req, function(statusCode, payload){
        helpers.handleServerResponse( res, statusCode, payload )
    })
})


// Export the Router module
module.exports = router