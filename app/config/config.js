// Returns correct configuration depending on environment
module.exports = require('./environments/' + process.env.NODE_ENV + '.js');