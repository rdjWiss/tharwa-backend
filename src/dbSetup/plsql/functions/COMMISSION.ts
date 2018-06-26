import { sequelize } from "../../../config/db";

//TODO vérifier que l'emetteur appartient à tharwa sinon virement externe reçu
//Retourne le type de la commission (Courant-epargne, epargne-courant, ...)
sequelize.query(`
create or replace FUNCTION COMMISSION(
  EMMETTEUR IN VARCHAR2 ,
  RECEPTEUR IN VARCHAR2 ,
  MONTANT   IN DECIMAL )
RETURN NUMBER
AS
user_emmet      NUMBER;
user_dest       NUMBER;
seuil_transfert DECIMAL:=200000;
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
  RETURN 6;
END IF;
RETURN comm;
END COMMISSION;`
)