import { sequelize } from "../config/db";
/*
FUNCTIONS
*/
//Fait appel à l'API de taux de change pour convertir montant (passe par la route du serveur)
sequelize.query(`
  CREATE OR REPLACE FUNCTION CONVERTIRMONTANT(
    MONNAIE_SRC  IN VARCHAR2 ,
    MONNAIE_DEST IN VARCHAR2 ,
    MONTANT      IN NUMBER )
  RETURN VARCHAR2
  AS
  req sys.utl_http.req;
  res sys.utl_http.resp;
  url     VARCHAR2(4000) := 'http://localhost:3000/convertir';
  reponse VARCHAR2(4000);
  name    VARCHAR2(4000);
  buffer  VARCHAR2(4000);
  content VARCHAR2(4000) := '{"montant":"'||montant||'"}';
  BEGIN
  req := sys.utl_http.begin_request(url, 'POST',' HTTP/1.1');
  sys.utl_http.set_header(req, 'user-agent', 'mozilla/4.0');
  sys.utl_http.set_header(req, 'client_id', '874');
  sys.utl_http.set_header(req, 'content-type', 'application/json');
  sys.utl_http.set_header(req, 'Content-Length', LENGTH(content));
  reponse:='';
  sys.utl_http.write_text(req, content);
  res := sys.utl_http.get_response(req);
  -- process the response from the HTTP call
  BEGIN
    LOOP
      sys.utl_http.read_line(res, buffer);
      reponse:=reponse|| buffer;
      dbms_output.put_line(buffer);
    END LOOP;
    sys.utl_http.end_response(res);
  EXCEPTION
  WHEN sys.utl_http.end_of_body THEN
    sys.utl_http.end_response(res);
  WHEN sys.UTL_HTTP.TOO_MANY_REQUESTS THEN
    dbms_output.put_line('two many request are waiting');
    sys.UTL_HTTP.END_RESPONSE(res);
  END;
  RETURN reponse;
  END convertirmontant;`
)

//Retourne le type de la commission entre comptes du même client
sequelize.query(`
  CREATE OR REPLACE FUNCTION COMMISSIONCLIENT(
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
  END COMMISSIONCLIENT;`
)

//Retourne le type de la commission (Courant-epargne, epargne-courant, ...)
sequelize.query(`
  CREATE OR REPLACE FUNCTION COMMISSION(
    EMMETTEUR IN VARCHAR2 ,
    RECEPTEUR IN VARCHAR2 ,
    MONTANT   IN DECIMAL )
  RETURN NUMBER
  AS
  user_emmet      NUMBER;
  user_dest       NUMBER;
  seuil_transfert DECIMAL:=200000;
  --TODO: seuil de validation, a récupérer par une requete
  comm NUMBER;
  /* un curseur pour trouver l'id de l'utilisateur correspondant au numero de compte */
  CURSOR findUser(num_compte VARCHAR2)
  IS
    SELECT "id_user" FROM "Comptes" WHERE "num_compte" = num_compte;
  BEGIN
  OPEN findUser(EMMETTEUR) ;
  FETCH findUser INTO user_emmet;
  CLOSE findUser;
  OPEN findUser(RECEPTEUR);
  FETCH findUser INTO user_dest;
  /* tester si l'utilisateur est interne a tharwa */
  IF findUser%FOUND THEN
    /* si le virement est un virement entre les comptes d'un meme client */
    IF user_emmet=user_dest THEN
      dbms_output.put_line('Virement entre compte de  Client ');
      /* Créer la commission correspondante */
      comm:=COMMISSIONCLIENT(EMMETTEUR,RECEPTEUR,MONTANT);
      RETURN comm;
    ELSE
      /* le virement est un virement entre deux client tharwa */
      dbms_output.put_line('Virement interieur a Tharwa ');
      /* si le montant de virement depasse le seuil autorisé le virement sera mis en attente */
      RETURN 5;
    END IF;
  ELSE
    dbms_output.put_line('Virement Exterieur');
  END IF;
  RETURN comm;
  END COMMISSION;`
)

//Calcule la commission du virement
sequelize.query(`
  CREATE OR REPLACE FUNCTION CALCULERCOMMISSION(
    TYPE_COMMISSION   IN NUMBER ,
    MONTANT_TRANSFERT IN NUMBER )
  RETURN NUMBER
  AS
    pourcentage NUMBER(38,2);
    commission  NUMBER(38,2);
  BEGIN
    SELECT "montant_commission"
    INTO pourcentage
    FROM "Commissions"
    WHERE "id_commission"=type_commission;
    commission:=pourcentage*montant_transfert/100;
    dbms_output.put_line('commission ' ||commission);
    RETURN ROUND(commission,2);
  END CALCULERCOMMISSION;`
)

