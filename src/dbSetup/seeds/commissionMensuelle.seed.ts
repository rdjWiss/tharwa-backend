import { CommissionMensuelle } from "../../app/models/CommissionMensuelle";

CommissionMensuelle.sync({force:true,})
.then((creation:any)=>{
    console.log("Table Commission mensuelle crée avec succés ")
})