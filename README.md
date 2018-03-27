# Backend

### Authentification a deux Facteurs avec oauth2

1- Le client mobile envoie les données de l'utilisateur au serveur d'authentification sur la route "/login" sous la forme 
      {
        email:'',
        password:'',
      }
      Reponses : 
            -400 : Bad request 
            -401 : Bad credentials 
            -200 : {
                    userId :'sfgefgjkegeg1eg65eg613'  // Jwt Token contenant { Id:'', expires_in :''  } 
                     }
2- si l'authentification est faite le client recevera un hash permettant de continuer la deuxieme étape pour choisir le deuxiéme facteur d'authentification sois Sms ou Mail dans un délai de 10 Min  sur la route "/choisir"
      {
        user:'',
        choix:'SMS ou MAil'
      }
      Reponse :
          - 400 : Bad Request
          - 401 : Unauthorized ( token a expiré)
          - 200 : Code envoyé 
3- Le client envoie le code de vérification avec le hash toujours pour permettre de le vérifier sous la route "/verifier" , le client a 3 chance pour envoyer le bon code sinon il devra demander un autre et le code doit etre validé dans moins d'une heure 
      {
        user:"sfgefgjkegeg1eg65eg613",
        token:'4598'
      }
      Reponse:
      400:Bad request 
      401: Unauthorized ( code invalide , nombre d'essais plus de 3, temps de validation expiré)
      200:
      {
        access_token: '456sd54fzsfzreklfzrfklqrfzr.zfzf',   // Acces token expire dans 15 min a 30 min  ___a fixer !___ 
        pin_code : 'gerhrt86g4rtg165et4ethb6th4teh4ethr1th'  // Code pin Hashé expires dans 1h
        refresh_token: 'sdfsd4f4f1qsf41zqg4r4grzege4gerg',  // Refresh token Expires dans 24h 
        expires_in: '121501122018',  //  Temps d'expiration 
        token_type:"bearer", // type de token 
        scope: 'Client', // Fonction 
        user:'4' // User ID
      }
      
  
        
