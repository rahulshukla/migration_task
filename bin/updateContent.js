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
, createCsvWriter = require('csv-writer').createObjectCsvWriter;

/**
 * 
 */
function updateContentWithItemSet(contentIdentifier, itemSetIdentifier, contentStatus, versionKey) {
    if(constants.access_token_required){
        log(chalk.bold.yellow("Getting Access Token in update content"))
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
            patchContentWithItemset(result.data.access_token, contentIdentifier, itemSetIdentifier, contentStatus, versionKey);
            })
            .catch((err) => {
                log(err)
            })

    } else {
        patchContentWithItemset('', contentIdentifier, itemSetIdentifier, contentStatus, versionKey);

    }
    
  }

  function patchContentWithItemset(access_token, contentIdentifier, itemSetIdentifier, contentStatus, versionKey) {
    log("content id = " + contentIdentifier)
    log("itemsetId id = " + itemSetIdentifier)
    log("contentStatus id = " + contentStatus)
    log("versionKey id = " + versionKey)

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'application/gzip',
            'Authorization': 'Bearer '.concat(access_token)
        }
    }

    const requestBody = {
        "request": {
          "content": {
            "itemSets": [
              {
                "identifier": itemSetIdentifier
              }
            ],
            "versionKey": versionKey
          }
        }
      }

    //   log(JSON.stringify(reqBody))

    axios.patch(constants.kp_content_service_base_path.concat('/content/v3/update/').concat(contentIdentifier) , requestBody, config)
    .then((result) => {
        if( (_.lowerCase(contentStatus)) === 'live' ) {
            log("Content update with item set " + result)
            contentPublish(access_token, contentIdentifier, itemSetIdentifier, contentStatus, versionKey)
        }
    })
    .catch((err) => {
        log("Failed update content with item set " + err)
        failedItemSetToContentReport(contentIdentifier, itemSetIdentifier, contentStatus, versionKey)
        log(chalk.red(err))
    })
  }

  function contentPublish(access_token, contentIdentifier, itemSetIdentifier, contentStatus, versionKey ) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'application/gzip',
            'Authorization': 'Bearer '.concat(access_token)
        }
    }
    const requestBody =   {
        "request": {
          "content": {
            "publisher": "EkStep",
            "lastPublishedBy": "EkStep"
          }
        }
      }

      axios.patch(constants.kp_learning_service_base_path.concat('/content/v3/publish/').concat(contentIdentifier) , requestBody, config).then((result) => {
        log("Content publish" + result)
        updatePublishReport(contentIdentifier, itemSetIdentifier, contentStatus, versionKey,'published')
    })
    .catch((err) => {
        updatePublishReport(contentIdentifier, itemSetIdentifier, contentStatus, versionKey,'failed')
        log(chalk.red(err))
    })
  }


  async function updatePublishReport(contentIdentifier, itemSetIdentifier, contentStatus, versionKey, status) {
   
    const csvWriter = createCsvWriter({
        path: constants.publish_result_csv_file_rath,
        append: true, // Below header will not get added if this property is true, just to make a blank template make it false 
        header: [
            {id: 'contentIdentifier', title: 'contentIdentifier'},
            {id: 'itemSetIdentifier', title: 'itemSetIdentifier'},
            {id: 'contentStatus', title: 'contentStatus'},
            {id: 'versionKey', title: 'versionKey'},
            {id: 'status', title: 'status'},
        ]
    });
    const resultData = [{
            contentIdentifier: contentIdentifier,
            itemSetIdentifier: itemSetIdentifier,
            contentStatus: contentStatus,
            versionKey: versionKey,
            status: status
    }]
    csvWriter.writeRecords(resultData)       // returns a promise
    .then(() => {
        log(chalk.bold.green('Successfully Publish Report generated for ' .concat(contentIdentifier)));
    });
}


async function failedItemSetToContentReport(contentIdentifier, itemSetIdentifier, contentStatus, versionKey) {
   
    const csvWriter = createCsvWriter({
        path: constants.failed_itemset_to_content_result_csv_file_rath,
        append: true, // Below header will not get added if this property is true, just to make a blank template make it false 
        header: [
            {id: 'contentIdentifier', title: 'contentIdentifier'},
            {id: 'itemSetIdentifier', title: 'itemSetIdentifier'},
            {id: 'contentStatus', title: 'contentStatus'},
            {id: 'versionKey', title: 'versionKey'},
            {id: 'status', title: 'status'},
        ]
    });
    const resultData = [{
            contentIdentifier: contentIdentifier,
            itemSetIdentifier: itemSetIdentifier,
            contentStatus: contentStatus,
            versionKey: versionKey,
            status: 'Failed to attach itemset to content'
    }]
    csvWriter.writeRecords(resultData)       // returns a promise
    .then(() => {
        log(chalk.bold.green('Failed Publish Report generated for ' .concat(contentIdentifier)));
    });
}

exports.updateContentWithItemSet = updateContentWithItemSet