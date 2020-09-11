const functions = require('firebase-functions')
const app = require('express')()
const cors = require('cors')
app.use(cors())
const FBAuth = require('./util/fbAuth')
const { adminFirestore } = require('./util/admin')

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     response.send("Hello DoTQ!")
// })

const {
    getAllScreams, post1Scream, get1Scream, cmtOnScream,
    likeScream, unlikeScream, deleteScream
} = require('./handlers/screams')
app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, post1Scream)
app.get('/screams/:screamId', get1Scream)
app.delete('/screams/:screamId', FBAuth, deleteScream)
app.post('/screams/:screamId/comment', FBAuth, cmtOnScream)
app.get('/screams/:screamId/like', FBAuth, likeScream)
app.get('/screams/:screamId/unlike', FBAuth, unlikeScream)

const {
    signUp, login, uploadImage, addUserDetails, getAuthenUserDetails,
    getUserDetails, markNotifiRead,
} = require('./handlers/users')
const admin = require('./util/admin')
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenUserDetails)
app.get('/users/:handle', getUserDetails)
app.post('/notifications', FBAuth, markNotifiRead)

exports.api = functions.region('asia-east2').https.onRequest(app)

exports.createNotifiOnLike = functions.region('asia-east2').firestore.document('likes/{id}')
    .onCreate(snapshot => { // INS /notifications/snapshotId (sender)
        return adminFirestore.doc(`/screams/${snapshot.data().screamId}`)
            .get() // SEL screams/screamId (receiver)
            .then(doc => {
                if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
                    return adminFirestore.doc(`/notifications/${snapshot.id}`).set({
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        read: false,
                        screamId: doc.id,
                        type: 'like',
                        createdAt: new Date().toISOString(),
                    })
                }
            })
            .catch((err) => {
                console.error(err)
                res.status(500).json({ error: err.code, })
            })
    })

exports.deleteNotifiOnUnlike = functions.region('asia-east2').firestore.document('likes/{id}')
    .onDelete(snapshot => {
        return adminFirestore.doc(`/notifications/${snapshot.id}`).delete()
            .catch((err) => {
                console.error(err)
                res.status(500).json({ error: err.code, })
            })
    })

exports.createNotifiOnComment = functions.region('asia-east2').firestore.document('comments/{id}')
    .onCreate(async snapshot => {
        try {
            const doc = await adminFirestore.doc(`/screams/${snapshot.data().screamId}`)
                .get()
            if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
                return adminFirestore.doc(`/notifications/${snapshot.id}`).set({
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    read: false,
                    screamId: doc.id,
                    type: 'comment',
                    createdAt: new Date().toISOString(),
                })
            }
        }
        catch (err) {
            console.error(err)
            res.status(500).json({ error: err.code, })
        }
    })

exports.onUserImageChange = functions
    .region('asia-east2')
    .firestore.document('/users/{userId}')
    .onUpdate((change) => {
        const change_bef = change.before.data()
        const change_aft = change.after.data()
        if (change_bef.imageUrl !== change_aft.imageUrl) {
            const batch = adminFirestore.batch()
            return adminFirestore
                .collection('screams')
                .where('userHandle', '==', change_bef.handle)
                .get()
                .then((data) => {
                    data.forEach(doc => {
                        const scream = adminFirestore.doc(`/screams/${doc.id}`)
                        batch.update(scream, { userImage: change_aft.imageUrl })
                    })
                    return batch.commit()
                })
        } else return true
    })

exports.onScreamDelete = functions // DEL scream -> DEL comments, likes & notifications
    .region('asia-east2')
    .firestore.document('/screams/{screamId}')
    .onDelete((snapshot, context) => {
        const screamId = context.params.screamId
        const batch = adminFirestore.batch()
        return adminFirestore
            .collection('comments')
            .where('screamId', '==', screamId)
            .get()
            .then((data) => {
                data.forEach(doc => {
                    batch.delete(adminFirestore.doc(`/comments/${doc.id}`))
                })
                return adminFirestore
                    .collection('likes')
                    .where('screamId', '==', screamId)
                    .get()
            })
            .then((data) => {
                data.forEach(doc => {
                    batch.delete(adminFirestore.doc(`/likes/${doc.id}`))
                })
                return adminFirestore
                    .collection('notifications')
                    .where('screamId', '==', screamId)
                    .get()
            })
            .then((data) => {
                data.forEach(doc => {
                    batch.delete(adminFirestore.doc(`/notifications/${doc.id}`))
                })
                return batch.commit()
            })
            .catch((err) => console.error(err))
    })