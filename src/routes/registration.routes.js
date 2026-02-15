const router = require("express").Router();
const mongoose = require("mongoose");
const ctrl = require("../controllers/registration.controller");
const adminCtrl = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { getGridFSBucket } = require("../config/gridFs");

router.post("/register",
  upload.single("document"), ctrl.create);
  router.get("/document/:id", async (req, res) => {
  try {
    const bucket = getGridFSBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/registrationslist", auth, ctrl.list);
router.post("/submitrating", ctrl.submitRating);
router.post("/admin/registration/approve/:id", auth, ctrl.approve);
router.post("/admin/registration/reject/:id", auth, ctrl.reject);
router.get("/admin/registrations", auth, ctrl.gridlist);
router.post("/admin/registrations/save", adminCtrl.create);
router.post("/admin/login", adminCtrl.login);
router.get("/public/members", ctrl.publicList);
router.get("/public/healthcheck", ctrl.healthcheck);
router.get("/states", ctrl.getStates);
router.get("/admin/states", ctrl.getAdminStates);

module.exports = router;
