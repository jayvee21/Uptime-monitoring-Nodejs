/**
 * Helper for various tasks
 */

// Dependencies
var crypto = require('crypto')
var conf = require('./conf')
var tokenService = require('./../middleware/tokenService')

// Container for the module to be export
var helpers = {}


// Create a SHA256 hash
helpers.hash = function( str ){
    if( typeof(str) == 'string' && str.length > 0 ){
        var hash = crypto.createHmac('SHA256', conf.secretKey).update(str).digest('hex')
        return hash
    }
}

// Parse JSON string to object
helpers.parseJsonToObject = function(str){
    try {
        var obj = JSON.parse(str)
        return obj
    } catch (e) {
        return {}
    }
}

/**
 * Guard the data from accessing others
 * required: token, phone
 */
helpers.guardDataAccess = function( token, phone, callback ){
    // Decode the token, to check if the phone in token and in requesting phone is the same
    var tokenObj = tokenService.decode( token )
    tokenObj = typeof(tokenObj) == 'object' ? tokenObj : false
    if( tokenObj ){
        callback(tokenObj)
    }else{
        callback(false)
    }
}

/**
 * Decode the token return token payload
 */
helpers.tokenDecode = function( headers, callback ) {
    // take the token from the headers
    var token = typeof( headers.jwt_token ) != 'undefined' 
                && headers.jwt_token.trim().length > 0
                ? headers.jwt_token.trim() : false
    if( token ){
        var tokenObj = tokenService.decode( token )
        tokenObj = typeof(tokenObj) == 'object' ? tokenObj : false
        if(tokenObj){
            callback( false, tokenObj.payload )
        }else{
            callback('Invalid token')
        }
        
    }else{
        callback( "Could not get the token from the headers, or token data is invalid" )
    }
}

/**
 * Generate random string
 */
helpers.createRandomString = function(strLen){
    strLen = typeof( strLen ) == 'number' && strLen > 0 ? strLen : false
    if( strLen ){
        // Define the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        // start the final string
        let str = ''
        for( var i = 1; i <= strLen; i++  ){
            var randomChar = possibleCharacters.charAt( Math.floor( Math.random() * possibleCharacters.length ) )
            // Append the character to the final string
            str += randomChar
        }
        // Return the final strig
        return str
        
    }else{
        return false;
    }
}

/**
 * Handle server responses for the API
 */
helpers.handleServerResponse = function( response, statusCode, payload ){
    statusCode = typeof(statusCode) == 'number' ? statusCode : 200
    payload = typeof(payload) == 'object' ? payload : {}
    var payloadString = JSON.stringify( payload )
    // Return the response
    response.setHeader('Content-type','application/json')
    response.writeHead(statusCode)
    response.end(payloadString)
}


// Export the module
module.exports = helpers