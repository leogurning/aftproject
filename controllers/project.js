const Projects = require('../models/project');
const config = require('../config.js');

exports.listprojects = ({
  query, limit, page, sortby,
}, cb) => {
  let totalcount;
  let offset = (page - 1) * limit;

  Projects.countDocuments(query, (err, recordcount) => {
    if (err) { cb(err, null); return; }
    totalcount = recordcount;
    if (recordcount > offset) {
      offset = 0;
    }
  });

  const options = {
    select: 'Id Department Camp Project Employer FirstNight LastNight NumberOfPeople',
    sort: sortby,
    offset,
    limit,
  };

  Projects.paginate(query, options).then((err, result) => {
    if (err) { cb(err, null); return; }
    cb(null, result, totalcount);
  });
};

exports.listprojects1 = ({
  query, limit, page, sortby,
}, cb) => {
  const aggregate = Projects.aggregate();

  let options = {
    page,
    limit,
  };

  const oproject = {
    Id: 1,
    Department: 1,
    Camp: 1,
    Project: 1,
    Employer: 1,
    NumberOfPeople: 1,
    FirstNight: 1,
    LastNight: 1,
    FirstNightDate: {
      $dateFromString: {
        dateString: '$FirstNight',
        format: '%d/%m/%Y',
        timezone: 'Asia/Jakarta',
        onError: '$FirstNight',
        onNull: new Date(0),
      },
    },
    LastNightDate: {
      $dateFromString: {
        dateString: '$LastNight',
        format: '%d/%m/%Y',
        timezone: 'Asia/Jakarta',
        onError: '$LastNight',
        onNull: new Date(0),
      },
    },
    NumberOfNights: {
      $add: [{
        $divide: [{
          $subtract: [{
            $dateFromString: {
              dateString: '$LastNight',
              format: '%d/%m/%Y',
              timezone: 'Asia/Jakarta',
              onError: '$LastNight',
              onNull: new Date(0),
            },
          }, {
            $dateFromString: {
              dateString: '$FirstNight',
              format: '%d/%m/%Y',
              timezone: 'Asia/Jakarta',
              onError: '$FirstNight',
              onNull: new Date(0),
            },
          },
          ],
        }, 86400000,
        ],
      }, 1,
      ],
    },
  };

  aggregate.match(query);
  aggregate.project(oproject);
  if (!sortby) {
    const osort = { Camp: 1 };
    aggregate.sort(osort);
  } else {
    options = {
      page,
      limit,
      sortBy: sortby,
    };
  }
  Projects.aggregatePaginate(aggregate, options, (err, results, pageCount, count) => {
    if (err) {
      cb(err.message, null);
    } else {
      cb(null, results, pageCount, count);
    }
  });
};

exports.listprojects2 = ({
  query, limit, page, sortby,
}, cb) => {
  const aggregate = Projects.aggregate();

  let options = {
    page,
    limit,
  };
  /*
  const oproject = {
    Id: 1,
    Department: 1,
    Camp: 1,
    Project: 1,
    Employer: 1,
    NumberOfPeople: 1,
    FirstNight: 1,
    LastNight: 1,
    FirstNightDate: 1,
    LastNightDate: 1,
    NumberOfNights: {
      $ceil: {
        $add: [{
          $divide: [{ $subtract: ['$LastNightDate', '$FirstNightDate'] },
            86400000,
          ],
        }, 1,
        ],
      },
    },
  };
  */
  const oproject = {
    Id: 1,
    Department: 1,
    Camp: 1,
    Project: 1,
    Employer: 1,
    NumberOfPeople: 1,
    FirstNight: 1,
    LastNight: 1,
    FirstNightDate: 1,
    LastNightDate: 1,
    NumberOfNights: {
      $ceil: {
        $divide: [{ $subtract: ['$LastNightDate', '$FirstNightDate'] },
          86400000,
        ],
      },
    },
  };
  aggregate.match(query);
  aggregate.project(oproject);
  if (!sortby) {
    const osort = { Camp: 1 };
    aggregate.sort(osort);
  } else {
    options = {
      page,
      limit,
      sortBy: sortby,
    };
  }
  Projects.aggregatePaginate(aggregate, options, (err, results, pageCount, count) => {
    if (err) {
      cb(err.message, null);
    } else {
      cb(null, results, pageCount, count);
    }
  });
};

function checkNullDateData(cb) {
  try {
    const query = {
      // Id: 'UKKOT2',
      FirstNightDate: null,
      LastNightDate: null,
    };
    Projects.countDocuments(query).exec((err, recordcount) => {
      if (err) { cb(err, null); return; }
      if (recordcount) {
        cb(null, recordcount);
      } else {
        cb('Undefined record count', null);
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

function updateFirstNLastDate(recordstoupd, cb) {
  let query; let rcnt = 0;
  try {
    query = {
      // Id: 'UKKOT2',
      FirstNightDate: null,
      LastNightDate: null,
    };
    let startdate; let startdateUTC;
    let enddate; let enddateUTC;
    const projectstream = Projects.find(query).cursor();
    projectstream.on('data', (doc) => {
      startdate = new Date(config.formatStrDate(doc.FirstNight));
      startdateUTC = config.formatUTCStartDate(startdate);
      enddate = new Date(config.formatStrDate(doc.LastNight));
      enddateUTC = config.formatUTCEndDate(enddate);
      // eslint-disable-next-line no-underscore-dangle
      Projects.updateOne({ _id: doc._id }, { $set: { FirstNightDate: startdateUTC, LastNightDate: enddateUTC } }, (err, result) => {
        if (err) { console.log(`${err.message}. FirstNight: ${doc.FirstNight} LastNight: ${doc.LastNight}`); }
        rcnt += parseInt(result.nModified, 10);
        console.log(`Id: ${doc.Id}. UPDATED RECORDS: ${rcnt} OUT OF ${recordstoupd}`); // result == true?
        // console.log(`start: ${startdateUTC}. end: ${enddateUTC}`);
      });
    });
    projectstream.on('error', (err) => {
      cb(err, null);
    });
    projectstream.on('end', () => {
      cb(null, rcnt);
      // stream can end before all your updates do if you have a lot
    });
  } catch (err) {
    cb(err, null);
  }
}

exports.updatedates = (cb) => {
  // const query = {};

  checkNullDateData((err, result) => {
    if (err) { cb(err, null); return; }
    if (result) {
      if (parseInt(result, 10) > 0) {
        // cb(null, 'UP');
        updateFirstNLastDate(result, (erru, resultu) => {
          if (erru) { cb(erru, null); return; }
          cb(null, resultu);
        });
      } else {
        cb(null, 'NUP');
      }
    } else {
      cb('Undefined result data.', null);
    }
  });
};
