var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml');
var builder = require('botbuilder');
var fetch = require('isomorphic-fetch');
var classifier = require(path.join(appRoot, '/core/classifier.js'));
var common = require(path.join(appRoot, '/utils/common.js'));
var sessionHelper = require(path.join(appRoot, '/utils/sessionHelper.js'));

//=========================================================
//
//  Builds the bot Dialogs
//
//=========================================================

//Registered Dialogs
const DIALOG_ROOT = '/root';
const DIALOG_INTERPRETER = '/interpreter';
const DIALOG_RESPOND = '/respond';
const DIALOG_PROMPT = '/prompt';
const DIALOG_FETCHAPI = '/fetchAPI';

var dialogRoot = [
    (session) => { //base dialog, only shown when bot is started
        var rootSource = yaml.safeLoad(fs.readFileSync(path.join(appRoot, '/yaml/root.yml'), 'utf8')); //Load root dialog from YAML

        session.dialogData.interaction = rootSource.dialog;

        session.beginDialog('/' + session.dialogData.interaction.event, session.dialogData.interaction); //redirects to another dialog        
    },
    (session) => {
        session.beginDialog(DIALOG_INTERPRETER);
    }
];

var dialogInterpreter = [
    (session) => { //Prompts user
        builder.Prompts.text(session, 'What do you wanna talk about?')
    },
    (session, results) => {
        
        var node_name;

        var classifications = classifier.classifier.getClassifications(results.response);
        
        if (classifications[0].value < classifier.trust) { //If natural-node is not at least x% certain, do not carry on
            node_name = "error"; //show "I didnt understand" message
        } else {
            node_name = classifier.classifier.classify(results.response);
        }

        session.dialogData.interaction = classifier.nodes[node_name].interaction;

        session.beginDialog('/' + session.dialogData.interaction.event, session.dialogData.interaction);        
    },
    (session) => {
        session.beginDialog(DIALOG_INTERPRETER);
    }
];

var dialogRespond = [
    (session, args) => { 
        session.dialogData.interaction = args;

        if (session.dialogData.interaction.type == 'block') { // Shows all messages, one after another
            session.dialogData.interaction.message.forEach((message) => {  
                sessionHelper.sendMessageToUser(session, session.dialogData.interaction, message);
            });
        } else if (session.dialogData.interaction.type == 'random') { // Picks a random message to send
            var message = session.dialogData.interaction.message[Math.floor(Math.random() * session.dialogData.interaction.message.length)];

            sessionHelper.sendMessageToUser(session, session.dialogData.interaction, message);
        }

        session.endDialog();
    }
];

var dialogPrompt = [
    (session, args) => { //Prompts user
        session.dialogData.interaction = args;
        builder.Prompts.text(session, session.dialogData.interaction.message[0]);
    },
    (session, results) => {        
        session.dialogData.interaction.value = results.response;        
        session.beginDialog('/' + session.dialogData.interaction.type, session.dialogData.interaction);
    },
    (session, args, next) => {
        if (session.dialogData.interaction.repeat == true)
            next();
        else
            session.endDialog();
    },
    (session) => {
        builder.Prompts.confirm(session, 'Do you want to do that again?');
    },
    (session, results) => {
        if (results.response == true)
            session.replaceDialog(DIALOG_PROMPT, session.dialogData.interaction);
        else
            session.endDialog();
    }
];

var dialogFetchAPI = [
    (session, args) => {
        session.dialogData.interaction = args;

        var endpoint = common.applyVariable(session.dialogData.interaction.url, 
                                            'value', 
                                            session.dialogData.interaction.value);
        
        endpoint = endpoint.replace(/ /g, '');
        
        fetch(endpoint)
        .then((response) => {
            response.text()
            .then((message) => {
                sessionHelper.sendMessageToUser(session, session.dialogData.interaction, message);

                session.endDialog();
            });            
        });
    }
];

var dialogs = [
    {
        key: DIALOG_ROOT,
        value: dialogRoot
    },
    {
        key: DIALOG_INTERPRETER,
        value: dialogInterpreter
    },
    {
        key: DIALOG_RESPOND,
        value: dialogRespond
    },
    {
        key: DIALOG_PROMPT,
        value: dialogPrompt
    },
    {
        key: DIALOG_FETCHAPI,
        value: dialogFetchAPI
    },
]

module.exports = dialogs;