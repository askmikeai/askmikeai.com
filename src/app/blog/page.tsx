import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Writing - AskMikeAI",
  description:
    "Mike writes about what he's building, breaking, and learning in AI — in public, one post at a time.",
};

const gradients = [
  "from-pink-600 to-coral-600",
  "from-teal-600 to-ocean-600",
  "from-coral-600 to-pink-600",
];

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 py-24">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-teal-400 font-semibold tracking-wide uppercase mb-4">Building in public</p>
            <h1 className="text-5xl font-display tracking-wide text-white sm:text-6xl">
              WRITING
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Notes on what I&apos;m building, what&apos;s breaking, and what I&apos;m starting to
              figure out in AI — thinking out loud, in public.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article
                key={post.slug}
                className="group flex flex-col border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} h-48 flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-8xl text-white/20 font-display">
                    {post.title.charAt(0)}
                  </span>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                      {post.readTime}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    <Link href={`/blog/${post.slug}`} className="hover:text-pink-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-gray-600 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 flex items-center">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-sm font-bold`}>
                      {post.author.charAt(0)}
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="font-medium text-gray-900">{post.author}</span>
                      <span className="mx-2 text-gray-400">&bull;</span>
                      <time dateTime={post.date} className="text-gray-500">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-pink-600 font-semibold hover:text-pink-700 transition-colors"
                  >
                    Read more
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-pink-700 via-pink-800 to-purple-900 rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative text-center">
              <h2 className="text-3xl font-display tracking-wide text-white md:text-4xl">
                STAY UPDATED ON AI TRENDS
              </h2>
              <p className="mt-4 text-lg text-pink-200 max-w-2xl mx-auto">
                Subscribe to our newsletter for the latest insights, tutorials, and industry
                news delivered to your inbox.
              </p>
              <form className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full px-6 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white px-8 py-3 font-semibold text-pink-700 hover:bg-gray-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
