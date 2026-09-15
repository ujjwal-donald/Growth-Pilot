import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { PLANS, formatInr } from "@/lib/billing/plans";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Megaphone,
  Search,
  Share2,
  Sparkles,
  Wand2,
} from "lucide-react";

const features = [
  { icon: Wand2, title: "AI content studio", body: "Posts, captions, blogs, and ads in your brand voice." },
  { icon: CalendarDays, title: "Social scheduler", body: "Plan a month of content and publish when engagement peaks." },
  { icon: Search, title: "SEO intelligence", body: "Audits, keywords, and competitor gaps in one workspace." },
  { icon: Megaphone, title: "Campaign builder", body: "Channel mix, budget split, copy, and KPIs generated for you." },
  { icon: Share2, title: "Multi-platform", body: "Instagram, Facebook, LinkedIn, X, YouTube, and Google Business." },
  { icon: BarChart3, title: "Marketing analytics", body: "Traffic, engagement, leads, and campaign ROI on one dashboard." },
];

const steps = [
  { n: "01", title: "Create your workspace", body: "Tell UPDON about your brand, audience, and growth goal." },
  { n: "02", title: "Generate the engine", body: "AI drafts posts, calendars, SEO fixes, and campaign plans." },
  { n: "03", title: "Publish and measure", body: "Schedule, track, and improve every week from one dashboard." },
];

const faqs = [
  { q: "Can I use UPDON without connecting social accounts?", a: "Yes. Phase 1 lets you generate, save drafts, and schedule internally. Connect Meta, LinkedIn, X, YouTube, and Google in Phase 2." },
  { q: "Which AI models do you support?", a: "OpenAI is wired first through a provider abstraction. Gemini, Claude, and others can be added without changing product features." },
  { q: "Is this multi-tenant?", a: "Every record is scoped to a workspace. Users can belong to multiple workspaces with RBAC." },
  { q: "Do you support Indian and international billing?", a: "Razorpay and Stripe adapters are in the architecture. Payments stay disconnected until credentials are supplied." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#features">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants()}>
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-indigo-700">
            <Sparkles className="size-3.5" /> UPDON Technologies
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Your AI Digital Marketing Team — Available 24/7
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Create content, grow your social media, improve SEO, launch campaigns and track your
            marketing performance from one intelligent platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Start Free <ArrowRight className="size-4" />
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Book Demo
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="rounded-xl bg-slate-950 p-5 text-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-400">Today’s marketing score</p>
            <p className="mt-2 font-heading text-4xl">78</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">SEO 82</div>
              <div className="rounded-lg bg-white/5 p-3">Social 71</div>
              <div className="rounded-lg bg-white/5 p-3">12 posts scheduled</div>
              <div className="rounded-lg bg-white/5 p-3">34 new leads</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-3xl font-semibold">Everything a growth team needs</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          AI marketing tools, SEO, social, advertising, and analytics — designed as one operating system.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border bg-white p-5 shadow-sm">
              <feature.icon className="mb-3 size-5 text-indigo-600" />
              <h3 className="font-medium">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n}>
              <p className="text-sm font-semibold text-indigo-600">{step.n}</p>
              <h3 className="mt-2 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            ["AI Marketing Tools", "Assistant, post generator, blog writer, ad copy, strategy plans."],
            ["SEO", "Audits, keywords, on-page recommendations, competitor analysis."],
            ["Social Media", "Accounts, calendar, scheduler, published history, engagement."],
            ["Advertising", "Campaigns across Meta, Google, and LinkedIn with AI variations."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border bg-white p-5">
              <h3 className="font-medium">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-heading text-3xl font-semibold">Teams already running on UPDON</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Northshore Cafe", "We stopped scrambling for captions. The calendar just shows up every Monday."],
            ["Helix Commerce", "SEO issues used to live in a spreadsheet. Now the score and the fix are in one place."],
            ["Arc Agency", "Multi-brand workspaces let us keep client voices separate without extra tools."],
          ].map(([name, quote]) => (
            <blockquote key={name} className="rounded-2xl border bg-white p-5 text-sm text-slate-700">
              “{quote}”
              <footer className="mt-4 font-medium text-slate-950">{name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-3xl font-semibold">Simple plans that scale</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {PLANS.map((plan) => (
            <div key={plan.id} className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{plan.name}</p>
              <p className="mt-2 font-heading text-3xl font-semibold">
                {plan.monthlyPriceInr === 0 ? "Free" : formatInr(plan.monthlyPriceInr)}
                {plan.monthlyPriceInr > 0 ? <span className="text-sm font-normal text-slate-500">/mo</span> : null}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 text-teal-600" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`${buttonVariants({ variant: plan.id === "GROWTH" ? "default" : "outline" })} mt-6`}>
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-heading text-3xl font-semibold">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-xl border bg-white p-4">
              <p className="font-medium">{item.q}</p>
              <p className="mt-1 text-sm text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-slate-950 px-8 py-12 text-white">
          <h2 className="font-heading text-3xl font-semibold">Put an AI marketing team to work tonight</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Start free. Connect your brand voice. Generate the next 30 days of content.
          </p>
          <Link href="/signup" className={`${buttonVariants({ size: "lg" })} mt-6 bg-white text-slate-950 hover:bg-slate-100`}>
            Start Free
          </Link>
        </div>
      </section>

      <footer className="border-t bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <Logo />
          <p>© {new Date().getFullYear()} UPDON Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
