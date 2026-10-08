const { z } = require('zod');

const addMoodSchema = z.object({
  mood_emoji: z.string().min(1, 'Mood emoji is required'),
});

const addJournalSchema = z.object({
  content: z.string().min(1, 'Journal content cannot be empty'),
});

module.exports = {
  addMoodSchema,
  addJournalSchema,
};
