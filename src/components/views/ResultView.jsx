import React from 'react';

export default function ResultView({ countC, total, wrongList, onRetryWrong }) {
  const score = total > 0 ? Math.round((countC / total) * 100) : 0;

  return (
    <div id="result-view" className="view result-view active">
      <div className="result-layout">
        <div className="result-copy-panel">
          <div className="section-head compact">
            <p className="section-kicker">Session Complete</p>
            <h2 className="result-title">학습 완료</h2>
            <p id="result-text" className="result-text">
              총 {total}개 단어 중 {countC}개를 맞히셨어요!
            </p>
          </div>
          {wrongList.length > 0 && (
            <button className="btn-bar retry-btn" id="retry-wrong-btn" onClick={onRetryWrong}>
              🔥 틀린 단어만 다시 복습하기
            </button>
          )}
        </div>
        <div className="result-score-wrap">
          <div id="result-score">{score}%</div>
        </div>
      </div>
    </div>
  );
}
