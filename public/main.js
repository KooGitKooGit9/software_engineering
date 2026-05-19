
// Supabase Configuration
const SUPABASE_URL = 'https://uzzsfpnpqywstyumvigh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CtEf-6qhdSYAnBiXJDixXA_Rp1FCHcx';

let _supabase;

// Initialize Supabase after script load
window.addEventListener('load', () => {
    if (typeof supabase === 'undefined') {
        alert('Supabase 라이브러리가 로드되지 않았습니다. 인터넷 연결을 확인하세요.');
        return;
    }
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase Client Initialized');
    updateLevelDashboard();
});

// --- Level System ---
function openInfoModal() {
    document.getElementById('info-modal').classList.add('show');
}
function closeInfoModal(e) {
    if (e && e.target !== document.getElementById('info-modal') && !e.target.closest('.modal-close')) return;
    document.getElementById('info-modal').classList.remove('show');
}

let currentGlobalXP = 0;
let totalGlobalWords = 100;

async function updateLevelDashboard() {
    if (!_supabase) return;
    try {
        const { count: xpCount, error: xpError } = await _supabase
            .from('correct_history')
            .select('*', { count: 'exact', head: true });
        if (xpError) throw xpError;

        currentGlobalXP = (xpCount || 0) * 2;
        renderDashboardUI(currentGlobalXP);
    } catch (e) {
        console.error('Failed to update level dashboard:', e);
    }
}

function renderDashboardUI(xp) {
    let lv = 1, title = '🐥 병아리', minXP = 0, maxXP = 10;
    
    if (xp <= 10) { lv = 1; title = '🐥 병아리'; minXP = 0; maxXP = 10; }
    else if (xp <= 30) { lv = 2; title = '🏃 초보'; minXP = 11; maxXP = 30; }
    else if (xp <= 60) { lv = 3; title = '🔥 중수'; minXP = 31; maxXP = 60; }
    else if (xp <= 100) { lv = 4; title = '👑 실력자'; minXP = 61; maxXP = 100; }
    else { lv = 5; title = '💎 마스터'; minXP = 101; maxXP = xp; }
    
    const levelBadge = document.querySelector('.level-badge-large');
    const levelDesc = document.querySelector('.level-desc');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (levelBadge) levelBadge.innerText = `Lv. ${lv}`;
    if (levelDesc) levelDesc.innerText = title;
    
    if (progressFill && progressText) {
        if (lv === 5) {
            progressFill.style.width = '100%';
            progressText.innerText = `${xp} XP (마스터)`;
        } else {
            const currentTierXP = xp - minXP;
            const tierTotalXP = maxXP - minXP + 1;
            const percentage = Math.min(100, Math.max(0, (currentTierXP / tierTotalXP) * 100));
            progressFill.style.width = `${percentage}%`;
            progressText.innerText = `${xp} / ${maxXP + 1} XP`;
        }
    }
}

function showXPAnimation() {
    const wrap = document.querySelector('.progress-wrap');
    if (!wrap) return;
    const plusOne = document.createElement('span');
    plusOne.className = 'xp-plus-one';
    plusOne.innerText = '+2';
    wrap.appendChild(plusOne);
    setTimeout(() => plusOne.remove(), 1000);
}

