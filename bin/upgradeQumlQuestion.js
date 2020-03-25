const axios = require('axios')
, qs = require('querystring')
, chalk = require('chalk')
, log = console.log
, _ = require('lodash')
, path = require('path')
, constants = require( path.join(__dirname, '..', 'constants'))



function upgradeQumlQuestion (QumlData) {
    let newEditorState = {};
    newEditorState.options = (_.has(QumlData.assessment_item.editorState, 'options')) ? QumlData.assessment_item.editorState.options : QumlData.assessment_item.options;
    newEditorState.question = (_.has(QumlData.assessment_item.editorState, 'question')) ? QumlData.assessment_item.editorState.question : QumlData.assessment_item.question;
    newEditorState.solutions = (_.has(QumlData.assessment_item.editorState, 'solutions')) ? QumlData.assessment_item.editorState.solutions : QumlData.assessment_item.solutions;
    QumlData.assessment_item.editorState = newEditorState
    // log(((QumlData.assessment_item)))
    getAccessToken(QumlData)
    // patchQuestionForNewVersion(QumlData)
}

function getAccessToken(QumlData) {
    log(chalk.bold.yellow("Getting Access Token to Upgrade"))
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
        patchQuestionForNewVersion(result,QumlData);
        })
        .catch((err) => {
            log(err)
        })
}

function patchQuestionForNewVersion (result,QumlData) {

    let requestBody = {
        "request": {
            "assessment_item": {
            }
        }
    };
    requestBody.request.assessment_item = QumlData.assessment_item;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'application/gzip',
            'Authorization': 'Bearer '.concat(result.data.access_token)
        }
    }

    axios.patch(constants.apiEndpointUrl + '/assessment/v3/items/update/' + QumlData.assessment_item.identifier, requestBody, config).then((result) => {
        updateReport(QumlData,'upgraded')
        console.log(result)
    })
    .catch((err) => {
        updateReport(QumlData,'failed')
        log(chalk.red(err))
    })

}

async function updateReport(QumlData, status) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: constants.result_csv_file_rath,
        append: true,
        header: [
            {id: 'identifier', title: 'identifier'},
            {id: 'itemType', title: 'itemType'},
            {id: 'qumlVersion', title: 'qumlVersion'},
            {id: 'program', title: 'program'},
            {id: 'type', title: 'type'},
            {id: 'objectType', title: 'objectType'},
            {id: 'board', title: 'board'},
            {id: 'status', title: 'status'},
        ]
    });
    const resultData = [{
            identifier: QumlData.assessment_item.identifier,
            itemType: QumlData.assessment_item.itemType,
            qumlVersion: QumlData.assessment_item.qumlVersion,
            program: QumlData.assessment_item.program,
            type: QumlData.assessment_item.type,
            objectType: QumlData.assessment_item.objectType,
            board: QumlData.assessment_item.board,
            status: status
    }]
    csvWriter.writeRecords(resultData)       // returns a promise
    .then(() => {
        console.log('...Done');
    });
}

exports.upgradeQumlQuestion = upgradeQumlQuestion