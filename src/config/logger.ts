var winston = require('winston');
 
//
// Requiring `winston-logstash` will expose
// `winston.transports.Logstash`
//
require('winston-logstash');

winston.add(winston.transports.Logstash, {
  port: 12345,
  node_name: 'Logging Backend',
  host: '127.0.0.1'
});

export const logger=winston;
