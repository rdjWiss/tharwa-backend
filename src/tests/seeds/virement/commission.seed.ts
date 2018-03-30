import { Commission } from '../../../app/models/Commission';

const Mocks=[
        {
            id_commission:1,
            lib_commisison:'Courant vers Epargne',
            montant_commission:0,
            type_commission:1,

        },
        {
            id_commission:2,
            lib_commisison:'Epargne vers Courant',
            montant_commission:0.1,
            type_commission:2,
            
        },
        {
            id_commission:3,
            lib_commisison:'Courant vers Devise',
            montant_commission:2,
            type_commission:2,
            
        },
        {
            id_commission:4,
            lib_commisison:'Devise ver Courant',
            montant_commission:1.5,
            type_commission:2,
            
        },
        {
            id_commission:5,
            lib_commisison:'Vers Client Tharwa',
            montant_commission:1,
            type_commission:2,
            
        },
        {
            id_commission:6,
            lib_commisison:'Vers Client Externe',
            montant_commission:2,
            type_commission:2,
            
        },
        {
            id_commission:7,
            lib_commisison:'Depuis Client Externe',
            montant_commission:0.5,
            type_commission:2,
            
        },
        {
            id_commission:8,
            lib_commisison:'Commission Mensuelle Compte Courant',
            montant_commission:100,
            type_commission:1,
            
        },
        {
            id_commission:9,
            lib_commisison:'Commission Mensuelle Compte Epargne',
            montant_commission:50,
            type_commission:1,
            
        },
        {
            id_commission:10,
            lib_commisison:'Commission Mensuelle Compte Devise',
            montant_commission:200,
            type_commission:1,
            
        }
]

export class CommissionSeed{

    public static seed(){
         Commission.sync({force:true})
          .then(()=>{
              console.log("Creation de la table commission ");
               Mocks.forEach(element => {
                    Commission.create(element)
                              .then((res:any)=>{
                                  console.log("Creation de la commision :",element.lib_commisison)
                              })
              }); 
          })

    }
}