import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services - AskMikeAI",
  description:
    "Explore our comprehensive AI consulting services including strategy, implementation, training, and ongoing support.",
};

const services = [
  {
    title: "AI Strategy Consulting",
    description:
      "Develop a comprehensive AI roadmap tailored to your business goals. We assess your current capabilities, identify opportunities, and create a clear path forward.",
    features: [
      "AI readiness assessment",
      "Technology stack evaluation",
      "ROI analysis and business case development",
      "Implementation roadmap",
      "Change management planning",
    ],
    gradient: "from-pink-600 to-coral-600",
  },
  {
    title: "Custom AI Development",
    description:
      "Build bespoke AI solutions tailored to your unique business challenges. From chatbots to predictive analytics, we create systems that deliver real value.",
    features: [
      "Natural language processing solutions",
      "Computer vision applications",
      "Predictive analytics and forecasting",
      "Recommendation systems",
      "Process automation",
    ],
    gradient: "from-teal-600 to-ocean-600",
  },
  {
    title: "AI Integration Services",
    description:
      "Seamlessly integrate AI capabilities into your existing systems and workflows. We ensure smooth deployment with minimal disruption.",
    features: [
      "API development and integration",
      "Legacy system modernization",
      "Cloud deployment (AWS, Azure, GCP)",
      "Data pipeline architecture",
      "Security and compliance implementation",
    ],
    gradient: "from-coral-600 to-pink-600",
  },
  {
    title: "AI Training & Workshops",
    description:
      "Empower your team with the knowledge and skills to leverage AI effectively. Our training programs are designed for all skill levels.",
    features: [
      "Executive AI literacy programs",
      "Technical deep-dives for developers",
      "Hands-on workshops",
      "Custom curriculum development",
      "Ongoing coaching and support",
    ],
    gradient: "from-ocean-600 to-teal-600",
  },
  {
    title: "AI Audits & Optimization",
    description:
      "Already using AI? We can help you get more value from your existing investments through comprehensive audits and optimization.",
    features: [
      "Performance assessment",
      "Model accuracy evaluation",
      "Cost optimization",
      "Bias and fairness analysis",
      "Scalability recommendations",
    ],
    gradient: "from-pink-700 to-purple-700",
  },
  {
    title: "Ongoing Support & Maintenance",
    description:
      "Keep your AI systems running smoothly with our ongoing support services. We monitor, maintain, and continuously improve your solutions.",
    features: [
      "24/7 monitoring",
      "Regular model updates",
      "Performance optimization",
      "Issue resolution",
      "Feature enhancements",
    ],
    gradient: "from-teal-600 to-teal-700",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery",
    description: "We learn about your business, challenges, and goals",
  },
  {
    step: "02",
    title: "Strategy",
    description: "We develop a tailored AI roadmap and implementation plan",
  },
  {
    step: "03",
    title: "Implementation",
    description: "We build and deploy your AI solutions with precision",
  },
  {
    step: "04",
    title: "Optimization",
    description: "We continuously improve and scale your AI capabilities",
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-ocean-800 py-24">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-teal-200 font-semibold tracking-wide uppercase mb-4">What We Offer</p>
            <h1 className="text-5xl font-display tracking-wide text-white sm:text-6xl">
              OUR SERVICES
            </h1>
            <p className="mt-6 text-xl text-teal-100">
              Comprehensive AI solutions designed to help your business innovate, optimize,
              and grow. From strategy to implementation, we&apos;ve got you covered.
            </p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative border border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-display text-white">{index + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">{service.title}</h3>
                <p className="mt-4 text-gray-600">{service.description}</p>
                <ul className="mt-6 space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center mr-3`}>
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-teal-600 font-semibold tracking-wide uppercase">How We Work</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              OUR PROCESS
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A proven methodology that delivers results
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-4">
            {process.map((phase, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-display text-white">{phase.step}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{phase.title}</h3>
                <p className="mt-2 text-gray-600">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-700 via-pink-800 to-purple-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            READY TO TRANSFORM YOUR BUSINESS?
          </h2>
          <p className="mt-4 text-xl text-pink-200 max-w-2xl mx-auto">
            Let&apos;s discuss which services are right for you. Schedule a free consultation.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-semibold text-pink-700 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
}
