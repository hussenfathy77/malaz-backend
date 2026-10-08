const toolkitService = require('../services/toolkitService');

const addMood = async (req, res, next) => {
  try {
    const mood = await toolkitService.addMood(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { mood }
    });
  } catch (error) {
    next(error);
  }
};

const getMoods = async (req, res, next) => {
  try {
    const trends = await toolkitService.getMoodTrends(req.user.id);
    res.status(200).json({
      status: 'success',
      results: trends.length,
      data: { trends }
    });
  } catch (error) {
    next(error);
  }
};

const addJournal = async (req, res, next) => {
  try {
    const journal = await toolkitService.addJournalEntry(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { journal }
    });
  } catch (error) {
    next(error);
  }
};

const getJournals = async (req, res, next) => {
  try {
    const history = await toolkitService.getJournalHistory(req.user.id);
    res.status(200).json({
      status: 'success',
      results: history.length,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMood,
  getMoods,
  addJournal,
  getJournals,
};
