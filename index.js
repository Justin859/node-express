var cool = require('cool-ascii-faces');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var exphbs = require('express-handlebars');
var sendemail = require('sendemail');
var graph = require('fbgraph');
var moment = require('moment');
var pg = require('pg');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// facebook graph
 graph.get("oauth/access_token?client_id=" + process.env.FACEBOOK_API_ID + "&client_secret=" + process.env.FACEBOOK_APP_SECRET  + "&grant_type=client_credentials", function(error, response) {
  graph.setAccessToken(response['access_token']);
})

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

var dateNow = moment().format("MM-DD-YYYY");
var weekDay = moment().weekday();

if (weekDay == 4 || weekDay == 1 || weekDay == 2 || weekDay == 3) {
  var weekend_start = moment(moment(dateNow).add(4-weekDay, 'days')).format("MM-DD-YYYY");;
  var weekend_stop = moment(moment(weekend_start).add(2, 'days')).format("MM-DD-YYYY");;
  var mid_weekend = moment(moment(weekend_start).add(1, 'days')).format("MM-DD-YYYY");;
} else if (weekDay == 5) {
  var weekend_start = moment().format("MM-DD-YYYY");
  var weekend_stop = moment(moment().add(2, 'days')).format("MM-DD-YYYY");
  var mid_weekend = moment(moment().add(1, 'days')).format("MM-DD-YYYY"); 
} else if (weekDay == 6) {
  var weekend_start = false;
  var weekend_stop = moment(moment().add(1, 'days')).format("MM-DD-YYYY");
  var mid_weekend = dateNow
} else {
  var weekend_start = dateNow
  var weekend_stop = false;
  var mid_weekend = false;
}

app.get('/', function(request, response) {
  
    var batchArray = []
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('SELECT * FROM event_hosts', function(err, result) {
        done();
        if (err)
         { console.error(err); response.send("Error " + err); }
        else
         { 
           
           for (i=0; i < result.rows.length; i++) {
             batchArray.push(
               {
                 method: "GET",
                 relative_url: result.rows[i].host_id + "/?fields=events{cover,name,attending_count,ticket_uri,interested_count,start_time,end_time,place}"
               }
             )
           }
           graph.batch(
            batchArray,
             function(error, res) {
            var data = [];
            var events = [];
            if (error) {
              console.log(error);
              res.render('pages/index', {events: "error", moment: moment, dateNow: dateNow, weekDay: weekDay, weekend_start: weekend_start, mid_weekend: mid_weekend, weekend_stop: weekend_stop});
            } else {
              for (var i=0; i< res.length; i++) {
                data.push(JSON.parse(res[i]['body'])['events']['data']);
              }
              for(var i = 0; i < data.length; i++)
              {
                  events = events.concat(data[i]);
              }
              events = events.sort(function(a, b) {
                if (a['attending_count'] > b['attending_count']) {
                  return -1;
                } else if ( a['attending_count'] < b['attending_count']) {
                  return +1;
                }
                return 0
              })
              
              response.render('pages/index', {events: events, moment: moment, dateNow: dateNow, weekDay: weekDay, weekend_start: weekend_start, mid_weekend: mid_weekend, weekend_stop: weekend_stop});
            }
        
          });
          }
      });
    });
  
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
    client.query('SELECT * FROM event_hosts', function(err, result) {
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
