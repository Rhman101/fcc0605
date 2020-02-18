const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadSchema = new Schema({
	text: {
		type: String,
		required: true
    },
    board: {
        type: String,
        required: true
    },
	delete_password: {
		type: String,
		required: true
	},
	created_on: {
		type: Date,
		required: true
	},
	bumped_on: {
		type: Date,
		required: true
	},
	reported: {
		type: Boolean,
		requried: true,
		default: false
	},
	replies: [
		{
			_id: { type: String },
			text: { type: String },
			delete_password: { type: String },
			created_on: { type: Date },
			reported: { type: Boolean, default: false }
		}
	]
});

const Thread = new mongoose.model('Thread', threadSchema);

module.exports = Thread;