const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    empid: {
        type: String,
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: [true, 'Leave date is required']
    },
    reason: {
        type: String,
        required: [true, 'Leave reason is required'],
        trim: true
    },
    grant: {
        type: String,
        enum: ['Pending', 'Yes', 'No'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Leave', leaveSchema);
