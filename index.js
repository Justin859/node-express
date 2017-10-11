var cool = require('cool-ascii-faces');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var exphbs = require('express-handlebars');
var sendemail = require('sendemail');
var graph = require('fbgraph');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth20').Strategy;;
var moment = require('moment');
var marked = require('marked');
var pg = require('pg');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// facebook graph
 graph.get("oauth/access_token?client_id=" + process.env.FACEBOOK_API_ID + "&client_secret=" + process.env.FACEBOOK_APP_SECRET  + "&grant_type=client_credentials", function(error, response) {
  graph.setAccessToken(response['access_token']);
});

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_API_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "https://obscure-brushlands-94270.herokuapp.com/auth/facebook/callback"
},

function(accessToken, refreshToken, profile, cb) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM auth_users WHERE id = $1', [profile.id], function(err, result) {
      if (err) {
         console.error(err); 
         response.send("Error " + err); 
      } else if (result.rows[0]) { 
          return cb(null, profile);
      } else {
        var id = profile.id,
            name = profile.displayName,
            provider = profile.provider
        client.query('INSERT INTO auth_users(id, provider, name) VALUES($1, $2, $3) RETURNING *', [profile.id, profile.provider, profile.displayName], function(err, result) {
        })
        return cb(null, profile);
      }
      done();
    });
    pg.end()
    });
  }
));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://obscure-brushlands-94270.herokuapp.com/auth/google/callback"
},

function(accessToken, refreshToken, profile, cb) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM auth_users WHERE id = $1', [profile.id], function(err, result) {
      if (err) {
         console.error(err); 
         response.send("Error " + err); 
      } else if (result.rows[0]) { 
          return cb(null, profile);
      } else {
        var id = profile.id,
            name = profile.displayName,
            provider = profile.provider
        client.query('INSERT INTO auth_users(id, provider, name) VALUES($1, $2, $3) RETURNING *', [profile.id, profile.provider, profile.displayName], function(err, result) {
        })
        return cb(null, profile);
      }
      done();
    });
    pg.end()
  });
    
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

function ensureLoggedIn() {
  return function(req, res, next) {
    // isAuthenticated is set by `deserializeUser()`
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send({
        success: false,
        message: 'You need to be authenticated to access this page!'
      })
    } else {
      next()
    }
  }
}

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

    // could be a temporary fix for source img problem with facebook api
    var imgFix = function (str) {
      str = str.split(".");
      str[1] = "xx";
      str = str.join(".");
    return str;
  };

  var weekend_start,
      mid_weekend,
      weekend_stop

  var dateNow = moment().format("MM-DD-YYYY");
  var weekDay = moment().weekday();
  
  if (weekDay == 4 || weekDay == 1 || weekDay == 2 || weekDay == 3) {
     weekend_start = moment(moment().add(5-weekDay, 'days')).format("MM-DD-YYYY");;
     weekend_stop = moment(moment().add(6-weekDay, 'days')).format("MM-DD-YYYY");;
     mid_weekend = moment(moment().add(7-weekDay, 'days')).format("MM-DD-YYYY");;
  } else if (weekDay == 5) {
     weekend_start = moment().format("MM-DD-YYYY");
     weekend_stop = moment(moment().add(2, 'days')).format("MM-DD-YYYY");
     mid_weekend = moment(moment().add(1, 'days')).format("MM-DD-YYYY"); 
  } else if (weekDay == 6) {
     weekend_start = false;
     weekend_stop = moment(moment().add(1, 'days')).format("MM-DD-YYYY");
     mid_weekend = dateNow
  } else {
     weekend_start = dateNow
     weekend_stop = false;
     mid_weekend = false;
  }

var get_events = function(options, request, response) {

  var event_types = options.event_types,
      host_type = options.host_type,
      main_img = options.main_img,
      cover_text = options.cover_text

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
      if (err)
       { console.error(err); response.send("Error " + err); }
      else { 
         
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
            res.send('There seems to be an error on the server.' + error);
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

            response.render('pages/eventsmain', {
              userAuthenticated: !request.isAuthenticated(),
              user: request.user,
              events: events,
              moment: moment,
              main_img: main_img,
              cover_text: cover_text,
              dateNow: dateNow,
              weekDay: weekDay,
              weekend_start: weekend_start,
              mid_weekend: mid_weekend,
              weekend_stop: weekend_stop,
              imgFix: imgFix
            });
          }
      
        });
      }
      done();
    });
    pg.end()
  });
}


app.get('/', function(request, response) {
  get_events({
    event_types: ['Live Shows','Art Exhibition', 'Craft Market'],
    host_type: 'Venue',
    main_img: 'play-69992.jpg',
    cover_text: 'Welcome to Rock Worthy'
  }, request, response);
});