/*
PROCEDURES
*/
//Traitement du virement (exécution)
sequelize.query(`
  create or replace PROCEDURE TRAITEMENTVIR(
    CODEVIR   IN VARCHAR2,
    EMETTEUR  IN VARCHAR2 ,
    RECEPTEUR IN VARCHAR2 ,
    MONTANT   IN NUMBER,
    STATUTVIR IN NUMBER)
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
  --Call fonction qui calcule le montant de la commission
  IF type_commission = 4 THEN -- DEVISE vers COURANT
    dbms_output.put_line('DEVISE COURANT');
    --Récupérer le code monnaie
    SELECT "code_monnaie"
    INTO monnaieDevise
    FROM "Comptes"
    WHERE "num_compte"=EMETTEUR;
    --Récupérer le montant converti
    retourConversion := json(convertirMontant(monnaieDevise,'DZD',montantVirement));
    montantVirement := JSON_EXT.GET_NUMBER(retourConversion,'montant_converti');
    dbms_output.put_line('montant converti: ' || montantVirement);
    --montantVirement := convertirMontant(monnaieDevise,'DZD',montantVirement);
  END IF;
  montantCommission:=calculercommission(type_commission,montantVirement);
  dbms_output.put_line('Montant commission ' || montantCommission);
  --Récupérer les anciens soldes des comptes
  SELECT "balance",
    "type_compte"
  INTO soldeEmetteur,
    typeCompteEmetteur
  FROM "Comptes"
  WHERE "num_compte"=EMETTEUR FOR UPDATE OF "balance" ;
  SELECT "balance",
    "type_compte"
  INTO soldeRecepteur,
    typeCompteRecepteur
  FROM "Comptes"
  WHERE "num_compte"=RECEPTEUR FOR UPDATE OF "balance" ;
  dbms_output.put_line('Ancien solde Emetteur' || soldeEmetteur);
  dbms_output.put_line('Ancien solde Recepteur ' || soldeRecepteur);

  --Extraire la commission du compte courant
  IF typeCompteEmetteur = COMPTE_COURANT THEN
    dbms_output.put_line('Commission extraite du compte emetteur');
    soldeEmetteur := soldeEmetteur - montantCommission;
  ELSE
    dbms_output.put_line('Commission extraite du compte recepteur');
    soldeRecepteur:= soldeRecepteur - montantCommission;
  END IF;

  --Si DEVISE COURANT ou COURANT DEVISE convertir montant
  IF typeCompteEmetteur    != COMPTE_DEVISE AND typeCompteRecepteur != COMPTE_DEVISE THEN
    soldeEmetteur          :=soldeEmetteur -montantVirement;
    IF statutvir = STATUT_VIR_VALIDE THEN
      soldeRecepteur         :=soldeRecepteur+montantVirement;
    END IF;
  ELSIF (typeCompteEmetteur = COMPTE_DEVISE) THEN
    soldeEmetteur          :=soldeEmetteur -MONTANT;
    soldeRecepteur         :=soldeRecepteur+montantVirement;
  ELSIF (typeCompteRecepteur= COMPTE_DEVISE) THEN
    soldeEmetteur          :=soldeEmetteur-montantVirement;
    SELECT "code_monnaie" INTO monnaieDevise FROM "Comptes" WHERE "num_compte"=RECEPTEUR;
    --Récupérer le montant converti
    retourConversion := json(convertirMontant('DZD',monnaieDevise,montantVirement));
    montantVirement := JSON_EXT.GET_NUMBER(retourConversion,'montant_converti');
    dbms_output.put_line('montant converti: ' || montantVirement);

    soldeRecepteur:=soldeRecepteur+montantVirement;
  END IF;
  UPDATE "Comptes" SET "balance" =soldeEmetteur WHERE "num_compte"=EMETTEUR;
  UPDATE "Comptes" SET "balance" = soldeRecepteur WHERE "num_compte"=RECEPTEUR;
  dbms_output.put_line('Nouveau solde Emetteur' || soldeEmetteur);
  dbms_output.put_line('Nouveau solde Recepteur ' || soldeRecepteur);
  INSERT
  INTO "CommissionVirements"
    (
      "id_commission",
      "montant_commission",
      "id_virement"
    )
    VALUES
    (
      type_commission,
      montantCommission,
      CODEVIR
    );
  END;`
)

/*
TRIGGERS
*/
//Verser commission dans le compte de THARWA 
sequelize.query(`
  CREATE OR REPLACE TRIGGER VERSERCOMMISSION AFTER
  INSERT ON "CommissionVirements" FOR EACH row DECLARE solde NUMBER(38,2);
  BEGIN
    SELECT "balance"
    INTO solde
    FROM "Comptes"
    WHERE "num_compte"='THW000000DZD' FOR UPDATE OF "balance" ;
    dbms_output.put_line('Ancien solde ' ||solde);
    solde:=solde+:new."montant_commission";
    dbms_output.put_line('Nouveau solde ' ||solde);
    --Versement dans le compte de tharwa
    UPDATE "Comptes" SET "balance"=solde WHERE "num_compte"='THW000000DZD';
  END;`
)

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
        TRAITEMENTVIR(:new."code_virement",:new."emmetteur",:new."recepteur",:new."montant",:new."statut_virement");
      
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