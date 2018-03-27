/*var crypto = require('crypto')

let password= crypto.createHash('md5').update('Test').digest('hex')
console.log(password)*/
var result:string = "811112"
var numSeq = Number(result) +1
console.log(numSeq)
var numSeqS = numSeq +"";
while (numSeqS.length < result.length) numSeqS = "0" + numSeqS;
console.log(numSeqS)