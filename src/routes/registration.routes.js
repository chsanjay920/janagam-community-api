const router = require("express").Router();
const ctrl = require("../controllers/registration.controller");
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
router.get("/admin/registrations", auth, ctrl.list);

/**
 * @swagger
 * /api/admin/registrations/{id}/approve:
 *   patch:
 *     summary: Approve registration
 */
router.patch("/admin/registrations/:id/approve", auth, ctrl.approve);

router.patch("/admin/registrations/:id/reject", auth, ctrl.reject);

/**
 * @swagger
 * /api/public/members:
 *   get:
 *     summary: Public approved members
 */
router.get("/public/members", ctrl.publicList);

module.exports = router;
