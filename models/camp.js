const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const { Schema } = mongoose;

const CampSchema = new Schema({
  CampId: { type: String, required: true },
  CampName: { type: String, required: true },
});

CampSchema.plugin(mongoosePaginate);
CampSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('camp', CampSchema, 'campMasterData');
