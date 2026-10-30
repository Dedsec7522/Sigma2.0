export type DeliveryMethod = "classroom" | "virtual" | "online" | "onsite";
export type Level = "foundation" | "intermediate" | "advanced" | "expert";

export const LEVEL_LABEL: Record<Level, string> = {
  foundation: "Foundation",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export const METHOD_LABEL: Record<DeliveryMethod, string> = {
  classroom: "Classroom",
  virtual: "Online instructor-led",
  online: "Self-paced online",
  onsite: "Onsite for teams",
};

export type Faq = { q: string; a: string };

export type Session = {
  method: "classroom" | "virtual";
  location: string;
  locationSlug: string | null;
  date: string;
  price: number | null;
  duration: string | null;
  bookingUrl: string | null;
};

export type Course = {
  slug: string;
  category: string;
  path: string;
  name: string;
  h1: string;
  meta: { title: string; description: string };
  topicId: string | null;
  bullets: string[];
  summary: string;
  overviewHtml: string;
  outlineHtml: string;
  faqs: Faq[];
  included: { title: string; text: string }[];
  duration: string | null;
  durationDays: number | null;
  examIncluded: boolean;
  certificateIncluded: boolean;
  support: string | null;
  deliveryMethods: DeliveryMethod[];
  onlineCourseSlug: string | null;
  classroom: Session[];
  virtual: Session[];
  fromPrice: number | null;
  related: string[];
  popularLocations: string[];
  level: Level;
  audience: string | null;
  prerequisites: string | null;
  hours: string | null;
};

export type Category = {
  slug: string;
  path: string;
  name: string;
  h1: string;
  meta: { title: string; description: string };
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  courseSlugs: string[];
};

export type Location = {
  slug: string;
  path: string;
  name: string;
  meta: { title: string; description: string };
  intro: string;
  detailHtml: string;
};

export type CourseLocation = {
  path: string;
  coursePath: string;
  locationSlug: string;
  locationName: string;
  h1: string;
  meta: { title: string; description: string };
  classroom: Session[];
};

export type OnlineCourse = {
  slug: string;
  path: string;
  name: string;
  h1: string;
  meta: { title: string; description: string };
  intro: string;
  overviewHtml: string;
  outlineHtml: string;
  faqs: Faq[];
  addons: { id: string; label: string; price: number }[];
  price: number | null;
  bookingUrl: string | null;
  related: string[];
  level: Level;
  learners: string | null;
  access: string | null;
};

/** Compact course record shipped to the browser for search and the advisor. */
export type CourseIndexEntry = {
  path: string;
  name: string;
  category: string;
  categoryName: string;
  level: Level;
  duration: string | null;
  durationDays: number | null;
  methods: DeliveryMethod[];
  fromPrice: number | null;
  onlinePath: string | null;
  onlinePrice: number | null;
  examIncluded: boolean;
  summary: string;
  audience: string | null;
  prerequisites: string | null;
  nextDate: string | null;
  /** Upcoming scheduled start dates (YYYY-MM-DD) at build time, soonest first. */
  upcomingDates: string[];
  keywords: string;
};
