import React from 'react';

export default function Header({ goHome }) {
  return (
    <div className="header-area" onClick={goHome}>
      <div className="brand-mark">👆</div>
      <div className="brand-copy">
        <p className="brand-kicker">Smart Vocabulary Studio</p>
        <h1 className="main-title">딸깍보카</h1>
        <p className="brand-subtitle">카테고리를 고르고, 난이도를 정한 뒤, 플래시카드로 빠르게 반복 학습하세요.</p>
      </div>
    </div>
  );
}
