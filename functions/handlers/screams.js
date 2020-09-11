const { adminFirestore } = require('../util/admin')

exports.getAllScreams = (req, res) => {
    adminFirestore
        .collection('screams')
        .orderBy('createdAt', 'desc') //Vì có orderBy('createdAt') nên khi tạo scream direct bằng FB thì phải create field 'createdAt'
        .get()
        .then((data) => {
            let screams = []
            data.forEach((doc) => {
                const { body, userHandle, createdAt, commentCount, likeCount, userImage } = doc.data()
                screams.push({
                    screamId: doc.id,
                    body: body,
                    userHandle: userHandle,
                    createdAt: createdAt,
                    commentCount: commentCount,
                    likeCount: likeCount,
                    userImage: userImage,
                })
            })
            return res.json(screams)
        })
        .catch((err) => console.error(err))
}

// exports.post1Scream = functions.https.onRequest((req, res) => {
//     if (req.method !== 'POST') {
//         return res.status(400).json({ error: 'method not allowed', })
//     }
//     // nội dung giống hàm dưới
// })
exports.post1Scream = (req, res) => {
    const { body } = req.body
    if (body.trim() === '') {
        return res.status(400).json({ body: 'Scream body must not be empty' })
    }
    const { handle, imageUrl } = req.user
    const newScream = {
        body: body,
        userHandle: handle,
        userImage: imageUrl,
        // createdAt: admin.firestore.Timestamp.fromDate(new Date()),
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
    }
    adminFirestore
        .collection('screams')
        .add(newScream)
        .then((doc) => {
            const resScream = newScream
            resScream.screamId = doc.id
            res.json(resScream)
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong', })
            console.error(err)
        })
}

// {
//     body: "scream 20200717 15:15",
//     userHandle: "newuser",
//     createdAt: "2020-07-17T06:16:19.509Z",
//     screamId: "fvxGSDbmbUxiKxTe4MiM",
//     comments: [
//         {
//             body: "cmt 2nd",
//             screamId: "fvxGSDbmbUxiKxTe4MiM",
//             createdAt: "2020-07-17T12:59:52.798Z",
//             userHandle: "newuser"
//         },
//         {
//             screamId: "fvxGSDbmbUxiKxTe4MiM",
//             createdAt: "2020-07-17T10:59:52.798Z",
//             body: "wondeful scream",
//             userHandle: "newuser"
//         }
//     ]
// }
exports.get1Scream = (req, res) => {
    let screamData = {}
    adminFirestore
        .doc(`/screams/${req.params.screamId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                res.status(404).json({ error: 'Scream not found' })
            }
            screamData = doc.data()
            screamData.screamId = doc.id
            return adminFirestore.collection('comments')
                .orderBy('createdAt', 'desc')
                .where('screamId', '==', req.params.screamId)
                .get()
        })
        .then((data) => {
            screamData.comments = []
            data.forEach((doc) => {
                screamData.comments.push(doc.data())
            })
            return res.json(screamData)
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })
}

exports.cmtOnScream = (req, res) => {
    const { body } = req.body
    if (body.trim() === '') {
        return res.status(400).json({ comment: 'Scream body must not be empty' })
    }
    const { handle, imageUrl } = req.user
    const newCmt = {
        body: body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        userHandle: handle,
        userImage: imageUrl,
    }
    adminFirestore
        .doc(`/screams/${req.params.screamId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                res.status(404).json({ error: 'Scream not found' })
            }
            return doc.ref.update({
                commentCount: doc.data().commentCount + 1
            })
        })
        .then(() => {
            return adminFirestore.collection('comments')
                .add(newCmt)
        })
        .then(() => {
            return res.json(newCmt)
        })
        .catch((err) => {
            console.error(err)
            res.status(500).json({ error: 'something went wrong', })
        })
}

exports.likeScream = (req, res) => {
    const { handle } = req.user
    const { screamId } = req.params
    const likeDoc = adminFirestore.collection('likes').where('userHandle', '==', handle)
        .where('screamId', '==', screamId).limit(1)
    const screamDoc = adminFirestore.doc(`/screams/${screamId}`)
    let screamData
    screamDoc.get()
        .then(doc => {
            if (doc.exists) {
                screamData = doc.data()
                screamData.screamId = doc.id
                return likeDoc.get()
            } else {
                return (
                    res.status(404).json({ error: 'Scream not found' }),
                    process.exit()
                )
            }
        })
        .then(data => { //likeDoc.get()
            if (data.empty) {
                return adminFirestore.collection('likes').add({ //INS record into 'likes'
                    screamId: screamId,
                    userHandle: handle,
                })
                    .then(() => {
                        screamData.likeCount++
                        //UPD 'screams.likeCount'
                        return screamDoc.update({ likeCount: screamData.likeCount })
                    })
                    .then(() => {
                        return res.json(screamData)
                    })
            } else {
                return (
                    res.status(404).json({ error: 'Scream already liked' }),
                    process.exit()
                )
            }
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code, })
        })
}

exports.unlikeScream = (req, res) => {
    const { handle } = req.user
    const { screamId } = req.params
    const likeDoc = adminFirestore.collection('likes').where('userHandle', '==', handle)
        .where('screamId', '==', screamId).limit(1)
    const screamDoc = adminFirestore.doc(`/screams/${screamId}`)
    let screamData
    screamDoc.get()
        .then(doc => {
            if (doc.exists) {
                screamData = doc.data()
                screamData.screamId = doc.id
                return likeDoc.get()
            } else {
                return (
                    res.status(404).json({ error: 'Scream not found' }),
                    process.exit()
                )
            }
        })
        .then(data => { //likeDoc.get()
            if (data.empty) {
                return res.status(400).json({ error: 'Scream NOT liked' })
            } else {
                return adminFirestore.doc(`/likes/${data.docs[0].id}`).delete() //DELETE record from 'likes'
                    .then(() => {
                        screamData.likeCount--
                        //UPD 'screams.likeCount'
                        return screamDoc.update({ likeCount: screamData.likeCount })
                    })
                    .then(() => {
                        return res.json(screamData)
                    })
            }
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code, })
        })
}

exports.deleteScream = (req, res) => {
    const document = adminFirestore.doc(`/screams/${req.params.screamId}`)
    document.get()
        .then(doc => {
            if (!doc.exists) {
                return (
                    res.status(404).json({ error: 'Scream not found' }),
                    process.exit()
                )
            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({ error: 'Unauthorized' })
            } else {
                return document.delete()
            }
        })
        .then(() => {
            return res.json({ message: 'Scream deleted successfully' })
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })
}


