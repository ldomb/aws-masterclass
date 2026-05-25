import Link from "next/link";
import { ExternalLink, BookOpen } from "lucide-react";

const sources = [
  {
    module: "Module 1: Foundations of Distributed Systems",
    articles: [
      { title: "Challenges with Distributed Systems", author: "Jacob Gabrielson", url: "https://aws.amazon.com/builders-library/challenges-with-distributed-systems/" },
      { title: "Availability & Beyond: Improving Resilience", author: null, url: "https://docs.aws.amazon.com/whitepapers/latest/availability-and-beyond-improving-resilience/availability-and-beyond-improving-resilience.html" },
      { title: "Resilience Lessons from the Lunch Rush", author: "Mike Haken", url: "https://aws.amazon.com/builders-library/resilience-lessons-from-the-lunch-rush/" },
      { title: "Reliability, Constant Work, and a Good Cup of Coffee", author: "Colm MacCárthaigh", url: "https://aws.amazon.com/builders-library/reliability-and-constant-work/" },
    ],
  },
  {
    module: "Module 2: Fault Isolation & Resilience Patterns",
    articles: [
      { title: "AWS Fault Isolation Boundaries", author: null, url: "https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/abstract-and-introduction.html" },
      { title: "Static Stability Using Availability Zones", author: "Becky Weiss & Mike Furr", url: "https://aws.amazon.com/builders-library/static-stability-using-availability-zones/" },
      { title: "Advanced Multi-AZ Resilience Patterns", author: "Mike Haken", url: "https://docs.aws.amazon.com/whitepapers/latest/advanced-multi-az-resilience-patterns/advanced-multi-az-resilience-patterns.html" },
      { title: "Minimizing Correlated Failures in Distributed Systems", author: "Joe Magerramov", url: "https://aws.amazon.com/builders-library/minimizing-correlated-failures-in-distributed-systems/" },
      { title: "Workload Isolation Using Shuffle-Sharding", author: null, url: "https://aws.amazon.com/builders-library/workload-isolation-using-shuffle-sharding/" },
    ],
  },
  {
    module: "Module 3: Traffic Management & Overload Protection",
    articles: [
      { title: "Timeouts, Retries, and Backoff with Jitter", author: "Marc Brooker", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/" },
      { title: "Making Retries Safe with Idempotent APIs", author: "Malcolm Featonby", url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/" },
      { title: "Avoiding Overload in Distributed Systems by Putting the Smaller Service in Control", author: "Joe Magerramov", url: "https://aws.amazon.com/builders-library/avoiding-overload-in-distributed-systems-by-putting-the-smaller-service-in-control/" },
      { title: "Avoiding Fallback in Distributed Systems", author: "Jacob Gabrielson", url: "https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/" },
      { title: "Avoiding Insurmountable Queue Backlogs", author: "David Yanacek", url: "https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/" },
      { title: "Caching Challenges and Strategies", author: "Matt Brinkley & Jas Chhabra", url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/" },
    ],
  },
  {
    module: "Module 4: Service Dependencies & Multi-Tenancy",
    articles: [
      { title: "Dependency Isolation", author: "David Yanacek", url: "https://aws.amazon.com/builders-library/dependency-isolation/" },
      { title: "Fairness in Multi-Tenant Systems", author: "David Yanacek", url: "https://aws.amazon.com/builders-library/fairness-in-multi-tenant-systems/" },
      { title: "Leader Election in Distributed Systems", author: "Marc Brooker", url: "https://aws.amazon.com/builders-library/leader-election-in-distributed-systems/" },
    ],
  },
  {
    module: "Module 5: Safe Deployments & CI/CD",
    articles: [
      { title: "Going Faster with Continuous Delivery", author: "Mark Mansour", url: "https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/" },
      { title: "CI/CD Pipeline as Release Captain", author: "Clare Liguori", url: "https://aws.amazon.com/builders-library/cicd-pipeline/" },
      { title: "Automating Safe, Hands-Off Deployments", author: "Clare Liguori", url: "https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/" },
      { title: "Ensuring Rollback Safety During Deployments", author: "Sandeep Pokkunuri", url: "https://aws.amazon.com/builders-library/ensuring-rollback-safety-during-deployments/" },
      { title: "Chaos Engineering on AWS", author: "Laurent Domb", url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/chaos-engineering-on-aws/introduction.html" },
    ],
  },
  {
    module: "Module 6: Observability & Operational Excellence",
    articles: [
      { title: "Implementing Health Checks", author: "David Yanacek", url: "https://aws.amazon.com/builders-library/implementing-health-checks/" },
      { title: "Building Dashboards for Operational Visibility", author: "John O'Shea", url: "https://aws.amazon.com/builders-library/building-dashboards-for-operational-visibility/" },
      { title: "Instrumenting Distributed Systems for Operational Visibility", author: "David Yanacek", url: "https://aws.amazon.com/builders-library/instrumenting-distributed-systems-for-operational-visibility/" },
    ],
  },
];

const authors = [
  { name: "Jacob Gabrielson", role: "Senior Principal Engineer, Amazon" },
  { name: "Marc Brooker", role: "VP & Distinguished Engineer, Amazon" },
  { name: "Colm MacCárthaigh", role: "VP & Distinguished Engineer, Amazon" },
  { name: "Joe Magerramov", role: "VP & Distinguished Engineer, Amazon" },
  { name: "David Yanacek", role: "Senior Principal Engineer, Amazon" },
  { name: "Becky Weiss", role: "VP & Distinguished Engineer, Amazon" },
  { name: "Clare Liguori", role: "Senior Principal Software Engineer, Amazon" },
  { name: "Malcolm Featonby", role: "Senior Principal Software Engineer, Amazon" },
  { name: "Sandeep Pokkunuri", role: "Senior Principal Engineer, Amazon" },
  { name: "Mike Haken", role: "Senior Principal Solutions Architect, AWS" },
  { name: "Mike Furr", role: "Senior Principal Engineer, Amazon" },
  { name: "Matt Brinkley", role: "Principal Engineer, Amazon" },
  { name: "Jas Chhabra", role: "Sr. Manager, Head of Engineering & Agentic AI, Amazon" },
  { name: "John O'Shea", role: "Principal Engineer, Amazon" },
  { name: "Mark Mansour", role: "Senior Manager of Software Development, Amazon" },
  { name: "Laurent Domb", role: "Chief Technologist, Federal Financials, AWS" },
];

export default function CreditsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Credits & Sources</h1>
      <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
        This course is built on the incredible work published in the{" "}
        <a
          href="https://aws.amazon.com/builders-library/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-aws-orange hover:underline inline-flex items-center gap-1"
        >
          Amazon Builders&apos; Library
          <ExternalLink className="h-3.5 w-3.5" />
        </a>{" "}
        and{" "}
        <a
          href="https://aws.amazon.com/prescriptive-guidance/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-aws-orange hover:underline inline-flex items-center gap-1"
        >
          AWS Prescriptive Guidance
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        ,{" "}
        <a
          href="https://docs.aws.amazon.com/whitepapers/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-aws-orange hover:underline inline-flex items-center gap-1"
        >
          AWS Whitepapers
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        . These are collections of articles and guides describing how Amazon
        builds and operates software. We are grateful to the authors and
        Amazon for making this knowledge publicly available.
      </p>

      {/* Authors */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Contributing Authors</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {authors.map((author) => (
            <div
              key={author.name}
              className="rounded-lg border p-4 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-aws-orange/10 flex items-center justify-center text-aws-orange font-semibold text-sm shrink-0">
                {author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="font-medium">{author.name}</div>
                <div className="text-sm text-muted-foreground">
                  {author.role}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Many articles in the Builders&apos; Library are published without
          individual author attribution. We thank the entire AWS engineering
          team for their contributions.
        </p>
      </section>

      {/* Source Articles */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Source Articles</h2>
        <p className="text-muted-foreground mb-6">
          Each lesson in this course draws from the following Amazon
          Builders&apos; Library, AWS Prescriptive Guidance, and AWS
          Whitepapers. We encourage you to read the originals for additional
          depth.
        </p>
        <div className="space-y-8">
          {sources.map((group) => (
            <div key={group.module}>
              <h3 className="font-semibold text-sm text-aws-orange mb-3">
                {group.module}
              </h3>
              <div className="space-y-2">
                {group.articles.map((article) => (
                  <a
                    key={article.title}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 rounded-lg border p-3 hover:bg-muted/30 transition-colors group"
                  >
                    <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-aws-orange shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium group-hover:text-aws-orange transition-colors">
                        {article.title}
                      </div>
                      {article.author && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          by {article.author}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-xl border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold mb-2">Disclaimer</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This course is an independent educational resource and is not
          affiliated with, endorsed by, or sponsored by Amazon Web Services
          (AWS) or Amazon.com, Inc. All original content from the Amazon
          Builders&apos; Library, AWS Prescriptive Guidance, and AWS
          Whitepapers remains the intellectual property of Amazon.com, Inc.
          The lessons in this course represent our interpretation and
          educational adaptation of the publicly available articles. AWS,
          Amazon, the Amazon Builders&apos; Library, AWS Prescriptive
          Guidance, and AWS Whitepapers are trademarks of Amazon.com, Inc.
        </p>
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/course"
          className="text-sm text-aws-orange hover:underline"
        >
          Back to Course
        </Link>
      </div>
    </div>
  );
}
