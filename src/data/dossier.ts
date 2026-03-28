/**
 * 캐릭터 도시에 — 공식 프로필(API comments/job 필드) 기반 관계 + 트리비아
 * 비공식 해석 없음. 모든 정보의 출처는 공식 홈페이지 캐릭터 프로필 또는 공식 스토리 태그.
 */

export type RelationType =
  | "가족"
  | "창조"
  | "동료"
  | "적대"
  | "보호"
  | "동행"
  | "소속"
  | "연관";

export interface CharacterRelation {
  targetName: string;
  targetId?: number;
  type: RelationType;
  label: string;
  source: string; // 출처
}

export interface Dossier {
  characterId: number;
  name: string;
  faction?: string;       // 소속/출신
  relations: CharacterRelation[];
  storyArcIds: string[];  // lore.ts StoryArc.id 참조
  trivia: string[];       // 공식 프로필에서 추출한 트리비아
  elimsNote: string;
  rNote?: string;
}

export const DOSSIERS: Dossier[] = [
  // ── 닥터헬 일가 ────────────────────────────────
  {
    characterId: 50,
    name: "카이",
    faction: "닥터헬 측",
    relations: [
      { targetName: "닥터헬", type: "가족", label: "양아버지 — 닥터헬의 보살핌을 받으며 성장", source: "공식 프로필" },
      { targetName: "하루", targetId: 54, type: "연관", label: "하루가 카이를 자신만의 방식으로 아끼고 있음", source: "공식 프로필 (하루)" },
      { targetName: "R", targetId: 60, type: "연관", label: "같은 닥터헬의 관계자", source: "공식 프로필" },
    ],
    storyArcIds: ["chaos-gen", "chaos-zero", "s1-epilogue"],
    trivia: [
      "소외받은 캐릭터들의 불만이 뭉쳐서 태어남 (공식 프로필)",
      "직업: 아슈(닥터헬)의 조수",
      "MBTI: INFP · 혈액형: B형",
      "키 177cm · 생일 10/31",
    ],
    elimsNote: "아슈가 길에서 데려와 키운 아이야. 공식 프로필에 적혀 있듯이, 세상에 대한 적개심을 아슈의 보살핌으로 억누르고 있지.",
    rNote: "카이... 저와 같은 닥터헬 님의 관계자예요. 좀 무서워 보이지만...",
  },
  {
    characterId: 60,
    name: "R",
    faction: "엘림스 측",
    relations: [
      { targetName: "닥터헬", type: "창조", label: "닥터헬이 호러파크에서 만든 인조인간", source: "공식 프로필" },
      { targetName: "엘림스 스마일", targetId: 38, type: "동료", label: "현재 엘림스의 조수로 활동 중", source: "공식 프로필 (직업)" },
      { targetName: "카이", targetId: 50, type: "연관", label: "같은 닥터헬의 관계자", source: "공식 프로필" },
    ],
    storyArcIds: ["chaos-zero", "s1-epilogue"],
    trivia: [
      "호러파크에서 만들어진 인조인간(호문쿨루스)",
      "감정 표현에 서툴고 세상 모든 것이 신기한 순수한 소년",
      "MBTI: INTP · 혈액형: 없음",
      "제조된 지 5년 · 키 177cm",
    ],
    elimsNote: "아슈가 만든 인조인간이야. 지금은 내 조수로 일하고 있지. 감정 표현이 서투르지만... 누구보다 순수한 녀석이야.",
    rNote: "저... 세상에 모르는 게 너무 많아요. 하나씩 배우는 중이에요!",
  },
  {
    characterId: 54,
    name: "하루",
    faction: "어둠의 존재",
    relations: [
      { targetName: "카이", targetId: 50, type: "보호", label: "어둠에서 태어난 카이를 자신만의 방식으로 아끼고 있음", source: "공식 프로필" },
    ],
    storyArcIds: ["chaos-new"],
    trivia: [
      "버려진 악의 기운들이 모여 태어남",
      "분노 시 강력한 어둠으로 변함",
      "MBTI: INTJ · 혈액형: B형",
      "키 177cm · 생일 11/11",
    ],
    elimsNote: "어둠의 기운이 뭉쳐 태어난 존재야. 카이와의 관계가 독특한데... 공식 프로필에는 '자신만의 방식으로 아낀다'고 되어 있지.",
  },

  // ── 엘림스 ─────────────────────────────────────
  {
    characterId: 38,
    name: "엘림스 스마일",
    faction: "감정의 제도",
    relations: [
      { targetName: "R", targetId: 60, type: "동료", label: "R의 현재 고용주/파트너", source: "공식 프로필 (R의 직업)" },
      { targetName: "닥터헬", type: "동료", label: "오랜 친구 (체이서 스토리에서 다룸)", source: "공식 스토리: 체이서" },
      { targetName: "시오넬", targetId: 65, type: "소속", label: "같은 감정의 제도 출신", source: "공식 프로필" },
    ],
    storyArcIds: ["frontier", "chaser"],
    trivia: [
      "감정의 제도에서 온 아티팩터",
      "늘 스마일 가면을 쓰고 다님",
      "아티팩트를 자유자재로 다룰 수 있음",
      "MBTI: ENTP · 혈액형: AB형",
      "키 193cm · 나이 30대 초반(추정) · 생일 8/8",
    ],
    elimsNote: "...이건 내 프로필이잖아. 뭘 더 알고 싶은 건데?",
    rNote: "엘림스 님은 아티팩트의 천재예요! 가면 뒤의 얼굴은... 저도 못 봤어요.",
  },

  // ── 왕실 계열 ─────────────────────────────────
  {
    characterId: 62,
    name: "라라",
    faction: "동화나라 왕실",
    relations: [
      { targetName: "앙리 3세", type: "가족", label: "아버지", source: "공식 프로필" },
      { targetName: "사브리나", type: "가족", label: "어머니 — 기쁨의 나라 출신", source: "공식 프로필" },
      { targetName: "시오넬", targetId: 65, type: "가족", label: "어머니 사브리나의 오빠 — 외삼촌", source: "공식 스토리: 감정의 제도" },
    ],
    storyArcIds: ["academy", "secret"],
    trivia: [
      "앙리 3세와 사브리나의 딸이자 동화나라의 공주",
      "기쁨의 나라 출신 사브리나에게 이어받은 잠재된 기쁨의 힘 보유",
      "MBTI: ESTJ · 혈액형: A형",
      "13살 · 키 156cm · 생일 1/31",
    ],
    elimsNote: "동화나라의 공주야. 사브리나에게 이어받은 기쁨의 힘이 잠재되어 있다고 공식 프로필에 나와 있지.",
    rNote: "라라 공주님은 어리지만 정말 듬직해 보여요!",
  },
  {
    characterId: 65,
    name: "시오넬",
    faction: "감정의 제도 · 기쁨의 왕국",
    relations: [
      { targetName: "네레이드", type: "연관", label: "물의 정령 네레이드의 선택을 받은 차기 왕위 후보", source: "공식 프로필" },
      { targetName: "엘림스 스마일", targetId: 38, type: "소속", label: "같은 감정의 제도 출신", source: "공식 프로필" },
      { targetName: "라라", targetId: 62, type: "가족", label: "사브리나의 오빠이자 라라의 외삼촌", source: "공식 스토리: 감정의 제도" },
    ],
    storyArcIds: ["emotion"],
    trivia: [
      "감정의 제도에 위치한 기쁨의 왕국의 왕자",
      "물의 정령 네레이드의 선택을 받은 유력한 차기 왕위 계승자 후보",
      "고급스럽고 차가운 외모와 달리 반항적이고 난폭한 성격",
      "MBTI: ISTP · 혈액형: B형",
      "25살 · 키 186cm · 생일 1/20",
    ],
    elimsNote: "기쁨의 왕국 왕자야. 프로필에 '반항적이고 난폭한 성격'이라고 적혀 있는데... 틀린 말은 아니야.",
  },

  // ── 레인울프 / 뱀파이어 ───────────────────────
  {
    characterId: 53,
    name: "아벨",
    faction: "레인울프 가문",
    relations: [
      { targetName: "베라", targetId: 55, type: "연관", label: "언더월드에서 첫 만남이 공개됨", source: "공식 스토리: 언더월드" },
      { targetName: "블러디 베라", targetId: 64, type: "연관", label: "언더월드 에피소드에서 함께 등장", source: "공식 스토리: 언더월드" },
    ],
    storyArcIds: ["underworld", "secret"],
    trivia: [
      "모든 것이 미스터리에 싸여있는 늑대인간",
      "평소에는 평범한 인간의 모습, 분노 시 늑대로 변신",
      "직업: 레인울프 차기 가주",
      "MBTI: ISTJ · 혈액형: AB형",
      "키 186cm · 생일 9/17",
    ],
    elimsNote: "레인울프 차기 가주. 공식 프로필에 '모든 것이 미스터리에 싸여 있다'고 돼 있어. 언더월드에서 베라와의 첫 만남이 공개됐지.",
    rNote: "아벨 씨는 정말 미스터리한 분이에요...",
  },
  {
    characterId: 55,
    name: "베라",
    faction: "뱀파이어 귀족 가문",
    relations: [
      { targetName: "블러디 베라", targetId: 64, type: "연관", label: "같은 인물 — 과거의 모습", source: "공식 프로필 (블러디 베라)" },
      { targetName: "아벨", targetId: 53, type: "연관", label: "언더월드에서 첫 만남이 공개됨", source: "공식 스토리: 언더월드" },
    ],
    storyArcIds: ["chaos-wing", "underworld"],
    trivia: [
      "남아있는 소수의 뱀파이어 귀족 가문 출신",
      "마음의 병을 앓았던 과거를 이겨내고 발랄한 성격을 갖게 됨",
      "분노 시 어두운 내면의 박쥐 떼를 소환",
      "직업: 고고학자",
      "MBTI: ENFP · 키 155cm · 생일 8/1",
    ],
    elimsNote: "뱀파이어 귀족 가문 출신의 고고학자야. 프로필에 '마음의 병을 앓았던 과거'가 있다고 돼 있지.",
  },
  {
    characterId: 64,
    name: "블러디 베라",
    faction: "뱀파이어 귀족 가문",
    relations: [
      { targetName: "베라", targetId: 55, type: "연관", label: "같은 인물 — 과거의 베라의 모습", source: "공식 프로필" },
      { targetName: "카인", targetId: 39, type: "적대", label: "카인의 반전의 힘에 의해 발현됨", source: "공식 프로필" },
    ],
    storyArcIds: ["underworld"],
    trivia: [
      "카인이 가진 반전의 힘에 의해 과거의 슬픔이 발현된 상태",
      "베라가 마음의 병을 앓던 과거의 모습과 성격을 그대로 지님",
      "뱀파이어가 되기 전 12살",
      "MBTI: ISTP · 키 155cm · 생일 8/1",
    ],
    elimsNote: "베라의 또 다른 모습이야. 카인의 반전의 힘이 과거의 슬픔을 끌어낸 거지. 공식 프로필에 명확히 적혀 있어.",
  },

  // ── 카인 ───────────────────────────────────────
  {
    characterId: 39,
    name: "카인",
    faction: "엔젤시티",
    relations: [
      { targetName: "블러디 베라", targetId: 64, type: "적대", label: "반전의 힘으로 블러디 베라를 발현시킴", source: "공식 프로필 (블러디 베라)" },
    ],
    storyArcIds: ["frontier", "secret"],
    trivia: [
      "엔젤시티에서 온 견습 사제",
      "모두에게 친절하고 열심히 하지만 실수가 많은 성격",
      "MBTI: INFJ · 혈액형: B형",
      "키 163cm · 생일 12/21",
    ],
    elimsNote: "공식 프로필에는 '치유의 천사'라고 되어 있어. 엔젤시티에서 온 견습 사제... 하지만 테일즈프론티어에서 정체를 드러냈지.",
  },

  // ── 손오공 / 시드 ──────────────────────────────
  {
    characterId: 56,
    name: "손오공",
    faction: "서유기",
    relations: [
      { targetName: "시드", targetId: 68, type: "연관", label: "시드와 영혼의 공명이 가능한 존재", source: "공식 프로필 (시드)" },
      { targetName: "우마왕/아누비스", type: "적대", label: "우마왕이 아누비스와 합치는 것을 막기 위해 동화나라에 체류", source: "공식 프로필" },
    ],
    storyArcIds: ["secret"],
    trivia: [
      "동화나라에 떨어진 의문의 비석에서 등장",
      "장난기 가득한 외모, 용기 있고 모험심이 강함",
      "우마왕이 아누비스와 합류하는 것을 막기 위해 동화나라에 체류",
      "MBTI: ESTP · 혈액형: B형",
      "키 177cm · 생일 4/8",
    ],
    elimsNote: "서유기의 그 손오공이야. 프로필에는 우마왕-아누비스 합류를 막기 위해 동화나라에 남았다고 되어 있지.",
  },
  {
    characterId: 68,
    name: "시드",
    faction: "데저트 킹덤",
    relations: [
      { targetName: "손오공", targetId: 56, type: "연관", label: "손오공과 영혼의 공명을 할 수 있는 존재", source: "공식 프로필" },
    ],
    storyArcIds: ["desert"],
    trivia: [
      "동화나라의 손오공과 영혼의 공명이 가능",
      "사치와 향락을 즐기는 왕자로 소문나 있지만 이는 왕이 되지 않기 위한 연기",
      "사실은 자신의 나라를 누구보다 사랑하고 있음",
      "MBTI: ESTJ · 혈액형: B형",
      "23살 · 키 177cm · 생일 4/8",
    ],
    elimsNote: "사막의 왕자야. 프로필을 보면 방탕한 이미지는 연기라는 게 적혀 있어. 그리고 손오공과 영혼의 공명이 가능하다고... 흥미롭지.",
  },

  // ── 판도라 ─────────────────────────────────────
  {
    characterId: 57,
    name: "시호",
    faction: "판도라 아일랜드",
    relations: [
      { targetName: "미호", targetId: 59, type: "동료", label: "같은 판도라 아일랜드 출신", source: "공식 프로필" },
    ],
    storyArcIds: ["adventure"],
    trivia: [
      "판도라 아일랜드의 수호자",
      "천년호의 후예",
      "다정다감하고 순수한 영혼, 동물과 교감 가능",
      "오감이 발달되어 민첩하고 재빠름",
      "MBTI: INFP · 수인족 12살 · 키 155cm · 생일 3/14",
    ],
    elimsNote: "판도라 아일랜드의 수호자야. 천년호의 후예라고 프로필에 나와 있지.",
  },
  {
    characterId: 59,
    name: "미호",
    faction: "판도라 아일랜드",
    relations: [
      { targetName: "시호", targetId: 57, type: "동료", label: "같은 판도라 아일랜드 출신", source: "공식 프로필" },
    ],
    storyArcIds: [],
    trivia: [
      "판도라 아일랜드에서 온 태양술사",
      "밝고 낙천적이지만 꽤 단순한 적극파 소녀",
      "별자리를 통해 미래를 내다볼 수 있는 차기 태양술사",
    ],
    elimsNote: "미호는 판도라 아일랜드의 태양술사야. 별자리로 미래를 본다는데, 얼마나 정확한지는 모르겠군.",
  },

  // ── 저승 ───────────────────────────────────────
  {
    characterId: 61,
    name: "하랑",
    faction: "저승",
    relations: [
      { targetName: "담연", targetId: 66, type: "동료", label: "같은 저승차사", source: "공식 프로필" },
    ],
    storyArcIds: [],
    trivia: [
      "아픈 동생 한울의 병을 고치려 운명을 거스른 대가로 저승차사가 됨",
      "미래와 과거를 넘나들며 사망 명부를 관리",
      "MBTI: ISFJ · 살아있을 때 22살",
      "키 176cm · 생일 12/12",
    ],
    elimsNote: "운명을 거스른 대가로 저승차사가 됐다고 해. 꽤 무거운 사연이지.",
  },
  {
    characterId: 66,
    name: "담연",
    faction: "저승컴퍼니",
    relations: [
      { targetName: "하랑", targetId: 61, type: "동료", label: "같은 저승차사", source: "공식 프로필" },
    ],
    storyArcIds: ["underworld-company"],
    trivia: [
      "저승컴퍼니의 엘리트 저승차사이자 부장",
      "많은 업무를 담당하느라 피로에 시달림",
      "업무에 대해서는 그 누구보다 완벽, 공과 사 구분이 철저",
      "MBTI: ISTJ · 저승 나이 100살 · 키 156cm · 생일 11/13",
    ],
    elimsNote: "저승컴퍼니 최연소 부장이라더군. 피로에 시달린다는 게 프로필에 있어. ...남의 일 같지 않네.",
  },

  // ── 연오 ───────────────────────────────────────
  {
    characterId: 63,
    name: "연오",
    faction: "성주신",
    relations: [],
    storyArcIds: ["imaemangyang"],
    trivia: [
      "오랫동안 노리개에 봉인되어 있다 런너들의 힘으로 깨어남",
      "우아하고 때론 냉정하리만큼 차갑지만, 마음을 준 상대에겐 한없이 잘 대해주는 의리파",
      "MBTI: ENFJ · 키 161cm · 생일 4/5",
    ],
    elimsNote: "오래 봉인되어 있던 성주신이야. 깨어난 뒤로 동화나라에 정착했지.",
  },

  // ── 차원관리국 ─────────────────────────────────
  {
    characterId: 41,
    name: "셀리아",
    faction: "차원관리국",
    relations: [
      { targetName: "클로에", targetId: 67, type: "소속", label: "같은 차원관리국 관련자", source: "공식 프로필" },
    ],
    storyArcIds: ["dimension"],
    trivia: [
      "차원관리국 의회 소속의 차원관리자이자 교관",
      "멸망한 다른 차원 속 동화나라에서 생존하여 차원관리국으로 옴",
      "자유분방하지만 자기주장이 확실한 강인한 성격",
      "MBTI: ENTP · 혈액형: B형 · 키 172cm · 생일 4/12",
    ],
    elimsNote: "멸망한 다른 차원의 동화나라 출신이라니... 흥미로운 배경이야.",
  },
  {
    characterId: 67,
    name: "클로에",
    faction: "차원관리국",
    relations: [
      { targetName: "도우", type: "동행", label: "그림자 '도우'를 통해 마음속 어둠을 극복", source: "공식 프로필" },
      { targetName: "부모님 (차원관리국 연구원)", type: "가족", label: "부모님이 행방불명됨", source: "공식 프로필" },
      { targetName: "셀리아", targetId: 41, type: "소속", label: "같은 차원관리국 관련자", source: "공식 프로필" },
    ],
    storyArcIds: [],
    trivia: [
      "차원관리국 소속 연구원인 부모님 아래에서 자랐으나 부모님이 행방불명",
      "사람을 믿지 않고 마음속 어둠을 갖게 됨",
      "그림자 '도우'를 통해 어느 정도 극복",
      "MBTI: ENFP · 혈액형: O형 · 15살 · 키 158cm · 생일 6/21",
    ],
    elimsNote: "부모님이 행방불명된 아이야. 그림자 도우가 마음의 지지대 역할을 하고 있지.",
  },

  // ── 티티 ───────────────────────────────────────
  {
    characterId: 69,
    name: "티티",
    faction: "연금술사",
    relations: [
      { targetName: "아린", type: "보호", label: "천사와 악마 사이에서 태어나 아린에게 맡겨짐", source: "공식 프로필" },
    ],
    storyArcIds: ["chaos-epilogue"],
    trivia: [
      "천사와 악마 사이에서 태어난 혼혈 소녀",
      "아린의 연금술에 의해 존재를 긍정받음",
      "아린과 같은 위대한 연금술사가 되는 날을 꿈꿈",
      "라스트 카오스 시리즈에서 첫 등장한 연금술사",
      "첫 전용 복장은 고양이 모티프 '냥글냥글'",
      "MBTI: INTJ · 혈액형: A형 · 키 150cm · 생일 8/18",
    ],
    elimsNote: "아린에게 맡겨진 혼혈 소녀야. 모두에게 괄시받다가 아린의 연금술로 존재를 긍정받았지. 카오스 에필로그에서 본격적으로 활약했는데, 호기심 많은 녀석이라 앞으로가 기대돼.",
  },

  // ── 로로아 ─────────────────────────────────────
  {
    characterId: 40,
    name: "로로아",
    faction: "동화나라 변방",
    relations: [
      { targetName: "슈슈", type: "동행", label: "고양이 슈슈와 함께 모험 중", source: "공식 프로필" },
    ],
    storyArcIds: ["eclipse"],
    trivia: [
      "동화나라 변방에서 살고 있던 작은 요정",
      "요정의 능력으로 영혼을 빼앗아 가면으로 만들 수 있음",
      "고양이 슈슈와 함께 영혼 가면을 수집하는 모험 중",
      "MBTI: ENFP · 혈액형: AB형 · 키 132cm · 생일 5/5",
    ],
    elimsNote: "영혼으로 가면을 만드는 요정이야. 슈슈라는 고양이와 함께 다니지. 프로필만 봐도 꽤 독특한 능력이야.",
  },

  // ── 닌자 자매 ──────────────────────────────────
  {
    characterId: 51,
    name: "유키",
    faction: "닌자",
    relations: [
      { targetName: "쿠로", targetId: 52, type: "가족", label: "쿠로가 유키와 함께 닌자 기술을 익힘", source: "공식 프로필 (쿠로)" },
    ],
    storyArcIds: [],
    trivia: [
      "도도하고 시크한 이미지지만 가족을 사랑하는 따뜻한 마음",
      "뛰어난 닌자, 빠른 속도가 특징",
    ],
    elimsNote: "겉은 차갑지만 속은 따뜻한 닌자야. 쿠로의 프로필에 '유키와 함께 닌자 기술을 익혔다'고 나와 있지.",
  },
  {
    characterId: 52,
    name: "쿠로",
    faction: "닌자",
    relations: [
      { targetName: "유키", targetId: 51, type: "가족", label: "유키와 함께 닌자 기술을 익힘", source: "공식 프로필" },
    ],
    storyArcIds: [],
    trivia: [
      "쾌활하고 활동적인 성격의 닌자",
      "어릴 적부터 파파의 밑에서 유키와 함께 닌자 기술을 익힘",
    ],
    elimsNote: "유키의 파트너야. 같은 파파 밑에서 자란 닌자 콤비지.",
  },

  // ── 러프 / 히든러프 ───────────────────────────
  {
    characterId: 47,
    name: "러프",
    faction: "TrES",
    relations: [
      { targetName: "히든러프", targetId: 48, type: "연관", label: "히든러프는 다른 차원의 미래의 러프", source: "공식 프로필 (히든러프)" },
    ],
    storyArcIds: ["character-stories"],
    trivia: [
      "세계 일류 바이크 라이더",
      "바이크 사고로 신경계에 문제가 생겨 몸이 거꾸로 반응하게 됨",
      "몸을 원래대로 되돌리기 위해 달리기 대회에 참가",
    ],
    elimsNote: "바이크 사고로 신경계에 문제가 생긴 소년이야. 몸이 거꾸로 반응한다니... 꽤 고된 사연이지.",
  },
  {
    characterId: 48,
    name: "히든러프",
    faction: "TrES",
    relations: [
      { targetName: "러프", targetId: 47, type: "연관", label: "다른 차원에서 온 정상적인 미래의 러프", source: "공식 프로필" },
      { targetName: "미야", type: "동행", label: "미야의 소원으로 불려옴, 미야의 기억 복원이 목표", source: "공식 프로필" },
    ],
    storyArcIds: ["character-stories"],
    trivia: [
      "러프를 도와준 고양이 미야의 소원으로 다른 차원에서 불려옴",
      "몸이 정상이지만 부작용으로 미야의 기억이 사라짐",
      "미야의 기억을 되돌리기 위해 활동",
    ],
    elimsNote: "미야라는 고양이의 소원이 만들어낸 존재야. 차원을 넘어온 미래의 러프... 소원의 부작용으로 미야의 기억이 사라졌지.",
  },

  // ── 자브 ───────────────────────────────────────
  {
    characterId: 70,
    name: "자브",
    faction: "애니멀 빌리지",
    relations: [
      { targetName: "하울이", type: "동행", label: "하울이와 함께 동화나라에 옴", source: "공식 프로필" },
    ],
    storyArcIds: ["zarb-adventure"],
    trivia: [
      "멍멍광역시 달동구 시고리 출신",
      "풀네임: 테오도르 발몽 드 리카르도 시고르자브 4세",
      "소원의 돌 경주를 목적으로 왔으나 경주는 이미 끝남",
      "순하고 낙천적인 성격의 강아지",
      "2025년 7월 업데이트로 등장한 신규 스토리 캐릭터",
      "동화나라에 적응 중",
      "MBTI: ENFP · 1.6세(인간 20세) · 생일 12/2",
    ],
    elimsNote: "풀네임이 저렇게 긴 강아지야. 소원의 돌 경주를 하러 왔는데 이미 끝났다는 게... 어찌 보면 테런답지. 동화나라에 아직 적응 중인 것 같은데, 순한 성격이라 금방 녹아들겠지.",
    rNote: "자브 씨의 이름이 정말 길어요...! 테오도르 발몽 드 리카르도 시고르자브 4세...",
  },

  // ── 오리지널 런너 ────────────────────────────────
  {
    characterId: 30,
    name: "초원",
    relations: [
      { targetName: "밍밍", targetId: 34, type: "동료", label: "대부분의 공식 만화에서 함께 등장하는 파트너", source: "공식 스토리" },
    ],
    storyArcIds: [],
    trivia: [
      "달리기를 좋아하는 건강하고 밝은 성격의 꼬마 스포츠맨",
      "무슨 일이든 나서서 하므로 주변에 친구들이 많은 골목대장",
      "소원 없음 — 달리기 자체를 좋아함",
      "MBTI: ESFJ · 혈액형: O형",
      "11살 · 키 140cm · 생일 5/2",
    ],
    elimsNote: "테일즈런너를 대표하는 소년이야. 특별한 소원 없이 그냥 달리기가 좋다는 게... 어쩌면 가장 순수한 런너지.",
    rNote: "초원 씨는 항상 밝아요! 같이 있으면 저도 기분이 좋아져요.",
  },
  {
    characterId: 34,
    name: "밍밍",
    relations: [
      { targetName: "초원", targetId: 30, type: "동료", label: "대부분의 공식 만화에서 함께 등장하는 파트너", source: "공식 스토리" },
    ],
    storyArcIds: [],
    trivia: [
      "밝고 꾸밈없는 성격으로 모두의 귀여움을 받는 영화배우",
      "어려서부터 스타로 떠받들어져서 약간 도도한 면도 있음",
      "소원: 빨리 어른이 되어 다양한 역할을 소화하는 것",
      "MBTI: ENFP · 혈액형: B형",
      "10살 · 키 130cm · 생일 7/29",
    ],
    elimsNote: "10살 영화배우라... 프로필에 '도도한 면도 있다'고 되어 있어. 초원과 콤비로 자주 나오지.",
  },
  {
    characterId: 36,
    name: "리나",
    faction: "프랑스 출신",
    relations: [],
    storyArcIds: [],
    trivia: [
      "걷기 전부터 발레를 배운 프랑스 출신 발레리나",
      "착하고 순종적이지만 목표를 정하면 고집스럽게 밀어붙이는 면도 있음",
      "엄격한 가정교육으로 예의범절이 깍듯함",
      "화려한 생활보다 평범하고 작은 일상을 소중히 함",
      "소원: 몸에 밴 발레 동작을 지우는 것",
      "MBTI: INFP · 혈액형: A형",
      "17살 · 키 155cm · 생일 2/28",
    ],
    elimsNote: "몸에 밴 발레 동작을 지우고 싶다는 소원이 특이하지. 서기, 달리기, 넘어지는 모션 전부 발레 자세야.",
  },
  {
    characterId: 42,
    name: "빅보",
    relations: [
      { targetName: "둥가", type: "동행", label: "앵무새 둥가의 병을 고치기 위해 달리기 대회에 참가", source: "공식 프로필" },
    ],
    storyArcIds: [],
    trivia: [
      "엄청나게 큰 덩치를 가졌지만 누구보다 순박하고 착한 친구",
      "거대한 몸집에 어울리지 않게 작고 귀여운 것들을 좋아함",
      "취미는 귀여운 애완동물 키우기와 애니메이션 피규어 모으기",
      "소원: 앵무새 둥가의 병을 치료하는 것",
      "MBTI: ISFJ · 혈액형: O형",
      "18살 · 키 192cm · 몸무게 125kg · 생일 3/3",
    ],
    elimsNote: "192cm에 125kg인데 소원이 앵무새 치료라니... 프로필에 '피규어 모으기'가 취미라고 적혀 있어. 의외의 갭이야.",
  },
  {
    characterId: 43,
    name: "DnD",
    relations: [],
    storyArcIds: [],
    trivia: [
      "이름은 Dream and Desire의 약자",
      "낙천적인 성격과 섹시함으로 최고의 인기를 누리는 가수",
      "생방송 중 변비로 방귀를 뀌는 사고를 당함",
      "변비를 치료하기 위해 동화나라 달리기 대회에 참가",
      "MBTI: ESFP · 혈액형: O형",
      "21살 · 키 168cm · 생일 6/10",
    ],
    elimsNote: "생방송 중 변비로 사고를 쳤다는 게 프로필에 그대로 적혀 있어. ...소원의 돌을 그 용도로 쓸 생각이라니.",
  },
  {
    characterId: 44,
    name: "나르시스",
    faction: "동화나라",
    relations: [],
    storyArcIds: [],
    trivia: [
      "동화나라 출신 — 다른 런너와 달리 동화나라 태생",
      "자신의 아름다움을 영원히 간직하는 것이 소원",
      "소원의 돌을 통해 영원한 미모를 얻고자 달리기 대회에 출전",
      "넘어진 뒤 회복 시간이 매우 긴 캐릭터 (외모 정리에 시간을 씀)",
      "MBTI: ISTP · 혈액형: AB형",
      "19살 · 키 185cm · 생일 6/11",
    ],
    elimsNote: "넘어지면 외모부터 정리하는 녀석이야. 영원한 미모가 소원이라... 동화나라 태생인 건 꽤 특이한 점이지.",
  },
  {
    characterId: 46,
    name: "마키",
    relations: [
      { targetName: "빌리", type: "동행", label: "어릴 때부터 따라다니는 유령 — 마키를 괴롭히는 존재", source: "공식 프로필" },
    ],
    storyArcIds: ["character-stories"],
    trivia: [
      "강한 영적 능력 때문에 어려서부터 영혼을 보게 됨",
      "영혼들의 시달림과 주변의 시선 때문에 성격이 어두워진 슬픈 과거",
      "소원: 유령 빌리를 떼어내는 것",
      "MBTI: INTJ · 혈액형: AB형",
      "16살 · 키 143cm · 생일 9/25",
    ],
    elimsNote: "영적 능력이 강해서 영혼이 보이는 소녀야. 프로필에 '슬픈 과거'라고 되어 있어. 빌리라는 유령을 떼어내고 싶다는 게 소원이지.",
  },
  {
    characterId: 49,
    name: "바다",
    faction: "곰 발바닥 섬",
    relations: [],
    storyArcIds: ["character-stories"],
    trivia: [
      "곰 발바닥 섬에서 태어남 — 섬이 바다에 가라앉는 것을 막기 위해 참가",
      "섬에서 자라 구수한 사투리를 씀 (경상도 방언)",
      "공식 프로필에 양 부모님이 공개된 최초의 캐릭터",
      "MBTI: ESTP · 혈액형: O형",
      "17살 · 키 162cm · 생일 12/24",
    ],
    elimsNote: "경상도 사투리를 쓰는 섬소녀야. 고향이 가라앉는 걸 막겠다는 소원이 진지해. 부모님 둘 다 공개된 첫 런너이기도 하고.",
  },
  {
    characterId: 58,
    name: "루시",
    faction: "바람계곡",
    relations: [],
    storyArcIds: [],
    trivia: [
      "혼돈의 지역 흩날리는 바람계곡에 살아남은 마지막 요정",
      "대자연을 섬기는 요정으로 경계심이 많고 예민함",
      "소원: 사라져버린 요정 종족을 되살리는 것",
      "눈 색깔이 시간대에 따라 변함 (낮: 파랑, 밤: 보라)",
      "이름은 유저 투표로 결정됨",
      "MBTI: INFJ · 혈액형: 불명",
      "요정 나이 약 15살 · 키 162cm · 생일 8/24",
    ],
    elimsNote: "마지막 요정이야. 종족을 되살리겠다는 소원이 무겁지. 눈 색깔이 시간에 따라 바뀐다는 건 프로필에서도 독특한 설정이야.",
    rNote: "루시 씨의 눈이 밤에 보라색으로 변해요... 예뻐요!",
  },
];

/** characterId로 도시에 찾기 */
export function getDossier(characterId: number): Dossier | undefined {
  return DOSSIERS.find((d) => d.characterId === characterId);
}

/** 해당 캐릭터와 관계가 있는 다른 캐릭터 ID 목록 */
export function getRelatedCharacterIds(characterId: number): number[] {
  const dossier = getDossier(characterId);
  if (!dossier) return [];
  return dossier.relations
    .map((r) => r.targetId)
    .filter((id): id is number => id !== undefined);
}
