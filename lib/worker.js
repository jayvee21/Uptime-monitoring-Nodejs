/**
 * Worker related files
 */

// Dependencies
var _data = require('./data')
var url = require('url')
var http = require('http')
var https = require('https')
// Instantiate the workers object
var workers = {}

// Look up all the checks, Get their data and send to Validator
workers.gatherAllChecks = function(){
    // Get all checks
    _data.list( 'checks', function(err, checks){
        if(!err && checks && checks.length > 0){
           
            checks.forEach( check => {
                // Read in the check data
                _data.read('checks', check, function(err, originalCheckData){
                    if(!err && originalCheckData){
                        // Pass it to the checks validator, and let that function continue of log as needed
                        workers.validateCheckData(originalCheckData)
                    }else{
                        console.log('Error reading one of the check\'s data')
                    }
                })
            })
        }
    })
}

// Sanity checking the check data
workers.validateCheckData = function(originalCheckData){
    originalCheckData  = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {}
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length > 0 ? originalCheckData.id.trim() : false
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length > 0 ? originalCheckData.userPhone.trim() : false
    originalCheckData.protocol = typeof(originalCheckData.protocol) != 'undefined' 
                                && ['http', 'https'].indexOf( originalCheckData.protocol.trim().toLowerCase() ) > -1
                                ? originalCheckData.protocol.trim().toLowerCase() : false
    originalCheckData.url = typeof(originalCheckData.url) != 'undefined' 
                            && originalCheckData.url.trim().length > 0
                            ? originalCheckData.url.trim().toLowerCase() : false
    originalCheckData.method = typeof(originalCheckData.method) != 'undefined' 
                            && ['post', 'get', 'put', 'delete'].indexOf( originalCheckData.method.trim().toLowerCase() ) > -1
                            ? originalCheckData.method.trim().toLowerCase() : false
    originalCheckData.successCodes = typeof(originalCheckData.successCodes ) != 'undefined'
                                    && typeof(originalCheckData.successCodes ) == 'object' 
                                    && originalCheckData.successCodes instanceof Array
                                    ? originalCheckData.successCodes : false 

    originalCheckData.timeoutSeconds = typeof( originalCheckData.timeoutSeconds ) != 'undefined' 
                                    && typeof( originalCheckData.timeoutSeconds ) == 'number'
                                    && originalCheckData.timeoutSeconds % 1 === 0
                                    && originalCheckData.timeoutSeconds >= 1
                                    && originalCheckData.timeoutSeconds <= 5
                                    ? originalCheckData.timeoutSeconds : false
    if( originalCheckData.id 
        && originalCheckData.userPhone
        && originalCheckData.protocol
        && originalCheckData.url
        && originalCheckData.method
        && originalCheckData.successCodes
        && originalCheckData.timeoutSeconds ){
            workers.performCheck( originalCheckData )
    }else{
        console.log("Error: One of the checks if not properly formatted")
    }
}

// Perform the check, send the original check data and the outcome of the process, to the next step
workers.performCheck = function( originalCheckData ){
    // Prepare the initial outcome
    var checkOutcome = {
        'error': false,
        'responseCode': false
    }

    // Mark the outcome has not sent yet
    var outcomeSent = false

    // Parse the the hostname and the path of the original check data
    var parsedUrl = url.parse( originalCheckData.protocol + '://' + originalCheckData.url, true )
    var hostName = parsedUrl.hostname
    var path = parsedUrl.path // Using the path and not the pathname because we want the querystring

    // Constructing the request object
    var requestDetail = {
        'protocol' : originalCheckData.protocol + ":",
        'hostname' : hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timout': originalCheckData.timeoutSeconds
    }
    // Instantiate the request object (using either http or https)
    var _moduleToUse = originalCheckData.protocol == 'http' ? http : https
    
    var req = _moduleToUse.request( requestDetail, function(res){
        var status = res.statusCode
        // Update the checkoutcome and pass the data along
        checkOutcome.responseCode = status
        
        if( !outcomeSent ){
            workers.processCheckOutcome(originalCheckData, checkOutcome)
        }
    })

    // Bind to the error event so it doesn't get thrown
    req.on('error', function(e){
        checkOutcome.error = {
            'error': true,
            'value': e
        }
        if( !outcomeSent ){
            workers.processCheckOutcome(originalCheckData, checkOutcome)
        }
    })
    // timeout  - Bind to the error event so it doesn't get thrown
    req.on('timeout', function(e){
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        }
        if( !outcomeSent ){
            workers.processCheckOutcome(originalCheckData, checkOutcome)
        }
    })

    // End the request
    req.end()
}


/**
 * Process the checkoutcome and update the checkdate and trigger an alert to the user if needed
 * Special accomodating a check that has never been check before ( don't alert on that one)
 */
workers.processCheckOutcome = function(originalCheckData, checkOutcome) {
    // Decide if the check is considered up or down
    var state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf( checkOutcome.responseCode ) > -1 ? 'up' : 'down'

    // Decided if an alert is warranted
    var alertWarranted = originalCheckData.lastChecked && originalCheckData.state != state ? true : false

    // Log the outcome
    var timeOfCheck = Date.now()


    // Update the checkdata
    var newCheckData = originalCheckData
    newCheckData.state = state
    newCheckData.lastChecked = timeOfCheck

    // Save the updates
    _data.update('checks', newCheckData.id, newCheckData, function(err){
        if(!err) {

            if( alertWarranted ){
                workers.alertUserToStatusChange(newCheckData)
            }else{
                // No alert needed
                // Console.log("Check ouotcome has not change,no alert needed")
            }

        }
    })
}

// Alert the user as to a changes in their check status
workers.alertUserToStatusChange = function(newCheckData){
    var msg = 'Alert: Your check for ' + newCheckData.method.toUpperCase() + ' ' + newCheckData.protocol + '://' + newCheckData.url + ' is currently ' + newCheckData.state 
    /**
     * Alert the user thru SMS or Email 
     */
    console.log(msg)
}

// Timer execute the worker process once per minute
workers.loop = function(){
    setInterval( function(){
        workers.gatherAllChecks()
    }, 1000 * 60)
}


// Init script
workers.init = function(){
    // Execute the checks immediately
    workers.gatherAllChecks()
    // Call the loops so the checks will execute later on
    workers.loop()
}



// Export the module
module.exports = workers