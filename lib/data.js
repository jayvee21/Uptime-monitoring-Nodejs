/**
 * Library for storing and editing data
 */

// Dependencies
var fs = require('fs')
var path = require('path')
var helpers = require('./helpers')

// Container for the module (to be exported)
var lib = {}

// Base dir of the data folder
lib.baseDir = path.join( __dirname, '/../.data/' )

// Write data to a file
lib.create = function( dir, filename, data, callback ){
    // Open the file for writing
    fs.open( lib.baseDir + dir + '/' + filename + '.json', 'wx', function(err, fileDescriptor){
        if(!err && fileDescriptor){

            // Convert the data into string
            var stringData = JSON.stringify(data)
            // Write data to a file
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false)
                        }else{
                            callback( "Error closing the new file" )
                        }
                    })
                    
                }else{
                    callback('Error writing to a new file')
                }
            })
        }else{
            callback(' Error on opening the file for writing')
        }
    })
}


// Read data from a file
lib.read = function( dir, filename, callback ){
    fs.readFile(lib.baseDir + dir + '/' + filename + '.json', function(err, data){
        if(!err && data){
            var parseData =  helpers.parseJsonToObject(data)
            callback(false, parseData)
        }else{
            callback(err, 'Could not read the file. File may not be exist.')
        }
    })
}

// Update the data on the file
lib.update = function( dir, filename, data, callback){
    // Open the file for writing

    fs.open(lib.baseDir + dir + '/' + filename + '.json', 'r+', function(err, fileDescriptor){
        if(!err && fileDescriptor){
            var stringData = JSON.stringify(data)

            fs.ftruncate( fileDescriptor, function(err){
                if(!err){
                    fs.writeFile( fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false)
                                }else{
                                    callback('Error on closing the file after updating')
                                }
                            })
                        }else{
                            callback('Error on writing the updated data')
                        }
                    })
                }else{
                    callback('Error on trucating the file')
                }
            })

        }else{
            callback('Error on opening the file.')
        }
    })
}



// Deleting a file
lib.delete = function( dir, filename, callback ){
    fs.unlink(lib.baseDir + dir + '/' +filename + '.json', function(err){
        if(!err){
            callback(false)
        }else{
            callback(err)
        }
    })
}

// listsall the items from the directory
lib.list = function(dir, callback){
    fs.readdir(lib.baseDir + dir + '/', function(err, data){
        if(!err && data && data.length > 0){
            var trimmedFilenames = []

            data.forEach( filename => {
                trimmedFilenames.push( filename.replace('.json', ''))
            });

            callback(false, trimmedFilenames)
        }else{
            callback(err, data)
        }
    })
}

// Export the module
module.exports = lib