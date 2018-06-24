const path=require("path")
const decompress = require("decompress")
const testCompress=require("decompress-zip")
const MailListener=require("mail-listener4")
import { logger } from "../../config/logger";
import { DESTINATION_DIR, TRAITES_DIR } from "../../config/mail";
import { VirementExtController } from "../controllers/VirementExtController";
import { Compte } from "../models/Compte";
var fs= require('fs')
var Parser=require('xml2js')


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
                attachmentOptions: { directory: DESTINATION_DIR } // specify a download directory for attachments
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
            
                new VirementExtController().traiterVirement(`<?xml version="1.0" encoding="utf-8"?>
                <virement>
                <numero>THW000002DZDTHW000002DZD20180204105300</numero>
                <date>20180204105300</date>
                <titulaire>
                <nom>Mostefai Mohammed Amine</nom>
                <banque>THW</banque>
                <compte>THW000002DZD</compte>
                </titulaire>
                <destinataire>
                <nom>Batata Sofiane</nom>
                <banque>THW</banque>
                <compte>THW000003DZD</compte>
                </destinataire>
                <montant>300000</montant>
                <motif>Pret pour projet immobilier</motif>
                </virement>`)

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
              
               
               
                this.mailListener.on("attachment", function(attachment:any){
                   console.log("Attachement")
                   console.log(attachment.fileName)
                  var file = fs.createWriteStream(DESTINATION_DIR+attachment.fileName);
                   file.on('pipe',(file:File)=>{ 
                   console.log('Test download ')	
                     });
                   attachment.stream.on("end",()=>{
                     console.log("fin")
                    /**
                     * Troisieme methode de decompression mais rien ne marche 
                     */
                     /*
                      var unzipper=new testCompress(DESTINATION_DIR+attachment.fileName)
                     unzipper.on("error",(err)=>{
                       console.log("aalo")
                       console.log(err)
                     }) 
                     unzipper.on("extract",(err)=>{
                        console.log("Test success")
                     })
                     unzipper.extract({
                      path: TRAITES_DIR+attachment.fileName
                  }); */
                     /***
                      *   2eme methode a essayer pour dezipper mais rien ne marche ++++
                      *   si tu essaie ici et rien ne marche incremente le compteur 
                      */
                     /* decompress(DESTINATION_DIR+attachment.fileName, 
                                TRAITES_DIR+attachment.fileName,
                                ).then( files => {
                        console.log('Fihcier decompresse avec succes !');
                    }); */
                        
                     /*       fs.createReadStream(DESTINATION_DIR+attachment.fileName)
                        .pipe(unzip.Extract({
                            path:TRAITES_DIR
                        })) */
/*                         .pipe(unzip.Parse())
                          .on('entry', function (entry:any) {
                           var fileName = entry.path;
                           var type = entry.type; // 'Directory' or 'File'
                     var size = entry.size;
                     console.log(entry)
                        console.log("Allo portto")
                               entry.pipe(fs.createWriteStream(TRAITES_DIR+entry.path));
                       console.log("Test Ouverture")
                         });  */
                   })
              
                   attachment.stream.pipe(file)
              
               });
            }
        
        lancer=()=>{
            this.mailListener.start(); // start listening
            logger.taglog("info","preparation de service de mail","Mail Service ",["Mail"])
        }

   
        stringToDate=(_date,_format,_delimiter)=>
          {
            var formatLowerCase=_format.toLowerCase();
            var formatItems=formatLowerCase.split(_delimiter);
            var dateItems=_date.split(_delimiter);
            var monthIndex=formatItems.indexOf("mm");
            var dayIndex=formatItems.indexOf("dd");
            var yearIndex=formatItems.indexOf("yyyy");
            var month=parseInt(dateItems[monthIndex]);
            month-=1;
            var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
            return formatedDate;
          }
}




