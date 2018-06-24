import { DemandeDeblocage } from "../../app/models/DemandeDeblocage";

DemandeDeblocage.sync({force:true,})
.then((creation:any)=>{
    console.log("Table DemandeDeblocage crée avec succés ")
}).catch(function(err:any){
  // console.log(err)
})