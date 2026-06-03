import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getAllBlogPosts } from "@/data/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found - AskMikeAI",
    };
  }

  return {
    title: `${post.title} - AskMikeAI Blog`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-700 via-pink-800 to-purple-900 py-16">
        <div className="absolute top-10 right-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-pink-200 hover:text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Blog
          </Link>
          <div className="mt-8">
            <div className="flex items-center gap-3 text-sm">
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium">
                {post.category}
              </span>
              <span className="text-pink-200">{post.readTime}</span>
            </div>
            <h1 className="mt-4 text-4xl font-display tracking-wide text-white sm:text-5xl">
              {post.title.toUpperCase()}
            </h1>
            <div className="mt-6 flex items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-ocean-600 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {post.author.charAt(0)}
                </span>
              </div>
              <div className="ml-4">
                <p className="font-semibold text-white">{post.author}</p>
                <time dateTime={post.date} className="text-sm text-pink-200">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg prose-pink max-w-none">
            {post.content.split("\n").map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-display tracking-wide text-gray-900 mt-10 mb-4">
                    {trimmed.replace("## ", "").toUpperCase()}
                  </h2>
                );
              }

              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-3">
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }

              if (trimmed.startsWith("- ")) {
                return (
                  <li key={index} className="text-gray-700 ml-4 flex items-start">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-600 to-coral-600 mt-2 mr-3 flex-shrink-0"></span>
                    <span>{trimmed.replace("- ", "")}</span>
                  </li>
                );
              }

              if (trimmed.match(/^\d+\.\s/)) {
                return (
                  <li key={index} className="text-gray-700 ml-4 list-decimal">
                    {trimmed.replace(/^\d+\.\s/, "")}
                  </li>
                );
              }

              if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                return (
                  <p key={index} className="text-gray-900 font-semibold my-2">
                    {trimmed.replace(/\*\*/g, "")}
                  </p>
                );
              }

              return (
                <p key={index} className="text-gray-700 my-4 leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Share & Follow Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Follow us for more insights</h3>
            <div className="mt-4 flex gap-4">
              <a
                href="https://x.com/askmikeai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/askmikeai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-ocean-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@askmikeai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-600 to-pink-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-700 via-teal-600 to-ocean-700"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display tracking-wide text-white">
            GOT A PROBLEM WORTH SOLVING?
          </h2>
          <p className="mt-4 text-lg text-teal-100 max-w-2xl mx-auto">
            Describe your pain point and name what fixing it is worth. If it resonates, I&apos;ll build it.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-semibold text-teal-700 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Back the Build
          </Link>
        </div>
      </section>
    </div>
  );
}
