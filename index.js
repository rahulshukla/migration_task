'use strict'
const path = require('path');
const generateList  = require(path.join(__dirname, 'bin', 'getOldContent'))
const updateQumlQuestion  = require(path.join(__dirname, 'bin', 'updateQUMLdata'))
const publishContent  = require(path.join(__dirname, 'bin', 'createItemset'))

const args = require('minimist')(process.argv.slice(2))


switch(args.x) {
    case 'get': // Get content details
        // to generate the list of content which doesn't have itemset attached
        // generateList.generateContentList();
      break;
    case 'update': // update content details
        // fetch QUML version 0.5 version question attached to content and upgrade to QUML 1.0
        updateQumlQuestion.updateQumlQuestion();
      break;
    case 'publish':  // publish content details
        // create Itemset from items/question 
        // update content with itemset
        // publish content if status is live
        publishContent.publishContent();
        break;
    default:
      console.log("\u001B[1m" + "\u001B[33m" +"Nothing to do check the script")
  }







