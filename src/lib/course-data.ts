import courseJson from "@/../content/course.json";

export interface Lesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  author: string | null;
  estimatedMinutes: number;
  sourceArticle: string;
}

export interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  title: string;
  description: string;
  modules: Module[];
}

export function getCourse(): Course {
  return courseJson as Course;
}

export function getModule(slug: string): Module | undefined {
  return getCourse().modules.find((m) => m.slug === slug);
}

export function getLesson(
  moduleSlug: string,
  lessonSlug: string
): { module: Module; lesson: Lesson } | undefined {
  const mod = getModule(moduleSlug);
  if (!mod) return undefined;
  const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return undefined;
  return { module: mod, lesson };
}

export function getAllLessons(): { module: Module; lesson: Lesson }[] {
  const course = getCourse();
  return course.modules.flatMap((mod) =>
    mod.lessons.map((lesson) => ({ module: mod, lesson }))
  );
}

export function getAdjacentLessons(moduleSlug: string, lessonSlug: string) {
  const all = getAllLessons();
  const idx = all.findIndex(
    (l) => l.module.slug === moduleSlug && l.lesson.slug === lessonSlug
  );
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
