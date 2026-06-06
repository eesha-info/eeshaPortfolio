export type Project = {
  title: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  url?: string;
  client?: string;
  highlights: string[];
};

export const projects: Project[] = [
  {
    title: "NextGen — Internal IQVIA Platform",
    description:
      "An internal IQVIA platform developed to manage and streamline client-related operations across healthcare and life sciences services. It centralizes client data, automates workflows, and ensures regulatory compliance — enhancing visibility, coordination, and operational efficiency for client engagement and service delivery.",
    tech: ["TypeScript", "Node.js", "Express.js", "Prisma ORM", "SQL", "Docker", "AWS"],
    live: "#",
    highlights: [
      "Led and coordinated a team, providing technical guidance and support to ensure efficient project execution",
      "Resolved complex technical challenges across the stack",
      "Centralized client data with automated workflows and regulatory compliance",
    ],
  },
  {
    title: "Lifedemy — Online Life-related Course Platform",
    description:
      "Contributed as a backend developer to Lifedemy, an online platform offering courses focused on life skills and personal development.",
    tech: ["Node.js", "Koa.js", "Express.js", "Strapi (CMS)", "PostgreSQL", "Razorpay", "AWS"],
    url: "https://lms.lifedemy.in/",
    live: "https://lms.lifedemy.in/",
    highlights: [
      "Developed a scalable CMS for course content management, enabling easy upload, categorization, and modification of course materials by instructors",
      "Integrated Razorpay payment gateways",
      "Implemented tracking functionalities to gather user behavior data, enabling the marketing team to tailor promotions and course suggestions",
      "Generated reports on user engagement and course popularity for strategic decision-making",
    ],
  },
  {
    title: "KnowThyWithin — Mental Health & Career Counselling",
    description:
      "KnowThyWithin is a hybrid mental health and career counselling service provider. Contributed as a backend developer and created APIs and integrated AWS-Chime for building meeting platform.",
    tech: ["Node.js", "Express.js", "MongoDB", "Razorpay", "AWS-Chime", "AWS"],
    url: "https://www.knowthywithin.com/",
    live: "https://www.knowthywithin.com/",
    highlights: [
      "Built backend APIs for counselling platform",
      "Integrated AWS-Chime for video meeting functionality",
      "Integrated Razorpay payment gateway",
    ],
  },
  {
    title: "DLF — Online Property Booking System",
    client: "Delhi Land & Finance (DLF)",
    description:
      "Contributed as the sole backend developer for an online property booking system aimed at enhancing DLF's real estate offerings and customer experience.",
    tech: ["Node.js", "Koa.js", "MongoDB", "Easebuzz", "AWS"],
    live: "https://www.dlf.in/",
    highlights: [
      "Built the complete backend architecture for property listing and booking",
      "Integrated Easebuzz payment gateway for secure transactions",
      "Deployed on AWS for scalability and reliability",
    ],
  },
  {
    title: "Camesports — Challenge Participation Platform",
    description:
      "Camesports is an interactive platform enabling users to engage in various challenges, offering both free and paid participation options. Users can track and review challenge records, including metrics like calories burned, completion time, maximum and average speeds, and location data upon challenge completion.",
    tech: ["Node.js", "Express.js", "MongoDB", "AWS"],
    url: "https://app.camelsportclub.com/",
    live: "https://www.chicmicstudios.in/portfolios/camel-sports/",
    highlights: [
      "Designed, developed, and deployed essential APIs using Node.js and Express.js to facilitate challenge participation, record tracking, and data retrieval",
      "Utilized MongoDB for efficient data storage and retrieval, managing challenge records and user information securely",
      "Orchestrated the deployment of the backend system on Amazon Web Services (AWS), ensuring scalability, reliability, and security",
    ],
  },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  projects: {
    name: string;
    description: string;
    tech: string[];
    url?: string;
    contributions: string[];
  }[];
};

export const experiences: Experience[] = [
  {
    company: "G3 Digital Innovation Private Limited",
    role: "SDE-3 (Lead Engineer)",
    period: "Mar 2026 — Present",
    projects: [
      {
        name: "DeepCarve",
        description:
          "A cloud-based memorial design platform that empowers memorial professionals and families to craft enduring tributes with real-time design tools, collaboration features, and production-ready file exports.",
        tech: ["Next.js", "Node.js", "TypeScript", "AWS"],
        url: "https://w1.influnetglobal.com/home",
        contributions: [
          "Leading full-stack development of the platform",
          "Building real-time design and customization tools for memorials",
          "Implementing collaboration features for sharing and approving designs",
          "Generating industry-ready files for engraving and production",
        ],
      },
    ],
  },
  {
    company: "ThinkJS",
    role: "SDE2",
    period: "Oct 2022 — Mar 2026",
    projects: [
      {
        name: "NextGen (IQVIA)",
        description:
          "Internal IQVIA platform to manage and streamline client-related operations across healthcare and life sciences services.",
        tech: ["TypeScript", "Node.js", "Express.js", "Prisma ORM", "SQL", "Docker", "AWS"],
        url: "https://www.iqvia.com/",
        contributions: [
          "Led and coordinated a team, providing technical guidance",
          "Centralized client data with automated workflows",
          "Ensured regulatory compliance and operational efficiency",
        ],
      },
      {
        name: "Lifedemy",
        description:
          "Online life-related course platform offering courses focused on life skills and personal development.",
        tech: ["Node.js", "Koa.js", "Express.js", "Strapi (CMS)", "PostgreSQL", "Razorpay", "AWS"],
        url: "https://www.lifedemy.in/",
        contributions: [
          "Developed a scalable CMS for course content management",
          "Integrated Razorpay payment gateways",
          "Implemented analytics & reporting for user engagement",
        ],
      },
      {
        name: "KnowThyWithin",
        description:
          "Hybrid mental health and career counselling service provider.",
        tech: ["Node.js", "Express.js", "MongoDB", "Razorpay", "AWS-Chime"],
        url: "https://www.knowthywithin.com/",
        contributions: [
          "Created backend APIs for counselling platform",
          "Integrated AWS-Chime for building meeting platform",
          "Integrated Razorpay payment gateway",
        ],
      },
      {
        name: "DLF Property Booking",
        description:
          "Online property booking system for DLF — a prominent commercial real estate development company.",
        tech: ["Node.js", "Koa.js", "MongoDB", "Easebuzz", "AWS"],
        contributions: [
          "Sole backend developer for the booking platform",
          "Integrated Easebuzz payment gateway",
          "Deployed on AWS for production",
        ],
      },
    ],
  },
  {
    company: "Chicmic",
    role: "Software Engineer",
    period: "Sep 2021 — Sep 2022",
    projects: [
      {
        name: "Camesports",
        description:
          "Interactive challenge participation platform with free and paid options.",
        tech: ["Node.js", "Express.js", "MongoDB", "AWS"],
        url: "https://app.camelsportclub.com/",
        contributions: [
          "Designed and deployed essential APIs using Node.js and Express.js",
          "Utilized MongoDB for efficient data storage and retrieval",
          "Orchestrated AWS deployment for scalability and security",
        ],
      },
    ],
  },
];

