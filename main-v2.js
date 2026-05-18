
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
    else { lv = 5; title = '💎 콩글리시 마스터'; minXP = 101; maxXP = xp; }
    
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
        if (filtered.length === 0) {
            alert('학습할 수 있는 새로운 단어가 없습니다! (이미 모두 맞혔거나 이 카테고리에 단어가 없습니다)');
            document.body.style.cursor = 'default';
            return;
        }

        currentList = shuffle(filtered.map(w => ({
            cat: w.category, level: w.level, word: w.word, mean: w.meaning,
            pron: w.pronunciation, ex: w.example, exKor: w.example_kor
        })));

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
    if (event && cur.konglishCorrect) {
        document.getElementById('konglish-correct').innerText = cur.konglishCorrect;
        document.getElementById('konglish-message').innerText = cur.konglishMessage;
        event.classList.remove('show');
        void event.offsetWidth;
        event.classList.add('show');
        setTimeout(() => event.classList.remove('show'), 3600);
    }
}

function hideKonglishEvent() {
    const event = document.getElementById('konglish-event');
    if (event) event.classList.remove('show');
}

function answer(isC) {
    const cur = currentList[idx];
    if (!cur.isKonglish) {
        saveToDB({ word: cur.word, is_correct: isC, category: cur.cat || currentCat, level: cur.level || currentLevel });
    }
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
updateBackButton();
