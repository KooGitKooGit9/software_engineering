import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HomeView from './components/views/HomeView';
import LevelView from './components/views/LevelView';
import StudyView from './components/views/StudyView';
import ResultView from './components/views/ResultView';
import SentenceView from './components/views/SentenceView';
import DevFeedback from './components/DevFeedback';
import { supabase } from './lib/supabaseClient';
import { KONGLISH_WORDS } from './data/konglish';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [currentView, setCurrentView] = useState('home-view');
  const [viewHistory, setViewHistory] = useState([]);
  const [globalXP, setGlobalXP] = useState(0);

  // Study states
  const [currentCat, setCurrentCat] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentList, setCurrentList] = useState([]);
  const [wrongList, setWrongList] = useState([]);
  const [studyIdx, setStudyIdx] = useState(0);
  const [countC, setCountC] = useState(0);
  const [countW, setCountW] = useState(0);

  // Sentence builder states
  const [sentenceList, setSentenceList] = useState([]);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [currentSentenceObj, setCurrentSentenceObj] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [poolWords, setPoolWords] = useState([]);
  const [dbWordsPool, setDbWordsPool] = useState([]);

  // Toast ref for custom popups
  const toastContainerRef = useRef(null);

  // 1. Initial Load: Get XP
  useEffect(() => {
    updateLevelDashboard();
  }, []);

  const updateLevelDashboard = async () => {
    try {
      const { count, error } = await supabase
        .from('correct_history')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      setGlobalXP((count || 0) * 2);
    } catch (e) {
      console.error('Failed to update level dashboard:', e);
    }
  };

  const showCustomPopup = (message, type = 'info') => {
    if (!toastContainerRef.current) return;
    const container = toastContainerRef.current;
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
  };

  const showXPAnimation = () => {
    const wrap = document.querySelector('.progress-wrap');
    if (!wrap) return;
    const plusOne = document.createElement('span');
    plusOne.className = 'xp-plus-one';
    plusOne.innerText = '+2';
    wrap.appendChild(plusOne);
    setTimeout(() => plusOne.remove(), 1000);
  };

  const triggerFeedback = (type) => {
    const container = document.getElementById('main-container');
    if (!container) return;
    const color = type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
    container.style.boxShadow = `0 0 40px ${color}, var(--shadow-lg)`;
    setTimeout(() => { container.style.boxShadow = ''; }, 300);
  };

  // --- Navigation ---
  const goHome = () => {
    setViewHistory([]);
    setCurrentView('home-view');
    updateLevelDashboard();
  };

  const goBack = () => {
    if (viewHistory.length === 0) return;
    const prev = viewHistory[viewHistory.length - 1];
    setViewHistory(prevHistory => prevHistory.slice(0, -1));
    setCurrentView(prev);
  };

  const navigateTo = (viewId) => {
    if (currentView !== viewId) {
      setViewHistory(prev => [...prev, currentView]);
      setCurrentView(viewId);
    }
  };

  // --- DB Helpers ---
  const saveToDB = async (data) => {
    const table = data.is_correct ? 'correct_history' : 'wrong_history';
    try {
      const { error } = await supabase.from(table).insert([{
        word: data.word, category: data.category, level: data.level
      }]);
      if (error) console.error('Save error details:', error);
      else {
        if (!data.is_correct) await saveFrequentWrongWord(data);
      }
    } catch (err) {
      console.error('Network/Runtime error during save:', err);
    }
  };

  const saveFrequentWrongWord = async (data) => {
    const { count, error: countError } = await supabase
      .from('wrong_history')
      .select('*', { count: 'exact', head: true })
      .eq('word', data.word);
    if (countError || (count || 0) < 3) return;

    const frequentWrongWord = {
      word: data.word, category: data.category, level: data.level, wrong_count: count
    };

    const { data: existingRows } = await supabase
      .from('frequent_wrong_words')
      .select('id')
      .eq('word', data.word)
      .limit(1);

    const existingId = existingRows && existingRows[0] && existingRows[0].id;
    if (existingId) {
      await supabase.from('frequent_wrong_words').update(frequentWrongWord).eq('id', existingId);
    } else {
      await supabase.from('frequent_wrong_words').insert([frequentWrongWord]);
    }
  };

  // --- Study Handlers ---
  const handleSelectCategory = (cat) => {
    setCurrentCat(cat);
    navigateTo('level-view');
  };

  const getKonglishWordsFor = (level, masteredSet, existingWords) => {
    const existingSet = new Set(existingWords.map(item => item.word.toLowerCase()));
    return KONGLISH_WORDS
      .filter(item => item.cat === currentCat)
      .filter(item => (level === '전체' || item.level === level))
      .filter(item => !masteredSet.has(item.word))
      .filter(item => !existingSet.has(item.word.toLowerCase()))
      .map(item => ({ ...item }));
  };

  const handleStartStudy = async (lv) => {
    setCurrentLevel(lv);
    document.body.style.cursor = 'wait';
    try {
      const { data: masteredData, error: mErr } = await supabase.from('correct_history').select('word');
      if (mErr) throw mErr;
      const masteredSet = new Set((masteredData || []).map(w => w.word));

      let query = supabase.from('words').select('*');
      if (currentCat) query = query.eq('category', currentCat);
      if (lv && lv !== '전체') query = query.eq('level', lv);
      
      const { data: allWords, error: wErr } = await query;
      if (wErr) throw wErr;

      const filtered = (allWords || []).filter(w => !masteredSet.has(w.word));
      const regularWords = filtered.map(w => ({
        cat: w.category, level: w.level, word: w.word, mean: w.meaning,
        pron: w.pronunciation, ex: w.example, exKor: w.example_kor, imageUrl: w.image_url
      }));

      const konglishWords = getKonglishWordsFor(lv, masteredSet, regularWords);
      if (regularWords.length + konglishWords.length === 0) {
        alert('학습할 수 있는 새로운 단어가 없습니다! (이미 모두 맞혔거나 이 카테고리에 단어가 없습니다)');
        return;
      }

      setCurrentList(shuffle([...regularWords, ...konglishWords]));
      setStudyIdx(0); setCountC(0); setCountW(0); setWrongList([]);
      navigateTo('study-view');
    } catch (e) {
      console.error('Fetch error:', e);
      alert('데이터를 가져오는데 실패했습니다: ' + e.message);
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const handleFrequentReview = async () => {
    setCurrentLevel('자주 틀린 단어');
    document.body.style.cursor = 'wait';
    try {
      const { data: frequentRows, error: frequentError } = await supabase
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
      
      const { data: allWords, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .eq('category', currentCat)
        .in('word', frequentWords);

      if (wordsError) throw wordsError;

      const wordByName = new Map((allWords || []).map(word => [word.word, word]));
      const reviewWords = frequentWords.map(word => wordByName.get(word)).filter(Boolean);

      if (reviewWords.length === 0) {
        alert('자주 틀린 단어의 상세 정보를 찾을 수 없습니다.');
        return;
      }

      const mapped = reviewWords.map(w => ({
        cat: w.category, level: w.level, word: w.word, mean: w.meaning,
        pron: w.pronunciation, ex: w.example, exKor: w.example_kor, imageUrl: w.image_url,
        wrongCount: wrongCountByWord.get(w.word)
      }));

      setCurrentList(mapped);
      setStudyIdx(0); setCountC(0); setCountW(0); setWrongList([]);
      navigateTo('study-view');
    } catch (e) {
      console.error('Frequent wrong words fetch error:', e);
      alert('자주 틀린 단어를 가져오는데 실패했습니다: ' + e.message);
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const handleAnswer = (isCorrect) => {
    const cur = currentList[studyIdx];
    saveToDB({ word: cur.word, is_correct: isCorrect, category: cur.cat || currentCat, level: cur.level || currentLevel });
    
    if (isCorrect) {
      setCountC(prev => prev + 1);
      triggerFeedback('success');
      setGlobalXP(prev => {
        const next = prev + 2;
        return next;
      });
      showXPAnimation();
    } else {
      setCountW(prev => prev + 1);
      setWrongList(prev => [...prev, cur]);
      triggerFeedback('danger');
    }

    setTimeout(() => {
      if (studyIdx + 1 >= currentList.length) {
        navigateTo('result-view');
      } else {
        setStudyIdx(prev => prev + 1);
      }
    }, 300);
  };

  const handleRetryWrong = () => {
    setCurrentList(shuffle([...wrongList]));
    setStudyIdx(0); setCountC(0); setCountW(0); setWrongList([]);
    navigateTo('study-view');
  };

  // --- Sentence Builder Handlers ---
  const setupSentencePool = (sentenceObj, sentenceWords, globalPool) => {
    const decoys = ["He", "She", "I", "are", "is", "am", "in", "on", "bus", "the", "we", "take", "make", "that", "you", "go", "for", "with", "have", "they", "to", "at", "my", "your"];
    let selectedDecoys = [];
    let shuffledDecoys = shuffle([...decoys]);
    
    for (let i = 0; i < shuffledDecoys.length; i++) {
      const d = shuffledDecoys[i];
      if (!sentenceWords.some(w => w.toLowerCase() === d.toLowerCase())) {
        selectedDecoys.push(d);
        if (selectedDecoys.length >= 4) break;
      }
    }
    
    const keyWord = sentenceObj.word || "";
    const keyLen = keyWord.length;
    let similarCandidates = [];
    
    if (globalPool && globalPool.length > 0) {
      similarCandidates = globalPool.filter(w => {
        const lowerW = w.toLowerCase();
        const inSentence = sentenceWords.some(sw => sw.toLowerCase() === lowerW);
        const inDecoys = selectedDecoys.some(sd => sd.toLowerCase() === lowerW);
        return lowerW !== keyWord.toLowerCase() && !inSentence && !inDecoys;
      });
    }
    
    if (similarCandidates.length > 0) {
      similarCandidates.sort((a, b) => Math.abs(a.length - keyLen) - Math.abs(b.length - keyLen));
      const addedDecoys = similarCandidates.slice(0, 3);
      selectedDecoys = [...selectedDecoys, ...addedDecoys];
    } else {
      for (let i = 0; i < shuffledDecoys.length; i++) {
        const d = shuffledDecoys[i];
        const lowerD = d.toLowerCase();
        const inSentence = sentenceWords.some(sw => sw.toLowerCase() === lowerD);
        const inDecoys = selectedDecoys.some(sd => sd.toLowerCase() === lowerD);
        if (!inSentence && !inDecoys) {
          selectedDecoys.push(d);
          if (selectedDecoys.length >= 7) break;
        }
      }
    }
    
    let combined = [
      ...sentenceWords.map(w => ({ word: w, isDecoy: false })),
      ...selectedDecoys.map(w => ({ word: w, isDecoy: true }))
    ];
    let pool = combined.map((item, index) => ({
      word: item.word, isDecoy: item.isDecoy, id: index, used: false, hinted: false
    }));
    
    // Simplistic handling of over-long pool (reducing decoys if too many words)
    // Actually, handling visually via CSS wrap is better in React.
    
    setPoolWords(shuffle(pool));
    setSelectedWords([]);
  };

  const loadNextSentence = (idx, sentences, gPool) => {
    let nextIdx = idx;
    let sList = sentences;
    if (nextIdx >= sentences.length) {
      alert('🎉 모든 문장 카드를 완료하셨습니다! 처음부터 다시 셔플하여 재생합니다.');
      sList = shuffle([...sentences]);
      setSentenceList(sList);
      nextIdx = 0;
    }
    const current = sList[nextIdx];
    setCurrentSentenceIdx(nextIdx);
    setCurrentSentenceObj(current);
    
    let cleanSentence = current.ex.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ").trim();
    const words = cleanSentence.split(" ");
    
    setupSentencePool(current, words, gPool);
  };

  const handleStartSentenceBuilder = async () => {
    document.body.style.cursor = 'wait';
    try {
      const { data: allDbWords } = await supabase.from('words').select('word');
      const gPool = [...new Set([...(allDbWords || []).map(w => w.word), ...KONGLISH_WORDS.map(k => k.word)])];
      setDbWordsPool(gPool);

      const { data: masteredData, error: mErr } = await supabase.from('correct_history').select('word');
      if (mErr) throw mErr;
      
      let wordsToFetch = (masteredData || []).map(w => w.word);
      let fetchedSentences = [];
      
      if (wordsToFetch.length > 0) {
        const { data: wordsData, error: wErr } = await supabase.from('words').select('*').in('word', wordsToFetch);
        if (wErr) throw wErr;
        
        (wordsData || []).forEach(w => {
          if (w.example && w.example_kor) {
            fetchedSentences.push({ word: w.word, ex: w.example, exKor: w.example_kor, cat: w.category, level: w.level });
          }
        });
        
        KONGLISH_WORDS.forEach(k => {
          if (wordsToFetch.includes(k.word) && k.ex && k.exKor) {
            fetchedSentences.push({ word: k.word, ex: k.ex, exKor: k.exKor, cat: k.cat, level: k.level });
          }
        });
      }
      
      if (fetchedSentences.length < 3) {
        const { data: fallbackWords } = await supabase.from('words').select('*').limit(40);
        (fallbackWords || []).forEach(w => {
          if (w.example && w.example_kor) {
            fetchedSentences.push({ word: w.word, ex: w.example, exKor: w.example_kor, cat: w.category, level: w.level });
          }
        });
        KONGLISH_WORDS.forEach(k => {
          if (k.ex && k.exKor) {
            fetchedSentences.push({ word: k.word, ex: k.ex, exKor: k.exKor, cat: k.cat, level: k.level });
          }
        });
      }
      
      const seen = new Set();
      let uniqueSentences = fetchedSentences.filter(s => {
        const cleanEx = s.ex.trim().toLowerCase();
        if (seen.has(cleanEx)) return false;
        seen.add(cleanEx);
        return true;
      });
      
      if (uniqueSentences.length === 0) {
        alert('가져올 수 있는 문장 예문이 없습니다. 단어 학습을 먼저 완료해주세요!');
        return;
      }
      
      uniqueSentences = shuffle(uniqueSentences);
      setSentenceList(uniqueSentences);
      loadNextSentence(0, uniqueSentences, gPool);
      navigateTo('sentence-view');
    } catch (e) {
      console.error('Sentence Builder Start Error:', e);
      alert('데이터 로드 중 오류가 발생했습니다: ' + e.message);
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const handleSelectWord = (idx, wordObj) => {
    setSelectedWords(prev => [...prev, wordObj]);
    setPoolWords(prev => {
      const next = [...prev];
      next[idx].used = true;
      return next;
    });
  };

  const handleDeselectWord = (slotIdx, wordObj) => {
    setSelectedWords(prev => {
      const next = [...prev];
      next.splice(slotIdx, 1);
      return next;
    });
    setPoolWords(prev => {
      const next = [...prev];
      const poolIdx = next.findIndex(p => p.id === wordObj.id);
      if (poolIdx !== -1) next[poolIdx].used = false;
      return next;
    });
  };

  const handleClearSlots = () => {
    setSelectedWords([]);
    setPoolWords(prev => prev.map(p => ({ ...p, used: false })));
  };

  const handleShowHint = () => {
    if (!currentSentenceObj) return;
    showCustomPopup(`💡 힌트: ${currentSentenceObj.word}`, 'info');
  };

  const handleSubmitSentence = async () => {
    if (selectedWords.length === 0) {
      showCustomPopup('낱말 카드를 탭하여 문장을 먼저 구성해 주세요!', 'error');
      return;
    }
    
    const userBuilt = selectedWords.map(s => s.word).join(" ");
    const cleanUser = userBuilt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const cleanTarget = currentSentenceObj.ex.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    
    if (cleanUser === cleanTarget) {
      triggerFeedback('success');
      saveToDB({
        word: currentSentenceObj.word,
        is_correct: true,
        category: currentSentenceObj.cat || '문장 만들기',
        level: currentSentenceObj.level || '중'
      });
      setGlobalXP(prev => prev + 2);
      showXPAnimation();
      showCustomPopup('🎉 완벽합니다! 정답입니다. (+2 XP 획득)', 'success');
      
      setTimeout(() => {
        loadNextSentence(currentSentenceIdx + 1, sentenceList, dbWordsPool);
      }, 1000);
    } else {
      triggerFeedback('danger');
      showCustomPopup(`❌ 틀렸습니다! 다시 한 번 생각해보세요.`, 'error');
    }
  };

  return (
    <>
      <div className={`app-layout ${currentView === 'home-view' ? 'show-dashboard' : ''}`} id="app-layout">
        
        {/* Main Content Container */}
        <div className="container" id="main-container">
          <button 
            id="back-button" 
            className={`back-btn ${viewHistory.length > 0 ? 'visible' : ''}`} 
            type="button" 
            onClick={goBack} 
            aria-label="뒤로가기"
          >
            뒤로가기
          </button>

          <Header goHome={goHome} />

          {currentView === 'home-view' && (
            <HomeView 
              onSelectCategory={handleSelectCategory} 
              onStartSentenceBuilder={handleStartSentenceBuilder}
            />
          )}

          {currentView === 'level-view' && (
            <LevelView 
              category={currentCat}
              onSelectLevel={handleStartStudy}
              onFrequentReview={handleFrequentReview}
            />
          )}

          {currentView === 'study-view' && (
            <StudyView 
              currentList={currentList}
              idx={studyIdx}
              countC={countC}
              countW={countW}
              onAnswer={handleAnswer}
            />
          )}

          {currentView === 'result-view' && (
            <ResultView 
              countC={countC}
              total={currentList.length}
              wrongList={wrongList}
              onRetryWrong={handleRetryWrong}
            />
          )}

          {currentView === 'sentence-view' && (
            <SentenceView 
              currentSentenceObj={currentSentenceObj}
              selectedWords={selectedWords}
              poolWords={poolWords}
              onClearSlots={handleClearSlots}
              onShowHint={handleShowHint}
              onSubmit={handleSubmitSentence}
              onSelectWord={handleSelectWord}
              onDeselectWord={handleDeselectWord}
            />
          )}
        </div>

        {/* Dashboard Side Panel */}
        <Dashboard xp={globalXP} />
        
      </div>
      
      {/* Toast Container for popups */}
      <div id="toast-container" ref={toastContainerRef}></div>

      <DevFeedback currentView={currentView} onNotify={showCustomPopup} />
    </>
  );
}
