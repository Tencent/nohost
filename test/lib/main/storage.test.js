const {setDomain,getAdmin,getDomain} = require('../../../lib/main/storage')

  
describe('lib storage',()=>{     
    test('should getAdmin be empty',()=>{
        expect(getAdmin()).toBe('')    
    })
})
ß