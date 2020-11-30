const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

//READ (get)
router.get('/login/:email', controller.user_login);
//router.get('/likes', controller.user_likes); 
router.get('/likes/list', controller.user_likes_list);

//CREATE (post)
router.post('/create', controller.user_create);

//UPDATE (put)
router.put('/update', controller.user_update);

//DELETE (delete)
router.delete('/delete', controller.user_delete);

module.exports = router;