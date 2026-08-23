export type TechCategoryKey = "language" | "database" | "cloud";

export type TechCategory = {
  key: TechCategoryKey;
  label: string;
  icon: string;
  description: string;
};

export const techCategories: TechCategory[] = [
  {
    key: "language",
    label: "Languages",
    icon: "💻",
    description: "Core languages and markup I use to build for the web",
  },
  {
    key: "database",
    label: "Database",
    icon: "🗄️",
    description: "Where the data lives — relational and document stores",
  },
  {
    key: "cloud",
    label: "Cloud",
    icon: "☁️",
    description: "Infrastructure and tooling for shipping to production",
  },
];

export type TechItem = {
  slug: string;
  name: string;
  icon: string;
  category: TechCategoryKey;
  tagline: string;
  description: string;
  keyConcepts: string[];
  docsUrl: string;
  notesUrl?: string;
  comingSoon?: boolean;
};

export const techStack: TechItem[] = [
  // ── Languages ──
  {
    slug: "javascript",
    name: "JavaScript",
    icon: "🟡",
    category: "language",
    tagline: "The language of the web",
    description:
      "JavaScript is the dynamic, event-driven language that runs in every browser and, via Node.js, on the server too. It's the foundation everything else in this stack — TypeScript, React, Node.js — is built on top of.",
    keyConcepts: [
      "Event loop & asynchronous programming (Promises, async/await)",
      "Closures, scope, and the prototype chain",
      "ES6+ features — destructuring, modules, arrow functions, spread/rest",
      "DOM manipulation and browser APIs",
    ],
    docsUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    notesUrl: "/resources/javascript-basic-to-advanced.html",
  },
  {
    slug: "typescript",
    name: "TypeScript",
    icon: "🔷",
    category: "language",
    tagline: "JavaScript with static types",
    description:
      "TypeScript is a superset of JavaScript that adds static typing, catching bugs at compile time instead of runtime. I use it on both the frontend and backend for safer refactors and self-documenting code.",
    keyConcepts: [
      "Interfaces, types, and generics",
      "Type inference and strict mode",
      "Union & intersection types, utility types",
      "Compile-time safety for large-scale apps and APIs",
    ],
    docsUrl: "https://www.typescriptlang.org/docs/",
  },
  {
    slug: "html",
    name: "HTML",
    icon: "🌐",
    category: "language",
    tagline: "The structure of every page",
    description:
      "HTML is the markup language that structures content on the web — headings, forms, semantic sections, and accessibility hooks that every other technology renders on top of.",
    keyConcepts: [
      "Semantic elements — header, main, section, article",
      "Forms, inputs, and validation attributes",
      "Accessibility (ARIA roles, alt text, landmark elements)",
      "Metadata & SEO fundamentals",
    ],
    docsUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML",
  },
  {
    slug: "css",
    name: "CSS",
    icon: "🎨",
    category: "language",
    tagline: "Styling and layout for the web",
    description:
      "CSS controls how HTML looks and behaves visually — layout systems, animations, and design tokens that turn markup into a polished interface.",
    keyConcepts: [
      "Flexbox & Grid for layout",
      "Custom properties (CSS variables) and theming",
      "Transitions, keyframe animations, and transforms",
      "Specificity, cascade, and the box model",
    ],
    docsUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS",
  },
  {
    slug: "responsive-design",
    name: "Responsive Design",
    icon: "📐",
    category: "language",
    tagline: "Bootstrap & media queries",
    description:
      "Responsive design makes a single layout work across phones, tablets, and desktops. I lean on CSS media queries for custom breakpoints and Bootstrap's grid system for fast, consistent, mobile-first layouts.",
    keyConcepts: [
      "Media queries — breakpoints for min/max-width",
      "Mobile-first design workflow",
      "Bootstrap's 12-column responsive grid & utility classes",
      "Fluid typography and flexible images",
    ],
    docsUrl: "https://getbootstrap.com/docs/5.3/getting-started/introduction/",
  },

  // ── Database ──
  {
    slug: "postgresql",
    name: "PostgreSQL",
    icon: "🐘",
    category: "database",
    tagline: "Advanced open-source relational database",
    description:
      "PostgreSQL is a powerful, open-source relational database known for reliability, strong SQL compliance, and advanced features like JSONB columns and full-text search. I've used it in production for platforms like Lifedemy.",
    keyConcepts: [
      "Relational schema design & normalization",
      "Indexes, joins, and query optimization",
      "JSONB for flexible, semi-structured data",
      "Transactions and ACID guarantees",
    ],
    docsUrl: "https://www.postgresql.org/docs/",
  },
  {
    slug: "mongodb",
    name: "MongoDB",
    icon: "🍃",
    category: "database",
    tagline: "Document-oriented NoSQL database",
    description:
      "MongoDB stores data as flexible, JSON-like documents instead of rigid tables — a good fit for rapidly evolving schemas and read-heavy apps. I've paired it with Mongoose across several client projects.",
    keyConcepts: [
      "Collections & documents (BSON) instead of tables & rows",
      "Schema design for embedding vs. referencing",
      "Aggregation pipelines",
      "Indexing for query performance",
    ],
    docsUrl: "https://www.mongodb.com/docs/",
  },
  {
    slug: "sql",
    name: "SQL",
    icon: "🗃️",
    category: "database",
    tagline: "The standard language for relational data",
    description:
      "SQL is the query language behind every relational database. Whether it's PostgreSQL or MySQL, the same fundamentals — selecting, joining, and aggregating data — power the queries underneath.",
    keyConcepts: [
      "SELECT, JOIN, GROUP BY, and subqueries",
      "Primary/foreign keys and referential integrity",
      "Indexes and query performance",
      "Transactions and isolation levels",
    ],
    docsUrl: "https://www.w3schools.com/sql/",
  },
  {
    slug: "prisma",
    name: "Prisma",
    icon: "◆",
    category: "database",
    tagline: "Type-safe ORM for Node.js & TypeScript",
    description:
      "Prisma is a next-generation ORM that generates a fully type-safe query client from a declarative schema file — autocomplete and compile-time checks for every query, no raw SQL required. I've used it to model client data for the NextGen (IQVIA) platform.",
    keyConcepts: [
      "Declarative schema file as the single source of truth",
      "Auto-generated, type-safe query client",
      "Migrations via Prisma Migrate",
      "Relations, filtering, and pagination made simple",
    ],
    docsUrl: "https://www.prisma.io/docs",
  },
  {
    slug: "sequelize",
    name: "Sequelize",
    icon: "🔶",
    category: "database",
    tagline: "Promise-based ORM for SQL databases",
    description:
      "Sequelize is a mature, promise-based ORM for Node.js that works across PostgreSQL, MySQL, and more — mapping JavaScript models directly to relational tables with built-in validation and associations.",
    keyConcepts: [
      "Model definitions mapped to SQL tables",
      "Associations — hasOne, hasMany, belongsToMany",
      "Migrations & seeders for schema versioning",
      "Built-in validation and hooks/lifecycle events",
    ],
    docsUrl: "https://sequelize.org/docs/v6/",
  },
  {
    slug: "mongoose",
    name: "Mongoose",
    icon: "🍃",
    category: "database",
    tagline: "Elegant object modeling for MongoDB",
    description:
      "Mongoose sits on top of MongoDB, adding schemas, validation, and middleware to otherwise schema-less documents — making it easier to model and enforce structure across a growing app. I've used it across Camesports, KnowThyWithin, and DLF.",
    keyConcepts: [
      "Schemas & models for structuring documents",
      "Built-in validation and custom middleware (pre/post hooks)",
      "Population for referencing related documents",
      "Query builder API on top of the native MongoDB driver",
    ],
    docsUrl: "https://mongoosejs.com/docs/",
  },

  // ── Cloud ──
  {
    slug: "aws",
    name: "AWS",
    icon: "☁️",
    category: "cloud",
    tagline: "Cloud infrastructure at scale",
    description:
      "Amazon Web Services is the cloud platform I deploy on day to day — EC2 for compute, S3 for storage, Lambda for serverless functions, and CloudFront/API Gateway for delivery, all wired together for production-grade apps.",
    keyConcepts: [
      "EC2, S3, and Lambda fundamentals",
      "CloudFront CDN & API Gateway",
      "IAM roles and permissions",
      "Deploying scalable, cost-aware backend infrastructure",
    ],
    docsUrl: "https://docs.aws.amazon.com/",
    notesUrl: "/resources/aws-backend-devops-roadmap.html",
  },
  {
    slug: "docker",
    name: "Docker",
    icon: "🐳",
    category: "cloud",
    tagline: "Containers for consistent environments",
    description:
      "Docker packages an app with everything it needs to run into a portable container — the same image runs identically on a laptop, CI server, or in production.",
    keyConcepts: [
      "Images vs. containers",
      "Dockerfile & multi-stage builds",
      "Volumes and networking",
      "Docker Compose for multi-service setups",
    ],
    docsUrl: "https://docs.docker.com/",
    comingSoon: true,
  },
];

export function getTechBySlug(slug: string) {
  return techStack.find((t) => t.slug === slug);
}
