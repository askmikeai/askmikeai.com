import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              {/* Logo Mark */}
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 via-coral-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-pink-500/40 transition-shadow">
                <span className="text-white font-display text-2xl tracking-tight">M</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
              </div>
              {/* Logo Text */}
              <div className="flex flex-col leading-none">
                <span className="text-xs font-semibold text-gray-500 tracking-widest">ASK</span>
                <span className="text-2xl font-display tracking-wide bg-gradient-to-r from-pink-500 to-coral-500 bg-clip-text text-transparent">
                  MIKE<span className="text-teal-400">AI</span>
                </span>
              </div>
            </Link>
            <p className="mt-4 text-gray-300 max-w-md">
              Builder, educator, and member of the AI community. I make software that solves real
              problems — and I let the people with the problem decide what it&apos;s worth.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-teal-400 text-sm font-medium">Based in Miami, FL</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-pink-500">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
                  About Mike
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-teal-400 transition-colors">
                  What I Build
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Writing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-pink-500">Contact</h3>
            <ul className="mt-4 space-y-2 text-gray-300">
              <li>
                <a href="mailto:askmikeai@gmail.com" className="hover:text-teal-400 transition-colors">
                  askmikeai@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/17542959900" className="hover:text-teal-400 transition-colors">
                  +1 (754) 295-9900
                </a>
              </li>
              <li className="text-sm">Miami, FL</li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <a href="https://x.com/askmikeai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                <span className="sr-only">X</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com/askmikeai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://youtube.com/@askmikeai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://t.me/askmikeai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                <span className="sr-only">Telegram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; {currentYear} AskMikeAI. All rights reserved. Made with sun and innovation in Miami.
          </p>
        </div>
      </div>
    </footer>
  );
}