let db = [];
let currentCat = '', currentLevel = '', currentList = [], wrongList = [], idx = 0, countC = 0, countW = 0;
let currentView = 'home-view';
const viewHistory = [];
const KONGLISH_WORDS = [
    {
        cat: '1. 수능 영단어',
        level: '상',
        word: 'Cunning',
        mean: '컨닝은 cheating이라고 해요.',
        pron: '커닝',
        ex: 'Cheating on a test is never acceptable.',
        exKor: '시험에서 부정행위를 하는 것은 절대 괜찮지 않아요.',
        isKonglish: true,
        konglishCorrect: 'cheating',
        konglishMessage: '한국어의 컨닝은 영어권에서 cheating이 자연스러운 표현이에요.'
    },
    {
        cat: '1. 수능 영단어',
        level: '중',
        word: 'Note',
        mean: '공책은 notebook이라고 해요.',
        pron: '노트',
        ex: 'I wrote the answer in my notebook.',
        exKor: '나는 공책에 답을 적었어요.',
        isKonglish: true,
        konglishCorrect: 'notebook',
        konglishMessage: 'note는 짧은 메모나 기록에 가깝고, 공책은 notebook이 더 정확해요.'
    },
    {
        cat: '1. 수능 영단어',
        level: '하',
        word: 'Sharp',
        mean: '샤프는 mechanical pencil이라고 해요.',
        pron: '샤프',
        ex: 'Can I borrow your mechanical pencil?',
        exKor: '네 샤프 좀 빌릴 수 있을까?',
        isKonglish: true,
        konglishCorrect: 'mechanical pencil',
        konglishMessage: 'sharp만 말하면 날카로운이라는 뜻으로 먼저 이해돼요.'
    },
    {
        cat: '2. 일상 회화',
        level: '상',
        word: 'One piece',
        mean: '원피스는 영어로 dress라고 해요.',
        pron: '원 피스',
        ex: 'She wore a dress to the party.',
        exKor: '그녀는 파티에 원피스를 입고 갔어요.',
        isKonglish: true,
        konglishCorrect: 'dress',
        konglishMessage: '한국식으로는 익숙하지만 영어권에서는 one-piece보다 dress가 자연스러워요.'
    },
    {
        cat: '2. 일상 회화',
        level: '중',
        word: 'Hand phone',
        mean: '휴대폰은 영어로 cell phone 또는 mobile phone이에요.',
        pron: '핸드 폰',
        ex: 'My cell phone battery is low.',
        exKor: '내 휴대폰 배터리가 부족해요.',
        isKonglish: true,
        konglishCorrect: 'cell phone',
        konglishMessage: 'hand phone이라고 하면 의미는 짐작할 수 있어도 실제 표현은 cell phone이 자연스러워요.'
    },
    {
        cat: '2. 일상 회화',
        level: '하',
        word: 'Fighting',
        mean: '응원할 때는 You can do it! 또는 Good luck!이라고 해요.',
        pron: '파이팅',
        ex: 'You can do it!',
        exKor: '넌 할 수 있어!',
        isKonglish: true,
        konglishCorrect: 'You can do it!',
        konglishMessage: 'fighting은 영어권에서 응원 구호로 잘 쓰이지 않아요.'
    },
    {
        cat: '3. 여행 필수',
        level: '상',
        word: 'Pension',
        mean: '여행 숙소 펜션은 cottage 또는 vacation rental이라고 해요.',
        pron: '펜션',
        ex: 'We stayed at a cottage near the beach.',
        exKor: '우리는 해변 근처 펜션에 머물렀어요.',
        isKonglish: true,
        konglishCorrect: 'cottage',
        konglishMessage: 'pension은 주로 연금이라는 뜻이라 숙소 의미로는 다르게 들릴 수 있어요.'
    },
    {
        cat: '3. 여행 필수',
        level: '중',
        word: 'Concent',
        mean: '콘센트는 outlet이라고 해요.',
        pron: '콘센트',
        ex: 'Is there an outlet near the bed?',
        exKor: '침대 근처에 콘센트가 있나요?',
        isKonglish: true,
        konglishCorrect: 'outlet',
        konglishMessage: '영어권에서는 plug socket이나 outlet이 자연스러워요.'
    },
    {
        cat: '3. 여행 필수',
        level: '하',
        word: 'Vinyl',
        mean: '비닐봉지는 plastic bag이라고 해요.',
        pron: '바이닐',
        ex: 'Can I have a plastic bag?',
        exKor: '비닐봉지 하나 받을 수 있을까요?',
        isKonglish: true,
        konglishCorrect: 'plastic bag',
        konglishMessage: 'vinyl은 소재 이름에 가깝고, 봉지는 plastic bag이라고 말해요.'
    },
    {
        cat: '4. 설레는 연애',
        level: '상',
        word: 'Skinship',
        mean: '스킨십은 physical affection이라고 해요.',
        pron: '스킨십',
        ex: 'They show physical affection naturally.',
        exKor: '그들은 자연스럽게 애정 표현을 해요.',
        isKonglish: true,
        konglishCorrect: 'physical affection',
        konglishMessage: 'skinship은 영어권에서 일반적으로 쓰는 표현은 아니에요.'
    },
    {
        cat: '4. 설레는 연애',
        level: '중',
        word: 'Meeting',
        mean: '소개팅은 blind date라고 해요.',
        pron: '미팅',
        ex: 'I went on a blind date last weekend.',
        exKor: '나는 지난 주말에 소개팅을 했어요.',
        isKonglish: true,
        konglishCorrect: 'blind date',
        konglishMessage: 'meeting은 회의나 만남 전체를 뜻하고, 소개팅은 blind date가 자연스러워요.'
    },
    {
        cat: '4. 설레는 연애',
        level: '하',
        word: 'Couple look',
        mean: '커플룩은 matching outfits라고 해요.',
        pron: '커플 룩',
        ex: 'They wore matching outfits.',
        exKor: '그들은 커플룩을 입었어요.',
        isKonglish: true,
        konglishCorrect: 'matching outfits',
        konglishMessage: 'couple look보다 matching outfits가 더 자연스럽게 들려요.'
    },
    {
        cat: '5. 비즈니스',
        level: '상',
        word: 'Claim',
        mean: '고객 클레임은 complaint라고 해요.',
        pron: '클레임',
        ex: 'We received a customer complaint.',
        exKor: '우리는 고객 불만을 접수했어요.',
        isKonglish: true,
        konglishCorrect: 'complaint',
        konglishMessage: 'claim은 주장이나 청구의 뜻이 강해서 고객 불만은 complaint가 맞아요.'
    },
    {
        cat: '5. 비즈니스',
        level: '중',
        word: 'A/S',
        mean: 'A/S는 after-sales service 또는 repair service라고 해요.',
        pron: '에이 에스',
        ex: 'Does this product include after-sales service?',
        exKor: '이 제품은 A/S가 포함되나요?',
        isKonglish: true,
        konglishCorrect: 'after-sales service',
        konglishMessage: 'A/S라는 줄임말은 영어권에서 바로 통하지 않을 수 있어요.'
    },
    {
        cat: '5. 비즈니스',
        level: '하',
        word: 'Name card',
        mean: '명함은 business card라고 해요.',
        pron: '네임 카드',
        ex: 'Can I have your business card?',
        exKor: '명함 한 장 받을 수 있을까요?',
        isKonglish: true,
        konglishCorrect: 'business card',
        konglishMessage: 'name card보다 business card가 실제 비즈니스 표현이에요.'
    },
    {
        cat: '6. 토익 기출',
        level: '상',
        word: 'Sign',
        mean: '서명은 signature라고 해요.',
        pron: '사인',
        ex: 'Please write your signature here.',
        exKor: '여기에 서명해 주세요.',
        isKonglish: true,
        konglishCorrect: 'signature',
        konglishMessage: 'sign은 동사로 서명하다 또는 표지판 의미가 강하고, 명사는 signature가 정확해요.'
    },
    {
        cat: '6. 토익 기출',
        level: '중',
        word: 'Part-time',
        mean: '아르바이트는 part-time job이라고 해요.',
        pron: '파트 타임',
        ex: 'I have a part-time job after school.',
        exKor: '나는 방과 후에 아르바이트를 해요.',
        isKonglish: true,
        konglishCorrect: 'part-time job',
        konglishMessage: 'part-time만으로는 형용사라 job을 붙여 말하는 편이 자연스러워요.'
    },
    {
        cat: '6. 토익 기출',
        level: '하',
        word: 'Schedule',
        mean: '스케줄이 많다는 말은 busy schedule이라고 해요.',
        pron: '스케줄',
        ex: 'I have a busy schedule today.',
        exKor: '나는 오늘 스케줄이 많아요.',
        isKonglish: true,
        konglishCorrect: 'busy schedule',
        konglishMessage: 'schedule 자체는 일정이라는 뜻이라 상황에 맞는 형용사를 함께 쓰면 자연스러워요.'
    }
];

