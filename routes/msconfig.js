const Msconfig = require('../controllers/msconfig');

exports.getDeptListRouterHandler = (req, res) => {
  // get the Dept List
  const query = {};

  Msconfig.getdeptlist({ query }, (err, result) => {
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

  Msconfig.getcamplist({ query }, (err, result) => {
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

exports.getlistdatesRouterHandler = (req, res) => {
  const { startdate, enddate } = req.body;

  const result = Msconfig.getlistdates(startdate, enddate);
  return res.status(200).json({
    success: true,
    data: result,
  });
};

exports.getlisttabledatesRouterHandler = (req, res) => {
  const { startdate, days } = req.body;

  const result = Msconfig.getlisttabledates(startdate, days);
  return res.status(200).json({
    success: true,
    data: result,
  });
};
