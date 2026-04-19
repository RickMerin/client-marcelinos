/** Public blog post payload from GET /api/blog-posts */
export type BlogPostDto = {
  id: number;
  title: string;
  slug: string;
  embed_src: string;
  iframe_width: number;
  iframe_height: number;
  meta_description: string;
  meta_keywords: string | null;
  og_image: string | null;
  /** Uploaded featured image URL (list + post header), optional */
  featured_image: string | null;
  excerpt: string;
  published_at: string | null;
};

export type BlogPostsListResponse = {
  success: boolean;
  data: BlogPostDto[];
};

export type BlogPostDetailResponse = {
  success: boolean;
  data: BlogPostDto;
};