function setActiveView(viewId, options = {}) {
    const { pushHistory = true } = options;
    if (pushHistory && currentView !== viewId) viewHistory.push(currentView);
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
        if (viewId === 'home-view') {
            appLayout.classList.add('show-dashboard');
            updateLevelDashboard();
        } else {
            appLayout.classList.remove('show-dashboard');
        }
    }
    
    currentView = viewId;
    
    updateBackButton();
}

function updateBackButton() {
    const btn = document.getElementById('back-button');
    if (btn) btn.classList.toggle('visible', viewHistory.length > 0);
}

function handleHeaderClick(e) { goHome(); }
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getKonglishWordsFor(level, masteredSet, existingWords) {
    const existingSet = new Set(existingWords.map(item => item.word.toLowerCase()));
    return KONGLISH_WORDS
        .filter(item => item.cat === currentCat)
        .filter(item => (level === '전체' || item.level === level))
        .filter(item => !masteredSet.has(item.word))
        .filter(item => !existingSet.has(item.word.toLowerCase()))
        .map(item => ({ ...item }));
}
function goHome() { viewHistory.length = 0; setActiveView('home-view', { pushHistory: false }); }
function goBack() {
    if (viewHistory.length === 0) return;
    setActiveView(viewHistory.pop(), { pushHistory: false });
}
function chooseLevel(cat) {
    currentCat = cat;
    document.getElementById('selected-cat-name').innerText = cat.replace(/^\d+\.\s*/, '');
    setActiveView('level-view');
}

