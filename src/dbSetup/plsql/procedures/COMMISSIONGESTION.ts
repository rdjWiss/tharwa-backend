import { sequelize } from "../../../config/db";

//Procédure de calcul des commissions de gestion  
sequelize.query(`
create or replace PROCEDURE COMMISSIONGESTION
AS
CURSOR user_c IS SELECT "id" FROM "userdbs" WHERE "fonctionId"='C' or "fonctionId"='E' and "active"='TRUE';
CURSOR compte_c(user_id number) IS 
  SELECT  "num_compte","type_compte","balance" FROM "Comptes" 
  WHERE "statut_actuel" not in (4,1) and "id_user"=user_id
  FOR UPDATE OF "balance";
userId "userdbs"."id"%TYPE;
compte "Comptes"%ROWTYPE;
commissionTotale number(38,2) := 0;
commissionParUser number(38,2) := 0;
numCompteCourant VARCHAR2(30);
ancienneBalanceCourant number(38,2) := 0;

COMPTE_COURANT CONSTANT NUMBER := 1;
COMPTE_EPARGNE CONSTANT NUMBER := 2;
COMPTE_DEVISE CONSTANT NUMBER := 3;

COMMISSION_COURANT CONSTANT NUMBER := 8;
COMMISSION_EPARGNE CONSTANT NUMBER := 9;
COMMISSION_DEVISE CONSTANT NUMBER := 10;

--- A remplacer par une requete qui récupère toutes les com
COMMISSION_COURANT_MONTANT CONSTANT NUMBER := 100;
COMMISSION_EPARGNE_MONTANT CONSTANT NUMBER := 50;
COMMISSION_DEVISE_MONTANT CONSTANT NUMBER := 200;

BEGIN
dbms_output.put_line('Calcul des commissions de gestion');
--Pour chaque user
FOR userId IN user_c
LOOP
  dbms_output.put_line('ID ' || userId."id");
  commissionParUser := 0;
  --Pour chaque compte du user
  FOR compte IN compte_c(userId."id")
  LOOP
    dbms_output.put_line('num compte  ' || compte."type_compte");
    IF compte."type_compte" = COMPTE_COURANT THEN
      numCompteCourant := compte."num_compte";
      ancienneBalanceCourant := compte."balance";
      commissionParUser := commissionParUser + COMMISSION_COURANT_MONTANT;
      --Créer commission
      CREER_COMMISSION_GESTION(COMMISSION_COURANT,COMMISSION_COURANT_MONTANT,compte."num_compte");
      
    ELSIF compte."type_compte" = COMPTE_EPARGNE THEN
      commissionParUser := commissionParUser + COMMISSION_EPARGNE_MONTANT;
      --Créer commission
      CREER_COMMISSION_GESTION(COMMISSION_EPARGNE,COMMISSION_EPARGNE_MONTANT,compte."num_compte");
      
    ELSIF compte."type_compte" = COMPTE_DEVISE THEN
      commissionParUser := commissionParUser + COMMISSION_DEVISE_MONTANT;
      --Créer commission
      CREER_COMMISSION_GESTION(COMMISSION_DEVISE,COMMISSION_DEVISE_MONTANT,compte."num_compte");
    END IF;
  END LOOP;
  dbms_output.put_line('Total User  ' || commissionParUser || ' courant '|| numCompteCourant);
  dbms_output.put_line('Ancienne balance  ' || ancienneBalanceCourant );
  -- Enlever la commission totale du user du compte courant
  UPDATE "Comptes" SET "balance"=ancienneBalanceCourant-commissionParUser WHERE "num_compte"=numCompteCourant;
  --dbms_output.put_line('New balance  ' || ancienneBalanceCourant - commissionParUser );
  
  --Sommer la totale des commissions
  commissionTotale:= commissionTotale + commissionParUser;
  
END LOOP;
dbms_output.put_line('Total  ' || commissionTotale );
 --Verser la commission dans le compte de tharwa
 UPDATE "Comptes" SET "balance"="balance"+commissionTotale WHERE "num_compte"='THW000000DZD';
END;
`)