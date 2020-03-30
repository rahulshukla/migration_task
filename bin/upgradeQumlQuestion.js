'use strict'
const axios = require('axios')
, qs = require('querystring')
, chalk = require('chalk')
, log = console.log
, _ = require('lodash')
, path = require('path')
, constants = require( path.join(__dirname, '..', 'constants'))
, createCsvWriter = require('csv-writer').createObjectCsvWriter;



function upgradeQumlQuestion (QumlData) {

    const options = (_.has(QumlData.assessment_item, 'options')) ? QumlData.assessment_item.options : []
    const question = (_.has(QumlData.assessment_item, 'question')) ? QumlData.assessment_item.question : ''
    const solutions = (_.has(QumlData.assessment_item, 'solutions')) ? QumlData.assessment_item.solutions : []

    let newEditorState = {};
    newEditorState.options = (_.has(QumlData.assessment_item.editorState, 'options')) ? QumlData.assessment_item.editorState.options : options;
    newEditorState.question = (_.has(QumlData.assessment_item.editorState, 'question')) ? QumlData.assessment_item.editorState.question : question;
    newEditorState.solutions = (_.has(QumlData.assessment_item.editorState, 'solutions')) ? QumlData.assessment_item.editorState.solutions : solutions;
    QumlData.assessment_item.editorState = newEditorState

    // Adding response declaration in MCQ
    if(_.lowerCase(QumlData.assessment_item.category) === "mcq"){
        let resDecl =  {
            "responseValue": {
                "cardinality": "single",
                "type": "integer",
                "correct_response": {
                    "value": _.findIndex(QumlData.assessment_item.options, {"answer": true})
                }
            }
        }
        _.set(QumlData.assessment_item,'responseDeclaration',resDecl)

    // Adding response declaration in VSA and SA
    } else if ( (_.lowerCase(QumlData.assessment_item.category) === "vsa") || (_.lowerCase(QumlData.assessment_item.category) === "sa")){
        let resDecl =  {
            "responseValue": {
                "cardinality": "single",
                "type": "string",
                "correct_response": {
                    "value": _.toString(QumlData.assessment_item.solutions)
                }
            }
        }
        _.set(QumlData.assessment_item,'responseDeclaration',resDecl)
    }
    getAccessToken(QumlData)
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
    const objectType = (_.has(QumlData.assessment_item, 'objectType')) ? QumlData.assessment_item.objectType : 'AssessmentItem'
    let requestBody = {
        "request": {
            "assessment_item": {
                "objectType": objectType,
                "metadata": {}
            }
        }
    };
    requestBody.request.assessment_item.metadata = QumlData.assessment_item;

    // log(JSON.stringify(requestBody));
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'application/gzip',
            'Authorization': 'Bearer '.concat(result.data.access_token)
        }
    }

    axios.patch(constants.apiEndpointUrl.concat('/assessment/v3/items/update/').concat(QumlData.assessment_item.identifier) , requestBody, config).then((result) => {
        updateReport(QumlData,'upgraded')
        // console.log(result)
        // log(QumlData)
    })
    .catch((err) => {
        updateReport(QumlData,'failed')
        log(chalk.red(err))
    })

}

async function updateReport(QumlData, status) {
   
    const csvWriter = createCsvWriter({
        path: constants.result_csv_file_rath,
        append: true, // Below header will not get added if this property is true, just to make a blank template make it false 
        header: [
            {id: 'identifier', title: 'identifier'},
            {id: 'itemType', title: 'itemType'},
            {id: 'qumlVersion', title: 'qumlVersion'},
            {id: 'program', title: 'program'},
            {id: 'type', title: 'type'},
            {id: 'category', title:'category'},
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
        log(chalk.bold.green('Report generated for ' .concat(QumlData.assessment_item.identifier)));
    });
}

exports.upgradeQumlQuestion = upgradeQumlQuestion