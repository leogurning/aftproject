const Projects = require('../controllers/project');
const config = require('../config.js');

exports.projectsaggreport = (req, res) => {
  const deptid = req.body.deptid || req.query.deptid;
  const campid = req.body.campid || req.query.campid;
  const { startdate, days } = req.body;

  let limit = parseInt(req.query.limit, 10);
  let page = parseInt(req.body.page || req.query.page, 10);
  const sortby = req.body.sortby || req.query.sortby;
  let query = {};

  if (!limit || limit < 1) {
    limit = 500;
  }

  if (!page || page < 1) {
    page = 1;
  }
  if (!deptid || !startdate || !days) {
    res.status(202).send({ success: false, message: 'Parameter data is not correct or incompleted.' });
    return;
  }
  // returns projects records based on query
  const qstartdate = config.formatUTCStartDate(new Date(startdate));
  // const qstartdate = new Date(startdate);
  const inputstartdate = new Date(startdate);
  const newDate = new Date(inputstartdate.setTime(inputstartdate.getTime() + (days - 1) * 86400000));
  const inputenddateUTC = config.formatUTCStartDate(newDate);

  query = {
    Department: deptid,
    $or: [
      {
        FirstNightDate: { $gte: qstartdate, $lte: inputenddateUTC },
      },
      {
        LastNightDate: { $gte: qstartdate, $lte: inputenddateUTC },
      },
      {
        $and: [
          {
            FirstNightDate: { $lte: qstartdate },
          },
          {
            LastNightDate: { $gte: inputenddateUTC },
          },
        ],
      },
    ],
  };
  console.log(qstartdate);
  console.log(inputstartdate);
  if (campid) {
    query = Object.assign(query, { Camp: campid });
  }

  Projects.listprojects2({
    query, limit, page, sortby,
  }, (err, results, pageCount, count) => {
    if (err) { return res.status(202).send({ success: false, message: err }); }
    if (results) {
      return res.status(200).json({
        success: true,
        data: results,
        npage: pageCount,
        totalcount: count,
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getprojectRouterHandler = (req, res) => {
  const pid = req.params.id;

  Projects.getproject(pid, (err, result) => {
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

exports.updateprojectRouterHandler = (req, res) => {
  const pid = req.params.id;
  const {
    campid, projectid, employerid, noofpeople, firstnight, lastnight,
    firstnightstr, lastnightstr,
  } = req.body;

  Projects.updateproject(pid, {
    campid,
    projectid,
    employerid,
    noofpeople,
    firstnightstr,
    lastnightstr,
    firstnight,
    lastnight,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Project updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updateprojecttimeRouterHandler = (req, res) => {
  const pid = req.params.id;
  const {
    firstnightstr, lastnightstr,
  } = req.body;

  Projects.updateprojecttime(pid, {
    firstnightstr,
    lastnightstr,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Project time updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};
/*
exports.projectsaggreport = (req, res) => {
  const deptid = req.body.deptid || req.query.deptid;
  const campid = req.body.campid || req.query.campid;

  let limit = parseInt(req.query.limit, 10);
  let page = parseInt(req.body.page || req.query.page, 10);
  const sortby = req.body.sortby || req.query.sortby;
  let query = {};

  if (!limit || limit < 1) {
    limit = 100;
  }

  if (!page || page < 1) {
    page = 1;
  }
  if (!deptid) {
    res.status(202).send({ success: false, message: 'Parameter data is not correct or incompleted.' });
    return;
  }
  // returns projects records based on query
  query = {
    Department: deptid,
  };

  if (campid) {
    query = Object.assign(query, { Camp: campid });
  }

  Projects.listprojects({
    query, limit, page, sortby,
  }, (err, results, totalcount) => {
    if (err) { return res.status(202).send({ success: false, message: err }); }
    if (results) {
      return res.status(200).json({
        success: true,
        data: results,
        totalcount,
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};
*/
