export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dopey",
    url: "https://sshdopey.com",
    description:
      "Building AI systems and high-performance tools. Python for the models. Rust for everything else.",
    author: {
      "@type": "Person",
      name: "Dopey",
      url: "https://sshdopey.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dopey",
    url: "https://sshdopey.com",
    jobTitle: "Software Engineer",
    sameAs: [
      "https://github.com/sshdopey",
      "https://twitter.com/sshdopey",
      "https://linkedin.com/in/sshdopey",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  excerpt,
  slug,
  publishedAt,
  coverImage,
}: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  coverImage?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    url: `https://sshdopey.com/blog/${slug}`,
    datePublished: publishedAt,
    author: {
      "@type": "Person",
      name: "Dopey",
      url: "https://sshdopey.com",
    },
    publisher: {
      "@type": "Person",
      name: "Dopey",
      url: "https://sshdopey.com",
    },
    ...(coverImage && {
      image: coverImage.startsWith("http")
        ? coverImage
        : `https://sshdopey.com${coverImage}`,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
