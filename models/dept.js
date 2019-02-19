const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const { Schema } = mongoose;

const DeptSchema = new Schema({
  DeptId: { type: String, required: true },
  DeptName: { type: String, required: true },
});

DeptSchema.plugin(mongoosePaginate);
DeptSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('dept', DeptSchema, 'deptMasterData');
