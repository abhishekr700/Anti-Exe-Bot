const { Telegraf } = require('telegraf')
require("dotenv").config()

const {
    createEntryForChat,
    storeBannedUserID,
    setAdminChat,
} = require("./db")

const {
    sendMessageToAdminChat,
    sendHelp
} = require("./helpers")

const bot = new Telegraf(process.env.BOT_TOKEN)
const Telegram = require('telegraf/telegram')
const telegram = new Telegram(process.env.BOT_TOKEN)


bot.use(async (ctx, next) => {
    if(!ctx.message){
        console.log("No Message field", ctx);
        return;
    }
    if(!ctx.message.chat){
        console.log("Not in a group");
        return next()
    }
    let data = await telegram.getChatMember(ctx.message.chat.id, process.env.BOT_ID)
    // console.log(data);

    ctx.message.isAdmin = (data.status === 'administrator')
    next()
})

bot.use((ctx,next) => {
    createEntryForChat(ctx.chat.id)
    // storeBannedUserID(ctx.chat.id, ctx.from.id)
    // sendMessageToAdminChat(ctx, telegram)

    next()
})

bot.use((ctx, next) => {
    console.log("Msg:",ctx.message.text,"ChatName:",ctx.chat.title, "ChatUsername:", ctx.chat.username, "ChatID:", ctx.chat.id);
    next()
})


bot.start((ctx) => {
    ctx.reply('Anti Exe Spam Bot\n\nI will kick anyone who shares a exe file here(and delete the message too). Exe files are not safe !\nAlso, I need admin privileges to kick users & delete messages.')
    sendHelp(ctx)
})

bot.help(ctx => sendHelp(ctx))

// Usage: /setadmin 123456
bot.command("setadmin", async (ctx) => {
    console.log("setadmin", ctx.message);
    let adminChatid = ctx.message.text.split(" ")[1]
    // console.log(adminChatid);

    ctx.getChatMember(ctx.from.id)
    .then((user) =>{
        console.log("UserStatus:",user.status);
        if(user.status === 'administrator')
            return setAdminChat(ctx.chat.id, adminChatid)
        
        return false 
    })
    .then((resp)=>{
        if(resp)
            ctx.reply("Admin Chat Set !")
        else{
            ctx.reply("You are not admin !")
        }
    })
    // .catch()
})

bot.use((ctx, next) => {
    if(!ctx.message.document)
        return next();

    let docName = ctx.message.document.file_name;
    let extension = docName.split(".")
    extension = extension[extension.length-1]
    if(extension === "exe"){
        // Ban user
        // ctx.reply("Will ban")
        ctx.reply(`Exe spam detected, kicking user.\nUser Name: ${ctx.message.from.first_name}\nUser ID: ${ctx.message.from.id}`)

        storeBannedUserID(ctx.chat.id, ctx.from.id)
        sendMessageToAdminChat(ctx, telegram)

        if(ctx.message.isAdmin){

            telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
            .catch((err) => {
                console.log("Cannot Delete Message:", err);
            })
            
            telegram.kickChatMember(ctx.message.chat.id, ctx.message.from.id)
            .catch((err) => {
                console.log("Cannot Kick User:",err);
            })
           
        } else {
            ctx.reply("I have to be a admin in this group to kick people out.")
        }
    }

    next();
})


bot.launch().then(() => console.log("Bot started"));

