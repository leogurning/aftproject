const Depts = require('../controllers/msconfig');
const Camps = require('../controllers/msconfig');


exports.getDeptListRouterHandler = (req, res) => {
  // get the Dept List
  const query = {};

  Depts.getdeptlist({ query }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getCampListRouterHandler = (req, res) => {
  // get the Dept List
  const query = {};

  Camps.getcamplist({ query }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};
