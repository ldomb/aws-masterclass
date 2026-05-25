import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getCourse, getLesson, getAdjacentLessons } from "@/lib/course-data";
import { LessonContent } from "@/components/lesson-content";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import {
  ExponentialBackoffVisualizer,
  ShuffleShardingDemo,
  CircuitBreakerDemo,
  QueueSimulator,
  DeploymentSimulator,
  AvailabilityCalculator,
  MultiAZTopology,
  FailureCascadeDemo,
  RequestFlowSimulator,
  MetricsDashboard,
} from "@/components/interactive";

interface Props {
  params: Promise<{ module: string; lesson: string }>;
}

export function generateStaticParams() {
  const course = getCourse();
  return course.modules.flatMap((mod) =>
    mod.lessons.map((lesson) => ({
      module: mod.slug,
      lesson: lesson.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const data = getLesson(moduleSlug, lessonSlug);
  if (!data) return { title: "Not Found" };
  return {
    title: `${data.lesson.title} — AWS Masterclass`,
    description: data.lesson.description,
  };
}

const mdxComponents = {
  Mermaid: MermaidDiagram,
  ExponentialBackoffVisualizer,
  ShuffleShardingDemo,
  CircuitBreakerDemo,
  QueueSimulator,
  DeploymentSimulator,
  AvailabilityCalculator,
  MultiAZTopology,
  FailureCascadeDemo,
  RequestFlowSimulator,
  MetricsDashboard,
  Callout: ({
    type = "info",
    children,
  }: {
    type?: string;
    children: React.ReactNode;
  }) => {
    const colors: Record<string, string> = {
      info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
      warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
      tip: "border-green-500 bg-green-50 dark:bg-green-950/30",
    };
    return (
      <div
        className={`border-l-4 rounded-r-lg p-4 my-6 ${colors[type] || colors.info}`}
      >
        {children}
      </div>
    );
  },
  KeyTakeaways: ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl border-2 border-aws-orange/30 bg-aws-orange/5 p-6 my-8">
      <h3 className="text-lg font-semibold text-aws-orange mb-3">
        Key Takeaways
      </h3>
      {children}
    </div>
  ),
};

export default async function LessonPage({ params }: Props) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const data = getLesson(moduleSlug, lessonSlug);
  if (!data) notFound();

  const { prev, next } = getAdjacentLessons(moduleSlug, lessonSlug);

  // Load the MDX content
  let content = "";
  try {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "content",
      "modules",
      moduleSlug,
      `${lessonSlug}.mdx`
    );
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    content = `# ${data.lesson.title}\n\nContent coming soon.`;
  }

  // Load quiz data
  let quiz = null;
  try {
    const fs = await import("fs");
    const path = await import("path");
    const quizPath = path.join(
      process.cwd(),
      "content",
      "quizzes",
      `${lessonSlug}.json`
    );
    quiz = JSON.parse(fs.readFileSync(quizPath, "utf-8"));
  } catch {
    // No quiz available
  }

  // Render MDX on server, pass as children to client component
  const mdxContent = (
    <article className="prose">
      <MDXRemote source={content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </article>
  );

  return (
    <LessonContent
      module={data.module}
      lesson={data.lesson}
      quiz={quiz}
      prev={prev}
      next={next}
    >
      {mdxContent}
    </LessonContent>
  );
}
