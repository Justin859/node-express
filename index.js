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

var get_events = function(event_types, host_type, page_to_request, request, response) {
  var batchArray = []
  
  if (event_types.length == 1 && host_type == 'Venue') {
    var query_string = 'SELECT * FROM event_hosts WHERE event_type = ($1)';
  } else if (event_types.length == 4 && host_type == 'Special Event') {
    var query_string = 'SELECT * FROM event_hosts WHERE event_type = $1 AND host_type = $4 OR event_type = $2 AND host_type = $4 OR event_type = $3 AND host_type = $4';    
  } else if (event_types.length == 3) {
    var query_string = 'SELECT * FROM event_hosts WHERE event_type = $1 OR event_type = $2 OR event_type = $3';
  }

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query_string, event_types, function(err, result) {
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
            res.render('pages/livemusic', {events: "error", moment: moment, dateNow: dateNow, weekDay: weekDay, weekend_start: weekend_start, mid_weekend: mid_weekend, weekend_stop: weekend_stop});
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
            // could be a temporary fix for source img problem with facebook api
            var imgFix = function (str) {
              str = str.split(".");
              str[1] = "xx";
              str = str.join(".");
           return str;
          };
            response.render(page_to_request, {events: events, moment: moment, dateNow: dateNow, weekDay: weekDay, weekend_start: weekend_start, mid_weekend: mid_weekend, weekend_stop: weekend_stop, imgFix: imgFix});
          }
      
        });
        }
    });
  });
}

app.get('/', function(request, response) {
  get_events(['Live Shows','Art Exhibition', 'Craft Market'], 'Venue', 'pages/index', request, response);
  
});

app.get('/live-music', function(request, response) {
  get_events(['Live Shows'], 'Venue', 'pages/livemusic', request, response);
});

app.get('/art-exhibitions', function(request, response) {
  get_events(['Art Exhibition'], 'Venue', 'pages/artexhibitions', request, response);
});

app.get('/craft-markets', function(request, response) {
  get_events(['Craft Market'],'Venue', 'pages/craftmarkets', request, response);
});

app.get('/special-events', function(request, response) {
  get_events(['Live Shows', 'Art Exhibition', 'Craft Market', 'Special Event'],'Special Event', 'pages/specialevents', request, response);
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
