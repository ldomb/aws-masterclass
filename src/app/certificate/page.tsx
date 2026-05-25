"use client";

import { useEffect, useState } from "react";
import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourse } from "@/lib/course-data";
import { getCompletedCount } from "@/lib/progress";

export default function CertificatePage() {
  const course = getCourse();
  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    setCompleted(getCompletedCount());
  }, []);

  const allDone = completed >= totalLessons;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <Award
        className={`h-20 w-20 mx-auto mb-6 ${
          allDone ? "text-aws-orange" : "text-muted-foreground/30"
        }`}
      />
      <h1 className="text-3xl font-bold mb-4">
        {allDone ? "Congratulations!" : "Certificate of Completion"}
      </h1>

      {allDone ? (
        <>
          <p className="text-lg text-muted-foreground mb-8">
            You have completed all {totalLessons} lessons in the AWS Distributed
            Systems Masterclass. You now have a deep understanding of the
            patterns and practices that power Amazon&apos;s most resilient services.
          </p>
          <div className="rounded-xl border-2 border-aws-orange p-10 bg-gradient-to-b from-aws-orange/5 to-transparent">
            <div className="text-sm text-aws-orange font-medium mb-4">
              CERTIFICATE OF COMPLETION
            </div>
            <h2 className="text-2xl font-bold mb-2">
              AWS Distributed Systems Masterclass
            </h2>
            <p className="text-muted-foreground mb-6">
              Based on the Amazon Builders&apos; Library
            </p>
            <div className="text-sm text-muted-foreground">
              {totalLessons} lessons completed •{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-lg text-muted-foreground mb-4">
            Complete all lessons to earn your certificate.
          </p>
          <p className="text-muted-foreground">
            {completed} of {totalLessons} lessons completed (
            {Math.round((completed / totalLessons) * 100)}%)
          </p>
        </>
      )}
    </div>
  );
}
