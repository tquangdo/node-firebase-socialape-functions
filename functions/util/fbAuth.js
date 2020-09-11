const { admin, adminFirestore } = require('./admin')

module.exports = (req, res, next) => {
    let idToken
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer ')) {
        idToken = authorization.split('Bearer ')[1]
    } else {
        console.error('No token found')
        return res.status(403).json({ error: 'Unauthorized', })
    }
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken //req.user = {id, handle,}
            return adminFirestore.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            const { handle, imageUrl } = data.docs[0].data()
            req.user.handle = handle//FB console > DB "users.user.handle"
            req.user.imageUrl = imageUrl
            return next()
        })
        .catch((err) => {
            console.error('Error while verifying token: ', err)
            return res.status(403).json(err)
        })
}