async function startStudy(lv) {
    currentLevel = lv;
    if (!_supabase) {
        alert('데이터베이스가 아직 초기화되지 않았습니다. 잠시 후 다시 시도하세요.');
        return;
    }
    
    document.body.style.cursor = 'wait';
    try {
        // 1. Get mastered words
        const { data: masteredData, error: mErr } = await _supabase.from('correct_history').select('word');
        if (mErr) throw mErr;
        const masteredSet = new Set(masteredData.map(w => w.word));

        // 2. Fetch word pool
        let query = _supabase.from('words').select('*');
        if (currentCat) query = query.eq('category', currentCat);
        if (lv && lv !== '전체') query = query.eq('level', lv);
        
        const { data: allWords, error: wErr } = await query;
        if (wErr) throw wErr;

        // 3. Filter
        const filtered = allWords.filter(w => !masteredSet.has(w.word));
        const regularWords = filtered.map(w => ({
            cat: w.category, level: w.level, word: w.word, mean: w.meaning,
            pron: w.pronunciation, ex: w.example, exKor: w.example_kor,
            imageUrl: w.image_url
        }));
        const konglishWords = getKonglishWordsFor(lv, masteredSet, regularWords);
        if (regularWords.length + konglishWords.length === 0) {
            alert('학습할 수 있는 새로운 단어가 없습니다! (이미 모두 맞혔거나 이 카테고리에 단어가 없습니다)');
            document.body.style.cursor = 'default';
            return;
        }

        currentList = shuffle([...regularWords, ...konglishWords]);

        idx = 0; countC = 0; countW = 0; wrongList = [];
        updateStats();
        showWord();
        setActiveView('study-view');
    } catch (e) {
        console.error('Fetch error:', e);
        alert('데이터를 가져오는데 실패했습니다: ' + e.message);
    } finally {
        document.body.style.cursor = 'default';
    }
}

async function startFrequentWrongStudy() {
    currentLevel = '자주 틀린 단어';
    if (!_supabase) {
        alert('데이터베이스가 아직 초기화되지 않았습니다. 잠시 후 다시 시도하세요.');
        return;
    }

    document.body.style.cursor = 'wait';
    try {
        const { data: frequentRows, error: frequentError } = await _supabase
            .from('frequent_wrong_words')
            .select('word, wrong_count')
            .eq('category', currentCat)
            .order('wrong_count', { ascending: false });

        if (frequentError) throw frequentError;
        if (!frequentRows || frequentRows.length === 0) {
            alert('이 카테고리에는 아직 자주 틀린 단어가 없습니다.');
            return;
        }

        const frequentWords = frequentRows.map(row => row.word);
        const wrongCountByWord = new Map(frequentRows.map(row => [row.word, row.wrong_count]));
        const { data: allWords, error: wordsError } = await _supabase
            .from('words')
            .select('*')
            .eq('category', currentCat)
            .in('word', frequentWords);

        if (wordsError) throw wordsError;

        const wordByName = new Map((allWords || []).map(word => [word.word, word]));
        const reviewWords = frequentWords
            .map(word => wordByName.get(word))
            .filter(Boolean);

        if (reviewWords.length === 0) {
            alert('자주 틀린 단어의 상세 정보를 찾을 수 없습니다.');
            return;
        }

        currentList = reviewWords.map(w => ({
            cat: w.category,
            level: w.level,
            word: w.word,
            mean: w.meaning,
            pron: w.pronunciation,
            ex: w.example,
            exKor: w.example_kor,
            imageUrl: w.image_url,
            wrongCount: wrongCountByWord.get(w.word)
        }));

        idx = 0; countC = 0; countW = 0; wrongList = [];
        updateStats();
        showWord();
        setActiveView('study-view');
    } catch (e) {
        console.error('Frequent wrong words fetch error:', e);
        alert('자주 틀린 단어를 가져오는데 실패했습니다: ' + e.message);
    } finally {
        document.body.style.cursor = 'default';
    }
}

