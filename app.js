const { Telegraf } = require('telegraf')
require("dotenv").config()

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

bot.use((ctx, next) => {
    console.log("Msg:",ctx.message.text);
    next()
})


bot.start((ctx) => ctx.reply('I shall kill exe spammers :)'))

bot.use((ctx, next) => {
    if(!ctx.message.document)
        return next();

    let docName = ctx.message.document.file_name;
    let extension = docName.split(".")
    extension = extension[extension.length-1]
    if(extension === "exe"){
        // Ban user
        // ctx.reply("Will ban")
        if(ctx.message.isAdmin){
            ctx.reply(`Exe spam detected, kicking user.\nUser Name: ${ctx.message.from.first_name}\nUser ID: ${ctx.message.from.id}`)

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


bot.launch()
