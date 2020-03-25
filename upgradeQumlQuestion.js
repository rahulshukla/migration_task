const batchRequest = require('batch-request-js')
const constants = require('./constants')
axios = require('axios')
qs = require('querystring')
fs = require('fs')
util = require('util')
chalk = require('chalk')
log = console.log
const csvsync = require('csvsync');
const _ = require('lodash');


function upgradeQumlQuestion(QumlData) {
    let newEditorState = {};
    newEditorState.options = (_.has(QumlData.assessment_item.editorState, 'options')) ? QumlData.assessment_item.editorState.options : QumlData.assessment_item.options;
    newEditorState.question = (_.has(QumlData.assessment_item.editorState, 'question')) ? QumlData.assessment_item.editorState.question : QumlData.assessment_item.question;
    newEditorState.solutions = (_.has(QumlData.assessment_item.editorState, 'solutions')) ? QumlData.assessment_item.editorState.solutions : QumlData.assessment_item.solutions;
    QumlData.assessment_item.editorState = newEditorState
    log(((QumlData.assessment_item)))
}

exports.upgradeQumlQuestion = upgradeQumlQuestion