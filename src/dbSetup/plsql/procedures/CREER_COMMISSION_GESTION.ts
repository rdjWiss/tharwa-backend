import { sequelize } from "../../../config/db";

//Créer une commission de gestion
sequelize.query(`
create or replace PROCEDURE CREER_COMMISSION_GESTION(
  ID_COMMISSION   IN NUMBER ,
  MONTANT IN NUMBER,
  NUM_COMPTE IN VARCHAR2)
AS

BEGIN
INSERT INTO "CommissionMensuelles"(
  "id_commission",
  "montant_commission",
  "date_commission",
  "num_compte",
  "createdAt",
  "updatedAt"
)
VALUES (
  ID_COMMISSION,
  MONTANT,
  SYSDATE(),
  NUM_COMPTE,
  SYSDATE(),
  SYSDATE()
);
END;
`)