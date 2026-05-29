import React from 'react';

export default function HomeView({ onSelectCategory, onStartSentenceBuilder }) {
  const categories = [
    { title: '수능 영단어', meta: '내신 · 모의고사', emoji: '📚', value: '1. 수능 영단어' },
    { title: '일상 회화', meta: '실전 표현', emoji: '💬', value: '2. 일상 회화' },
    { title: '여행 필수', meta: '공항 · 호텔 · 이동', emoji: '✈️', value: '3. 여행 필수' },
    { title: '설레는 연애', meta: '감정 · 관계 표현', emoji: '❤️', value: '4. 설레는 연애' },
    { title: '비즈니스', meta: '회의 · 보고 · 협업', emoji: '💼', value: '5. 비즈니스' },
    { title: '토익 기출', meta: '빈출 어휘 압축', emoji: '📝', value: '6. 토익 기출' },
  ];

  return (
    <div id="home-view" className="view active">
      <div className="section-head">
        <p className="section-kicker">Category Select</p>
        <h2 className="section-title">공부할 영역을 선택하세요</h2>
        <p className="section-description">시험, 회화, 여행, 연애, 비즈니스, 토익까지 바로 시작할 수 있게 정리해 두었습니다.</p>
        
        <div className="sentence-builder-cta" onClick={onStartSentenceBuilder}>
          <span className="cta-emoji">🧩</span>
          <div className="cta-info">
            <strong className="cta-title">배운 단어로 문장 만들기</strong>
            <span className="cta-desc">학습해서 내 것으로 만든 단어들의 예문을 직접 조립해보세요!</span>
          </div>
          <span className="cta-arrow">➔</span>
        </div>
      </div>

      <div className="grid-layout">
        {categories.map((cat, idx) => (
          <button key={idx} className="btn-select" onClick={() => onSelectCategory(cat.value)}>
            <span className="select-emoji">{cat.emoji}</span>
            <span className="select-title">{cat.title}</span>
            <span className="select-meta">{cat.meta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