function showWord() {
    if(idx >= currentList.length) { showResult(); return; }
    const cur = currentList[idx];
    document.getElementById('q-word').innerText = cur.word;
    document.getElementById('a-word').innerText = cur.word;
    document.getElementById('a-pron').innerText = `[${cur.pron}]`;
    document.getElementById('a-meaning').innerText = cur.mean;
    document.getElementById('a-ex').innerText = cur.ex;
    document.getElementById('a-ex-kor').innerText = cur.exKor;
    
    const imgContainer = document.getElementById('card-image-container');
    const imgEl = document.getElementById('card-image');
    if (cur.imageUrl) {
        imgEl.src = cur.imageUrl;
        imgContainer.style.display = 'flex';
    } else {
        imgContainer.style.display = 'none';
        imgEl.src = '';
    }

    document.getElementById('flashcard').classList.remove('flipped', 'konglish-revealed');
    hideKonglishEvent();
}

function handleCardFlip() {
    const card = document.getElementById('flashcard');
    const isOpening = !card.classList.contains('flipped');
    card.classList.toggle('flipped');
    if (isOpening) triggerKonglishEvent();
}

function triggerKonglishEvent() {
    const cur = currentList[idx];
    if (!cur || !cur.isKonglish || cur.konglishRevealed) return;
    cur.konglishRevealed = true;

    document.getElementById('flashcard').classList.add('konglish-revealed');
    const event = document.getElementById('konglish-event');
    document.getElementById('konglish-correct').innerText = cur.konglishCorrect;
    document.getElementById('konglish-message').innerText = cur.konglishMessage;
    event.classList.remove('show');
    void event.offsetWidth;
    event.classList.add('show');
    setTimeout(() => event.classList.remove('show'), 3600);
}

function hideKonglishEvent() {
    const event = document.getElementById('konglish-event');
    if (event) event.classList.remove('show');
}

function answer(isC) {
    const cur = currentList[idx];
    saveToDB({ word: cur.word, is_correct: isC, category: cur.cat || currentCat, level: cur.level || currentLevel });
    if(isC) {
        countC++; triggerFeedback('success'); updateStats('correct');
        // Instantly update XP visually
        currentGlobalXP += 2;
        renderDashboardUI(currentGlobalXP);
        showXPAnimation();
    } else {
        countW++; wrongList.push(cur); triggerFeedback('danger'); updateStats('wrong');
    }
    setTimeout(() => { idx++; showWord(); }, 300);
}

async function saveToDB(data) {
    if (!_supabase) return;
    const table = data.is_correct ? 'correct_history' : 'wrong_history';
    
    try {
        const { error } = await _supabase.from(table).insert([{
            word: data.word, category: data.category, level: data.level
        }]);
        
        if (error) {
            console.error('Save error details:', error);
            alert('DB 저장 실패: ' + error.message);
        } else {
            console.log(`Saved to ${table}: ${data.word}`);
            if (!data.is_correct) await saveFrequentWrongWord(data);
        }
    } catch (err) {
        console.error('Network/Runtime error during save:', err);
        alert('네트워크 오류로 저장이 되지 않았습니다.');
    }
}

async function saveFrequentWrongWord(data) {
    const { count, error: countError } = await _supabase
        .from('wrong_history')
        .select('*', { count: 'exact', head: true })
        .eq('word', data.word);

    if (countError) {
        console.error('Failed to count wrong word:', countError);
        return;
    }

    if ((count || 0) < 3) return;

    const frequentWrongWord = {
        word: data.word,
        category: data.category,
        level: data.level,
        wrong_count: count
    };

    const { data: existingRows, error: selectError } = await _supabase
        .from('frequent_wrong_words')
        .select('id')
        .eq('word', data.word)
        .limit(1);

    if (selectError) {
        console.error('Failed to check frequent wrong word:', selectError);
        return;
    }

    const existingId = existingRows && existingRows[0] && existingRows[0].id;
    const request = existingId
        ? _supabase.from('frequent_wrong_words').update(frequentWrongWord).eq('id', existingId)
        : _supabase.from('frequent_wrong_words').insert([frequentWrongWord]);

    const { error } = await request;
    if (error) console.error('Failed to save frequent wrong word:', error);
}

