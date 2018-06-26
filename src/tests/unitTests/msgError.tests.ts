import { getMessageErreur } from "../../config/errorMsg";
import * as Chai from 'chai'
var should= Chai.should()

describe('Récupération du message d\'erreur',function(){
  it('Doit retourner le message d\'erreur correspondant au code d\'erreur',function(){
    let msg = getMessageErreur('D00')
    msg.should.equals('Erreur DB')
    console.log(msg)

    // console.log(getMessageErreur('A01'))
    // console.log(getMessageErreur('U01'))
    // console.log(getMessageErreur('C01'))
    // console.log(getMessageErreur('V01'))
    // console.log(getMessageErreur('D01'))
  })
})