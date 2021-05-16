# node-firebase-socialape-functions 🚀

[![Report an issue](https://img.shields.io/badge/Support-Issues-green)](https://github.com/tquangdo/node-firebase-socialape-functions/issues/new)

## FB
![fb](https://img.shields.io/badge/firebase-deployed-orange)
### 1/authentication
![authentication](authentication.png)
### 2/db
![db1](db1.png)
*********
![db2](db2.png)
### 3/storage
![storage](storage.png)
### 4/hosting
![hosting](hosting.png)
### 5/function
![function1](function1.png)
*********
![function2](function2.png)
### 6/about function
#### a) create
- `<root path>$firebase init firestore`
- -> auto create folder "functions"
#### b) downgrade version if deploy NG
1. npm install
- (NG!) `$npm install -g firebase-tools`
- (OK) `$npm install firebase-tools@6.8.0 - g`
2. package.json
```json
"engines": {
    "node": "10"=>"8"
  },
"firebase-functions": "^3.6.1"=>"^2.3.1"
```
#### c) emulators
- `$firebase emulators:start`
#### d) serve
`functions$firebase serve`
1. create file "functions/serviceAccountKey.json":
- FB's dashboard: tab "project settings" > service accounts > firebase admin sdk > click "generate new private key" > rename file to "serviceAccountKey.json"
![service_acc](service_acc.png)
2. file "admin.js"
```js
const serviceAccount = require('../serviceAccountKey.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL:  ****
})
```
#### e) deploy
`functions$firebase deploy`
* Note:
1. NOT run concurrently with serve
2. if get `access right` ERR then: https://console.cloud.google.com/functions > choose project name > check in chkbox function name > add member > allUsers & Cloud Functions Invoker > save
![func_invoke](func_invoke.png)
3. deploy's API NOT stable like serve's API -> if bug then should rerun deploy
#### f) log
https://console.cloud.google.com/logs/ > choose project name
![log](log.png)
#### g) function:
![api_list](api_list.png)
*********
#### h) function:"login"
1. Option 1:
- `functions$firebase serve`
- => access "http://localhost:5000/socialape-efcc4/us-central1//login"
- => get token for API's header
2. Option 2:
- `functions$firebase deploy --only functions`
- => access "https://asia-east2-socialape-efcc4.cloudfunctions.net/api/login"
- => get token for API's header
#### i) function:"users<likes/comments>"
users<likes/comments>: https://firestore.googleapis.com/v1/projects/socialape-efcc4/databases/(default)/documents/users<likes/comments>
![api](api.png)
