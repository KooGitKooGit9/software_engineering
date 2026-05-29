import React from 'react';

export default function SentenceView({
  currentSentenceObj,
  selectedWords,
  poolWords,
  onClearSlots,
  onShowHint,
  onSubmit,
  onSelectWord,
  onDeselectWord
}) {
  if (!currentSentenceObj) return null;

  return (
    <div id="sentence-view" className="view sentence-view active">
      <div className="sentence-layout">
        <div className="sentence-question-panel">
          <div className="section-head compact">
            <p className="section-kicker">Sentence Builder</p>
            <h2 className="sentence-title-text">배운 단어로 문장 만들기</h2>
            <p className="section-description">단어 카드를 알맞은 순서대로 탭하여 완벽한 문장을 조립해 보세요.</p>
          </div>
          
          <div className="sentence-target-box">
            <span className="target-label">의미</span>
            <div id="sentence-meaning" className="target-meaning">{currentSentenceObj.exKor}</div>
          </div>
          
          <div className="sentence-slots-container">
            <div className="slots-header">
              <span>조립된 문장</span>
              <button className="btn-clear-slots" onClick={onClearSlots}>전체 취소 ↺</button>
            </div>
            <div id="sentence-slots" className="sentence-slots">
              {selectedWords.map((wordObj, idx) => (
                <div 
                  key={`sel-${idx}`} 
                  className="word-chip" 
                  onClick={() => onDeselectWord(idx, wordObj)}
                >
                  {wordObj.word}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sentence-action-panel">
          <div className="pool-header">낱말 카드 풀</div>
          <div id="sentence-pool" className="sentence-pool">
            {poolWords.map((wordObj, idx) => (
              <div 
                key={`pool-${idx}`} 
                className={`word-chip ${wordObj.used ? 'used' : ''} ${wordObj.hinted ? 'hinted' : ''}`}
                onClick={() => !wordObj.used && onSelectWord(idx, wordObj)}
              >
                {wordObj.word}
              </div>
            ))}
          </div>
          
          <button className="btn-bar btn-sentence-hint" onClick={onShowHint}>힌트 보기 💡</button>
          <button className="btn-bar btn-sentence-submit" onClick={onSubmit}>완성하기 ✓</button>
        </div>
      </div>
    </div>
  );
}
