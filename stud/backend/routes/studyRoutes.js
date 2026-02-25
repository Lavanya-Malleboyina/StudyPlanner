const express = require('express');
const {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  getQuotes,
  getProgress
} = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStudyPlans)
  .post(createStudyPlan);

router.route('/:id')
  .put(updateStudyPlan)
  .delete(deleteStudyPlan);

router.get('/quotes/random', getQuotes);
router.get('/progress/stats', getProgress);

module.exports = router;