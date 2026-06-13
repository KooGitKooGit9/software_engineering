import React, { useState, useEffect } from 'react';
import { buildImageUrl, getImageFallbacks } from '../../lib/imageUrl';

export default function StudyView({ 
  currentList, 
  idx, 
  countC, 
  countW, 
  onAnswer, 
  onFinish 
}) {
  const [flipped, setFlipped] = useState(false);
  const [showKonglish, setShowKonglish] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [imageFallbacks, setImageFallbacks] = useState([]);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  const cur = currentList[idx];

  // Reset states when the index changes
  useEffect(() => {
    setFlipped(false);
    setShowKonglish(false);
    setFallbackIdx(0);
    if (cur?.imageUrl) {
      const fallbacks = getImageFallbacks(cur.imageKey || cur.word, cur.imageUrl);
      setImageFallbacks(fallbacks);
      setImageSrc(buildImageUrl(cur.imageUrl));
      setShowImage(true);
    } else {
      setImageFallbacks([]);
      setImageSrc('');
      setShowImage(false);
    }
  }, [idx, cur?.imageUrl, cur?.imageKey, cur?.word]);

  if (!cur) return null;

  const handleCardFlip = () => {
    const isOpening = !flipped;
    setFlipped(!flipped);
    if (isOpening && cur.isKonglish && !cur.konglishRevealed) {
      cur.konglishRevealed = true;
      setShowKonglish(true);
      setTimeout(() => setShowKonglish(false), 3600);
    }
  };

  const speak = (e, text) => {
    e.stopPropagation();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'en-US';
    window.speechSynthesis.speak(ut);
  };

  const handleImageError = () => {
    if (fallbackIdx < imageFallbacks.length) {
      const nextPath = imageFallbacks[fallbackIdx];
      setFallbackIdx(prev => prev + 1);
      setImageSrc(buildImageUrl(nextPath));
      return;
    }
    setShowImage(false);
  };

  return (
    <div id="study-view" className="view study-view active">
      <div className="study-layout">
        <div className="study-card-panel">
          <div 
            className={`card ${flipped ? 'flipped' : ''} ${showKonglish ? 'konglish-revealed' : ''}`} 
            id="flashcard" 
            onClick={handleCardFlip}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="word-text" id="q-word">{cur.word}</div>
                <div className="card-hint">카드를 터치하면 뜻과 예문이 펼쳐집니다</div>
              </div>
              <div className="card-back">
                <div className="answer-head">
                  <span id="a-word" className="answer-word">{cur.word}</span>
                  <button className="tts-icon" type="button" onClick={(e) => speak(e, cur.word)}>🔊</button>
                </div>
                <div id="a-pron" className="pron-text">[{cur.pron}]</div>
                <div id="a-meaning" className="meaning-text">{cur.mean}</div>
                
                {showImage && (
                  <div className="card-image-container" id="card-image-container">
                    <img
                      key={imageSrc}
                      id="card-image"
                      src={imageSrc}
                      alt="Flashcard Image"
                      onError={handleImageError}
                    />
                  </div>
                )}
                
                <div className="example-box">
                  <div className="example-line">
                    <span id="a-ex">{cur.ex}</span>
                    <button className="example-audio" type="button" onClick={(e) => speak(e, cur.ex)}>🔊</button>
                  </div>
                  <div id="a-ex-kor" className="example-translation">{cur.exKor}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`konglish-event ${showKonglish ? 'show' : ''}`} id="konglish-event" aria-live="polite">
            <div className="konglish-burst">Konglish!</div>
            <div className="konglish-title">사실 이 단어는 콩글리쉬입니다!</div>
            <div className="konglish-correct">진짜 표현: <strong id="konglish-correct">{cur.konglishCorrect}</strong></div>
            <div className="konglish-message" id="konglish-message">{cur.konglishMessage}</div>
          </div>
        </div>

        <div className="study-side-panel">
          <div className="study-side-copy">
            <p className="section-kicker">Study Flow</p>
            <h2 className="section-title">카드를 보고 바로 체크하세요</h2>
            <p className="section-description">단어를 먼저 떠올리고, 카드를 뒤집은 뒤 정답 여부를 즉시 기록하면 반복 학습이 훨씬 빨라집니다.</p>
          </div>

          <div className="action-group">
            <button className="btn-wrong" onClick={() => { setFlipped(false); onAnswer(false); }}>❌ 틀렸어요</button>
            <button className="btn-correct" onClick={() => { setFlipped(false); onAnswer(true); }}>✅ 맞았어요</button>
          </div>

          <div className="stats-bar">
            <span className="stat-pill stat-wrong">틀림 <strong id="s-wrong">{countW}</strong></span>
            <span className="stat-pill stat-correct">맞음 <strong id="s-correct">{countC}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
