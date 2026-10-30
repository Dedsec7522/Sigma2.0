import { getCourseIndex } from "@/lib/course-index";

// Generated at build time and served as a static file to the search and advisor.
export const dynamic = "force-static";

export function GET() {
  return Response.json(getCourseIndex());
}
