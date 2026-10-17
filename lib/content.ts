// Single source of truth for every word on the site. Numbers here come from the resume
// and public GitHub repos; keep them honest when editing.

export const profile = {
  name: "Hari Krishna T",
  first: "Hari Krishna",
  role: "AI Engineer",
  location: "Hyderabad, India",
  email: "harithota609@gmail.com",
  phone: "+91 96184 91484",
  phoneHref: "tel:+919618491484",
  whatsapp: "https://wa.me/919618491484",
  linkedin: "https://www.linkedin.com/in/hari-krishna-thota-06b850275",
  github: "https://github.com/hari9618",
  huggingface: "https://huggingface.co/hari-krishna-ai",
  resume: "/Hari_Krishna_AI_Engineer_Resume.pdf",
};

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Observability", href: "#observability" },
  { label: "Automation", href: "#automation" },
  { label: "Websites", href: "#websites" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const heroRotating = [
  "AI agents that act.",
  "n8n automations.",
  "Playwright browser bots.",
  "hybrid RAG systems.",
  "LLM observability.",
  "end-to-end evals.",
  "voice AI agents.",
];

export type Service = { id: string; tag: string; title: string; body: string; image: string };

// "What I ship": short, outcome-first cards in the reference's style (art + tag + title + two lines).
export const services: Service[] = [
  {
    id: "agents",
    tag: "Build · Agents",
    title: "Agents that do the work",
    body: "Multi-agent systems that take real actions in your tools: research, triage, outreach, reporting. Human-approved where it matters, traced from day one.",
    image: "/ship-agents.webp",
  },
  {
    id: "automation",
    tag: "Automate · n8n",
    title: "Repetitive work, gone",
    body: "n8n, Zapier and Make pipelines with LLM steps that wire your CRM, inbox, Slack and sheets together, so the busywork runs itself.",
    image: "/ship-automation.webp",
  },
  {
    id: "browser",
    tag: "Playwright · Headless",
    title: "Browsers on autopilot",
    body: "Playwright bots and browser agents that log in, fill forms, scrape data and test every release, headless and on schedule.",
    image: "/ship-browser.webp",
  },
  {
    id: "rag",
    tag: "Retrieve · RAG",
    title: "Knowledge that answers back",
    body: "Hybrid RAG over your documents with re-ranking and self-correction. Every answer cites its source, or the agent says it doesn't know.",
    image: "/ship-rag.webp",
  },
  {
    id: "observe",
    tag: "Monitor · Langfuse",
    title: "Every LLM call, watched",
    body: "Langfuse and LangSmith tracing for every prompt, tool call, token and dollar, with alerts on drift, spend and hallucinations.",
    image: "/ship-observe.webp",
  },
  {
    id: "eval",
    tag: "Evaluate · as a service",
    title: "End-to-end evals, done for you",
    body: "Golden datasets, Ragas and LLM-as-judge scoring, validation guardrails and CI gates for agents you already run.",
    image: "/ship-eval.webp",
  },
  {
    id: "cost",
    tag: "Optimize · Cost",
    title: "Cheaper, faster answers",
    body: "Prompt and semantic caching, model routing and leaner tool calls. The same quality on a fraction of the tokens.",
    image: "/ship-cost.webp",
  },
  {
    id: "voice",
    tag: "Converse · Voice",
    title: "Voice agents that keep up",
    body: "STT → LLM → TTS with streaming and prefix caching, so calls feel like a conversation, not a phone menu.",
    image: "/ship-voice.webp",
  },
  {
    id: "deploy",
    tag: "Ship · Cloud",
    title: "Production, secured",
    body: "Dockerized on AWS, GCP, Azure, Vercel or Render, with guardrails, read-only access and kill switches built in.",
    image: "/ship-deploy.webp",
  },
];

export const loop = [
  {
    n: "01",
    title: "Map",
    icon: "search",
    body: "A short call to find the workflow that costs you the most. We agree on what success looks like and write the eval rubric before the first prompt.",
  },
  {
    n: "02",
    title: "Build",
    icon: "rocket",
    body: "A working agent or automation in your stack, built fast with Claude Code subagents, skills and MCP servers, and covered by tests.",
  },
  {
    n: "03",
    title: "Evaluate",
    icon: "gauge",
    body: "Ragas scores, Langfuse traces and a quality gate. You see faithfulness, latency and cost per run on a dashboard before anything goes live.",
  },
  {
    n: "04",
    title: "Hand off",
    icon: "key",
    body: "You own the code, the evals and the runbook. The next workflow can ship without me on the call, though I'm happy to stay on.",
  },
];

export type CaseStudy = {
  sector: string;
  title: string;
  body: string;
  stats: { value: string; label: string }[];
  stack: string[];
  links: { label: string; href: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    sector: "Multi-agent · Hybrid RAG · LLM-Ops",
    title: "Atlas: an autonomous due-diligence desk",
    body: "You ask about a company. Four specialist agents research it in parallel, a bull and a bear agent argue it out, and a judge writes an investor-grade report where every claim carries a citation, along with a confidence score. It improves itself: an eval runs, a quality gate checks it, the prompt is rewritten, and the new version is released.",
    stats: [
      { value: "4", label: "parallel specialist agents" },
      { value: "4", label: "memory layers" },
      { value: "$0", label: "cost per run (free tier)" },
    ],
    stack: ["LangGraph", "Groq GPT-OSS-120B", "Qdrant", "BM25 + bge", "Ragas", "Langfuse", "MCP", "Next.js"],
    links: [
      { label: "Live demo", href: "https://atlas-web-lake.vercel.app" },
      { label: "GitHub", href: "https://github.com/hari9618/atlas-agentic-research" },
    ],
  },
  {
    sector: "Fine-tuning · Text-to-SQL",
    title: "Text-to-SQL accuracy up from 43.7% to 70.9%",
    body: "I fine-tuned Qwen3-8B with QLoRA on a free Kaggle T4. The benchmark is my own: a 12-table, 328K-row database with zero pattern overlap between train and test. Queries are scored by running them. A self-correction loop sends database errors back to the model.",
    stats: [
      { value: "70.86%", label: "execution accuracy (from 43.71%)" },
      { value: "98.2%", label: "executable SQL" },
      { value: "0.66%", label: "hallucinated schema (from 3.75%)" },
    ],
    stack: ["Qwen3-8B", "QLoRA / PEFT", "PostgreSQL", "SQLGlot", "FastAPI", "Hugging Face"],
    links: [
      { label: "Live demo", href: "https://huggingface.co/spaces/hari-krishna-ai/text2sql-finetuned-live" },
      { label: "GitHub", href: "https://github.com/hari9618/Text_To_SQL_Fine-Tuned_Project" },
    ],
  },
  {
    sector: "Multi-agent · Media",
    title: "MediaMind: a media intelligence platform",
    body: "A supervisor routes each task to a summarization, highlights or social-content agent. Retrieval mixes ChromaDB (60%) with BM25 (40%), and YouTube transcripts are indexed live. Guardrails AI handles safety and Langfuse traces every call.",
    stats: [
      { value: "3", label: "specialist agents" },
      { value: "60/40", label: "semantic / BM25 hybrid" },
      { value: "4", label: "live tools (web, wiki, DDG, YouTube)" },
    ],
    stack: ["LangGraph", "ChromaDB", "BM25", "Guardrails AI", "Langfuse", "AWS EC2", "Docker"],
    links: [{ label: "GitHub", href: "https://github.com/hari9618/Meadia-Mind--MultiAgent-System" }],
  },
  {
    sector: "Business automation · Tech Aegis AI",
    title: "8+ business workflows on autopilot",
    body: "LLM pipelines orchestrated with n8n that I ship and run daily: LinkedIn outreach, sales CRM, and blog, article and ad content generation. Building with Claude Code subagents, skills, hooks and MCP servers cut delivery time by about 40%.",
    stats: [
      { value: "8+", label: "workflows automated" },
      { value: "~40%", label: "faster feature delivery" },
      { value: "Daily", label: "shipped to production" },
    ],
    stack: ["n8n", "LLM pipelines", "Claude Code", "MCP", "Langfuse", "AWS"],
    links: [{ label: "Tech Aegis AI", href: "https://techaegisai.com" }],
  },
];

export const moreProjects = [
  {
    title: "AI Second Brain",
    body: "A personal knowledge system with RAG over your notes, vector search and a Groq-powered chat.",
    stack: ["Streamlit", "FastAPI", "Groq", "RAG"],
    href: "https://github.com/hari9618/AI-brain-system",
    live: "https://ai-brain-system-huvejew3yhmfdszsu6te7q.streamlit.app/",
  },
  {
    title: "PADER Report Generator",
    body: "A pipeline that turns adverse-event data into safety reports grounded in evidence.",
    stack: ["Python", "LLM", "Grounding"],
    href: "https://github.com/hari9618/pader-report-generator",
  },
  {
    title: "Reel Fact-Checker Bot",
    body: "A Slack bot that fact-checks Instagram reels and posts a verdict with sources.",
    stack: ["Slack API", "LLM", "Automation"],
    href: "https://github.com/hari9618/Instagram_Automation",
  },
  {
    title: "AI Sales Agent",
    body: "A sales intelligence platform for lead research and outreach, automated with n8n.",
    stack: ["Gemini", "LangChain", "Langfuse", "n8n"],
    href: "https://github.com/hari9618/AI-SALES-AGENT",
  },
  {
    title: "Agentic Banking Assistant",
    body: "A banking assistant with tool-using agents that route intents and run account flows.",
    stack: ["LangGraph", "Groq"],
    href: "https://github.com/hari9618/Banking-Agent",
  },
  {
    title: "Planner · Worker · Reviewer",
    body: "A multi-agent system where a planner splits the task, workers run it and a reviewer checks the result.",
    stack: ["LangGraph", "Groq", "Streamlit"],
    href: "https://github.com/hari9618/Multi-Agent_System_AI",
  },
  {
    title: "Autonomous Document Agent",
    body: "An autonomous agent that researches a topic and writes a formatted Word document.",
    stack: ["FastAPI", "Groq", "python-docx"],
    href: "https://github.com/hari9618/Autonomus_AI_Agent",
  },
  {
    title: "Learning Path Generator",
    body: "Generates a learning roadmap for any skill, broken into stages.",
    stack: ["LangChain", "Gemini", "Streamlit"],
    href: "https://github.com/hari9618/Learning-Path_Generator",
    live: "https://learning-pathgenerator-xhnhmvayztvyqpcy6v8c3w.streamlit.app/",
  },
  {
    title: "News Event Classifier",
    body: "Classifies news articles into event types using an NLP pipeline.",
    stack: ["Python", "NLP", "Transformers"],
    href: "https://github.com/hari9618/News-Event-Classifier",
  },
];

export const stats = [
  { value: 8, suffix: "+", label: "Business workflows automated" },
  { value: 40, prefix: "~", suffix: "%", label: "Faster delivery with Claude Code" },
  { value: 70.86, suffix: "%", decimals: 2, label: "Text-to-SQL accuracy (from 43.71%)" },
  { value: 18, suffix: "+", label: "Public AI repos shipped" },
  { value: 0, prefix: "$", label: "Atlas cost per run" },
];

export const experience = [
  {
    role: "AI Engineer Intern",
    org: "Tech Aegis AI",
    href: "https://techaegisai.com",
    period: "06/2026 — Present",
    place: "Hyderabad, India",
    points: [
      "Build and ship AI automation daily: LinkedIn outreach, sales CRM, and blog, article and ad content. 8+ business workflows now run on LLM pipelines orchestrated with n8n.",
      "Work on voice AI agents (STT → LLM → TTS), cutting conversation latency with response streaming, prefix caching and fewer LLM tool calls.",
      "Build with Claude Code as a force multiplier, writing custom subagents, skills, hooks and MCP servers. Feature delivery time dropped by about 40%.",
      "Design, build and evaluate production RAG systems (hybrid semantic + BM25, re-ranking), measuring quality with Ragas faithfulness, relevancy and precision.",
      "Run LLM-Ops: tracing, token and cost tracking, and automated eval gates in Langfuse and LangSmith.",
      "Put agent security in place, containerize with Docker, and deploy to Vercel and AWS (EC2 / Bedrock).",
    ],
  },
];

export const education = [
  {
    title: "Generative AI Program",
    org: "Innomatics Research Labs",
    period: "01/2026 — 06/2026",
    note: "LLMs, LangChain, LangGraph, Hybrid RAG, RAG evaluation, Agentic AI, MCP, Langfuse, FastAPI, Docker.",
  },
  {
    title: "B.Tech, Artificial Intelligence & Data Science",
    org: "Aditya College of Engineering",
    period: "10/2022 — 04/2026",
    note: "Machine learning, deep learning, NLP, computer vision, Python, DSA, SQL.",
  },
];

export const principles = [
  {
    quote: "The eval rubric gets written before the first prompt. Otherwise “it works” just means it worked on the example I happened to try.",
    who: "On evaluation",
    tag: "Measure first",
  },
  {
    quote: "Every claim needs a source. If the retriever can't find evidence for it, the agent says it doesn't know.",
    who: "On grounding",
    tag: "No hallucinated confidence",
  },
  {
    quote: "Cost per run is a feature. The cheapest token is the one you cache, route to a cheaper model, or never send.",
    who: "On LLM-Ops",
    tag: "Cheap to run",
  },
];

export const faqs = [
  {
    q: "Are you open to full-time roles or freelance work?",
    a: "Both. I'm looking for full-time AI Engineer roles, and I take freelance and contract projects: agents, automations, RAG systems and eval or cost audits. I'm based in Hyderabad (IST) and work remotely with teams in any time zone.",
  },
  {
    q: "Can you monitor and evaluate an agent we already built?",
    a: "Yes, and it's often the fastest win. I add Langfuse or LangSmith tracing to your existing LLM calls, build a golden dataset from real traffic, then set up end-to-end evals, validation guardrails, cost dashboards and Slack alerts. You keep your code; you gain visibility.",
  },
  {
    q: "Can you automate work inside websites that have no API?",
    a: "Yes. Playwright bots and browser agents log in, fill forms, download reports and scrape data headlessly, on a schedule, with retries, screenshots and traces. The same Playwright setup can also run automated end-to-end tests on every release.",
  },
  {
    q: "How does a freelance engagement start?",
    a: "With a free 30-minute call about the workflow that hurts most. You get a written scope, a target cost per run and a timeline. We start with one small pilot, not a big retainer.",
  },
  {
    q: "How do you keep agents under control?",
    a: "Any action with real consequences goes through a human approval gate. Database access is read-only, queries have timeouts, inputs are validated, and grounding guardrails block claims that have no citation. Langfuse traces every decision.",
  },
  {
    q: "How do you prove it actually works?",
    a: "A golden dataset and an eval rubric come first. Then Ragas scores faithfulness, answer relevancy and context precision, and an automated quality gate blocks regressions. You get the dashboard, not just a demo.",
  },
  {
    q: "Will it be expensive to run?",
    a: "Usually not. I design for cost from day one: caching, routing easy work to cheaper models, fewer tool calls, local embeddings and free tiers where they make sense. Atlas, my largest system, runs at $0 per run.",
  },
  {
    q: "Which stack do you build with?",
    a: "Python, LangGraph and LangChain for agents. Qdrant, Chroma or FAISS for retrieval. n8n, Zapier or Make for automation. Langfuse, LangSmith and Ragas for observability and evals. FastAPI and Next.js for apps. Docker, AWS, Vercel and Render for deployment. I adapt to whatever you already run.",
  },
];
