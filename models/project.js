const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const { Schema } = mongoose;

const ProjectSchema = new Schema({
  Id: { type: String, required: true },
  Department: { type: String, required: true },
  Camp: { type: String, required: true },
  Project: { type: String, required: true },
  Employer: { type: String, required: true },
  FirstNight: { type: String, required: true },
  LastNight: { type: String, required: true },
  NumberOfPeople: { type: Number, required: true },
});

ProjectSchema.plugin(mongoosePaginate);
ProjectSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('project', ProjectSchema, 'projectTimeForecast');
