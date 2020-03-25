// Get the Auth token based on URL and credentials
const constants = require('./constants')
, axios = require('axios')
, qs = require('querystring')
, perf = require('execution-time')()
const {
    convertArrayToCSV
} = require('convert-array-to-csv')
fs = require('fs')
util = require("util")
chalk = require('chalk')
log = console.log

perf.start();


function generateContentList() {
    getAccessToken()
}

function getAccessToken() {
    log(chalk.bold.yellow("Getting Access Token"))
    const requestBody = {
        client_id: constants.clientId,
        username: constants.username,
        password: constants.password,
        grant_type: constants.grant_type,
    }
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    axios.post(constants.authEndpointUrl, qs.stringify(requestBody), config).then((result) => {
            setAccessToken(result);
        })
        .catch((err) => {
            log(err)
        })
}

function setAccessToken(response) {
    const access_token = response.data.access_token
    getOldQumlContent(access_token)
}

function getOldQumlContent(token) {
    log(chalk.bold.yellow("Searching for QUML version 0.5 content"))
    const requestBody = {
        "request": {
            "filters": {
                "objectType": "AssessmentItem",
                "qumlVersion": ["0.5"]
            }
        }
    };
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'application/gzip',
            'Accept-Charset': 'UTF-8',
            'Authorization': 'Bearer ' + token
        }
    }

    axios.post(constants.apiEndpointUrl + '/composite/v3/search', requestBody, config).then((result) => {
            createCSVFromQuestionData(result.data.result.items)
        })
        .catch((err) => {
            log(chalk.red(err))
        })
}

function createCSVFromQuestionData(questionData) {
    log(chalk.bold.yellow("Creating file for content Id's"))
    var contentIdArray = [];
    questionData.forEach(function(v) {
        contentIdArray.push({
            identifier: v.identifier,
            itemType: v.itemType,
            qumlVersion: v.qumlVersion,
            program: v.program,
            type: v.type,
            objectType: v.objectType,
            board: v.board,
            status: 'Not started'
        })
    });
    const csvFromArrayOfObjects = convertArrayToCSV(contentIdArray);

    const writeFile = util.promisify(fs.writeFile);
    writeFile('./question_ids.csv', csvFromArrayOfObjects, 'utf8').then(() => {
        const results = perf.stop();
        log(chalk.bold.greenBright('File is saved with content ID and ready to process for batch execution'));
        log(chalk.white("Script execution time was " + results.words + " for " + (contentIdArray.length) + " content")); // in milliseconds
    }).catch(error => log(chalk.red('Some error occurred - file either not saved or corrupted file saved.' + error)));;
}

exports.generateContentList = generateContentList;
