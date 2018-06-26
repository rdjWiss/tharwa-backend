import { sequelize } from "../../../config/db";

//Fait appel à l'API de taux de change pour convertir montant (passe par la route du serveur)
sequelize.query(`
create or replace FUNCTION CONVERTIRMONTANT(
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
END convertirmontant;  
`
)