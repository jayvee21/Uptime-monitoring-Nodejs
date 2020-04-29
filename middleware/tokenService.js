/**
 * Library for Creating, verifying and decoding token
 */

const jwt = require('jsonwebtoken')
var fs = require('fs')
var path = require('path')
var conf = require('../lib/conf')
const privateKey = fs.readFileSync( path.join( __dirname, '/../lib/cert/private.key' ) )
const publicKey = fs.readFileSync( path.join( __dirname, '/../lib/cert/public.key' ) )

var tokenLib = {}

tokenLib.sign =  (payload, audience, callback) => {
        // Token signing options
        let signOptions = {
            issuer: conf.tokenService.issuer,
            subject: conf.tokenService.subject,
            audience : audience,
            expiresIn: "30d",
            algorithm: "RS256"
        }
        return jwt.sign(payload, privateKey, signOptions)
}

tokenLib.verify = ( token, audience, callback ) => {
    // Token signing options
    let verifyOption = {
        issuer: conf.tokenService.issuer,
        subject: conf.tokenService.subject,
        audience: audience,
        expiresIn: "30d",
        algorithm: ["RS256"]
    }

    try{
        let issued_token =  jwt.verify(token, publicKey, verifyOption)
        callback(false, issued_token)
    }catch(err) {
        callback(true)
    }
}

tokenLib.decode = (token) => {
    return jwt.decode(token, {complete: true});
    //returns null if token is invalid
}

module.exports = tokenLib