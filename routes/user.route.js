const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

const auth = require('../auth.js'); // middleware auth

//READ (get)
router.get('/test', controller.user_test); // READ (get) a simple test url to check that all of our files are communicating correctly
router.get('/testSecured', auth.isAuthenticated, controller.user_test); // READ (get) Secured with JWTrouter
router.get('/likes/list', auth.isAuthenticated, controller.user_likes_list); // auth = sikret med JWT
router.get('/suggested/match', auth.isAuthenticated, controller.suggested_match);

//CREATE (post)
router.post('/login', controller.user_login);
router.post('/create', controller.user_create);

//UPDATE (put)
router.put('/update', auth.isAuthenticated, controller.user_update);
router.put('/like/suggested/user', auth.isAuthenticated, controller.user_like);

//DELETE (delete)
router.delete('/likes/delete', auth.isAuthenticated, controller.user_likes_delete);
router.delete('/delete', auth.isAuthenticated, controller.user_delete);

module.exports = router;