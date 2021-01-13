const startServer = require('../index');

const options = {
    debugMode:'product'
}

let server = require('../lib')(options, function (params){
    // console.log(`nohost is listening on ${this.address().port}`);
});

describe('index', ()=>{
    test('should callback be called',()=>{
        expect(server.address().port).toEqual(8080)
    })

    // test('start server with options is function',()=>{
    //     startServer(()=>console.log('cb'))
    // })
})

