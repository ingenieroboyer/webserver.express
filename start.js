//start.js
var spawn = require('child_process').spawn;
py = spawn('python', ['compute_input.py']),
    data = [1, 2, 3, 4, 5, 6, 7, 8, 9],
    dataString = '';


py.stdout.on('data', function(data) {
    dataString += data.toString();
    console.log('estoy aquí');
});
py.stdout.on('end', function() {
    console.log('Sum of numbers=', dataString);
});
py.stdin.write(JSON.stringify(data));
py.stdin.end();

py.on('close', (code) => {
    console.log(`child process exited close with code ${code}`);
});

py.on('error', (code) => {
    console.log(`child process exited error with code ${code}`);
});