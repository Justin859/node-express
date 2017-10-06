var cool = require('cool-ascii-faces');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var exphbs = require('express-handlebars');
var sendemail = require('sendemail');
var pg = require('pg');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// express handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// express validate forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add this after the bodyParser middlewares!

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {

  response.render('pages/index');
  
});

app.get('/contact', function(request, response) {

  response.render('pages/contact', {formErrors: false, successMsg: false, user: false})

});

app.post('/contact', function(request, response) {
  request.checkBody('name', 'Invalid name').isAlpha();
  request.checkBody('email', 'Enter an email address').isEmail().withMessage('must be an email'); 
  request.checkBody('query', 'Enter a query').notEmpty(); 
  request.sanitizeBody('name').escape();
  var errors = request.validationErrors();

  var user = { name: request.body.name, email: request.body.email, query: request.body.query};

  if (errors) {
      response.render('pages/contact', {formErrors: errors, successMsg: false, user: user});
      // Render the form using error information
  } else {

  // email

  var email = sendemail.email;

  var person = {
    name : user.name,
    emailAddress : user.email,
    email: 'info@rockworthy.co.za',
    query: user.query,
    subject:"Query from rockworthy.co.za"
  };

  email('welcome', person, function(error, result){
    console.log(' - - - - - - - - - - - - - - - - - - - - -> email sent: ');
    console.log(result);
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
  });

    response.render('pages/contact', {formErrors: false, successMsg: 'Your query has been sent. We will contact you as soon as possible.', user: false});
     // There are no errors so perform action with valid data (e.g. save record).
  }

});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
