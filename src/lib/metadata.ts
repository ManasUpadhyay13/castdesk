import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface OgMetadataOptions {
  title: string;
  description: string;
  section?: string;
  path?: string;
}

export function generateOgMetadata({
  title,
  description,
  section,
  path = "",
}: OgMetadataOptions): Metadata {
  const ogImageParams = new URLSearchParams({
    title,
    description,
    ...(section && { section }),
  });

  const ogImageUrl = `${BASE_URL}/api/og?${ogImageParams.toString()}`;
  const pageUrl = `${BASE_URL}${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "CastDeck",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
