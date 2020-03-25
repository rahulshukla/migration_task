const path = require('path');
const generateList  = require(path.join(__dirname, 'bin', 'getMigrationData'))
generateList.generateContentList();

