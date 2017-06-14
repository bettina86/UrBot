var restify = require('restify');
var builder = require('botbuilder');
var path = require('path');
global.appRoot = path.resolve(__dirname);

// Import bot dialogs
var dialogs = require(path.join(appRoot, '/core/dialogs.js'));

//=========================================================
//
//  Starting up the bot
//
//=========================================================

//Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Create the bot
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.beginDialog('/root');
    },
    function (session, results) {
        session.endConversation("See you!");
    }
]);

// Feed the dialogs to the bot
dialogs.forEach((dialog) => {
    bot.dialog(dialog.key, dialog.value);
});