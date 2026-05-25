import Link from "next/link";
import { ArrowRight, BookOpen, Award, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourse } from "@/lib/course-data";

export default function HomePage() {
  const course = getCourse();
  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-aws-dark to-slate-900 text-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-aws-orange/30 bg-aws-orange/10 px-4 py-1.5 text-sm text-aws-orange mb-6">
            <BookOpen className="h-4 w-4" />
            Based on the Amazon Builders&apos; Library
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Master AWS
            <br />
            <span className="text-aws-orange">Distributed Systems</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Learn battle-tested patterns for building resilient, scalable systems
            from the engineers who built AWS — distilled into {totalLessons}{" "}
            hands-on lessons.
          </p>
          <Link href="/course">
            <Button size="lg" className="bg-aws-orange hover:bg-aws-orange/90 text-white">
              Start Learning <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12 grid grid-cols-3 gap-8 text-center">
          {[
            { label: "Modules", value: course.modules.length },
            { label: "Lessons", value: totalLessons },
            { label: "Self-Paced", value: "100%" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-aws-orange">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          What You&apos;ll Learn
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Resilience Patterns",
              desc: "Fault isolation, static stability, shuffle-sharding, and multi-AZ resilience patterns used at Amazon scale.",
            },
            {
              icon: BarChart3,
              title: "Traffic Management",
              desc: "Timeouts, retries with jitter, backoff strategies, overload protection, and queue management techniques.",
            },
            {
              icon: Award,
              title: "Safe Deployments",
              desc: "CI/CD pipelines, rollback safety, chaos engineering, and hands-off deployment automation.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border p-6 hover:shadow-lg transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-aws-orange mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Module overview */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Course Modules
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.modules.map((mod) => (
              <Link
                key={mod.slug}
                href="/course"
                className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-sm font-medium text-aws-orange mb-2">
                  Module {mod.id}
                </div>
                <h3 className="text-lg font-semibold mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {mod.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {mod.lessons.length} lessons
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
