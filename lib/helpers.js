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


// Export the module
module.exports = helpers