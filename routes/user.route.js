const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

router.get('/login/:email', controller.user_login); //READ (get)

router.post('/create', controller.user_create); //CREATE (post)

module.exports = router;