import { CommissionSeed } from "./commission.seed";
import { LigneOrdreSeed } from "./ligneordre.seed";
import { OrdreVirementSeed } from "./ordrevirement.seed";
import { StatutVirementSeed } from "./statutvirement.seed";
import { CommissionVirement } from "../../../app/models/CommissionVirement";



CommissionVirement.sync({force:true,})
.then((creation:any)=>{
    console.log("Table compte crée avec succés ")
})
