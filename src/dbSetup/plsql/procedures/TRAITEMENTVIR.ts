import { sequelize } from "../../../config/db";

//Traitement du virement (exécution)
sequelize.query(`
create or replace PROCEDURE TRAITEMENTVIR(
  CODEVIR   IN VARCHAR2,
  EMETTEUR  IN VARCHAR2 ,
  RECEPTEUR IN VARCHAR2 ,
  MONTANT   IN NUMBER,
  STATUTVIR IN NUMBER,
  DATEVIR IN TIMESTAMP)
AS
type_commission     NUMBER;
montantCommission   NUMBER(38,2);
montantVirement     NUMBER(38,2);
soldeEmetteur       NUMBER(38,2);
typeCompteEmetteur  NUMBER(10);
soldeRecepteur      NUMBER(38,2);
typeCompteRecepteur NUMBER(10);
monnaieDevise       VARCHAR2(3);
retourConversion json;

STATUT_VIR_AVALIDER CONSTANT NUMBER := 1;
STATUT_VIR_VALIDE CONSTANT NUMBER := 2;

COMPTE_COURANT CONSTANT NUMBER := 1;
COMPTE_EPARGNE CONSTANT NUMBER := 2;
COMPTE_DEVISE CONSTANT NUMBER := 3;
BEGIN
montantVirement:= MONTANT;
--Call la fonction qui détermine le type de la commission
type_commission :=commission(EMETTEUR,RECEPTEUR,montantVirement);

--Si devise vers courant, convertir d'abord le montant
IF type_commission = 4 THEN -- DEVISE vers COURANT
  dbms_output.put_line('DEVISE COURANT');
  --Récupérer le code monnaie
  SELECT "code_monnaie" INTO monnaieDevise FROM "Comptes" WHERE "num_compte"=EMETTEUR;

  --Récupérer le montant converti selon taux de change
  retourConversion := json(convertirMontant(monnaieDevise,'DZD',montantVirement));
  montantVirement := JSON_EXT.GET_NUMBER(retourConversion,'montant_converti');
  dbms_output.put_line('montant converti: ' || montantVirement);
END IF;

--Call fonction qui calcule le montant de la commission
montantCommission:=calculercommission(type_commission,montantVirement);
dbms_output.put_line('Montant commission ' || montantCommission);

--Récupérer les anciens soldes des comptes
SELECT "balance", "type_compte" INTO soldeEmetteur, typeCompteEmetteur
FROM "Comptes"
WHERE "num_compte"=EMETTEUR FOR UPDATE OF "balance" ;

SELECT "balance", "type_compte"
INTO soldeRecepteur, typeCompteRecepteur
FROM "Comptes"
WHERE "num_compte"=RECEPTEUR FOR UPDATE OF "balance" ;

dbms_output.put_line('Ancien solde Emetteur' || soldeEmetteur);
dbms_output.put_line('Ancien solde Recepteur ' || soldeRecepteur);

--Prélever la commission du compte courant
IF typeCompteEmetteur = COMPTE_COURANT THEN
  dbms_output.put_line('Commission extraite du compte emetteur');
  soldeEmetteur := soldeEmetteur - montantCommission;
ELSE
  dbms_output.put_line('Commission extraite du compte recepteur');
  soldeRecepteur:= soldeRecepteur - montantCommission;
END IF;

--Si DEVISE COURANT ou COURANT DEVISE convertir montant
--Si les deux comptes ne sont pas devise, prélever montant du compte de l'emetteur
IF typeCompteEmetteur    != COMPTE_DEVISE AND typeCompteRecepteur != COMPTE_DEVISE THEN
  soldeEmetteur          :=soldeEmetteur -montantVirement;
  --Si virement valide
  IF statutvir = STATUT_VIR_VALIDE THEN
    soldeRecepteur         :=soldeRecepteur+montantVirement;
  END IF;

-- Si le compte de l'emetteur est devise, nécessairement virement entre comptes du meme client, pas de validation
ELSIF (typeCompteEmetteur = COMPTE_DEVISE) THEN
  soldeEmetteur          :=soldeEmetteur -MONTANT;
  soldeRecepteur         :=soldeRecepteur+montantVirement;

--si compte recepteur est devise
ELSIF (typeCompteRecepteur= COMPTE_DEVISE) THEN
  soldeEmetteur          :=soldeEmetteur-montantVirement;
  SELECT "code_monnaie" INTO monnaieDevise FROM "Comptes" WHERE "num_compte"=RECEPTEUR;

  --Récupérer le montant converti
  retourConversion := json(convertirMontant('DZD',monnaieDevise,montantVirement));
  montantVirement := JSON_EXT.GET_NUMBER(retourConversion,'montant_converti');
  dbms_output.put_line('montant converti: ' || montantVirement);

  soldeRecepteur:=soldeRecepteur+montantVirement;
END IF;

--Mettre à jour les balances des comptes
UPDATE "Comptes" SET "balance" =soldeEmetteur WHERE "num_compte"=EMETTEUR;
UPDATE "Comptes" SET "balance" = soldeRecepteur WHERE "num_compte"=RECEPTEUR;
dbms_output.put_line('Nouveau solde Emetteur' || soldeEmetteur);
dbms_output.put_line('Nouveau solde Recepteur ' || soldeRecepteur);

--Créer la commission du virement
  INSERT
  INTO "CommissionVirements"
    (
      "id_commission",
      "montant_commission",
      "id_virement",
      "date_commission"
    )
    VALUES
    (
      type_commission,
      montantCommission,
      CODEVIR,
      DATEVIR--SYSDATE()
    );
END;`
)
