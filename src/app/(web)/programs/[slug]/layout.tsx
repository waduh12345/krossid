import type { Metadata } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const SITE_URL = process.env.NEXTAUTH_URL || "https://kross.id";

type ProgramData = {
  id: number;
  title: string;
  sub_title?: string | null;
  description?: string | null;
  original?: string;
  avif?: string;
  image?: string | null;
};

async function getProgramById(id: number): Promise<ProgramData | null> {
  if (!API_BASE || !id || isNaN(id)) return null;
  try {
    const res = await fetch(`${API_BASE}/public/programs/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    return data ? { ...data } : null;
  } catch {
    return null;
  }
}

function getOgImageUrl(program: ProgramData): string {
  const raw =
    program.original || program.avif || (typeof program.image === "string" ? program.image : null);
  if (!raw) return `${SITE_URL}/kross-id.png`;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = API_BASE.replace(/\/api\/v\d+$/, "");
  return raw.startsWith("/") ? `${base}${raw}` : `${base}/${raw}`;
}

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  const id = slug ? parseInt(slug, 10) : NaN;
  const program = await getProgramById(id);

  if (!program) {
    return {
      title: "Program | KROSS.ID",
      description: "Program affiliate KROSS.ID",
    };
  }

  const title = program.title || "Program | KROSS.ID";
  const description =
    program.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `${program.title} - Program KROSS.ID`;
  const ogImage = getOgImageUrl(program);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/programs/${program.id}`,
      siteName: "KROSS.ID",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: program.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ProgramSlugLayout({ children }: Props) {
  return <>{children}</>;
}
