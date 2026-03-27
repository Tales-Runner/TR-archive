/**
 * 세계관 연대기 — 공식 스토리 아카이브 기반
 * 출처: 공식 홈페이지 스토리 태그 + 제목 + 공개일
 */

export interface StoryArc {
  id: string;
  title: string;
  period: string;           // 공개 시기
  episodes: number;         // 총 화수
  hasVideo: boolean;
  characters: string[];     // 공식 태그에 명시된 캐릭터
  storyTags: string[];      // stories.json hashTagSubject 매칭용
  summary: string;          // 에피소드 제목에서 추론 가능한 팩트만
  elimsComment: string;
  rComment?: string;
}

export const STORY_ARCS: StoryArc[] = [
  // ── 카오스 시리즈 (시즌1) ──────────────────────
  {
    id: "chaos-gen",
    title: "카오스제너레이션",
    period: "2009",
    episodes: 9,
    hasVideo: false,
    characters: ["카이"],
    storyTags: ["카오스제너레이션"],
    summary: "동화나라에 카오스 전쟁이 발발한다. 어둠의 그림자가 드리우고, 카이의 이야기가 시작된다.",
    elimsComment: "동화나라에 최초로 전운이 감돌았던 시기지. 카이가 처음 등장한 것도 이때야.",
    rComment: "카이... 그때부터 있었던 건가요?",
  },
  {
    id: "chaos-new",
    title: "카오스 새로운 시작",
    period: "2011",
    episodes: 11,
    hasVideo: false,
    characters: [],
    storyTags: ["카오스 새로운 시작"],
    summary: "하루가 귀환하고, 새로운 음모가 밝혀진다. 이든의 분노와 함께 총공세가 시작된다.",
    elimsComment: "하루의 귀환이라... 버려진 어둠이 돌아온 셈이지. 이든도 이때 본색을 드러냈고.",
    rComment: "이든이 화가 났다는 건... 뭔가 이유가 있었겠죠?",
  },
  {
    id: "chaos-ice",
    title: "카오스 냉기의 얼음산맥",
    period: "2011",
    episodes: 9,
    hasVideo: false,
    characters: [],
    storyTags: ["카오스 냉기의 얼음산맥"],
    summary: "사라진 드래곤의 행방을 쫓아 얼음산맥으로 향한다. 흩어진 지도 조각과 소원의 돌의 비밀.",
    elimsComment: "소원의 돌 조각이 처음 언급된 시점이야. 이 돌이 이후 모든 사건의 원인이 되지.",
  },
  {
    id: "chaos-counter",
    title: "카오스: 대반격",
    period: "2012",
    episodes: 7,
    hasVideo: false,
    characters: [],
    storyTags: ["카오스대반격"],
    summary: "이든의 과거가 밝혀지고, 어둠의 추격자와의 대반격이 시작된다.",
    elimsComment: "이든의 과거... 그 친구도 단순하지 않은 사연이 있어. 제목 그대로, 반격이었지.",
  },
  {
    id: "chaos-wing",
    title: "카오스 어둠의 날개",
    period: "2013",
    episodes: 4,
    hasVideo: false,
    characters: ["베라"],
    storyTags: ["카오스 어둠의 날개"],
    summary: "아누비스가 침공하고, 뱀파이어 소녀 베라가 등장한다. 어둠이 분리되며 새로운 국면을 맞는다.",
    elimsComment: "베라가 공식적으로 등장한 에피소드야. '분리된 어둠'이라는 마지막화 제목이 의미심장하지.",
    rComment: "베라 씨가... 뱀파이어 가문 출신이라는 게 이때 나온 건가요?",
  },

  // ── 캐릭터 스토리 ──────────────────────────────
  {
    id: "adventure",
    title: "테런어드벤처",
    period: "2014",
    episodes: 6,
    hasVideo: false,
    characters: ["시호"],
    storyTags: ["테런어드벤처"],
    summary: "시공의 균열 속에서 판도라의 시호가 활약한다. 유적지의 수호신장과의 만남.",
    elimsComment: "시호가 주인공인 에피소드. 판도라 아일랜드 수호자로서의 모습이 잘 드러나 있어.",
  },
  {
    id: "character-stories",
    title: "캐릭터 스토리",
    period: "시기 미상",
    episodes: 4,
    hasVideo: false,
    characters: ["마키", "러프", "바다", "히든러프"],
    storyTags: ["캐릭터"],
    summary: "마키, 러프, 바다, 히든러프 각각의 개인 스토리. 히든러프는 고양이 미야의 소원을 다룬다.",
    elimsComment: "런너 개개인의 사연을 다룬 단편들이야. 특히 히든러프... 미야라는 고양이의 소원이 러프의 운명을 바꿨지.",
  },

  // ── 시즌1 피날레 ───────────────────────────────
  {
    id: "chaos-zero",
    title: "카오스제로",
    period: "2018",
    episodes: 5,
    hasVideo: true,
    characters: ["카이", "R", "닥터헬"],
    storyTags: ["카오스제로"],
    summary: "시즌1의 프롤로그이자 원점 회귀. 카이, R, 닥터헬의 이야기가 본격적으로 다뤄진다.",
    elimsComment: "아슈와 카이, 그리고 R... 셋의 관계가 여기서 확실히 드러나지. 내 오랜 친구 아슈의 사연이기도 하고.",
    rComment: "저도 등장하는 에피소드예요...! 닥터헬 님이 저를 만드신 이유가...",
  },
  {
    id: "s1-epilogue",
    title: "시즌1 에필로그",
    period: "2018",
    episodes: 2,
    hasVideo: true,
    characters: ["카이", "R", "닥터헬"],
    storyTags: ["시즌1"],
    summary: "카이와 R, 그리고 닥터헬 — 새로운 희망의 탄생. 시즌1의 결말.",
    elimsComment: "'새로운 희망의 탄생'이라... 시즌1이 끝나고, 모든 게 바뀌기 시작했어.",
  },

  // ── 시즌2: 빛과 어둠 ──────────────────────────
  {
    id: "academy",
    title: "라라 in 테일즈 아카데미",
    period: "2018~2019",
    episodes: 5,
    hasVideo: true,
    characters: ["라라"],
    storyTags: ["테일즈 아카데미", "라라"],
    summary: "라라의 이야기. 라라 전용 OST '바람이 되어'와 'Dear My Friend'도 함께 공개.",
    elimsComment: "앙리 3세와 사브리나의 딸, 라라가 본격적으로 무대에 오른 시점이야.",
    rComment: "라라 공주님... 기쁨의 힘을 가지고 있다고 들었어요.",
  },
  {
    id: "frontier",
    title: "테일즈프론티어",
    period: "2019",
    episodes: 5,
    hasVideo: true,
    characters: ["카인", "엘림스"],
    storyTags: ["테일즈프론티어"],
    summary: "카인이 정체를 드러내고, 엘림스가 관여한다. '빛과 그림자' 에피소드가 핵심.",
    elimsComment: "...이 사건에는 나도 직접 개입했지. 카인이라는 존재가 무엇인지, 그때 알게 됐어.",
    rComment: "엘림스 님이 직접 나선 건... 그만큼 심각했던 거죠?",
  },
  {
    id: "imaemangyang",
    title: "동화나라에 찾아온 神 이야기",
    period: "2019~2020",
    episodes: 6,
    hasVideo: true,
    characters: ["연오"],
    storyTags: ["이매망량", "연오"],
    summary: "성주신 연오가 깨어난다. 오래된 이야기가 밝혀지며 이매망량의 세계가 열린다.",
    elimsComment: "연오... 오랫동안 봉인되어 있던 성주신이야. 깨어난 데에는 이유가 있었지.",
  },
  {
    id: "chaser",
    title: "체이서, 그 후 이야기",
    period: "2020",
    episodes: 1,
    hasVideo: false,
    characters: ["엘림스", "닥터헬"],
    storyTags: ["체이서"],
    summary: "엘림스와 닥터헬, 오랜 친구 둘의 이야기.",
    elimsComment: "...아슈와의 일이야. 더 이상은 말하지 않겠어.",
    rComment: "닥터헬 님과 엘림스 님이... 오랜 친구였다는 건 알고 있어요.",
  },
  {
    id: "secret",
    title: "테일즈 시크릿",
    period: "2020",
    episodes: 6,
    hasVideo: true,
    characters: ["라라", "카인", "아벨", "오공"],
    storyTags: ["테일즈 시크릿", "시크릿"],
    summary: "앙리성 페스티벌에서 '동화나라의 그림자'와 '서로 다른 빛'이 충돌한다.",
    elimsComment: "축제 중에 벌어진 일이지. 라라와 카인, 아벨과 오공... 각자의 빛과 그림자가 드러난 사건이야.",
  },
  {
    id: "underworld",
    title: "어둠으로 빛나는 세계, 언더월드",
    period: "2020",
    episodes: 12,
    hasVideo: true,
    characters: ["블러디 베라", "아벨", "베라"],
    storyTags: ["언더월드"],
    summary: "어둠의 세계 언더월드. 아벨과 베라의 첫 만남이 공개되고, 블러디 베라가 등장한다. OST 'Dark Tales'와 '평행선' 수록.",
    elimsComment: "언더월드... 베라의 과거가 드러난 가장 무거운 에피소드야. 공식 프로필에도 있듯이, 카인의 반전의 힘이 블러디 베라를 발현시켰지.",
    rComment: "베라 씨에게 그런 과거가... 아벨 씨와의 첫 만남도 여기서 나왔군요.",
  },
  {
    id: "dream",
    title: "테일즈 드림",
    period: "2021",
    episodes: 24,
    hasVideo: false,
    characters: [],
    storyTags: ["테일즈 드림"],
    summary: "20화 + 에필로그 4화의 장편 시리즈. 동화나라의 꿈을 다룬다.",
    elimsComment: "시리즈 최장편이야. 에필로그까지 합치면 24화. 그만큼 할 이야기가 많았다는 뜻이지.",
  },

  // ── 감정의 제도 사가 ──────────────────────────
  {
    id: "emotion",
    title: "감정의 제도 / 시오넬",
    period: "2021",
    episodes: 12,
    hasVideo: true,
    characters: ["시오넬"],
    storyTags: ["감정의 제도", "시오넬"],
    summary: "감정의 제도에 위치한 기쁨의 왕국. 왕자 시오넬의 이야기 — '오만한 왕자님으로 살아남는다는 것은' 영상 시리즈 포함.",
    elimsComment: "감정의 제도... 내 고향이기도 하지. 시오넬은 기쁨의 왕국 왕자인데, 공식 프로필대로 반항적이고 난폭한 성격이야. 겉과 속이 다른 녀석.",
    rComment: "엘림스 님도 감정의 제도 출신이시잖아요. 시오넬 씨와는 아는 사이인가요?",
  },

  // ── 이클립스 ──────────────────────────────────
  {
    id: "eclipse",
    title: "이클립스 / 로로아의 여행일기",
    period: "2021~2022",
    episodes: 14,
    hasVideo: true,
    characters: ["로로아"],
    storyTags: ["이클립스", "로로아"],
    summary: "로로아의 여행일기 7화와 이클립스 본편으로 구성. 동화나라 속 성냥팔이 소녀 이야기가 포함된다.",
    elimsComment: "로로아... 동화나라 변방의 요정이야. 고양이 슈슈와 함께 영혼 가면을 모으는 중이라지. '성냥팔이 소녀' 에피소드는 꽤 묵직해.",
  },

  // ── 시즌3: 새로운 세계 ────────────────────────
  {
    id: "underworld-company",
    title: "저승컴퍼니",
    period: "2022",
    episodes: 8,
    hasVideo: true,
    characters: ["담연"],
    storyTags: ["저승컴퍼니", "담연"],
    summary: "저승컴퍼니의 엘리트 저승차사 담연이 등장한다.",
    elimsComment: "저승 쪽 이야기야. 담연은 저승컴퍼니 최연소 부장이라더군. 업무에 시달리는 건 여기나 저기나 마찬가지인 모양이야.",
    rComment: "저승에도... 회사가 있나요?",
  },
  {
    id: "dimension",
    title: "차원관리국",
    period: "2022~2023",
    episodes: 6,
    hasVideo: false,
    characters: [],
    storyTags: ["차원관리국"],
    summary: "다른 차원을 관리하는 차원관리국의 이야기.",
    elimsComment: "차원관리국... 셀리아가 속해 있는 곳이지. 멸망한 다른 차원의 동화나라에서 살아남은 차원관리자라고 해.",
  },
  {
    id: "bounabi",
    title: "바우나비 아일랜드",
    period: "2023",
    episodes: 6,
    hasVideo: false,
    characters: [],
    storyTags: ["바우나비 아일랜드"],
    summary: "바우나비 아일랜드에서 펼쳐지는 이야기.",
    elimsComment: "새로운 무대야. 동화나라 바깥에도 이야기는 계속되니까.",
  },
  {
    id: "dohwa",
    title: "도화연가",
    period: "2023",
    episodes: 5,
    hasVideo: false,
    characters: [],
    storyTags: ["도화연가"],
    summary: "도화연가 — 프롤로그부터 마지막화까지.",
    elimsComment: "동양풍 배경의 에피소드지. 제목 자체가 꽤 서정적이야.",
  },
  {
    id: "desert",
    title: "데저트 킹덤",
    period: "2023~2024",
    episodes: 6,
    hasVideo: false,
    characters: [],
    storyTags: ["데저트 킹덤"],
    summary: "사막의 왕국이 배경. 시드의 출신지로 추정되는 무대.",
    elimsComment: "데저트 킹덤... 시드 프로필에 '사막의 왕자'라고 되어 있지. 연관이 있을 거야.",
  },
  {
    id: "last-chaos",
    title: "라스트 카오스",
    period: "2024~2025",
    episodes: 15,
    hasVideo: false,
    characters: [],
    storyTags: ["라스트카오스"],
    summary: "카오스 시리즈의 마지막 편. 15화 구성의 대작.",
    elimsComment: "카오스 시리즈의 끝이야. 2009년 카오스제너레이션부터 시작된 이야기가 드디어 완결을 맞았지.",
    rComment: "15년에 걸친 이야기가... 끝난 건가요?",
  },
  {
    id: "dashjump",
    title: "DashJump",
    period: "2025",
    episodes: 3,
    hasVideo: false,
    characters: [],
    storyTags: ["DashJump"],
    summary: "테일즈런너 20주년 기념 프로젝트.",
    elimsComment: "20주년이라... 꽤 오래됐지. 이 세계도 그만큼의 역사가 쌓인 거야.",
  },
  {
    id: "atelier",
    title: "테일즈 아틀리에",
    period: "2025~2026",
    episodes: 5,
    hasVideo: false,
    characters: [],
    storyTags: ["테일즈아틀리에"],
    summary: "현재 연재 중인 최신 시리즈.",
    elimsComment: "지금도 이야기는 계속되고 있어. 내 아카이브에도 계속 추가해야겠지.",
  },
];

/** 태그 기반으로 stories.json에서 해당 아크의 스토리 ID를 찾는 헬퍼 */
export function matchArcStories(
  arc: StoryArc,
  stories: { id: number; hashTagSubject: string }[],
): number[] {
  return stories
    .filter((s) =>
      arc.storyTags.some((tag) =>
        s.hashTagSubject.split(",").some((t) => t.trim() === tag),
      ),
    )
    .map((s) => s.id);
}
