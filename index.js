const  app = require('express')();
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios')
let covid
const { getCode, getName } = require('country-list');
const port = 4000 || process.env.PORT

app.get('/health',(req,res)=>{
    res.json({
        'status': 200,
        'message': "online"
    })
})
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_KEY;
// Create a bot that uses 'polling' to fetch new updates
let covidFunc = async(code)=>{
    try {
    covid = await axios.get(`http://covid19.soficoop.com/country/${code}`)
    if(covid.data === null){
        let getCountryCode = getCode(code)
        covid = await axios.get(`http://covid19.soficoop.com/country/${getCountryCode}`)
        // console.log(getCountryCode)
        // if(covid.data === null){
        //     bot.sendMessage(chatId, `Sorry ${msg.chat.first_name}, I can't seem to find that country`);

        // }
    }
    // console.log(covid.data)
    } catch (error) {
        console.log(error)
    }
    return covid
}
const bot = new TelegramBot(token, {polling: true});
bot.on("polling_error", (err) => console.log(err));
bot.on('message', async (msg) => {
    if(msg.text === "/start"){
        bot.sendMessage(msg.chat.id, `Welcome ${msg.chat.first_name}, Tell me the Name or Code of a country e.g (Nigeria or NG), and I'll in turn give the Covid-19 status of the country`);
    }else{
    try {
        const chatId = msg.chat.id;
        
// console.log(msg);
    // send a message to the chat acknowledging receipt of their message
    let response = await covidFunc(msg.text)
    if(response.data === null){
            bot.sendMessage(chatId, `Sorry ${msg.chat.first_name}, I can't seem to find that country, are You from Mars?`);

        }else{
    console.log(response.data)
    let name = response.data.name
    response = response.data.snapshots
    response = response[response.length-1]
    // console.log(response[response.length-1])
    // bot.sendMessage(chatId, `Received your message ${msg.chat.first_name}, Please wait a minute`);
    bot.sendMessage(chatId, `name: ${name}
Cases: ${response.cases}
Today's Cases: ${response.todayCases}
Daths: ${response.deaths}
Today's Deaths: ${response.todayDeaths}
Recovered: ${response.recovered}
Active: ${response.active}
Critical: ${response.critical}
Timestamp: ${response.timestamp}`);
    bot.sendPhoto(chatId,'https://image.shutterstock.com/z/stock-photo-dice-form-the-expression-stay-home-stay-safe-1676267707.jpg')
    // bot.sendMessage(chatId, `cases: ${response.cases}`);
    // bot.sendMessage(chatId, `today's Cases: ${response.todayCases}`);
    // bot.sendMessage(chatId, `deaths: ${response.deaths}`);
    // bot.sendMessage(chatId, `today's Deaths: ${response.todayDeaths}`);
    // bot.sendMessage(chatId, `recovered: ${response.recovered}`);
    // bot.sendMessage(chatId, `active: ${response.active}`);
    // bot.sendMessage(chatId, `critical: ${response.critical}`);
    // bot.sendMessage(chatId, `timestamp: ${response.timestamp}`);
    // bot.sendMessage(chatId, JSON.stringify(response[response.length-1]));
        }
    } catch (error) {
        console.log(error)
        bot.sendMessage(chatId, `error: ${error}`);
    }
}
    
});
app.listen(port,()=>{
    console.log("listening............")
});