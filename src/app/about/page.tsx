import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - AskMikeAI",
  description:
    "Learn about AskMikeAI and our mission to help businesses leverage artificial intelligence for growth and innovation.",
};

const team = [
  {
    name: "Mike Anderson",
    role: "Founder & CEO",
    bio: "With over 15 years in AI and machine learning, Mike has helped countless organizations transform their operations through intelligent automation.",
    gradient: "from-pink-600 to-coral-600",
  },
  {
    name: "Dr. Emily Chen",
    role: "Chief AI Scientist",
    bio: "Former research lead at a major tech company, Emily brings deep expertise in natural language processing and computer vision.",
    gradient: "from-teal-600 to-ocean-600",
  },
  {
    name: "David Park",
    role: "Head of Engineering",
    bio: "A full-stack engineer with a passion for building scalable AI systems that deliver real business value.",
    gradient: "from-coral-600 to-pink-600",
  },
];

const values = [
  {
    title: "Innovation",
    description:
      "We stay at the forefront of AI technology, continuously exploring new approaches to solve complex problems.",
  },
  {
    title: "Integrity",
    description:
      "We believe in ethical AI development and transparent practices in everything we do.",
  },
  {
    title: "Impact",
    description:
      "We measure success by the tangible results we deliver for our clients and their customers.",
  },
  {
    title: "Partnership",
    description:
      "We work alongside our clients as true partners, committed to their long-term success.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 py-24">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-pink-400 font-semibold tracking-wide uppercase mb-4">About Us</p>
            <h1 className="text-5xl font-display tracking-wide text-white sm:text-6xl">
              ABOUT ASKMIKEAI
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              We&apos;re on a mission to democratize AI and help businesses of all sizes
              harness its transformative power. Based in sunny Miami, we bring warmth
              and innovation to every project.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-teal-600 font-semibold tracking-wide uppercase">Our Story</p>
              <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900">
                BORN IN MIAMI, BUILT FOR THE WORLD
              </h2>
              <div className="mt-6 space-y-4 text-gray-600">
                <p>
                  AskMikeAI was founded with a simple belief: that every business deserves
                  access to world-class AI expertise. Too often, we saw companies struggle
                  to navigate the complex landscape of artificial intelligence, missing out
                  on opportunities for growth and efficiency.
                </p>
                <p>
                  What started as a one-person consultancy in Miami&apos;s vibrant tech scene has
                  grown into a team of passionate AI experts, engineers, and strategists.
                  Together, we&apos;ve helped over 50 organizations implement AI solutions that
                  drive real results.
                </p>
                <p>
                  Today, we continue to push the boundaries of what&apos;s possible with AI,
                  while never losing sight of what matters most: delivering value for our
                  clients and their customers.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-700 via-pink-800 to-purple-900 rounded-3xl p-10 text-white shadow-2xl">
                <blockquote className="text-xl italic">
                  &ldquo;Our goal isn&apos;t just to implement AI—it&apos;s to transform how
                  businesses think about and use technology to serve their customers better.&rdquo;
                </blockquote>
                <p className="mt-6 font-display text-2xl tracking-wide">— MIKE ANDERSON</p>
                <p className="text-pink-300">Founder</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-teal-500/30 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-coral-600 font-semibold tracking-wide uppercase">What Drives Us</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              OUR VALUES
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at AskMikeAI.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">{value.title.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-teal-600 font-semibold tracking-wide uppercase">The Team</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              MEET OUR TEAM
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A diverse group of experts passionate about AI and committed to your success.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className={`mx-auto h-40 w-40 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform`}>
                  <span className="text-6xl font-display text-white">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-pink-600 font-medium">{member.role}</p>
                <p className="mt-4 text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-700 via-pink-800 to-coral-800"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            WANT TO WORK WITH US?
          </h2>
          <p className="mt-4 text-xl text-pink-200 max-w-2xl mx-auto">
            We&apos;re always looking for new challenges and opportunities to help businesses grow.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-semibold text-pink-700 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
