const firebase = require('firebase')

const firebaseConfig = {
    apiKey: process.env,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();


const createEntryForChat = (chatid) => {
    const chat = database.ref(`chats/${chatid}`)
    chat.once('value')
    .then((data) => {
        // console.log(data.exists());
        if(!data.exists()){
            console.log("Create Entry:", chatid);
            chat.set({
                "bans": "[]"
            }).then(()=>{
                console.log("Entry added to db");
            })
        }
    })
}

const storeBannedUserID = (chatid, userid) => {
    const chat = database.ref(`chats/${chatid}/bans/${userid}`)
    chat.set("true")
}

const setAdminChat = async (chatid, adminchatid) => {
    console.log("setAdminChat:", chatid, adminchatid);
    
    let chat = database.ref(`chats/${chatid}/adminchat`)
    await chat.set(adminchatid)

    return true
}

const getAdminChat = async (chatid) => {
    console.log("getAdminChat:", chatid);

    let chat = database.ref(`chats/${chatid}/adminchat`)

    let data = await chat.once('value')
    console.log("AdminChat Exists:", data.exists());
    console.log("AdminChat ID:", data.val());
    return data.val()
}


module.exports = {
    createEntryForChat,
    storeBannedUserID,
    setAdminChat,
    getAdminChat
}