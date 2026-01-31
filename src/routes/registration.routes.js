const router = require("express").Router();
const ctrl = require("../controllers/registration.controller");
const adminCtrl = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register community member
 *     tags: [Registration]
 */
router.post("/register", ctrl.create);

/**
 * @swagger
 * /api/admin/registrations:
 *   get:
 *     summary: List all registrations
 *     tags: [Admin]
 */

router.get("/admin/registrationslist", auth, ctrl.list);
router.get("/admin/registrations", auth, ctrl.gridlist);

router.post("/admin/registrations/save", adminCtrl.create);
router.post("/admin/login", adminCtrl.login);

/**
 * @swagger
 * /api/public/members:
 *   get:
 *     summary: Public approved members
 */
router.get("/public/members", ctrl.publicList);
router.get("/public/healthcheck", ctrl.healthcheck);

module.exports = router;
