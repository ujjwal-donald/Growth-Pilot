import {
  LayoutDashboard,
  Bot,
  PenSquare,
  CalendarDays,
  Newspaper,
  MessageSquareText,
  Hash,
  Share2,
  Users,
  Send,
  Clock3,
  CheckCircle2,
  BarChart3,
  Search,
  Globe,
  KeyRound,
  Swords,
  FileSearch,
  Lightbulb,
  Megaphone,
  Sparkles,
  ThumbsUp,
  LineChart,
  Contact,
  Target,
  Palette,
  Mic2,
  ImageIcon,
  UsersRound,
  Plug,
  CreditCard,
  Settings,
  Shield,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const dashboardNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/app", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/assistant", label: "AI Marketing Assistant", icon: Bot },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/app/content/posts", label: "AI Post Generator", icon: PenSquare },
      { href: "/app/content/calendar", label: "Content Calendar", icon: CalendarDays },
      { href: "/app/content/blog", label: "Blog Generator", icon: Newspaper },
      { href: "/app/content/captions", label: "Caption Generator", icon: MessageSquareText },
      { href: "/app/content/hashtags", label: "Hashtag Generator", icon: Hash },
    ],
  },
  {
    label: "Social Media",
    items: [
      { href: "/app/social/accounts", label: "Accounts", icon: Users },
      { href: "/app/social/create", label: "Create Post", icon: Send },
      { href: "/app/social/scheduler", label: "Scheduler", icon: Clock3 },
      { href: "/app/social/published", label: "Published Posts", icon: CheckCircle2 },
      { href: "/app/social/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "SEO",
    items: [
      { href: "/app/seo", label: "SEO Dashboard", icon: Search },
      { href: "/app/seo/audit", label: "Website Audit", icon: Globe },
      { href: "/app/seo/keywords", label: "Keywords", icon: KeyRound },
      { href: "/app/seo/competitors", label: "Competitor Analysis", icon: Swords },
      { href: "/app/seo/pages", label: "Page Optimization", icon: FileSearch },
      { href: "/app/seo/suggestions", label: "Content Suggestions", icon: Lightbulb },
    ],
  },
  {
    label: "Advertising",
    items: [
      { href: "/app/ads/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/app/ads/generator", label: "AI Ad Generator", icon: Sparkles },
      { href: "/app/ads/facebook", label: "Facebook Ads", icon: ThumbsUp },
      { href: "/app/ads/google", label: "Google Ads", icon: Share2 },
      { href: "/app/ads/analytics", label: "Analytics", icon: LineChart },
    ],
  },
  {
    label: "Leads",
    items: [
      { href: "/app/leads", label: "Leads", icon: Contact },
      { href: "/app/leads/campaigns", label: "Lead Campaigns", icon: Target },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/app/analytics", label: "Overview", icon: BarChart3 },
      { href: "/app/analytics/social", label: "Social Analytics", icon: Share2 },
      { href: "/app/analytics/website", label: "Website Analytics", icon: Globe },
      { href: "/app/analytics/campaigns", label: "Campaign Performance", icon: LineChart },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/app/brand", label: "Brand Profile", icon: Palette },
      { href: "/app/brand/voice", label: "Brand Voice", icon: Mic2 },
      { href: "/app/brand/assets", label: "Assets", icon: ImageIcon },
      { href: "/app/team", label: "Team", icon: UsersRound },
      { href: "/app/integrations", label: "Integrations", icon: Plug },
      { href: "/app/billing", label: "Billing", icon: CreditCard },
      { href: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Platform", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/workspaces", label: "Companies", icon: UsersRound },
];
