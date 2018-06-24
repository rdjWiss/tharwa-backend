import { sequelize } from "../../../config/db";

//Verser commission dans le compte de THARWA 
sequelize.query(`
create or replace TRIGGER VERSERCOMMISSION AFTER
  INSERT ON "CommissionVirements" 
  FOR EACH row 
  DECLARE 
    solde NUMBER(38,2);
  BEGIN
    SELECT "balance"
    INTO solde
    FROM "Comptes"
    WHERE "num_compte"='THW000000DZD' FOR UPDATE OF "balance" ;--Compte tharwa

    dbms_output.put_line('Ancien solde ' ||solde);
    solde:=solde+:new."montant_commission";
    dbms_output.put_line('Nouveau solde ' ||solde);

    --Versement dans le compte de tharwa
    UPDATE "Comptes" SET "balance"=solde WHERE "num_compte"='THW000000DZD';
  END;
  `
)