function triggerFeedback(type) {
    const container = document.querySelector('.container');
    const color = type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
    container.style.boxShadow = `0 0 40px ${color}, var(--shadow-lg)`;
    setTimeout(() => { container.style.boxShadow = ''; }, 300);
}

function updateStats(type) {
    document.getElementById('s-correct').innerText = countC;
    document.getElementById('s-wrong').innerText = countW;
}

function showResult() {
    setActiveView('result-view', { pushHistory: false });
    const score = Math.round((countC / currentList.length) * 100);
    document.getElementById('result-score').innerText = score + '%';
    document.getElementById('result-text').innerText = `총 ${currentList.length}개 단어 중 ${countC}개를 맞히셨어요!`;
    document.getElementById('retry-wrong-btn').style.display = wrongList.length > 0 ? 'block' : 'none';
}

function retryWrong() {
    currentList = shuffle([...wrongList]);
    idx = 0; countC = 0; countW = 0; wrongList = [];
    updateStats(); showWord(); setActiveView('study-view');
}

function speak(e, id) {
    e.stopPropagation();
    const text = document.getElementById(id).innerText;
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'en-US';
    window.speechSynthesis.speak(ut);
}

// ==========================================
// 🧩 배운 단어로 문장 만들기 (Sentence Builder)
// ==========================================
let sentenceList = [];
let currentSentenceIdx = 0;
let currentSentenceObj = null;
let currentSentenceWords = [];
let sentencePoolWords = [];
let sentenceSelectedWords = [];
let dbWordsPool = [];

async function startSentenceBuilder() {
    if (!_supabase) {
        alert('데이터베이스가 아직 초기화되지 않았습니다. 잠시 후 다시 시도하세요.');
        return;
    }
    
    document.body.style.cursor = 'wait';
    try {
        // Fetch all database words for decoys
        const { data: allDbWords } = await _supabase.from('words').select('word');
        let localWords = [];
        if (typeof KONGLISH_WORDS !== 'undefined') {
            localWords = KONGLISH_WORDS.map(k => k.word);
        }
        dbWordsPool = [...new Set([...(allDbWords || []).map(w => w.word), ...localWords])];

        // 1. Fetch mastered words from correct_history
        const { data: masteredData, error: mErr } = await _supabase
            .from('correct_history')
            .select('word');
            
        if (mErr) throw mErr;
        
        let wordsToFetch = (masteredData || []).map(w => w.word);
        let fetchedSentences = [];
        
        // 2. If there are mastered words, fetch matching example sentences
        if (wordsToFetch.length > 0) {
            const { data: wordsData, error: wErr } = await _supabase
                .from('words')
                .select('*')
                .in('word', wordsToFetch);
                
            if (wErr) throw wErr;
            
            if (wordsData) {
                wordsData.forEach(w => {
                    if (w.example && w.example_kor) {
                        fetchedSentences.push({
                            word: w.word,
                            ex: w.example,
                            exKor: w.example_kor,
                            cat: w.category,
                            level: w.level
                        });
                    }
                });
            }
            
            if (typeof KONGLISH_WORDS !== 'undefined') {
                KONGLISH_WORDS.forEach(k => {
                    if (wordsToFetch.includes(k.word) && k.ex && k.exKor) {
                        fetchedSentences.push({
                            word: k.word,
                            ex: k.ex,
                            exKor: k.exKor,
                            cat: k.cat,
                            level: k.level
                        });
                    }
                });
            }
        }
        
        // 3. Fallback: if user learned < 3 sentences, load random ones to enable playing
        if (fetchedSentences.length < 3) {
            console.log("Fallback mode active: loading random sentences");
            const { data: fallbackWords, error: fErr } = await _supabase
                .from('words')
                .select('*')
                .limit(40);
                
            if (fErr) throw fErr;
            
            if (fallbackWords) {
                fallbackWords.forEach(w => {
                    if (w.example && w.example_kor) {
                        fetchedSentences.push({
                            word: w.word,
                            ex: w.example,
                            exKor: w.example_kor,
                            cat: w.category,
                            level: w.level
                        });
                    }
                });
            }
            
            if (typeof KONGLISH_WORDS !== 'undefined') {
                KONGLISH_WORDS.forEach(k => {
                    if (k.ex && k.exKor) {
                        fetchedSentences.push({
                            word: k.word,
                            ex: k.ex,
                            exKor: k.exKor,
                            cat: k.cat,
                            level: k.level
                        });
                    }
                });
            }
        }
        
        // Deduplicate sentences by the exact example
        const seen = new Set();
        sentenceList = fetchedSentences.filter(s => {
            const cleanEx = s.ex.trim().toLowerCase();
            if (seen.has(cleanEx)) return false;
            seen.add(cleanEx);
            return true;
        });
        
        if (sentenceList.length === 0) {
            alert('가져올 수 있는 문장 예문이 없습니다. 단어 학습을 먼저 완료해주세요!');
            return;
        }
        
        // Shuffle and initialize
        shuffle(sentenceList);
        currentSentenceIdx = 0;
        
        setActiveView('sentence-view');
        loadNextSentence();
        
    } catch (e) {
        console.error('Sentence Builder Start Error:', e);
        alert('데이터 로드 중 오류가 발생했습니다: ' + e.message);
    } finally {
        document.body.style.cursor = 'default';
    }
}

