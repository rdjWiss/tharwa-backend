var winston = require('winston');

//
// Requiring `winston-logstash` will expose
// `winston.transports.Logstash`
//
require('winston-logstash');
require('winston-daily-rotate-file')
var transport = new (winston.transports.DailyRotateFile)({
    filename: 'fichier-log-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    dirname:'./Log',
    level:'info',
    levelOnly:'true',
    name:'file#info'
  });
var erreorTransport= new (winston.transports.DailyRotateFile)({
    filename: 'silly-log-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    dirname:'./Dev',
    name:'file#dev',
    level:'silly'
})



// @TODO 
// Enlever le transport de winston vers  Logstash 
/* winston.add(winston.transports.Logstash, {
  port: 12345,
  node_name: 'Logging Backend',
  host: '127.0.0.1'
}); */

// Remplacer avec rotate file log 
/* var winston = new (winston.Logger)({
    transports: [
      transport
    ]
  }); */
winston.add(winston.transports.DailyRotateFile,transport)
winston.add(winston.transports.DailyRotateFile,erreorTransport)
winston.remove(winston.transports.Console)
winston.taglog=function(level:String,titre:String,message:any,tags:String){
    // console.log("Test Yemchi")
    winston.log(level,{
        title:titre,
        message:message,
        tags:tags
    })
            
}
// Log des Requetes Morgan 
winston.requete=function(message:any,tags:String[]){
       
            winston.info({
                message:message,
                tags:tags
            })
}

winston.stream = {
    write: function(message:any, encoding:any){
        logger.requete(message,"Requetes");
    }
};
export const logger=winston;
