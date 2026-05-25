"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/components/quiz";
import type { Module, Lesson } from "@/lib/course-data";
import { isLessonComplete, markLessonComplete } from "@/lib/progress";

interface Props {
  module: Module;
  lesson: Lesson;
  children: React.ReactNode;
  quiz: QuizData | null;
  prev: { module: Module; lesson: Lesson } | null;
  next: { module: Module; lesson: Lesson } | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  lessonSlug: string;
  questions: QuizQuestion[];
}

export function LessonContent({ module: mod, lesson, children, quiz, prev, next }: Props) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isLessonComplete(mod.slug, lesson.slug));
  }, [mod.slug, lesson.slug]);

  function handleMarkComplete() {
    markLessonComplete(mod.slug, lesson.slug);
    setCompleted(true);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/course" className="hover:text-foreground">
          Course
        </Link>
        <span>/</span>
        <span>{mod.title}</span>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div className="mb-8">
        <div className="text-sm font-medium text-aws-orange mb-2">
          Module {mod.id} — Lesson {lesson.id}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{lesson.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {lesson.author && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {lesson.author}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} min read
          </span>
          {completed && (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* MDX Content (rendered on server, passed as children) */}
      {children}

      {/* Quiz */}
      {quiz && quiz.questions.length > 0 && (
        <div className="mt-12">
          <Quiz data={quiz} lessonSlug={lesson.slug} />
        </div>
      )}

      {/* Complete button */}
      {!completed && (
        <div className="mt-10 text-center">
          <Button
            size="lg"
            onClick={handleMarkComplete}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Complete
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t">
        {prev ? (
          <Link href={`/course/${prev.module.slug}/${prev.lesson.slug}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {prev.lesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link href={`/course/${next.module.slug}/${next.lesson.slug}`}>
            <Button variant="ghost" className="gap-2">
              {next.lesson.title}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/certificate">
            <Button className="gap-2 bg-aws-orange hover:bg-aws-orange/90 text-white">
              View Certificate
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
