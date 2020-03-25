const batchRequest = require('batch-request-js')
, path = require('path')
, constants = require( path.join(__dirname, '..', 'constants'))
, axios = require('axios')
, qs = require('querystring')
, fs = require('fs')
, chalk = require('chalk')
, log = console.log
, csvsync = require('csvsync')
, upgradeUtil  = require(path.join(__dirname,  'upgradeQumlQuestion'))

function getDataFromCSV() {
    var csv = fs.readFileSync(constants.csv_file_rath);
    var data = csvsync.parse(csv,{skipHeader: false,
      returnObject: true,});
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
  let customerIds = []
  row.forEach(function (value) {
    customerIds.push(value.identifier)
  });

  const config = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '.concat(access_token)
    }
}

  var API_ENDPOINT =  constants.apiEndpointUrl .concat("/assessment/v3/items/read")

  const request = (customerId) => axios.get(`${API_ENDPOINT}/${customerId}`, config).then(response => {
    upgradeUtil.upgradeQumlQuestion(response.data.result)
  })
  .catch((error) => {
    log(error);
  });

  const {error, data } = await batchRequest(customerIds, request, { batchSize: 50, delay: 200 })

  log(chalk.green(JSON.stringify(data))) 

  log(chalk.red(error)) 
}

getQumlQuestions()