import { sequelize } from "../../../config/db";

//Trigger à l'ajout d'un virement ou sa validation/rejet
//Pour calculer la commission et executer la transaction
sequelize.query(`
create or replace TRIGGER VirementValide AFTER
INSERT OR
UPDATE OF "statut_virement" ON "Virements" FOR EACH row 
DECLARE 
type_commission NUMBER;
montantCommission NUMBER(38,2);
montantVirement NUMBER(38,2);
soldeEmetteur NUMBER(38,2);
typeCompteEmetteur NUMBER(10);
soldeRecepteur NUMBER(38,2);
typeCompteRecepteur NUMBER(10);
monnaieDevise varchar2(3);
retourConversion json;

STATUT_VIR_VALIDE CONSTANT NUMBER := 2;
STATUT_VIR_REJETE CONSTANT NUMBER := 3;
BEGIN
  IF inserting THEN
    montantVirement := :new."montant";
      TRAITEMENTVIR(:new."code_virement",:new."emmetteur",:new."recepteur",
        :new."montant",:new."statut_virement", :new."date_virement");
    
  ELSIF updating THEN
  dbms_output.put_line('UPDATING');
    IF :new."statut_virement"=STATUT_VIR_VALIDE THEN
    --Si validé, retirer le montant du recepteur
      SELECT "balance" INTO soldeRecepteur FROM "Comptes" WHERE "num_compte"=:new."recepteur" FOR UPDATE OF "balance" ;
      dbms_output.put_line('Recpteur old: ' || soldeRecepteur);
      
      soldeRecepteur := soldeRecepteur + :new."montant";
      dbms_output.put_line('Recpteur new: ' || soldeRecepteur);
      UPDATE "Comptes" SET "balance" = soldeRecepteur WHERE "num_compte"=:new."recepteur";
      
    ELSIF :new."statut_virement"=STATUT_VIR_REJETE THEN
    --Si rejeté, restituer le montant à l'emetteur, pas la commission
      dbms_output.put_line('REJET virement');
      SELECT "balance" INTO soldeEmetteur FROM "Comptes" WHERE "num_compte"=:new."emmetteur" FOR UPDATE OF "balance" ;
      dbms_output.put_line('Emetteur old: ' || soldeEmetteur);
      
      soldeEmetteur := soldeEmetteur + :new."montant";
      dbms_output.put_line('Emetteur new: ' || soldeEmetteur);
      UPDATE "Comptes" SET "balance" = soldeEmetteur WHERE "num_compte"=:new."emmetteur";
      
    END IF;
    
  END IF;
END;`
)