import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white md:flex">
        <Logo light />
        <div>
          <p className="font-heading text-3xl font-semibold">Marketing that never clocks out.</p>
          <p className="mt-3 max-w-md text-slate-300">
            Content, SEO, campaigns, and analytics — with your brand voice baked in.
          </p>
        </div>
        <p className="text-sm text-slate-500">UPDON Technologies</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
