import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { endpoints, queryKeys } from "@/lib/api/endpoints";
import type { BlogPostDetailResponse, BlogPostDto } from "@/types/blogPost";
import { Spinner } from "@/components/ui/spinner";

const DEFAULT_OG =
  "https://i.pinimg.com/736x/d0/12/ff/d012ff9db63632a5d2fda38c45e886fc.jpg";

function isNotFoundError(error: Error): boolean {
  const e = error as Error & { response?: { status?: number } };
  return e.response?.status === 404;
}

function BlogPostingJsonLd({ post }: { post: BlogPostDto }) {
  const jsonLd = useMemo(() => {
    const pageUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/blog/${post.slug}`
        : "";
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.meta_description,
      datePublished: post.published_at ?? undefined,
      url: pageUrl,
      image: post.og_image ?? post.featured_image ?? DEFAULT_OG,
    };
  }, [post]);

  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-marcelinos", "blog-posting-jsonld");
    el.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [jsonLd]);

  return null;
}

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  useScrollToTop();

  const {
    data: response,
    isLoading,
    error,
  } = useApiQuery<BlogPostDetailResponse>(
    [...queryKeys.blogPosts.detail(slug ?? "")],
    endpoints.blogPostBySlug(slug ?? ""),
    { enabled: Boolean(slug) },
  );

  const post = response?.success ? response.data : undefined;
  const notFound = Boolean(error && isNotFoundError(error));

  usePageSEO(
    post && slug
      ? {
          title: `${post.title} | Marcelinos Hotel & Resort`,
          description: post.meta_description,
          path: `/blog/${slug}`,
          keywords: post.meta_keywords ?? undefined,
          image: post.og_image ?? post.featured_image ?? DEFAULT_OG,
        }
      : slug && isLoading
        ? {
            title: "Blog | Marcelinos Hotel & Resort",
            description:
              "News and updates from Marcelinos Hotel & Resort in Hilongos, Leyte.",
            path: `/blog/${slug}`,
            keywords: "Marcelinos, blog, Hilongos Leyte",
          }
        : notFound && slug
          ? {
              title: "Post not found | Marcelinos Hotel & Resort",
              description:
                "This blog post is no longer available. Browse other news from Marcelinos Hotel & Resort.",
              path: `/blog/${slug}`,
            }
          : null,
  );

  if (!slug) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 pt-28 pb-14 md:pt-36">
        <p className="text-center text-neutral-600">Invalid link.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 pt-28 pb-14 md:pt-36">
        <Spinner />
      </div>
    );
  }

  if (error && isNotFoundError(error)) {
    return (
      <div id="blog-post" className="min-h-screen bg-neutral-50">
        <article className="mx-auto max-w-3xl px-4 pt-28 pb-10 md:pt-36 md:pb-14">
          <h1 className="font-display text-2xl font-bold text-green-900">
            Post not found
          </h1>
          <p className="mt-2 text-neutral-600">
            This blog post may have been removed or the link is incorrect.
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-block text-sm font-medium text-green-800 underline underline-offset-2 hover:text-green-950"
          >
            Back to blog
          </Link>
        </article>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 pt-28 pb-14 md:pt-36">
        <p className="text-center text-neutral-600">
          {error?.message ?? "Could not load this post."}
        </p>
        <Link
          to="/blog"
          className="mt-4 block text-center text-sm font-medium text-green-800 underline"
        >
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div id="blog-post" className="min-h-screen bg-neutral-50">
      <BlogPostingJsonLd post={post} />
      <article className="mx-auto max-w-3xl px-4 pt-28 pb-10 md:pt-36 md:pb-14">
        <header className="mb-8">
          <nav className="mb-4 text-sm text-neutral-600">
            <Link to="/blog" className="text-green-800 hover:underline">
              Blog
            </Link>
            <span className="mx-2 text-neutral-400">/</span>
            <span className="text-neutral-800">{post.title}</span>
          </nav>
          <h1 className="font-display text-3xl font-bold tracking-tight text-green-900 md:text-4xl">
            {post.title}
          </h1>
          {post.featured_image ? (
            <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm">
              <img
                src={post.featured_image}
                alt={post.title}
                className="max-h-[min(28rem,70vh)] w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          ) : null}
          <p className="mt-4 text-base leading-relaxed text-neutral-700">
            {post.excerpt}
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div
            className="mx-auto max-w-full"
            style={{ maxWidth: post.iframe_width }}
          >
            <iframe
              title={`${post.title} — Facebook post`}
              src={post.embed_src}
              width={post.iframe_width}
              height={post.iframe_height}
              className="max-w-full border-0"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogPost;
