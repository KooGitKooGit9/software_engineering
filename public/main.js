
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
});

let db = [];
let currentCat = '', currentLevel = '', currentList = [], wrongList = [], idx = 0, countC = 0, countW = 0;
let currentView = 'home-view';
const viewHistory = [];

function setActiveView(viewId, options = {}) {
    const { pushHistory = true } = options;
    if (pushHistory && currentView !== viewId) viewHistory.push(currentView);
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
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

function showWord() {
    if(idx >= currentList.length) { showResult(); return; }
    const cur = currentList[idx];
    document.getElementById('q-word').innerText = cur.word;
    document.getElementById('a-word').innerText = cur.word;
    document.getElementById('a-pron').innerText = `[${cur.pron}]`;
    document.getElementById('a-meaning').innerText = cur.mean;
    document.getElementById('a-ex').innerText = cur.ex;
    document.getElementById('a-ex-kor').innerText = cur.exKor;
    document.getElementById('flashcard').classList.remove('flipped');
}

function answer(isC) {
    const cur = currentList[idx];
    saveToDB({ word: cur.word, is_correct: isC, category: currentCat, level: currentLevel });
    if(isC) {
        countC++; triggerFeedback('success'); updateStats('correct');
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
