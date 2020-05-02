const {
    getAdminChat
} = require("./db")

const sendMessageToAdminChat = async (ctx, telegram) => {
    let chatid = ctx.chat.id
    let userid = ctx.from.id
    let grpName = ctx.chat.title
    let fileName = ctx.message.document.file_name
    console.log("sendMessageToAdminChat:", { chatid, userid, grpName, fileName });
    
    let adminchatid = await getAdminChat(chatid);
    console.log({adminchatid});

    if(!adminchatid)
        return

    let message = `=> Possible Exe Spam\n\nUserID: ${userid}\nGroup: ${grpName}\nFile: ${fileName}\n`    
    try{
        await telegram.sendMessage(adminchatid, message)
    }
    catch(e) {
        console.log("Error send message to admin:", e);
    }
}

module.exports = {
    sendMessageToAdminChat
}