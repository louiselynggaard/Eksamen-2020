const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

//READ (get)
router.get('/login/:email', controller.user_login);
router.get('/likes/list', controller.user_likes_list);
router.get('/suggested/match', controller.suggested_match);

//CREATE (post)
router.post('/create', controller.user_create);

//UPDATE (put)
router.put('/update', controller.user_update);

//DELETE (delete)
router.delete('/likes/delete', controller.user_likes_delete);
router.delete('/delete', controller.user_delete);

module.exports = router;