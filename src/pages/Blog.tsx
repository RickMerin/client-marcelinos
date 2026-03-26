import { Link } from "react-router-dom";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import { endpoints, queryKeys } from "@/lib/api/endpoints";
import type { BlogPostsListResponse } from "@/types/blogPost";
import { Spinner } from "@/components/ui/spinner";

function Blog() {
  useScrollToTop();
  usePageSEO({
    title: "Blog | Marcelinos Hotel & Resort",
    description:
      "News and updates from Marcelinos Hotel & Resort in Hilongos, Leyte.",
    path: "/blog",
    keywords: "Marcelinos, blog, news, Hilongos Leyte, hotel resort updates",
  });

  const { data: response, isLoading, error } = useApiQuery<BlogPostsListResponse>(
    [...queryKeys.blogPosts.all],
    endpoints.blogPosts
  );

  const posts = response?.success ? response.data : [];

  return (
    <div id="blog" className="min-h-screen bg-neutral-50">
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-green-900 md:text-4xl">
            Blog
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Follow us on Facebook for the latest posts, or view them here.
          </p>
        </header>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error.message}
          </p>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <p className="text-sm text-neutral-600">
            No posts yet. Check back soon, or visit our Facebook page for updates.
          </p>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-green-200 hover:shadow-md sm:flex-row">
                  {post.featured_image ? (
                    <div className="relative aspect-[16/10] w-full shrink-0 bg-neutral-100 sm:aspect-auto sm:h-auto sm:min-h-[11rem] sm:w-44 sm:max-w-[45%]">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-xl font-semibold text-green-900">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-700">
                      {post.excerpt}
                    </p>
                    <span className="mt-3 inline-block text-sm font-medium text-green-800">
                      Read more →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

export default Blog;
