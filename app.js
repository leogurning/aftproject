const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');

const port = process.env.PORT || config.serverport;

const projects = require('./routes/projects.js');
const msconfig = require('./routes/msconfig.js');

mongoose.connect(config.database, {
  useNewUrlParser: true,
}, (err) => {
  if (err) {
    console.log('Error connecting database, please check if MongoDB is running.');
  } else {
    console.log('Connected to database...');
  }
});

const app = express();
// Enable CORS from client-side
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') { res.sendStatus(204); } else { next(); }
});

app.use(express.static(path.join(__dirname, 'public')));

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// basic routes
app.get('/', (req, res) => {
  res.send(`AFT API is running at PORT:${port}/api`);
});

// express router
const apiRoutes = express.Router();
app.use('/api', apiRoutes);

apiRoutes.post('/report', projects.projectsaggreport);
apiRoutes.get('/dept/list', msconfig.getDeptListRouterHandler); // API returns Dept List
apiRoutes.get('/camp/list', msconfig.getCampListRouterHandler); // API returns Camp List
apiRoutes.post('/date/list', msconfig.getlistdatesRouterHandler); // API returns Date List
apiRoutes.post('/date/table', msconfig.getlisttabledatesRouterHandler); // API returns Date table List
apiRoutes.put('/project/:id', projects.updateprojectRouterHandler); // API to update project data
apiRoutes.put('/project/time/:id', projects.updateprojecttimeRouterHandler); // API to update project time
apiRoutes.get('/project/:id', projects.getprojectRouterHandler); // API returns project details

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// kick off the server
app.listen(port);

console.log(`AFT app is listening at PORT:${port}`);
