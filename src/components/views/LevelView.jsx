import React from 'react';

export default function LevelView({ category, onSelectLevel, onFrequentReview }) {
  // 카테고리 이름에서 숫자 지우기 처리
  const displayName = category ? category.replace(/^\d+\.\s*/, '') : '';

  return (
    <div id="level-view" className="view active">
      <div className="section-head compact">
        <p className="section-kicker">Difficulty Select</p>
        <p id="selected-cat-name" className="selected-category">{displayName}</p>
        <p className="section-description">현재 수준에 맞게 시작하거나 전체를 한 번에 돌려볼 수 있습니다.</p>
        <button className="frequent-review-cta" onClick={onFrequentReview}>
          <span className="review-cta-icon">3+</span>
          <span className="review-cta-copy">
            <strong>자주 틀린 단어</strong>
            <small>3번 이상 틀린 단어만 집중 복습</small>
          </span>
        </button>
      </div>
      <div className="level-column">
        <button className="btn-bar level-high" onClick={() => onSelectLevel('상')}>
          <span className="level-badge">상</span>
          <span className="level-copy">
            <strong>난이도 상</strong>
            <small>도전적인 단어와 표현부터 학습</small>
          </span>
        </button>
        <button className="btn-bar level-mid" onClick={() => onSelectLevel('중')}>
          <span className="level-badge">중</span>
          <span className="level-copy">
            <strong>난이도 중</strong>
            <small>가장 균형 잡힌 기본 코스</small>
          </span>
        </button>
        <button className="btn-bar level-low" onClick={() => onSelectLevel('하')}>
          <span className="level-badge">하</span>
          <span className="level-copy">
            <strong>난이도 하</strong>
            <small>가볍게 익히는 핵심 단어 위주</small>
          </span>
        </button>
        <button className="btn-bar level-all" onClick={() => onSelectLevel('전체')}>
          <span className="level-badge">ALL</span>
          <span className="level-copy">
            <strong>전체 보기</strong>
            <small>모든 난이도를 섞어서 한 번에 복습</small>
          </span>
        </button>
      </div>
    </div>
  );
}
