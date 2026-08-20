import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { getAllSlugs, getArticle } from "@/lib/learn";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.meta.title} | SkillDraft`,
    description: article.meta.description,
    alternates: { canonical: `https://skilldraft.io/learn/${slug}` },
    openGraph: {
      title: article.meta.title,
      description: article.meta.description,
      type: "article",
      publishedTime: article.meta.date,
      url: `https://skilldraft.io/learn/${slug}`,
    },
  };
}

export default async function LearnArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 lg:px-10 pt-10 pb-24 max-w-3xl mx-auto w-full">
        <nav
          className="flex items-center gap-2 text-[11px] text-silver-faint mb-6"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Link href="/learn" className="hover:text-silver-dim motion-safe:transition-colors">
            Learn
          </Link>
          <span>/</span>
          <span className="text-silver-mid">{article.meta.title}</span>
        </nav>

        <header className="mb-8">
          <h1
            className="text-headline text-3xl font-black leading-tight mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {article.meta.title}
          </h1>
          <p className="text-silver-muted text-sm mb-2">{article.meta.description}</p>
          <time
            className="text-silver-faint text-[10px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {new Date(article.meta.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        <article
          className="learn-prose"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        <div className="mt-12 border-t border-border-dark pt-8 flex items-center gap-6 flex-wrap">
          <div>
            <p
              className="text-headline text-sm font-semibold mb-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Skip the hand-writing.
            </p>
            <p className="text-silver-muted text-xs">
              Generate a quality-scored, security-scanned SKILL.md for any agent
              in under 60 seconds.
            </p>
          </div>
          <Link
            href="/generate"
            className="gradient-silver-btn text-xs font-semibold px-5 py-2.5 rounded-[4px] shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Generate →
          </Link>
        </div>
      </main>
    </div>
  );
}
