export const CONTEST_STORAGE_KEY = "academos-upcoming-contest";
export const CONTEST_SAVED_EVENT = "academos:contest-saved";

export const initialContestForm = {
  contestName: "",
  contestDate: "",
  subjectName: "",
  syllabusInput: "",
  notes: "",
};

export function normalizeTopics(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateContestForm(form) {
  const errors = {};

  if (!form.contestName.trim()) {
    errors.contestName = "Contest name is required.";
  }

  if (!form.contestDate) {
    errors.contestDate = "Contest date is required.";
  }

  if (!form.subjectName.trim()) {
    errors.subjectName = "Subject name is required.";
  }

  const topics = normalizeTopics(form.syllabusInput);

  if (!form.syllabusInput.trim() || topics.length === 0) {
    errors.syllabusInput = "Syllabus or topics are required.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    topics,
  };
}

export function buildContestDraft(form, topics) {
  return {
    contestName: form.contestName.trim(),
    contestDate: form.contestDate,
    subjectName: form.subjectName.trim(),
    syllabus: {
      rawInput: form.syllabusInput.trim(),
      topics,
    },
    notes: form.notes.trim(),
  };
}

export function isValidContestDraft(value) {
  return Boolean(
    value &&
      typeof value.contestName === "string" &&
      typeof value.contestDate === "string" &&
      typeof value.subjectName === "string" &&
      value.syllabus &&
      typeof value.syllabus.rawInput === "string" &&
      Array.isArray(value.syllabus.topics) &&
      typeof value.notes === "string",
  );
}

export function buildFormFromDraft(value) {
  return {
    contestName: value.contestName || "",
    contestDate: value.contestDate || "",
    subjectName: value.subjectName || "",
    syllabusInput:
      value?.syllabus?.rawInput ||
      (Array.isArray(value?.syllabus?.topics) ? value.syllabus.topics.join(", ") : ""),
    notes: value.notes || "",
  };
}
