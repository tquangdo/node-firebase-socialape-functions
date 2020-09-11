const serviceAccount = require('../serviceAccountKey.json')
//1)cách tạo:
//FB>Settings>Service accounts>Firebase Admin SDK> button "Generate new private key"
//tạo ra file *.json>rename thành "serviceAccountKey.json">move to socialape-functions/functions
//2)cách check list "serviceAccountKey.json":
//FB>...>Firebase Admin SDK> link "Manage service account permissions">mở cửa sổ of "https://console.cloud.google.com/"
//tab "Service Accounts">click "firebase-adminsdk-q1csq@socialape-efcc4.iam.gserviceaccount.com">thấy keys= "40f050104c0f084339632f4988822b3622761e6a" với Key creation date="Jul 15, 2020"

const admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})
const adminFirestore = admin.firestore()

module.exports = { admin, adminFirestore }
