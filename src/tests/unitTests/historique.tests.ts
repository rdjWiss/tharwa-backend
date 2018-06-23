
import * as Chai from 'chai'
import { getTypeCommission } from '../../app/models/Commission';
var should= Chai.should()

describe('Historique',function(){
  it('Doit retourner le type de la commission selon l\'id',function(){
    let type = getTypeCommission(2)
    type.should.equals("Epargne vers courant")
  })
})