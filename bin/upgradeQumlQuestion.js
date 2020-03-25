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
        // createCSVFromQuestionData(result.data.result.items)
        console.log(result)
    })
    .catch((err) => {
        log(chalk.red(err))
    })

}

exports.upgradeQumlQuestion = upgradeQumlQuestion