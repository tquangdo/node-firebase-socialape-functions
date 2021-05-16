# node-firebase-socialape-functions 🚀

[![Report an issue](https://img.shields.io/badge/Support-Issues-green)](https://github.com/tquangdo/node-firebase-socialape-functions/issues/new)

## FB
### authentication
![authentication](authentication.png)
### db
![db1](db1.png)
*********
![db2](db2.png)
### storage
![storage](storage.png)
### hosting
![hosting](hosting.png)
### function
![function1](function1.png)
*********
![function2](function2.png)
### deploy function
#### login
1. Option 1:
- `$firebase serve`
- => access "http://localhost:5000/socialape-efcc4/us-central1/api/login"
- => get token for API's header
2. Option 2:
- `$firebase deploy --only functions`
- => access "https://asia-east2-socialape-efcc4.cloudfunctions.net/api/login"
- => get token for API's header
#### downgrade version if deploy NG
1. https://console.firebase.google.com/ > tab "functions"
- (NG!) `$npm install -g firebase-tools`
- (OK) `$npm install firebase-tools@6.8.0 - g`
2. package.json
```json
"engines": {
    "node": "10" -> "8"
  },
"firebase-functions": "^3.6.1" -> "^2.3.1"
```
