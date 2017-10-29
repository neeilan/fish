module.exports = {
    db: {
        url : process.env.MONGODB_URI || 'mongodb://mongo/lovejoy'
    },
    session : {
        secret : 'mycrazysecritmycrazysecritmycrazysecritmy0crazysecrit'
    },
    port : 3000
}
