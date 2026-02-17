import crypto from 'crypto'
import fs from 'fs'
import path from 'path'


const {publicKey , privateKey} =  crypto.generateKeyPairSync('rsa', {
    modulusLength : 2048 ,
    publicKeyEncoding : {
        type : "spki",
        format : "pem"
        },

    privateKeyEncoding : {
        type: "pkcs8",
        format : "pem"
    }
})



const currentPath = process.cwd()

fs.writeFileSync(`${currentPath}/src/certs/private.pem`,privateKey)
fs.writeFileSync(`${currentPath}/src/certs/public.pem`,publicKey)
