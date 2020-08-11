const mongoose = require("mongoose")
const dotenv = require('dotenv')
const Schema = mongoose.Schema

// create new schema
let URLSchema = new Schema({
  "long_URL":{type: String, required: true},
  "short_URL":{type: String, required: true}
})

// create model from the schema
const URL = mongoose.model("URL", URLSchema)
module.exports = URL
