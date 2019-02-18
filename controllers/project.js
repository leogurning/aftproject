const Projects = require('../models/project');

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
