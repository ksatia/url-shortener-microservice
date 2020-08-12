const URLModel = require("../models/urlschema")
const dns = require('dns')
const crypto = require('crypto')

let queryHandler = {}

// we ask for an "options"" object for optional parameters - they can just pass "longURL" OR "shortURL" with a value
queryHandler.lookupURL = function (options, callback) {
  if (options.longURL === undefined) {
    URLModel.find({ short_URL: redirectURL }, (err, document) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, document)
      }
    })
  } else if (options.shortURL === undefined) {
    URLModel.find({ long_URL: options.longURL }, (err, document) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, document)
      }
    })
  }
}

queryHandler.lookupAndWrite = function (urlToWrite, callback) {
  dns.lookup(urlToWrite.host, (err, address, family) => {
    if (err) {
      console.error(err)
      res.json({ "error": "invalid URL" })
    }
    else {
      // hash using the URI with the protocol stripped from it
      const hash = crypto.createHash('sha1').update(urlToWrite.hostname, 'utf-8').digest('hex')
      const userUrlObj = new URLModel({
        // use origin property to include protocol
        "long_URL": urlToWrite.origin,
        "short_URL": hash.slice(0, 5)
      })
      // save using .create method on model itself (vs using .save on the instance)
      URLModel.create(userUrlObj, (err, document) => {
        if (err) callback(err, null)
        else {
          let response = {"long_URL": document.long_URL, "short_URL":hash.slice(0,5)}
          callback(null, response)
        }
      })
    }
  })
}

module.exports = queryHandler