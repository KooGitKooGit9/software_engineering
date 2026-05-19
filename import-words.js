
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const words = [
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Ambiguous",
    "mean": "모호한",
    "pron": "앰비규어스",
    "ex": "The ending was ambiguous.",
    "exKor": "결말이 모호했다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Ambivalent",
    "mean": "반대 감정이 병존하는",
    "pron": "앰비벌런트",
    "ex": "She has ambivalent feelings about her job.",
    "exKor": "그녀는 그녀의 직업에 대해 복잡한 감정을 가지고 있다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Ambitious",
    "mean": "야심 있는",
    "pron": "앰비셔스",
    "ex": "The plan was too ambitious.",
    "exKor": "그 계획은 너무 야심찼다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Anonymous",
    "mean": "익명의",
    "pron": "어나니머스",
    "ex": "The donor wished to remain anonymous.",
    "exKor": "기부자는 익명으로 남기를 원했다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Inevitably",
    "mean": "불가피하게",
    "pron": "이네비터블리",
    "ex": "It will inevitably happen.",
    "exKor": "그것은 불가피하게 일어날 것이다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Inimitably",
    "mean": "독특하게",
    "pron": "이니미터블리",
    "ex": "She sang inimitably well.",
    "exKor": "그녀는 독보적으로 노래를 잘 불렀다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Invariably",
    "mean": "변함없이",
    "pron": "인베리어블리",
    "ex": "He invariably arrives late.",
    "exKor": "그는 변함없이 늦게 도착한다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Prevalent",
    "mean": "널리 퍼진",
    "pron": "프레벌런트",
    "ex": "The custom is prevalent.",
    "exKor": "그 관습은 널리 퍼져 있다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Preventive",
    "mean": "예방의",
    "pron": "프리벤티브",
    "ex": "Take preventive measures.",
    "exKor": "예방 조치를 취하세요."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Precedent",
    "mean": "선례",
    "pron": "프레시던트",
    "ex": "There is no precedent for this.",
    "exKor": "이것에 대한 선례가 없다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Subtle",
    "mean": "미묘한",
    "pron": "써틀",
    "ex": "I noticed a subtle change.",
    "exKor": "나는 미묘한 변화를 알아차렸다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Saddle",
    "mean": "안장",
    "pron": "새들",
    "ex": "He sat on the saddle.",
    "exKor": "그는 안장 위에 앉았다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Shuttle",
    "mean": "셔틀",
    "pron": "셔틀",
    "ex": "Take the shuttle bus.",
    "exKor": "셔틀버스를 타세요."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Vulnerable",
    "mean": "취약한",
    "pron": "벌너러블",
    "ex": "We are vulnerable to cold.",
    "exKor": "우리는 추위에 취약하다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Valuable",
    "mean": "가치 있는",
    "pron": "밸류어블",
    "ex": "This is a valuable ring.",
    "exKor": "이것은 가치 있는 반지다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "상",
    "word": "Voluntary",
    "mean": "자발적인",
    "pron": "발런터리",
    "ex": "Participation is voluntary.",
    "exKor": "참여는 자발적이다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "중",
    "word": "Alternative",
    "mean": "대안",
    "pron": "얼터너티브",
    "ex": "There is no alternative.",
    "exKor": "대안이 없다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "중",
    "word": "Consistent",
    "mean": "일관된",
    "pron": "컨시스턴트",
    "ex": "Be consistent with rules.",
    "exKor": "규칙에 일관성을 가지세요."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "중",
    "word": "Distinct",
    "mean": "뚜렷한",
    "pron": "디스틴트",
    "ex": "The smell is distinct.",
    "exKor": "냄새가 뚜렷하다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "중",
    "word": "Evaluate",
    "mean": "평가하다",
    "pron": "이밸류에이트",
    "ex": "Evaluate your progress.",
    "exKor": "당신의 진행 상황을 평가하세요."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "중",
    "word": "Perspective",
    "mean": "관점",
    "pron": "퍼스펙티브",
    "ex": "A new perspective is needed.",
    "exKor": "새로운 관점이 필요하다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "하",
    "word": "Achieve",
    "mean": "성취하다",
    "pron": "어치브",
    "ex": "You can achieve anything.",
    "exKor": "당신은 무엇이든 성취할 수 있다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "하",
    "word": "Focus",
    "mean": "집중하다",
    "pron": "포커스",
    "ex": "Focus on the goal.",
    "exKor": "목표에 집중하세요."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "하",
    "word": "Global",
    "mean": "세계적인",
    "pron": "글로벌",
    "ex": "Global warming is serious.",
    "exKor": "지구 온난화는 심각하다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "하",
    "word": "Notice",
    "mean": "알아차리다",
    "pron": "노티스",
    "ex": "I didn't notice him.",
    "exKor": "나는 그를 알아차리지 못했다."
  },
  {
    "cat": "1. 수능 영단어",
    "level": "하",
    "word": "Support",
    "mean": "지지하다",
    "pron": "서포트",
    "ex": "Thank you for your support.",
    "exKor": "당신의 지지에 감사드립니다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "상",
    "word": "Spontaneous",
    "mean": "즉흥적인",
    "pron": "스판테이니어스",
    "ex": "It was a spontaneous trip.",
    "exKor": "그것은 즉흥적인 여행이었다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "상",
    "word": "Versatile",
    "mean": "다재다능한",
    "pron": "버서틀",
    "ex": "He is a versatile actor.",
    "exKor": "그는 다재다능한 배우이다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "상",
    "word": "Complacent",
    "mean": "자기만족적인",
    "pron": "컴플레이슨트",
    "ex": "Don't be complacent.",
    "exKor": "자만하지 마세요."
  },
  {
    "cat": "2. 일상 회화",
    "level": "상",
    "word": "Inquisitive",
    "mean": "호기심 많은",
    "pron": "인퀴지티브",
    "ex": "The child is inquisitive.",
    "exKor": "그 아이는 호기심이 많다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "상",
    "word": "Whimsical",
    "mean": "변덕스러운",
    "pron": "윔지컬",
    "ex": "She has a whimsical style.",
    "exKor": "그녀는 변덕스러운 스타일을 가졌다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "중",
    "word": "Appreciate",
    "mean": "고마워하다",
    "pron": "어프리시에이트",
    "ex": "I appreciate your help.",
    "exKor": "당신의 도움에 감사드립니다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "중",
    "word": "Exaggerate",
    "mean": "과장하다",
    "pron": "이그재저레이트",
    "ex": "Don't exaggerate the story.",
    "exKor": "이야기를 과장하지 마세요."
  },
  {
    "cat": "2. 일상 회화",
    "level": "중",
    "word": "Gorgeous",
    "mean": "아주 멋진",
    "pron": "고져스",
    "ex": "The view is gorgeous.",
    "exKor": "경치가 아주 멋지다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "중",
    "word": "Reliable",
    "mean": "믿을만한",
    "pron": "릴라이어블",
    "ex": "She is a reliable person.",
    "exKor": "그녀는 믿을 만한 사람이다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "중",
    "word": "Keep in touch",
    "mean": "연락하다",
    "pron": "킵 인 터치",
    "ex": "Let's keep in touch!",
    "exKor": "계속 연락하고 지내자!"
  },
  {
    "cat": "2. 일상 회화",
    "level": "하",
    "word": "Awesome",
    "mean": "최고예요",
    "pron": "어썸",
    "ex": "That is awesome!",
    "exKor": "정말 멋지네요!"
  },
  {
    "cat": "2. 일상 회화",
    "level": "하",
    "word": "Believe",
    "mean": "믿다",
    "pron": "빌리브",
    "ex": "I believe in you.",
    "exKor": "나는 당신을 믿습니다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "하",
    "word": "Favorite",
    "mean": "좋아하는",
    "pron": "페이버릿",
    "ex": "My favorite food is pizza.",
    "exKor": "내가 가장 좋아하는 음식은 피자이다."
  },
  {
    "cat": "2. 일상 회화",
    "level": "하",
    "word": "Hurry",
    "mean": "서두르다",
    "pron": "허리",
    "ex": "Hurry up, we're late.",
    "exKor": "서둘러, 우리 늦었어."
  },
  {
    "cat": "2. 일상 회화",
    "level": "하",
    "word": "Maybe",
    "mean": "아마도",
    "pron": "메이비",
    "ex": "Maybe you are right.",
    "exKor": "아마도 당신이 맞을지도 몰라요."
  },
  {
    "cat": "3. 여행 필수",
    "level": "상",
    "word": "Picturesque",
    "mean": "그림 같은",
    "pron": "픽처레스크",
    "ex": "The village is picturesque.",
    "exKor": "그 마을은 그림 같다."
  },
  {
    "cat": "3. 여행 필수",
    "level": "상",
    "word": "Atmosphere",
    "mean": "분위기",
    "pron": "애트모스피어",
    "ex": "I like the atmosphere here.",
    "exKor": "나는 이곳의 분위기가 좋다."
  },
  {
    "cat": "3. 여행 필수",
    "level": "상",
    "word": "Heritage",
    "mean": "유산",
    "pron": "헤리티지",
    "ex": "It is a world heritage site.",
    "exKor": "그것은 세계 문화 유산이다."
  },
  {
    "cat": "3. 여행 필수",
    "level": "상",
    "word": "Excursion",
    "mean": "짧은 여행",
    "pron": "익스커션",
    "ex": "We went on an excursion.",
    "exKor": "우리는 짧은 여행을 다녀왔다."
  },
  {
    "cat": "3. 여행 필수",
    "level": "상",
    "word": "Inhabitant",
    "mean": "주민",
    "pron": "인해비턴트",
    "ex": "Local inhabitants are kind.",
    "exKor": "현지 주민들은 친절하다."
  },
  {
    "cat": "3. 여행 필수",
    "level": "중",
    "word": "Destination",
    "mean": "목적지",
    "pron": "데스티네이션",
    "ex": "What's our destination?",
    "exKor": "우리의 목적지는 어디인가요?"
  },
  {
    "cat": "3. 여행 필수",
    "level": "중",
    "word": "Reservation",
    "mean": "예약",
    "pron": "레저베이션",
    "ex": "I have a reservation.",
    "exKor": "나는 예약을 했다."
  },
  {
    "cat": "3. 여행 필수",
    "level": "중",
    "word": "Souvenir",
    "mean": "기념품",
    "pron": "수베니어",
    "ex": "I bought a souvenir.",
    "exKor": "나는 기념품을 샀다."
  },
  {
    "cat": "3. 여행 필수",
    "level": "중",
    "word": "Baggage",
    "mean": "수하물",
    "pron": "배기지",
    "ex": "Where is my baggage?",
    "exKor": "내 수하물은 어디에 있나요?"
  },
  {
    "cat": "3. 여행 필수",
    "level": "중",
    "word": "Explore",
    "mean": "탐험하다",
    "pron": "익스플로어",
    "ex": "Let's explore the city.",
    "exKor": "도시를 탐험해 보자."
  },
  {
    "cat": "3. 여행 필수",
    "level": "하",
    "word": "Airport",
    "mean": "공항",
    "pron": "에어포트",
    "ex": "Where is the airport?",
    "exKor": "공항이 어디에 있나요?"
  },
  {
    "cat": "3. 여행 필수",
    "level": "하",
    "word": "Passport",
    "mean": "여권",
    "pron": "패스포트",
    "ex": "Keep your passport safe.",
    "exKor": "여권을 안전하게 보관하세요."
  },
  {
    "cat": "3. 여행 필수",
    "level": "하",
    "word": "Ticket",
    "mean": "표",
    "pron": "티켓",
    "ex": "One ticket, please.",
    "exKor": "표 한 장 주세요."
  },
  {
    "cat": "3. 여행 필수",
    "level": "하",
    "word": "Map",
    "mean": "지도",
    "pron": "맵",
    "ex": "Can I have a map?",
    "exKor": "지도를 받을 수 있을까요?"
  },
  {
    "cat": "3. 여행 필수",
    "level": "하",
    "word": "Camera",
    "mean": "카메라",
    "pron": "카메라",
    "ex": "Look at the camera.",
    "exKor": "카메라를 보세요."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "상",
    "word": "Unrequited",
    "mean": "보답 없는",
    "pron": "언리콰이티드",
    "ex": "It was unrequited love.",
    "exKor": "그것은 짝사랑이었다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "상",
    "word": "Commitment",
    "mean": "헌신/약속",
    "pron": "커밋먼트",
    "ex": "Marriage needs commitment.",
    "exKor": "결혼은 헌신이 필요하다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "상",
    "word": "Reconciliation",
    "mean": "화해",
    "pron": "레컨실리에이션",
    "ex": "They seek reconciliation.",
    "exKor": "그들은 화해를 원한다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "상",
    "word": "Inseparable",
    "mean": "뗄 수 없는",
    "pron": "인세퍼러블",
    "ex": "They are inseparable.",
    "exKor": "그들은 뗄 수 없는 사이이다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "상",
    "word": "Jealousy",
    "mean": "질투",
    "pron": "젤러시",
    "ex": "Jealousy can be toxic.",
    "exKor": "질투는 해로울 수 있다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "중",
    "word": "Affection",
    "mean": "애정",
    "pron": "어펙션",
    "ex": "She showed him affection.",
    "exKor": "그녀는 그에게 애정을 보였다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "중",
    "word": "Proposal",
    "mean": "청혼",
    "pron": "프로포절",
    "ex": "He made a proposal.",
    "exKor": "그는 청혼을 했다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "중",
    "word": "Intimate",
    "mean": "친밀한",
    "pron": "인티메이트",
    "ex": "They are intimate friends.",
    "exKor": "그들은 친밀한 친구이다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "중",
    "word": "Charming",
    "mean": "매력적인",
    "pron": "차밍",
    "ex": "You are very charming.",
    "exKor": "당신은 매우 매력적이다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "중",
    "word": "Fate",
    "mean": "운명",
    "pron": "페이트",
    "ex": "I believe in fate.",
    "exKor": "나는 운명을 믿는다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "하",
    "word": "Couple",
    "mean": "커플",
    "pron": "커플",
    "ex": "They are a cute couple.",
    "exKor": "그들은 귀여운 커플이다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "하",
    "word": "Date",
    "mean": "데이트",
    "pron": "데이트",
    "ex": "Let's go on a date.",
    "exKor": "데이트하러 가자."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "하",
    "word": "Heart",
    "mean": "마음",
    "pron": "하트",
    "ex": "You stole my heart.",
    "exKor": "당신은 내 마음을 훔쳤어요."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "하",
    "word": "Flower",
    "mean": "꽃",
    "pron": "플라워",
    "ex": "I bought flowers.",
    "exKor": "나는 꽃을 샀다."
  },
  {
    "cat": "4. 설레는 연애",
    "level": "하",
    "word": "Sweet",
    "mean": "달콤한",
    "pron": "스위트",
    "ex": "You are so sweet.",
    "exKor": "당신은 정말 다정해요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "상",
    "word": "Collaboration",
    "mean": "협업",
    "pron": "컬래버레이션",
    "ex": "We need more collaboration.",
    "exKor": "우리는 더 많은 협업이 필요하다."
  },
  {
    "cat": "5. 비즈니스",
    "level": "상",
    "word": "Negotiate",
    "mean": "협상하다",
    "pron": "니고시에이트",
    "ex": "Time to negotiate the price.",
    "exKor": "가격을 협상할 시간이다."
  },
  {
    "cat": "5. 비즈니스",
    "level": "상",
    "word": "Implement",
    "mean": "실행하다",
    "pron": "임플리먼트",
    "ex": "Implement the plan now.",
    "exKor": "지금 계획을 실행하세요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "상",
    "word": "Feasibility",
    "mean": "실현 가능성",
    "pron": "피지빌리티",
    "ex": "Check the feasibility.",
    "exKor": "실현 가능성을 확인하세요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "상",
    "word": "Redundancy",
    "mean": "정리해고",
    "pron": "리던던시",
    "ex": "Redundancy is a risk.",
    "exKor": "정리해고는 위험 요소이다."
  },
  {
    "cat": "5. 비즈니스",
    "level": "중",
    "word": "Revenue",
    "mean": "수익",
    "pron": "레버뉴",
    "ex": "The revenue is growing.",
    "exKor": "수익이 증가하고 있다."
  },
  {
    "cat": "5. 비즈니스",
    "level": "중",
    "word": "Objective",
    "mean": "목표",
    "pron": "오브젝티브",
    "ex": "What is your objective?",
    "exKor": "당신의 목표는 무엇인가요?"
  },
  {
    "cat": "5. 비즈니스",
    "level": "중",
    "word": "Deadline",
    "mean": "마감일",
    "pron": "데드라인",
    "ex": "Don't miss the deadline.",
    "exKor": "마감일을 놓치지 마세요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "중",
    "word": "Quarterly",
    "mean": "분기별의",
    "pron": "쿼터리",
    "ex": "Review the quarterly report.",
    "exKor": "분기별 보고서를 검토하세요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "중",
    "word": "Agenda",
    "mean": "의제",
    "pron": "어젠다",
    "ex": "What's on the agenda?",
    "exKor": "안건이 무엇인가요?"
  },
  {
    "cat": "5. 비즈니스",
    "level": "하",
    "word": "Meeting",
    "mean": "회의",
    "pron": "미팅",
    "ex": "See you at the meeting.",
    "exKor": "회의에서 만나요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "하",
    "word": "Client",
    "mean": "고객",
    "pron": "클라이언트",
    "ex": "The client is waiting.",
    "exKor": "고객이 기다리고 있습니다."
  },
  {
    "cat": "5. 비즈니스",
    "level": "하",
    "word": "Report",
    "mean": "보고서",
    "pron": "리포트",
    "ex": "Finish the report.",
    "exKor": "보고서를 끝내세요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "하",
    "word": "Email",
    "mean": "이메일",
    "pron": "이메일",
    "ex": "Send me an email.",
    "exKor": "저에게 이메일을 보내주세요."
  },
  {
    "cat": "5. 비즈니스",
    "level": "하",
    "word": "Order",
    "mean": "주문",
    "pron": "오더",
    "ex": "Can I take your order?",
    "exKor": "주문하시겠습니까?"
  },
  {
    "cat": "6. 토익 기출",
    "level": "상",
    "word": "Mandatory",
    "mean": "의무적인",
    "pron": "맨더토리",
    "ex": "The training is mandatory.",
    "exKor": "그 교육은 의무적이다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "상",
    "word": "Appraisal",
    "mean": "평가",
    "pron": "어프레이절",
    "ex": "Wait for the performance appraisal.",
    "exKor": "인사 고과를 기다리세요."
  },
  {
    "cat": "6. 토익 기출",
    "level": "상",
    "word": "Contingency",
    "mean": "만일의 사태",
    "pron": "컨틴전시",
    "ex": "We have a contingency plan.",
    "exKor": "우리는 비상 계획이 있다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "상",
    "word": "Adjourn",
    "mean": "휴회하다",
    "pron": "어전",
    "ex": "The meeting was adjourned.",
    "exKor": "회의가 휴회되었다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "상",
    "word": "Premises",
    "mean": "구내/부지",
    "pron": "프레미시즈",
    "ex": "Smoking is banned on premises.",
    "exKor": "구내에서는 협연이 금지되어 있다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "중",
    "word": "Accommodate",
    "mean": "수용하다",
    "pron": "어카모데이트",
    "ex": "We can accommodate you.",
    "exKor": "우리는 당신을 수용할 수 있습니다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "중",
    "word": "Significant",
    "mean": "상당한",
    "pron": "시그니피컨트",
    "ex": "A significant change.",
    "exKor": "상당한 변화."
  },
  {
    "cat": "6. 토익 기출",
    "level": "중",
    "word": "Merchandise",
    "mean": "상품",
    "pron": "머천다이즈",
    "ex": "New merchandise arrived.",
    "exKor": "새로운 상품이 도착했다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "중",
    "word": "Inventory",
    "mean": "재고",
    "pron": "인벤토리",
    "ex": "Check the inventory.",
    "exKor": "재고를 확인하세요."
  },
  {
    "cat": "6. 토익 기출",
    "level": "중",
    "word": "Duration",
    "mean": "지속 기간",
    "pron": "듀레이션",
    "ex": "For the duration of stay.",
    "exKor": "머무는 기간 동안."
  },
  {
    "cat": "6. 토익 기출",
    "level": "하",
    "word": "Apply",
    "mean": "지원하다",
    "pron": "어플라이",
    "ex": "Apply for the position.",
    "exKor": "그 직책에 지원하세요."
  },
  {
    "cat": "6. 토익 기출",
    "level": "하",
    "word": "Deliver",
    "mean": "배달하다",
    "pron": "딜리버",
    "ex": "We deliver within an hour.",
    "exKor": "우리는 한 시간 내에 배달합니다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "하",
    "word": "Cancel",
    "mean": "취소하다",
    "pron": "캔슬",
    "ex": "The order was canceled.",
    "exKor": "그 주문은 취소되었다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "하",
    "word": "Hire",
    "mean": "고용하다",
    "pron": "하이어",
    "ex": "We plan to hire more staff.",
    "exKor": "우리는 더 많은 직원을 고용할 계획이다."
  },
  {
    "cat": "6. 토익 기출",
    "level": "하",
    "word": "Vacation",
    "mean": "휴가",
    "pron": "베이케이션",
    "ex": "Enjoy your vacation.",
    "exKor": "휴가를 즐기세요."
  }
];
async function importWords() {
    const mapped = words.map(w => ({
        word: w.word,
        meaning: w.mean,
        pronunciation: w.pron,
        category: w.cat,
        level: w.level,
        example: w.ex,
        example_kor: w.exKor
    }));
    const { error } = await supabase.from('words').insert(mapped);
    if (error) {
        console.error('Error:', error);
        if (error.code === '42P01') console.log('TABLE_MISSING');
    } else {
        console.log('SUCCESS');
    }
}
importWords();