function loadNextSentence() {
    if (currentSentenceIdx >= sentenceList.length) {
        alert('🎉 모든 문장 카드를 완료하셨습니다! 처음부터 다시 셔플하여 재생합니다.');
        shuffle(sentenceList);
        currentSentenceIdx = 0;
    }
    
    currentSentenceObj = sentenceList[currentSentenceIdx];
    sentenceSelectedWords = [];
    
    // Set target meaning
    document.getElementById('sentence-meaning').innerText = currentSentenceObj.exKor;
    
    // Split into clean words
    let cleanSentence = currentSentenceObj.ex.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ").trim();
    currentSentenceWords = cleanSentence.split(" ");
    
    // Decoys
    const decoys = ["He", "She", "I", "are", "is", "am", "in", "on", "bus", "the", "we", "take", "make", "that", "you", "go", "for", "with", "have", "they", "to", "at", "my", "your"];
    let selectedDecoys = [];
    let shuffledDecoys = shuffle([...decoys]);
    
    // 1. General decoys (4 of them)
    for (let i = 0; i < shuffledDecoys.length; i++) {
        const d = shuffledDecoys[i];
        if (!currentSentenceWords.some(w => w.toLowerCase() === d.toLowerCase())) {
            selectedDecoys.push(d);
            if (selectedDecoys.length >= 4) break;
        }
    }
    
    // 2. Similar-length decoys from database (3 of them)
    const keyWord = currentSentenceObj.word || "";
    const keyLen = keyWord.length;
    let similarCandidates = [];
    
    if (typeof dbWordsPool !== 'undefined' && dbWordsPool.length > 0) {
        similarCandidates = dbWordsPool.filter(w => {
            const lowerW = w.toLowerCase();
            const inSentence = currentSentenceWords.some(sw => sw.toLowerCase() === lowerW);
            const inDecoys = selectedDecoys.some(sd => sd.toLowerCase() === lowerW);
            return lowerW !== keyWord.toLowerCase() && !inSentence && !inDecoys;
        });
    }
    
    if (similarCandidates.length > 0) {
        similarCandidates.sort((a, b) => Math.abs(a.length - keyLen) - Math.abs(b.length - keyLen));
        const addedDecoys = similarCandidates.slice(0, 3);
        selectedDecoys = [...selectedDecoys, ...addedDecoys];
    } else {
        // Fallback: 3 more general decoys
        for (let i = 0; i < shuffledDecoys.length; i++) {
            const d = shuffledDecoys[i];
            const lowerD = d.toLowerCase();
            const inSentence = currentSentenceWords.some(sw => sw.toLowerCase() === lowerD);
            const inDecoys = selectedDecoys.some(sd => sd.toLowerCase() === lowerD);
            if (!inSentence && !inDecoys) {
                selectedDecoys.push(d);
                if (selectedDecoys.length >= 7) break;
            }
        }
    }
    
    // Combined and Shuffled pool
    let combined = [
        ...currentSentenceWords.map(w => ({ word: w, isDecoy: false })),
        ...selectedDecoys.map(w => ({ word: w, isDecoy: true }))
    ];
    sentencePoolWords = combined.map((item, index) => ({
        word: item.word,
        isDecoy: item.isDecoy,
        id: index,
        selected: false
    }));
    
    shuffle(sentencePoolWords);
    renderSentenceBuilder();
}

