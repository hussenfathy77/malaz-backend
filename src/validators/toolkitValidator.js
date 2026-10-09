const { z } = require('zod');

const addMoodSchema = z.object({
  mood_score: z.number().int().min(1).max(10),
  note: z.string().optional(),
});

const addJournalSchema = z.object({
  content: z.string().min(1, 'Journal content cannot be empty'),
});

module.exports = {
  addMoodSchema,
  addJournalSchema,
};
