// Include async module by absolute module install path.
var async = require('/usr/local/lib/node_modules/async');

// Specify how many worker execute taks concurrently in the queue.
var worker_number = 2;

// Create the queue object. The first parameter is a function object.
// The second parameter is the worker number that execute task at same time.
var queue = async.queue(function (object,callback) {

    // Get queue start run time.
    var date = new Date();
    var time = date.toTimeString();

    // Print task start info.
    console.log("Start task " + JSON.stringify(object) + " at " + time);

    // Execute function after object.time timeout.
    setTimeout(function () {

        // Get timeout time.
        date = new Date();
        time = date.toTimeString();

        // Print task timeout data.
        console.log("End task " + JSON.stringify(object) + " art " + time);

        callback();
    },object.time)
},worker_number)

// Loop to add object in the queue with prefix 1.
for (var i = 0; i<3; i++) {
    queue.push({name:"1 - " + i,time:(i+1)*1000},function (err) {
        console.log(err);
    })
};

// Loop to add object in the queue with prefix 2.
for (var i = 0; i<3; i++) {
    queue.push({name:"2 - " + i,time:(i+1)*1000},function (err) {
        console.log(err);
    })
};