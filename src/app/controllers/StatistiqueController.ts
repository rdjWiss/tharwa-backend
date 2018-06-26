import { Virement, Sequelize } from "../models/Virement";
import { Response,Request} from "express"
import { Z_DATA_ERROR } from "zlib";
export class StatistiqueController{


        getTotalVirementMois=(req:Request,res:Response)=>{
            console.log('getTotalVirementMois')
               let  annee=req.params.a
               let  mois = parseInt(req.params.m) -1
                
                if(!annee || !mois) {
                    res.send(400)
                    return 
                }

                let debut=new Date(annee,mois,1,0)
                let fin = new Date(annee,mois+1,1,0)

                console.log(debut)
                console.log(fin)
               this.getVirementsinDate(debut,fin,(resultat)=>{
                   res.send({
                       count: resultat
                    })
               })
        }

        getTotalVirementSemestre(req:Request,res:Response){
            console.log('getTotalVirementSemestre')
            let annee=req.params.a
            let semestre=parseInt(req.params.s)

            if(!annee || !semestre  ) {
                res.send(400)
                return 
            }
            let debut=new Date(annee,semestre*3,1);
            let fin =new Date(annee,(semestre+1)*3,1);
            this.getVirementsinDate(debut,fin,(virements)=>{
                    res.send({
                        count: virements.length
                     })
            })
        
        }

        getTotalVirementAnnee=(req:Request,res:Response)=>{
            console.log('getTotalVirementAnnee')
                let annee=parseInt(req.params.a)
                if(!annee) {
                    res.send(401)
                }
                let debut=new Date(annee,1,1)
                let fin = new Date(annee+1,1,1) 
                this.getVirementsinDate(debut,fin,(resultat:any)=>{
                        res.send({
                            count: resultat
                         })

                })

        }
        


        private getVirementsinDate=(debut:Date,fin:Date,callback)=>{
            let where ={
                where:{
                    date_virement: {
                   $between: [debut,fin]
                   }
                }
            }
           
                Virement.findAll(where)
                    .then(  (result:any)=>{
                            callback(result.length)
                        })
        }
}