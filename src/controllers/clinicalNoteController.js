const clinicalNoteService = require('../services/clinicalNoteService');

const createNote = async (req, res, next) => {
  try {
    const note = await clinicalNoteService.createClinicalNote(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        note,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const note = await clinicalNoteService.updateClinicalNote(req.user.id, req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        note,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const notes = await clinicalNoteService.getPatientClinicalNotes(req.user.id, req.user.role, patientId);

    res.status(200).json({
      status: 'success',
      results: notes.length,
      data: {
        notes,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  updateNote,
  getNotes,
};
