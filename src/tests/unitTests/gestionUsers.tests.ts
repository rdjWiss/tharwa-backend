import * as Chai from 'chai'
import { getUserContact } from '../../oauth2Server/models/User';

var should= Chai.should()

describe('Gestion des users', function () {
  it('Doit retourner le nom, email et telephone du user', function(){
    var id = 6
    getUserContact(id, function(user:any){
      // console.log(user)
      user.should.have.property('nom')
      user.should.have.property('email')
      user.should.have.property('tel')
    },(error:any)=>{
      error.should.equal('User not found')
    })
  })

});