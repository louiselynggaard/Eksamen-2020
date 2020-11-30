const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

//READ (get)
router.get('/login/:email', controller.user_login);
router.get('/likes', controller.user_likes); 
router.get('/matches', controller.user_matches);

//CREATE (post)
router.post('/create', controller.user_create);

//UPDATE (put)
router.put('/update/:email', controller.user_update);

//DELETE (delete)
router.delete('/delete/:email', controller.user_delete);

module.exports = router;