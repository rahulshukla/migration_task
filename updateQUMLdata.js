const batchRequest = require('batch-request-js')
const constants = require('./constants')
axios = require('axios')
qs = require('querystring')
fs = require('fs')
util = require('util')
chalk = require('chalk')
log = console.log
var csvsync = require('csvsync');

function getDataFromCSV() {
    var csv = fs.readFileSync('./question_ids.csv');
    var data = csvsync.parse(csv,{skipHeader: false,
      returnObject: true,});
    return data
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
    getCustomers(result.data.access_token);
      })
      .catch((err) => {
          log(err)
      })
}

async function getCustomers (access_token) {
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
    // If request is good...
    // console.log(response.data.result.assessment_item.identifier);
    console.log(response.data);
  })
  .catch((error) => {
    log(error);
  });



  // fetch customers in batches of 100, delaying 200ms inbetween each batch request
  const {error, data } = await batchRequest(customerIds, request, { batchSize: 50, delay: 200 })

  // Data from successful requests
  log(chalk.green(JSON.stringify(data))) // [{ customerId: '100', ... }, ...]

  // Failed requests
  log(chalk.red(error)) // [{ record: "101", error: [Error: Customer not found] }, ...]
}


// getAccessToken()
getAccessToken()