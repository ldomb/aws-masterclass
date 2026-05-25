"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { QuizData } from "@/components/lesson-content";
import { saveQuizScore, getQuizScore } from "@/lib/progress";

interface Props {
  data: QuizData;
  lessonSlug: string;
}

export function Quiz({ data, lessonSlug }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedScore] = useState(() => getQuizScore(lessonSlug));

  function handleSelect(questionIdx: number, optionIdx: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  }

  function handleSubmit() {
    setSubmitted(true);
    const correct = data.questions.filter(
      (q, i) => answers[i] === q.correctIndex
    ).length;
    const score = Math.round((correct / data.questions.length) * 100);
    saveQuizScore(lessonSlug, score);
  }

  const allAnswered = Object.keys(answers).length === data.questions.length;
  const score = submitted
    ? data.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : null;

  if (savedScore !== undefined && !submitted) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Quiz</h3>
        <p className="text-muted-foreground mb-4">
          You scored <strong>{savedScore}%</strong> on this quiz.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setAnswers({});
            setSubmitted(false);
          }}
        >
          Retake Quiz
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-1">Knowledge Check</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Test your understanding of this lesson.
      </p>

      <div className="space-y-8">
        {data.questions.map((q, qi) => (
          <div key={qi}>
            <p className="font-medium mb-3">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = q.correctIndex === oi;
                let borderClass = "border-border";
                if (submitted) {
                  if (isCorrect) borderClass = "border-green-500 bg-green-50 dark:bg-green-950/30";
                  else if (selected) borderClass = "border-red-500 bg-red-50 dark:bg-red-950/30";
                } else if (selected) {
                  borderClass = "border-aws-orange bg-aws-orange/5";
                }

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    className={`w-full text-left rounded-lg border-2 p-3 text-sm transition-colors ${borderClass} ${
                      !submitted ? "hover:border-aws-orange/50 cursor-pointer" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {submitted && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                      {submitted && selected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-2 text-sm text-muted-foreground italic">
                {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <Button
          className="mt-6 bg-aws-orange hover:bg-aws-orange/90 text-white"
          disabled={!allAnswered}
          onClick={handleSubmit}
        >
          Submit Answers
        </Button>
      )}

      {submitted && score !== null && (
        <div className="mt-6 p-4 rounded-lg bg-muted text-center">
          <p className="text-lg font-semibold">
            You got {score} out of {data.questions.length} correct!
          </p>
        </div>
      )}
    </Card>
  );
}
