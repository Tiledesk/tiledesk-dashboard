  
//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));

app.get('/*', function(req,res) {
    console.log("other res");   
    res.sendFile(path.join(__dirname,'/dist/index.html'));
});

// Start the app by listening on the default Heroku port
var listener = app.listen(process.env.PORT || 4500, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 4500
});