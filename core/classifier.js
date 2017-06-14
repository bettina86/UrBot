var natural = require('natural');
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

//=========================================================
//
//  Builds NaturalNode's classifier class
//
//=========================================================

var nodes = {}; //every chat "category"
var classifier = new natural.LogisticRegressionClassifier(); //from natural-node, does the magic
var interactionsSource = yaml.safeLoad(fs.readFileSync(path.join(appRoot, '/yaml/interactions.yml'), 'utf8')); //load and convert YAML to a Javascript object.

//=========================================================
// Feed natural node classifier
//=========================================================
interactionsSource.interactions.forEach(function(interaction) { //foreach registered interaction
    var node = interaction.node; //the "categories" themselves
    var classifiers = interaction.classifiers; //the strings used to classify

    nodes[node.name] = { interaction: interaction };

    if (classifiers != undefined) {
        return classifiers.forEach(function(doc) { //foreach classifier
            return classifier.addDocument(doc, node.name); //add to natural-node's magic class
        });
    }
});

classifier.train(); //makes natural-node's classifier understand the data it just received

var classifier = {
    classifier: classifier,
    nodes: nodes,
    trust: interactionsSource.trust
}

module.exports = classifier;