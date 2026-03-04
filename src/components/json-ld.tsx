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
  tags,
  wordCount,
}: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  coverImage?: string;
  tags?: string[];
  wordCount?: number;
}) {
  const ogImage = `https://sshdopey.com/og/${slug}.png`;
  const images: string[] = [ogImage];
  if (coverImage) {
    images.push(
      coverImage.startsWith("http")
        ? coverImage
        : `https://sshdopey.com${coverImage}`,
    );
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    url: `https://sshdopey.com/blog/${slug}`,
    datePublished: publishedAt,
    dateModified: publishedAt,
    image: images,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sshdopey.com/blog/${slug}`,
    },
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
    ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
    ...(wordCount && { wordCount }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
