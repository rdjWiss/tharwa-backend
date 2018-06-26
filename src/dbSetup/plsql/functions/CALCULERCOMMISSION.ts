import { sequelize } from "../../../config/db";

//Calcule la commission du virement
sequelize.query(`
create or replace FUNCTION CALCULERCOMMISSION(
  TYPE_COMMISSION   IN NUMBER ,
  MONTANT_TRANSFERT IN NUMBER )
RETURN NUMBER
AS
pourcentage NUMBER(38,2);
commission  NUMBER(38,2);
BEGIN
--Commission de virement
SELECT "montant_commission" INTO pourcentage
FROM "Commissions"
WHERE "id_commission"=type_commission;

commission:=pourcentage*montant_transfert/100;
dbms_output.put_line('pourcentage: ' || pourcentage || '  commission ' ||commission);
RETURN ROUND(commission,2);
END CALCULERCOMMISSION;
  `
)
