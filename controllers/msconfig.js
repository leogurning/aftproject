const Depts = require('../models/dept');
const Camps = require('../models/camp');

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
