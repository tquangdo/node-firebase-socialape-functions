const { admin, adminFirestore } = require('../util/admin')
const firebaseConfig = require('../util/config')
// Initialize Firebase
const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)
const {
    validateSignupData, validateLoginData, reduceUserDetails
} = require('../util/validators')

exports.signUp = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }
    //validate data
    const { valid, errors } = validateSignupData(newUser)
    if (!valid) {
        return res.status(400).json(errors)
    }
    const noImg = 'no-img.png'
    let tokenVar, userId
    adminFirestore.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                //POST http://localhost:5000/socialape-efcc4/us-central1/api/signup lần 2
                return (
                    res.status(400).json({ handle: 'this handle is already taken', }),
                    process.exit()
                )
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password) // create user in FB console > Users
            }
        })
        .then((data) => {
            userId = data.user.uid
            return data.user.getIdToken() //data.user = FB console > DB "users.user"
        })
        .then((idToken) => {
            tokenVar = idToken
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${
                    firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
                userId,
            }
            return adminFirestore.doc(`/users/${newUser.handle}`).set(userCredentials) //INS DB "users.user"
        })
        .then(() => {
            //POST http://localhost:5000/socialape-efcc4/us-central1/api/signup lần 1
            return res.status(201).json({ tokenVar, })
        })
        .catch((err) => {
            console.error(err)
            if (err.code === 'auth/email-already-in-use') {
                res.status(400).json({ email: 'Email is already in use', })
            } else {
                res.status(500).json({ general: "Something went wrong, please try again" })
            }
        })
}

exports.login = (req, res) => {
    const { valid, errors } = validateLoginData(req.body)
    if (!valid) {
        return res.status(400).json(errors)
    }
    const { email, password } = req.body
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((data) => {
            return data.user.getIdToken()
        })
        .then((token) => {
            return res.json({ token })
        })
        .catch((err) => {
            console.error(err)
            return res.status(403).json({ general: 'Wrong credentials, please try again', })
        })
}

exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body)
    adminFirestore.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details added successfully' })
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code, })
        })
}

exports.getAuthenUserDetails = (req, res) => {
    let userData = {}
    const { handle } = req.user
    adminFirestore.doc(`/users/${handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data()
                return adminFirestore.collection('likes')
                    .where('userHandle', '==', handle)
                    .get()
            }
        })
        .then(data => {
            userData.likes = []
            data.forEach(data_item => {
                userData.likes.push(data_item.data())
            })
            // userData=
            // {
            //     "credentials": {
            //         "userId": "bUj1WWPULrPSHHiYPNbXZ2Lchmm2",
            //         "location": "LA, CA",
            //         "imageUrl": "https://firebasestorage.googleapis.com/v0/b/socialape-efcc4.appspot.com/o/89767699.jpg?alt=media",
            //         "website": "https://google.com",
            //         "email": "new2@email.com",
            //         "createdAt": "2020-07-16T13:29:15.211Z",
            //         "handle": "new2",
            //         "bio": "Hello, I'm user"
            //     },
            //     "likes": []
            // }
            return adminFirestore.collection('notifications')
                .where('recipient', '==', handle)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get()
        })
        .then((data) => {
            userData.notifications = []
            data.forEach(data_item => {
                const { recipient, sender, createdAt, screamId, type, read } = data_item.data()
                userData.notifications.push({
                    recipient: recipient,
                    sender: sender,
                    createdAt: createdAt,
                    screamId: screamId,
                    type: type,
                    read: read,
                    notificationId: data_item.id,
                })
            })
            return res.json(userData)
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code, })
        })
}

exports.getUserDetails = (req, res) => {
    let userData = {}
    const { handle } = req.params
    adminFirestore.doc(`/users/${handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.user = doc.data()
                return adminFirestore.collection('screams')
                    .where('userHandle', '==', handle)
                    .orderBy('createdAt', 'desc')
                    .get()
            } else {
                return (
                    res.status(404).json({ getUserDetails: 'User not found' }),
                    process.exit()
                )
            }
        })
        .then(data => {
            userData.screams = []
            data.forEach(data_item => {
                const { body, createdAt, userHandle, userImage,
                    likeCount, commentCount } = data_item.data()
                userData.screams.push({
                    body: body,
                    createdAt: createdAt,
                    userHandle: userHandle,
                    userImage: userImage,
                    likeCount: likeCount,
                    commentCount: commentCount,
                    screamId: data_item.id,
                })
            })
            // userData=
            // {
            //     "user": {
            //         ...
            //     },
            //     "screams": []
            // }
            return res.json(userData)
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code, })
        })
}

exports.markNotifiRead = (req, res) => {
    let batch = adminFirestore.batch()
    req.body.forEach((notifiId) => {
        const notification = adminFirestore.doc(`/notifications/${notifiId}`)
        batch.update(notification, { read: true })
    })
    batch
        .commit()
        .then(() => {
            return res.json({ message: "Notifications marked read" })
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })
}

exports.uploadImage = (req, res) => {
    const busBoyObj = require('busboy')
    const path = require('path')
    const os = require('os')
    const fs = require('fs')
    const busboy = new busBoyObj({ headers: req.headers })
    let imageFileName
    let imageTobeUploaded = {}
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: "Wrong file's extension" })
        }
        const splitTmp = filename.split('.')
        const imageExt = splitTmp[splitTmp.length - 1]
        //123456789.png
        imageFileName = `${Math.round(
            Math.random() * 123456789).toString()}.${imageExt}`
        const filePath = path.join(os.tmpdir(), imageFileName)
        imageTobeUploaded = { filePath, mimetype }
        file.pipe(fs.createWriteStream(filePath))
    })
    busboy.on('finish', () => {
        admin
            .storage()
            .bucket(firebaseConfig.storageBucket)
            .upload(imageTobeUploaded.filePath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageTobeUploaded.mimetype,
                    },
                },
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
                    firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`
                console.log('imageUrl: ', imageUrl)
                return adminFirestore.doc(`/users/${req.user.handle}`).update({ imageUrl })
            })
            .then(() => {
                return res.json({ message: 'Image uploaded successfully' })
            })
            .catch((err) => {
                console.error(err)
                return res.status(500).json({ error: err.code, })
            })
    })
    busboy.end(req.rawBody)
}
