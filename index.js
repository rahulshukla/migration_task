'use strict'
const path = require('path');
const generateList  = require(path.join(__dirname, 'bin', 'getMigrationData'))
const upgradeQumlQuestion  = require(path.join(__dirname, 'bin', 'updateQUMLdata'))

// generateList.generateContentList();

upgradeQumlQuestion.updateQumlQuestion();

