'use strict'
const batchRequest = require('batch-request-js')
, path = require('path')
, constants = require( path.join(__dirname, '..', 'constants'))
, axios = require('axios')
, qs = require('querystring')
, fs = require('fs')
, chalk = require('chalk')
, log = console.log
, csvsync = require('csvsync')
, _ = require('lodash')
, { v4: uuidv4 } = require('uuid')
, updateContent  = require(path.join(__dirname,  'updateContent'))
, createCsvWriter = require('csv-writer').createObjectCsvWriter;

function getDataFromCSV() {
    var csv = fs.readFileSync(constants.content_csv_file_rath);
    var data = csvsync.parse(csv,{skipHeader: false,
      returnObject: true,});
    //   log(data)
    return data
    
}

function getQumlQuestions() {
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
    getQumlInBatch(result.data.access_token);
      })
      .catch((err) => {
          log(err)
      })
}

async function getQumlInBatch (access_token) {
  var row =getDataFromCSV()
  var questionIdObjForItemset = []
  row.forEach(function (value) {
    let arrayOfQuestions = _.split(value.questions,',')
    value.questions = arrayOfQuestions
  });
   row.forEach(function(value){
        let questions = value.questions
        questions.forEach(function(value){
            questionIdObjForItemset.push({'identifier': value })
        })
        
          const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '.concat(access_token)
            }
          }
          let requestBody = {
            "request": {
                "itemset": {
                    "code": uuidv4(),
                    "name": value.name,
                    "description": value.name,
                    "language": _.split(value.language),
                    "owner": value.author,
                    "items": questionIdObjForItemset
                }
            }
        }

        // log(JSON.stringify(requestBody))
          const API_ENDPOINT =  constants.apiEndpointUrl .concat("/itemset/v3/create")
        //    log(API_ENDPOINT) 
          axios.post(API_ENDPOINT, requestBody, config).then((result) => {
              log(result)
            updateContent.updateContentWithItemSet(value.identifier, result.data.result.identifier, value.status, value.versionKey )
            }).catch((err) => {
                failedItemSetToContentReport(value)
                log(chalk.red(err))
            })
   })

}

async function failedItemSetToContentReport(value) {
    const csvWriter = createCsvWriter({
        path: constants.failed_itemset_creation_result_csv_file_rath,
        append: true, // Below header will not get added if this property is true, just to make a blank template make it false 
        header: [
            {id: 'identifier', title: 'contentIdentifier'},
            {id: 'questions', title: 'itemSetIdentifier'},
            {id: 'program', title: 'contentStatus'},
            {id: 'objectType', title: 'versionKey'},
            {id: 'resourceType', title: 'resourceType'},
        ]
    });
    const resultData = [{
        identifier: value.contentIdentifier,
        questions: value.itemSetIdentifier,
        program: value.contentStatus,
        objectType: value.versionKey,
        resourceType: value.resourceType,
        status: 'Failed to create itemset'
    }]
    csvWriter.writeRecords(resultData)       // returns a promise
    .then(() => {
        log(chalk.bold.green('Itemset creation failed Report generated for ' .concat(contentIdentifier)));
    });
}

// getQumlQuestions()

exports.publishContent = getQumlQuestions;