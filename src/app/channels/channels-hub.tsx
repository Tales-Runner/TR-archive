import {
  YouTubeIcon,
  TwitterIcon,
  InstagramIcon,
  FacebookIcon,
  StoveIcon,
  WebIcon,
} from "@/components/icons";
import type { ComponentType } from "react";

/* ── YouTube channels ──────────────────────────────────── */

interface YouTubeChannel {
  name: string;
  handle: string;
  url: string;
  description: string;
  badges: string[];
}

const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  {
    name: "테일즈런너",
    handle: "@TalesRunner",
    url: "https://www.youtube.com/@TalesRunner",
    description:
      "레거시 채널, 초기 스토리 애니메이션 & 업데이트 영상 아카이브",
    badges: ["아카이브", "스토리 애니메이션"],
  },
  {
    name: "테일즈런너 공식",
    handle: "@rhaon_tr_official",
    url: "https://www.youtube.com/@rhaon_tr_official",
    description:
      "현 운영사 라온엔터테인먼트 공식 채널. 업데이트 공지(영상 끝에 쿠폰번호 증정), 심야라이브(업데이트 미리보기 + Q&A), 맵 소개 영상, 쇼츠, 이벤트/콜라보 영상 등",
    badges: ["업데이트", "심야라이브", "맵 소개", "쇼츠", "이벤트/콜라보"],
  },
];

/* ── Social media accounts ─────────────────────────────── */

interface SocialAccount {
  platform: string;
  handle: string;
  url: string;
  Icon: ComponentType<{ className?: string }>;
}

const SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    platform: "Twitter / X",
    handle: "@TR_Official_KR",
    url: "https://x.com/TR_Official_KR",
    Icon: TwitterIcon,
  },
  {
    platform: "Instagram",
    handle: "@rhaon_tr_official",
    url: "https://www.instagram.com/rhaon_tr_official/",
    Icon: InstagramIcon,
  },
  {
    platform: "Facebook",
    handle: "rhaonTRofficial",
    url: "https://www.facebook.com/rhaonTRofficial/",
    Icon: FacebookIcon,
  },
  {
    platform: "Stove",
    handle: "talesrunner/kr",
    url: "https://page.onstove.com/talesrunner/kr",
    Icon: StoveIcon,
  },
  {
    platform: "공식 홈페이지",
    handle: "tr.rhaon.co.kr",
    url: "https://tr.rhaon.co.kr",
    Icon: WebIcon,
  },
];

/* ── Components ────────────────────────────────────────── */

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="inline-block h-3.5 w-3.5 ml-1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6.5 3.5h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9.5 2.5h4v4M13.5 2.5l-6 6" />
    </svg>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-300 ring-1 ring-teal-500/20">
      {label}
    </span>
  );
}

function YouTubeCard({ channel }: { channel: YouTubeChannel }) {
  return (
    <a
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group card-hover block rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 ring-1 ring-red-500/20">
          <YouTubeIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white/90 group-hover:text-teal-300 transition-colors">
              {channel.name}
            </h3>
            <span className="text-xs text-white/40">{channel.handle}</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-white/50">
            {channel.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {channel.badges.map((b) => (
              <Badge key={b} label={b} />
            ))}
          </div>
        </div>
        <span className="shrink-0 text-white/40 group-hover:text-teal-400 transition-colors">
          <ExternalLinkIcon />
        </span>
      </div>
    </a>
  );
}

function SocialCard({ account }: { account: SocialAccount }) {
  const { Icon } = account;
  return (
    <a
      href={account.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group card-hover flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/50 ring-1 ring-white/10 group-hover:text-teal-300 group-hover:ring-teal-500/30 transition-colors">
        <Icon />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white/80 group-hover:text-teal-300 transition-colors truncate">
          {account.platform}
        </div>
        <div className="text-xs text-white/35 truncate">{account.handle}</div>
      </div>
      <span className="shrink-0 text-white/40 group-hover:text-teal-400 transition-colors">
        <ExternalLinkIcon />
      </span>
    </a>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/40">
      <span className="h-px flex-1 bg-white/10" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </h2>
  );
}

/* ── Main hub ──────────────────────────────────────────── */

export function ChannelsHub() {
  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      <section>
        <SectionHeading>YouTube</SectionHeading>
        <div className="flex flex-col gap-4 stagger-grid">
          {YOUTUBE_CHANNELS.map((ch) => (
            <YouTubeCard key={ch.handle} channel={ch} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading>소셜 미디어</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-grid">
          {SOCIAL_ACCOUNTS.map((acc) => (
            <SocialCard key={acc.url} account={acc} />
          ))}
        </div>
      </section>
    </div>
  );
}