function renderSentenceBuilder() {
    const slotsEl = document.getElementById('sentence-slots');
    const poolEl = document.getElementById('sentence-pool');
    
    slotsEl.innerHTML = '';
    poolEl.innerHTML = '';
    
    // Slots
    if (sentenceSelectedWords.length === 0) {
        slotsEl.classList.remove('active');
        slotsEl.innerHTML = `<span style="color: var(--text-color-muted, #718096); width: 100%; text-align: center; font-size: 0.9rem; font-weight: 600;">낱말 카드를 터치하여 문장을 완성해 보세요!</span>`;
    } else {
        slotsEl.classList.add('active');
        sentenceSelectedWords.forEach((sel, index) => {
            const chip = document.createElement('div');
            chip.className = 'word-chip';
            chip.innerText = sel.word;
            chip.onclick = () => removeWordFromSlots(index);
            slotsEl.appendChild(chip);
        });
    }
    
    // Pool
    sentencePoolWords.forEach((item) => {
        const chip = document.createElement('div');
        chip.className = 'word-chip';
        chip.innerText = item.word;
        if (item.selected) {
            chip.classList.add('selected-hidden');
        } else {
            chip.onclick = () => addWordToSlots(item.id);
        }
        poolEl.appendChild(chip);
    });
    
    // 5줄 오버플로우 방지 (데코이 제거)
    if (sentenceSelectedWords.length === 0) {
        let maxLoops = 3;
        while (poolEl.scrollHeight > 190 && maxLoops > 0) {
            const decoyIndex = sentencePoolWords.findIndex(p => p.isDecoy);
            if (decoyIndex !== -1) {
                sentencePoolWords.splice(decoyIndex, 1);
                
                // 다시 렌더링
                poolEl.innerHTML = '';
                sentencePoolWords.forEach((item) => {
                    const chip = document.createElement('div');
                    chip.className = 'word-chip';
                    chip.innerText = item.word;
                    if (item.selected) chip.classList.add('selected-hidden');
                    else chip.onclick = () => addWordToSlots(item.id);
                    poolEl.appendChild(chip);
                });
            } else {
                break;
            }
            maxLoops--;
        }
    }
}

function addWordToSlots(poolId) {
    const item = sentencePoolWords.find(p => p.id === poolId);
    if (!item || item.selected) return;
    
    item.selected = true;
    sentenceSelectedWords.push({
        word: item.word,
        poolId: poolId
    });
    
    renderSentenceBuilder();
}

function removeWordFromSlots(slotIndex) {
    const removed = sentenceSelectedWords.splice(slotIndex, 1)[0];
    if (removed) {
        const item = sentencePoolWords.find(p => p.id === removed.poolId);
        if (item) item.selected = false;
    }
    
    renderSentenceBuilder();
}

function clearSentenceSlots() {
    sentenceSelectedWords = [];
    sentencePoolWords.forEach(p => p.selected = false);
    renderSentenceBuilder();
}

function showCustomPopup(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    // 이전에 떠 있던 팝업들 즉시 제거
    container.innerHTML = '';
    
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    void toast.offsetWidth;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
    }, 2500);
}

function showSentenceHint() {
    if (!currentSentenceObj) return;
    showCustomPopup(`💡 힌트: ${currentSentenceObj.word}`, 'info');
}

async function submitSentence() {
    if (sentenceSelectedWords.length === 0) {
        showCustomPopup('낱말 카드를 탭하여 문장을 먼저 구성해 주세요!', 'error');
        return;
    }
    
    const userBuilt = sentenceSelectedWords.map(s => s.word).join(" ");
    
    const cleanUser = userBuilt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const cleanTarget = currentSentenceObj.ex.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    
    if (cleanUser === cleanTarget) {
        triggerFeedback('success');
        
        // Save correct attempt to database for persistence and stats
        if (_supabase) {
            saveToDB({
                word: currentSentenceObj.word,
                is_correct: true,
                category: currentSentenceObj.cat || '문장 만들기',
                level: currentSentenceObj.level || '중'
            });
        }
        
        currentGlobalXP += 2;
        renderDashboardUI(currentGlobalXP);
        showXPAnimation();
        
        showCustomPopup('🎉 완벽합니다! 정답입니다. (+2 XP 획득)', 'success');
        
        currentSentenceIdx++;
        loadNextSentence();
    } else {
        triggerFeedback('danger');
        showCustomPopup(`❌ 틀렸습니다! 다시 한 번 생각해보세요.`, 'error');
    }
}

updateBackButton();

