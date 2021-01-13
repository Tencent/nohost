const {checkLogin,shasum} = require('../../../lib/util/login')

describe('util login shasum function',()=>{
    test('should shasum result be  with empty value',()=>{
        expect(shasum()).toEqual('da39a3ee5e6b4b0d3255bfef95601890afd80709')
    })
})

describe('util login',()=>{
    
    test('should login success with username is empty', ()=>{
        const userrInfo ={
            nameKey:'admin',
            authKey:'6dd2c1e5750a9a2ac363f8dca20c78c9b200ce34'
        }
        const cookies = {
            get:name=>userrInfo[name]
        }

        const authConf = {
            username:'',
            password:'da39a3ee5e6b4b0d3255bfef95601890afd80709'
        }
        const ctx = {
            cookies,
            req:{
                headers:{}
            },
            set:name=>name
        }
        expect(checkLogin(ctx,authConf)).toBeTruthy()
    })
})

describe('util login',()=>{
    
    test('should login success with correct authorization', ()=>{
        const userrInfo ={
            nameKey:'admin',
            authKey:'3ef9bf2e56995e386a026b29fa514e32234a5d8a'
        }
        const cookies = {
            get:name=>userrInfo[name],
            set:key=>key
        }

        const authConf = {
            username:'admin',
            password:'7c4a8d09ca3762af61e59520943dc26494f8941b'
        }
        const ctx = {
            cookies,
            req:{
                headers:{
                    authorization:'Basic YWRtaW46MTIzNDU2'
                }
            },
            set:name=>name
        }
        expect(checkLogin(ctx,authConf)).toBeTruthy()
    })
})

describe('util login',()=>{
    
    test('should login faild with wrong username', ()=>{
        const userrInfo ={
            nameKey:'admin',
            authKey:'3ef9bf2e56995e386a026b29fa514e32234a5d8a'
        }
        const cookies = {
            get:name=>userrInfo[name],
            set:key=>key
        }

        const authConf = {
            username:'admin2',
            password:'7c4a8d09ca3762af61e59520943dc26494f8941b'
        }
        const ctx = {
            cookies,
            req:{
                headers:{
                    authorization:'Basic YWRtaW46MTIzNDU2'
                }
            },
            set:name=>name
        }
        expect(checkLogin(ctx,authConf)).toBeFalsy()
    })
})