app.get('/live-music', function(request, response) {
  get_events({
    event_types: ['Live Shows'],
    host_type: 'Venue',
    main_img: 'musician-2708190_1920.jpg',
    cover_text: 'Live Music Events'
  }, request, response);
});

app.get('/art-exhibitions', function(request, response) {
  get_events({
    event_types: ['Art Exhibition'],
    host_type: 'Venue',
    main_img: 'statue-2648579_1920.jpg',
    cover_text: 'Art Exhibition Events'
  }, request, response);
});

app.get('/craft-markets', function(request, response) {
  get_events({
    event_types: ['Craft Market'],
    host_type: 'Venue',
    main_img: 'lisbon-2660748_1920.jpg',
    cover_text: 'Craft Market Events'
  }, request, response);
});

app.get('/special-events', function(request, response) {
  get_events({
    event_types: ['Live Shows', 'Art Exhibition', 'Craft Market', 'Special Event'],
    host_type: 'Special Event',
    main_img: 'stainless-2576185_1920.jpg',
    cover_text: 'Special Events'
  }, request, response);
});

app.get('/event/:event_id/detail', function(request, response) {

  graph.get(request.params.event_id + "/?fields=cover,name,ticket_uri,description,attending_count,interested_count,start_time,end_time,place", function(err, res) {
    if (err) {
      response.send("The page requested does not exist." + error);
    } else {
      response.render('pages/detail/event_detail', {event: res, imgFix: imgFix, marked: marked});
    }
  });

});

app.get('/venues', function(request, response) {
  var batchArray = []

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM event_hosts WHERE host_type = $1', ['Venue'], function(err, result) {
      if (err)
       { console.error(err); response.send("Error " + err); }
      else { 
         
         for (i=0; i < result.rows.length; i++) {
           batchArray.push(
             {
               method: "GET",
               relative_url: result.rows[i].host_id + "/?fields=fan_count,picture,category,name"
             }
           )
         }
         graph.batch(
          batchArray,
           function(error, res) {
          var data = [];
          var venues = [];
          if (error) {
            console.log(error);
            res.send('There seems to be an error on the server.' + error);
          } else {
            for (var i=0; i< res.length; i++) {
              data.push(JSON.parse(res[i]['body']));
            }
            for(var i = 0; i < data.length; i++)
            {
                venues = venues.concat(data[i]);
            }
            venues = venues.sort(function(a, b) {
              if (a['fan_count'] > b['fan_count']) {
                return -1;
              } else if ( a['fan_count'] < b['fan_count']) {
                return +1;
              }
              return 0
            })

            response.render('pages/venues', {
              venues: venues,
              imgFix: imgFix
            });
          }
      
        });
      }
      done();
    });
    pg.end()
  });

});

app.get('/venue/:venue_id/page', function(request, response) {
  graph.get(request.params.venue_id + "/?fields=cover,events{cover,ticket_uri,name,place,attending_count,interested_count,start_time,end_time},fan_count,picture,category,name", function(err, res) {
    if (err) {
      response.send("The page requested does not exist." + err);
      console.log(err)
    } else {
      response.render('pages/detail/venue_detail', {
        venue: res,
        moment: moment,
        dateNow: dateNow,
        weekDay: weekDay,
        weekend_start: weekend_start,
        mid_weekend: mid_weekend,
        weekend_stop: weekend_stop,
        imgFix: imgFix
      });
    }
  });
});

app.get('/contact', function(request, response) {
  response.render('pages/contact', {formErrors: false, successMsg: false, user: false});
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
    if (error) {
      response.send(error);
      // There are no errors so perform action with valid data (e.g. save record).
    } else {
      console.log(' - - - - - - - - - - - - - - - - - - - - -> email sent: ');
      console.log(result);
      console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - -')

      response.render('pages/contact', {formErrors: false, successMsg: 'Your query has been sent. We will contact you as soon as possible.', user: false});
      // There are no errors so perform action with valid data (e.g. save record).
    }

  });

  }

});

app.get('/about', function(request, response) {
  response.render('pages/about');
});

app.get('/profile', ensureLoggedIn(), function(req, res){
  res.render('pages/profile', { user: req.user });
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/google',
passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { successRedirect: '/profile',
                                    failureRedirect: '/login' }));
app.get('/auth/google/callback',
passport.authenticate('google', { successRedirect: '/profile',
                                    failureRedirect: '/login' }));

app.get('/logout', function(request, response) {
  request.logout();
  response.redirect('/');
})

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM auth_users', function(err, result) {
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }

       done();
    });
    pg.end()
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
