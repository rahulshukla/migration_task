'use strict'

const path = require('path')

module.exports = {
    /**
     * The const of Authentication end point url.
     *
     * @const {string}
     */
    authEndpointUrl: 'https://dev.sunbirded.org/auth/realms/sunbird/protocol/openid-connect/token',

    /**
     * The const of API end point URL
     *
     * @const {string}
     */
    apiEndpointUrl: 'https://dev.sunbirded.org/action',

    /**
     * The const of client ID
     *
     * @const {string}
     */
    clientId: 'admin-cli',

    /**
     * The const of username
     *
     * @const {string}
     */
    username: 'ntptest103',

    /**
     * The const of Password.
     *
     * @const {string}
     */
    password: 'passowrd',

    /**
     * The const of grant type.
     *
     * @const {string}
     */
    grant_type: 'password',

    /**
     * The input csv file path
     *
     * @const {string}
     */
    csv_file_rath: path.join(__dirname, 'question_ids.csv'),
    /**
     * The output csv file path
     *
     * @const {string}
     */
    result_csv_file_rath: path.join(__dirname, 'results.csv'),
    /**
     * batch size for API request , it executes no of API request concurrently
     *
     * @const {number}
     */
    batch_size: 50,
    /**
     * Time delay between each batch
     *
     * @const {number}
     */
    delay_between_request: 500


}