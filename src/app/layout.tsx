import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { NavMenu, type NavGroup } from "./nav-menu";
import { GlobalSearch, type SearchEntry } from "./global-search";
import { MaintenanceBanner } from "./maintenance-banner";
import { ToastProvider } from "@/components/toast";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProfileButton } from "./profile-button";
import { ProfileProvider } from "@/lib/use-profile";
import { YouTubeIcon, TwitterIcon, InstagramIcon, WebIcon } from "@/components/icons";
import charactersJson from "@/data/characters.json";
import mapsJson from "@/data/maps.json";
import costumesJson from "@/data/costumes.json";
import guidesJson from "@/data/guides.json";
import storiesJson from "@/data/stories.json";
import type { Character, MapItem, CostumeItem, GuideItem, StoryItem } from "@/lib/types";
import "./globals.css";

const searchIndex: SearchEntry[] = [
  ...(charactersJson as Character[])
    .filter((c) => c.isView)
    .map((c) => ({ type: "런너", label: c.characterNm, sub: c.catchPhrase, href: "/characters", img: c.circularImageUrl })),
  ...(mapsJson as MapItem[]).map((m) => ({ type: "맵", label: m.subject, sub: m.hashTagSubject.split(",")[0]?.trim() ?? "", href: "/maps" })),
  ...(costumesJson as CostumeItem[]).map((c) => ({ type: "코스튬", label: c.subject, sub: c.openYear, href: "/closet" })),
  ...(guidesJson as GuideItem[]).map((g) => ({ type: "가이드", label: g.subject, sub: g.hashTagSubject, href: "/guides" })),
  ...(storiesJson as StoryItem[]).map((s) => ({ type: "스토리", label: s.subject, sub: s.openYear, href: "/stories" })),
];

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "엘림스 스마일의 비공식 아카이브 - 테일즈런너",
  description:
    "테일즈런너 캐릭터 능력치 비교, 변경권 확률, 맵 도감, 코스튬, 가이드, 스토리 뷰어",
  openGraph: {
    title: "엘림스 스마일의 비공식 아카이브",
    description:
      "내가 정리해 둔 비공식 아카이브다. 공식엔 없는 것들도 있지.",
    siteName: "엘림스 스마일의 비공식 아카이브",
    type: "website",
    images: [
      {
        url: "https://trimage.rhaon.co.kr/images/trintro/character/mainImageUrl/2d8NfCsBO9RRDObt3pw8NA.png",
        width: 400,
        height: 400,
        alt: "엘림스 스마일",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "엘림스 스마일의 비공식 아카이브",
    description:
      "내가 정리해 둔 비공식 아카이브다. 공식엔 없는 것들도 있지.",
  },
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "세계관",
    items: [
      { href: "/stories", label: "스토리" },
      { href: "/lore", label: "연대기" },
      { href: "/relationships", label: "인물 소개" },
    ],
  },
  {
    label: "도감",
    items: [
      { href: "/closet", label: "코스튬" },
      { href: "/characters", label: "런너 능력치" },
      { href: "/maps", label: "맵 도감" },
      { href: "/guides", label: "가이드" },
    ],
  },
  {
    label: "도구",
    items: [
      { href: "/probability", label: "변경권 확률" },
      { href: "/exp", label: "경험치 계산기" },
      { href: "/stats", label: "통계" },
    ],
  },
  {
    label: "커뮤니티",
    items: [
      { href: "/channels", label: "공식 채널" },
      { href: "/notices", label: "공지사항" },
      { href: "/feedback", label: "건의함" },
      { href: "/my", label: "마이페이지" },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2dd4bf" />
        <link
          rel="preload"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0f0b1a] overflow-x-hidden">
        <ToastProvider>
        <ProfileProvider>
        <MaintenanceBanner />
        <header className="relative sticky top-0 z-50 border-b border-white/5 bg-[#0f0b1a]/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 sm:gap-6 px-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-teal-300 tracking-tight"
            >
              <Image
                src="https://trimage.rhaon.co.kr/images/trintro/character/circularImageUrl/6awBZmzKmUkV8JVC43yMRH.png"
                alt=""
                width={28}
                height={28}
                className="rounded-full ring-1 ring-teal-500/30"
              />
              엘림스 스마일의 비공식 아카이브
            </Link>
            <NavMenu groups={NAV_GROUPS} />
            <div className="ml-auto flex items-center gap-2">
              <GlobalSearch index={searchIndex} />
              <ProfileButton />
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <footer className="border-t border-white/5 bg-[#0f0b1a] py-6">
          <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 text-white/40">
              <a href="https://www.youtube.com/@rhaon_tr_official" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors" aria-label="YouTube">
                <YouTubeIcon className="h-[18px] w-[18px]" />
              </a>
              <a href="https://x.com/TR_Official_KR" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors" aria-label="X (Twitter)">
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/rhaon_tr_official/" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href="https://tr.rhaon.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors" aria-label="공식 홈페이지">
                <WebIcon className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-white/40">
              비공식 아카이브 &middot; 감정 에너지로 빚어낸 기록들 &middot; 엘림스 스마일의 비공식 아카이브
            </p>
          </div>
        </footer>
        <ScrollToTop />
        </ProfileProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
