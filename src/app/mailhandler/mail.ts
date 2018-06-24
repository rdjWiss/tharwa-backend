var unzip=require("unzip")
var MailListener=require("mail-listener4")
import { logger } from "../../config/logger";
var fs= require('fs')
var Parser=require('xml2js-parser')


export class MailHandler{

      mail:string=""
     password :string=""
     server :string=""
     mailListener:MailListener
        constructor(mail:string,password:string,server:string){
            console.log("Lancement Mail Listener")
            this.mail=mail
            this.password=password
            this.server=server
            this.mailListener = new MailListener({
                username: mail,//"tharwa2cs@gmail.com",
                password: password,//"Tharwa2018",
                host: server,//"imap.gmail.com",
                port: 993, // imap port
                tls: true,
                connTimeout: 10000, 
                authTimeout: 5000, 
                debug: null, // Or your custom function with only one incoming argument. Default: null
                tlsOptions: { rejectUnauthorized: false },
                mailbox: "INBOX", // mailbox to monitor
                markSeen: true, // all fetched email willbe marked as seen and not fetched next time
                fetchUnreadOnStart: false, // use it only if you want to get all unread email on lib start. Default is `false`,
                mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
                attachments: true, // download attachments as they are encountered to the project directory
                attachmentOptions: { directory: "./VirementsExternes/" } // specify a download directory for attachments
              });
            
              this.mailListener.on("server:connected", function(){
                  logger.taglog("info","Mail Handler","preparatio de service de mail",["Mail"])
              });
               
              
             this.mailListener.on("server:disconnected", function(){
                logger.taglog("info","Mail Handler","arret de service de mail",["Mail"])
            });
               
              this.mailListener.on("error", function(err:any){
                console.log(err);
              });
        
              this.mailListener.on("mail", function(mail, seqno, attributes){
                // affichage des informations de mail
                console.log("emailParsed", mail.attachments);
                let attachment=mail.attachments[0];
               // console.log(attachment);
               // f(mail.attachments[0])
                // Telechargement de fichier attaché 
                //  var fichier = fs.createWriteStream("./attachements/"+attachment.fileName);
                  // Redirection de stream de la piece jointe vers le fichier 
                  //attachment.stream.pipe(fichier)
                  // fichier.on('end',()=>{
                      
                      
                      // fs.createReadStream('att	achements/'+.fileName)
                        // .pipe(unzip.Parse())
                        // .on('entry', function (entry) {
                          // var fileName = entry.path;
                          // var type = entry.type; // 'Directory' or 'File'
                          // var size = entry.size;
                          // if (fileName === "this IS the file I'm looking for") {
                            // entry.pipe(fs.createWriteStream('output/path'));
                          // } else {
                            // entry.autodrain();
                          // }
                        // });
                  // })
              });
              
               
               
                this.mailListener.on("attachment", function(attachment){
                   console.log("Attachement")
                   console.log(attachment.fileName)
                  var file = fs.createWriteStream("./attachements/"+attachment.fileName);
                     file.on('pipe',(file:File)=>{ 
                   console.log('Test download ')	
                   });
                   attachment.stream.on("end",()=>{
                     console.log("fin")
                     fs.createReadStream('attachements/'+attachment.fileName)
                     .pipe(unzip.Extract({ path: 'attachements/extracted' }));
              
                          fs.createReadStream('attachements/'+attachment.fileName)
                         .pipe(unzip.Parse())
                         .on('entry', function (entry:any) {
                           var fileName = entry.path;
                           var type = entry.type; // 'Directory' or 'File'
                     var size = entry.size;
                     console.log(entry)
                        console.log("Allo portto")
                               entry.pipe(fs.createWriteStream('output/path'));
                       console.log("Test Ouverture")
                         }); 
                   })
              
                   attachment.stream.pipe(file)
              
               });
            }
        
        lancer=()=>{
            this.mailListener.start(); // start listening
            logger.taglog("info","preparation de service de mail","Mail Service ",["Mail"])
        }

   

}



