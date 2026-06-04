export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

// Intentionally empty: the generic starter posts were removed. Real
// build-in-public notes will be added here, and "Writing" re-linked in the nav.
export const blogPosts: BlogPost[] = [];

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
