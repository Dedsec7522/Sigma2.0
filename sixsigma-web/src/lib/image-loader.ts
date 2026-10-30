// Image loader for the static export (no image optimisation server): serves files
// as-is and adds the deployment base path to site-relative sources.
export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}