export type Education = {
  institution: string;
  degree: string;
  year: string;
};

export const education: Education[] = [
  {
    institution: "Lovely Professional University (LPU), Punjab",
    degree: "Master of Computer Application",
    year: "2022",
  },
  {
    institution: "BNMU, Madhepura Bihar",
    degree: "Bachelor of Computer Application",
    year: "2018",
  },
  {
    institution: "Ras Bihar High (10+2) School, Madhepura",
    degree: "Intermediate of Science",
    year: "2015",
  },
];

export type Achievement = {
  period: string;
  description: string;
};

export const achievements: Achievement[] = [
  {
    period: "2022 — 2023",
    description:
      "Conceptualized, initiated, and successfully launched the Lifedemy project, achieving a remarkable milestone of 70,000 registered users within two years.",
  },
];

export type Skill = {
  name: string;
  icon: string;
  category: "frontend" | "backend" | "database" | "devops" | "tools";
};

export const skills: Skill[] = [
  // Backend
  { name: "Node.js", icon: "🟢", category: "backend" },
  { name: "Express.js", icon: "⚡", category: "backend" },
  { name: "Koa.js", icon: "🔷", category: "backend" },
  { name: "REST APIs", icon: "🔗", category: "backend" },
  { name: "JWT / OAuth", icon: "🔐", category: "backend" },

  // Frontend
  { name: "JavaScript", icon: "📜", category: "frontend" },
  { name: "TypeScript", icon: "📘", category: "frontend" },
  { name: "Next.js", icon: "▲", category: "frontend" },
  { name: "React.js", icon: "⚛️", category: "frontend" },
  { name: "Angular", icon: "🅰️", category: "frontend" },
  { name: "HTML / CSS", icon: "🌐", category: "frontend" },

  // Database
  { name: "MongoDB", icon: "🍃", category: "database" },
  { name: "PostgreSQL", icon: "🐘", category: "database" },
  { name: "MySQL", icon: "🐬", category: "database" },
  { name: "Prisma ORM", icon: "◆", category: "database" },
  { name: "Sequelize", icon: "🔶", category: "database" },
  { name: "Mongoose", icon: "🍃", category: "database" },

  // DevOps & Cloud
  { name: "AWS", icon: "☁️", category: "devops" },
  { name: "S3 / EC2", icon: "📦", category: "devops" },
  { name: "CloudFront", icon: "🌍", category: "devops" },
  { name: "Lambda", icon: "λ", category: "devops" },
  { name: "Docker", icon: "🐳", category: "devops" },

  // Tools
  { name: "Git / GitHub", icon: "📂", category: "tools" },
  { name: "Swagger", icon: "📄", category: "tools" },
  { name: "Postman", icon: "📮", category: "tools" },
];

export const socialLinks = {
  github: "https://github.com/eesha-info",
  linkedin: "https://linkedin.com/in/md-eesha",
  email: "mdeesha.info@gmail.com",
  twitter: "https://twitter.com",
  phone: "+91-9463258394",
  location: "Bengaluru, Karnataka (India)",
};

const careerStartDate = new Date(2021, 8); // September 2021
const today = new Date();
const totalMonths =
  (today.getFullYear() - careerStartDate.getFullYear()) * 12 +
  (today.getMonth() - careerStartDate.getMonth());
export const experienceYears = (totalMonths / 12).toFixed(1);

export const personalInfo = {
  name: "Mohammad Eesha",
  title: "NodeJS Backend Developer",
  tagline: `Full Stack Developer (AWS | Node.js | React.js | Next.js) with ${experienceYears} years of experience building scalable, high-performance web applications. Skilled in designing backend services using Node.js and AWS, and developing modern, responsive frontends with React.js and Next.js. Experienced in optimizing performance, system design, and delivering end-to-end solutions`,
  experience: `${experienceYears}+`,
  projectsCount: "10+",
  aboutParagraphs: [
    `AWS-Node.js developer with ${experienceYears} years of experience creating scalable, efficient web applications. Expert in leveraging AWS services, optimizing performance, ensuring security, and implementing best practices.`,
    "Proficient in frontend technologies like React.js, Next.js, Angular, HTML, and CSS — I can work across the full stack. From building scalable CMS platforms and IQVIA healthcare systems to integrating payment gateways and deploying on AWS, I bring real-world impact to every project.",
  ],
};
