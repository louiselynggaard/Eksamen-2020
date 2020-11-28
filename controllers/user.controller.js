const fs = require('fs');

const User = require('../models/user.model'); //klasse hentes fra denne mappe.

exports.user_create = function (req, res) {
    let obj = new User(
        (++userData.lastUserId).toString(),
        req.body.name,
        req.body.dateOfBirth,
        req.zipCode,
        req.email,
        req.password
    );

    console.log('user_create, object:', obj);
};