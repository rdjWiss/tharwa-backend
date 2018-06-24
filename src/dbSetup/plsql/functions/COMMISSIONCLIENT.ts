import { sequelize } from "../../../config/db";

//TODO remplacer les numéros par des constantes
//Retourne le type de la commission entre comptes du même client
sequelize.query(`
create or replace FUNCTION COMMISSIONCLIENT(
  COMPTE_SOURCE      IN VARCHAR2 ,
  COMPTE_DESTINATION IN VARCHAR2 ,
  MONTANT            IN NUMBER )
RETURN NUMBER
AS
type_src           NUMBER;
type_dest          NUMBER;
montant_commission NUMBER;
BEGIN
SELECT "type_compte"
INTO type_src
FROM "Comptes"
WHERE "num_compte"=compte_source;

SELECT "type_compte"
INTO type_dest
FROM "Comptes"
WHERE "num_compte"=compte_destination;

/* Viremnt depuis compte courant */
IF ( type_src=1 ) THEN
  /* Vers compte epargne*/
  IF type_dest = 2 THEN
    dbms_output.put_line('Virement courant vers Epargne ');
    /*montant_commission:=calculerCommission(1,montant);*/
    RETURN 1;
    /* Vers compte devise */
  elsif (type_dest=3) THEN
    dbms_output.put_line('Virelment courant vers devise');
    /*  montant_commission:=calculercommission(3,montant);*/
    RETURN 3;
  END IF;
ELSE
  /* virement depuis compte epargne */
  IF ( type_src= 2) THEN
    dbms_output.put_line('virement epargne vers courant ');
    /* montant_commission:=calculercommission(2,montant);*/
    RETURN 2;
    /* virement depuis compte devise */
  elsif ( type_src = 3) THEN
    dbms_output.put_line('virement devise vers courant ');
    /* montant_commission:=calculercommission(4,montant);*/
    RETURN 4;
  END IF;
END IF;
END COMMISSIONCLIENT;  
`
)
