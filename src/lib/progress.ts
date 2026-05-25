"use client";

const STORAGE_KEY = "aws-course-progress";

export interface Progress {
  completedLessons: string[]; // "module-slug/lesson-slug"
  quizScores: Record<string, number>; // "lesson-slug" -> score percentage
}

function getProgress(): Progress {
  if (typeof window === "undefined") {
    return { completedLessons: [], quizScores: {} };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data
      ? JSON.parse(data)
      : { completedLessons: [], quizScores: {} };
  } catch {
    return { completedLessons: [], quizScores: {} };
  }
}

function saveProgress(progress: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isLessonComplete(moduleSlug: string, lessonSlug: string): boolean {
  return getProgress().completedLessons.includes(`${moduleSlug}/${lessonSlug}`);
}

export function markLessonComplete(moduleSlug: string, lessonSlug: string) {
  const progress = getProgress();
  const key = `${moduleSlug}/${lessonSlug}`;
  if (!progress.completedLessons.includes(key)) {
    progress.completedLessons.push(key);
    saveProgress(progress);
  }
}

export function getQuizScore(lessonSlug: string): number | undefined {
  return getProgress().quizScores[lessonSlug];
}

export function saveQuizScore(lessonSlug: string, score: number) {
  const progress = getProgress();
  progress.quizScores[lessonSlug] = score;
  saveProgress(progress);
}

export function getCompletedCount(): number {
  return getProgress().completedLessons.length;
}

export function getModuleProgress(moduleSlug: string, lessonCount: number): number {
  const progress = getProgress();
  const completed = progress.completedLessons.filter((l) =>
    l.startsWith(`${moduleSlug}/`)
  ).length;
  return lessonCount > 0 ? Math.round((completed / lessonCount) * 100) : 0;
}

export function getAllProgress(): Progress {
  return getProgress();
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
