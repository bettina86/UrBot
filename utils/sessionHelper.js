var builder = require('botbuilder');

var sessionHelper = {};

sessionHelper.sendMessageToUser = function (session, interaction, content) {
    switch (interaction.resultType) {
        case 'message':
            session.send(content);
            session.delay(content.length * 50);
            break;
        case 'herocard':
            var card = new builder.HeroCard(session);
            if (interaction.resultArgs) {
                card.text(content);
                if (interaction.resultArgs.title)
                    card.title(interaction.resultArgs.title);
                if (interaction.resultArgs.subtitle)
                    card.subtitle(interaction.resultArgs.subtitle);
                if (interaction.resultArgs.image)
                    card.images([builder.CardImage.create(session, interaction.resultArgs.image)]);
            }

            var message = new builder.Message(session);
            message.attachments([card]);
            session.send(message);
            session.delay(content.length * 50);
    }
}

module.exports = sessionHelper;