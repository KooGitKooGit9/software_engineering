import React, { useState } from 'react';

export default function Dashboard({ xp }) {
  const [showInfo, setShowInfo] = useState(false);

  let lv = 1, title = '🐥 병아리', minXP = 0, maxXP = 10;
  if (xp <= 10) { lv = 1; title = '🐥 병아리'; minXP = 0; maxXP = 10; }
  else if (xp <= 30) { lv = 2; title = '🏃 초보'; minXP = 11; maxXP = 30; }
  else if (xp <= 60) { lv = 3; title = '🔥 중수'; minXP = 31; maxXP = 60; }
  else if (xp <= 100) { lv = 4; title = '👑 실력자'; minXP = 61; maxXP = 100; }
  else { lv = 5; title = '💎 마스터'; minXP = 101; maxXP = xp; }

  let progressPercentage = 0;
  let progressText = '';
  if (lv === 5) {
    progressPercentage = 100;
    progressText = `${xp} XP (마스터)`;
  } else {
    const currentTierXP = xp - minXP;
    const tierTotalXP = maxXP - minXP + 1;
    progressPercentage = Math.min(100, Math.max(0, (currentTierXP / tierTotalXP) * 100));
    progressText = `${xp} / ${maxXP + 1} XP`;
  }

  return (
    <>
      <div className="level-dashboard" id="level-dashboard">
        <div className="dashboard-inner">
          <div className="dashboard-header">
            <div className="header-title-wrap">
              <span className="dashboard-icon">🏆</span>
              <h3 className="dashboard-title">My Level</h3>
            </div>
            <button className="info-btn" onClick={() => setShowInfo(true)} aria-label="레벨 안내">ⓘ</button>
          </div>
          <div className="dashboard-content">
            <div className="level-badge-large">Lv. {lv}</div>
            <p className="level-desc">{title}</p>
            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <span className="progress-text">{progressText}</span>
              {/* Note: +2 animation should be handled dynamically via state if needed, 
                  but can also just update instantly */}
            </div>
          </div>
        </div>
      </div>

      {/* Level Info Modal */}
      {showInfo && (
        <div className="modal-overlay show" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowInfo(false)}>&times;</button>
            <h2 className="modal-title">🏆 레벨 시스템 안내</h2>
            <p className="modal-desc">새로운 단어를 맞힐 때마다 <strong>2 XP</strong>가 상승합니다.<br />꾸준히 학습하여 마스터에 도전하세요!</p>
            <table className="level-table">
              <thead>
                <tr>
                  <th>레벨</th>
                  <th>칭호</th>
                  <th>필요 경험치 (EXP)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><span className="lv-badge lv1">Lv. 1</span></td><td>🐥 병아리</td><td>0 ~ 10</td></tr>
                <tr><td><span className="lv-badge lv2">Lv. 2</span></td><td>🏃 초보</td><td>11 ~ 30</td></tr>
                <tr><td><span className="lv-badge lv3">Lv. 3</span></td><td>🔥 중수</td><td>31 ~ 60</td></tr>
                <tr><td><span className="lv-badge lv4">Lv. 4</span></td><td>👑 실력자</td><td>61 ~ 100</td></tr>
                <tr><td><span className="lv-badge lv5">Lv. 5</span></td><td>💎 마스터</td><td>101+</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
