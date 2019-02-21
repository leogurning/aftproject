const mongoose = require('mongoose');
const config = require('./config');
const projectfunc = require('./controllers/project.js');

mongoose.connect(config.database, {
  useNewUrlParser: true,
}, (err) => {
  if (err) {
    console.log('Error connecting database, please check if MongoDB is running.');
  } else {
    console.log('Connected to database...');
  }
});

projectfunc.updatedates((err, result) => {
  if (err) { console.log(`Error update dates. ${err}`); return; }
  if (result) {
    if (result === 'NUP') {
      console.log('Date data was already updated');
    } else if (result > 0) {
      console.log(`${result} records update completed`);
    } else {
      console.log('Undefined result value.');
    }
  } else {
    console.log('Undefined update result.');
  }
});
