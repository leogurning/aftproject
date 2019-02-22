const Depts = require('../models/dept');
const Camps = require('../models/camp');
const config = require('../config.js');

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'Jan', 'Feb', 'Mar',
  'Apr', 'May', 'Jun', 'Jul',
  'Aug', 'Sep', 'Oct',
  'Nov', 'Dec',
];

function formatDateToStr(date) {
  const dayOfWeekIndex = date.getDay();
  // console.log(dayOfWeekIndex);
  // return `${dayNames[dayOfWeekIndex]} ${date.getFullYear()}-${(`0${date.getMonth() + 1}`).slice(-2)}-${(`0${date.getDate()}`).slice(-2)}`;
  return `${dayNames[dayOfWeekIndex]}, ${(`0${date.getDate()}`).slice(-2)} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateToObj(date) {
  const dayOfWeekIndex = date.getDay();
  const dobj = {
    pday: dayNames[dayOfWeekIndex],
    pdate: (`0${date.getDate()}`).slice(-2),
    pmonth: monthNames[date.getMonth()],
    pyear: date.getFullYear(),
  };
  return dobj;
}

function formatDateToIdxStr(date) {
  return `${date.getFullYear()}-${(`0${date.getMonth() + 1}`).slice(-2)}-${(`0${date.getDate()}`).slice(-2)}`;
}

exports.getdeptlist = ({ query }, cb) => {
  // returns artists records based on query
  const fields = {
    DeptId: 1,
    DeptName: 1,
  };

  const psort = { DeptId: 1 };

  Depts.find(query, fields).sort(psort).exec((err, result) => {
    if (err) {
      cb(`Error processing request${err}`);
      return;
    }
    cb(null, result);
  });
};

exports.getcamplist = ({ query }, cb) => {
  // returns artists records based on query
  const fields = {
    CampId: 1,
    CampName: 1,
  };

  const psort = { CampId: 1 };

  Camps.find(query, fields).sort(psort).exec((err, result) => {
    if (err) {
      cb(`Error processing request${err}`);
      return;
    }
    cb(null, result);
  });
};

exports.getlistdates = (startdate, enddate) => {
  // const enddate = new Date();
  // const startdate = new Date(Date.UTC(2018, 0, 1));
  const start = new Date(startdate);
  const end = new Date(enddate);
  const daysOfYear = [];
  let dateObj; let dat;
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    dat = new Date(d);
    dateObj = {
      date: formatDateToIdxStr(dat),
      dateStr: formatDateToStr(dat),
    };
    daysOfYear.push(dateObj);
  }
  return daysOfYear;
};
/*
exports.getlisttabledates = (days) => {
  const start = new Date();
  const result = [];
  let dateObj; let dat;
  for (let i = 0; i < days; i += 1) {
    dat = new Date(start);
    dateObj = {
      date: dat,
      dateStr: formatDateToStr(dat),
    };
    result.push(dateObj);
    start.setDate(start.getDate() + 1);
  }
  return result;
};
*/

exports.getlisttabledates = (startdate, days) => {
  // const start = new Date(startdate);
  const start = config.formatUTCStartDate(new Date(startdate));
  const result = [];
  let dateObj; let dat;

  for (let i = 0; i < days; i += 1) {
    dat = new Date(start);
    dateObj = {
      datetime: dat,
      date: formatDateToIdxStr(dat),
      dateStr: formatDateToStr(dat),
      dobj: formatDateToObj(dat),
    };
    result.push(dateObj);
    start.setDate(start.getDate() + 1);
  }
  return result;
};
