const db = {
    users: [
        {
            userId: 'B00jLf4u9KPcbfjT2nnr0RQXQ5w2',
            email: 'newuser@email.com',
            handle: 'user',
            createdAt: '2019-03-15T10:59:52.798Z',
            imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
            bio: 'Hello, my name is user, nice to meet you',
            website: 'https://user.com',
            location: 'Lonodn, UK'
        }
    ],
    screams: [{
        body: 'this is the scream body',
        userHandle: 'user',
        userImage: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
        createdAt: '2020-07-15T15:24:35.380Z',
        likeCount: 5,
        commentCount: 2,
    }],
    comments: [
        {
            userHandle: 'user',
            screamId: 'kdjsfgdksuufhgkdsufky',
            body: 'nice one mate!',
            createdAt: '2019-03-15T10:59:52.798Z'
        }
    ],
    notifications: [
        {
            recipient: 'user',
            sender: 'john',
            read: 'true | false',
            screamId: 'kdjsfgdksuufhgkdsufky',
            type: 'like | comment',
            createdAt: '2019-03-15T10:59:52.798Z'
        }
    ],
}

//getAuthenUserDetails()
const userDetails = {
    // Redux data
    credentials: {
        userId: 'B00jLf4u9KPcbfjT2nnr0RQXQ5w2',
        email: 'newuser@email.com',
        handle: 'user',
        createdAt: '2019-03-15T10:59:52.798Z',
        imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
        bio: 'Hello, my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'Lonodn, UK'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'hh7O5oWfWucVzGbHH2pa'
        },
        {
            userHandle: 'user',
            screamId: '3IOnFoQexRcofs5OhBXO'
        }
    ]
}