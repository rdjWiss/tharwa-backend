import { sequelize } from "../../../config/db";

/*
D'abord,il faut accorder les privilèges suivants au user:
grant create procedure to HR;
grant execute on dbms_lock to HR;
grant execute on dbms_system to HR;
grant create job to HR;
grant manage scheduler to HR;
GRANT CREATE EXTERNAL JOB TO HR;
GRANT CREATE ANY JOB TO HR;
*/

/**
 *  Pour arreter 
BEGIN
  SYS.Dbms_Scheduler.Disable('job_commission_gestion',force=>true);
END;
/
 */

//Job qui se lance chaque fin du mois pour 
//prendre les commissions de gestion des comptes
sequelize.query(
` BEGIN
-- Job defined entirely by the CREATE JOB procedure.
DBMS_SCHEDULER.create_job (
  job_name        => 'job_commission_gestion',
  job_type        => 'PLSQL_BLOCK',
  job_action      => 'BEGIN COMMISSIONGESTION(); END;',
  start_date      => SYSTIMESTAMP,
  repeat_interval => 'freq=monthly;by monthday=-1',--dernier jour de la semaine
  end_date        => NULL,
  enabled         => TRUE,
  comments        => 'Job de traitement des commissions de gestion chaque mois.');
END;
/`)