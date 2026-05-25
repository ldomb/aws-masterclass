"use client";

import Link from "next/link";
import { CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { getCourse } from "@/lib/course-data";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
  isLessonComplete,
  getModuleProgress,
  getCompletedCount,
} from "@/lib/progress";
import { useEffect, useState } from "react";

export default function CourseDashboard() {
  const course = getCourse();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const completedCount = mounted ? getCompletedCount() : 0;
  const overallProgress = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Overall progress */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Course Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          {completedCount} of {totalLessons} lessons completed
        </p>
        <ProgressBar value={overallProgress} className="h-3" />
      </div>

      {/* Modules */}
      <div className="space-y-8">
        {course.modules.map((mod) => {
          const modProgress = mounted
            ? getModuleProgress(mod.slug, mod.lessons.length)
            : 0;

          return (
            <div key={mod.slug} className="rounded-xl border overflow-hidden">
              <div className="bg-muted/50 p-5 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-aws-orange mb-1">
                      Module {mod.id}
                    </div>
                    <h2 className="text-xl font-semibold">{mod.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mod.description}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {modProgress}%
                  </div>
                </div>
                <ProgressBar value={modProgress} className="h-1.5 mt-3" />
              </div>
              <div className="divide-y">
                {mod.lessons.map((lesson) => {
                  const completed = mounted && isLessonComplete(mod.slug, lesson.slug);

                  return (
                    <Link
                      key={lesson.slug}
                      href={`/course/${mod.slug}/${lesson.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {lesson.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {lesson.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {lesson.estimatedMinutes}m
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
