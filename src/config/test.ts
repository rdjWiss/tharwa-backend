var crypto = require('crypto')

let password= crypto.createHash('md5').update('Test').digest('hex')
console.log(password)