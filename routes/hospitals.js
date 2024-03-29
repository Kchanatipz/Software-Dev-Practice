const express = require("express");
const {
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  getVacCenters,
} = require("../controllers/hospitals");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const appointmentRouter = require("./appointments");

// re-route into other resource routers
router.use("/:hospitalId/appointments/", appointmentRouter);

router.route("/vacCenters").get(getVacCenters);

router
  .route("/")
  .get(getHospitals)
  .post(protect, authorize("admin"), createHospital);
router.route("/:id").get(getHospital);
router
  .route("/:id")
  .put(protect, authorize("admin"), updateHospital)
  .delete(protect, authorize("admin"), deleteHospital);

module.exports = router;
