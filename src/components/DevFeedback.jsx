import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DevFeedback({ currentView, onNotify }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => {
    if (submitting) return;
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      onNotify?.('내용을 입력해 주세요.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      message: trimmed,
      page_context: currentView || 'unknown',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    };

    try {
      const { error } = await supabase.from('developer_feedback').insert([payload]);
      if (error) throw error;
      setMessage('');
      setOpen(false);
      onNotify?.('요청이 전달되었습니다. 감사합니다!', 'success');
    } catch (err) {
      console.error('Developer feedback save failed:', err);
      try {
        const key = 'developer_feedback_queue';
        const queue = JSON.parse(localStorage.getItem(key) || '[]');
        queue.push({ ...payload, created_at: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(queue));
        setMessage('');
        setOpen(false);
        onNotify?.('요청을 저장했습니다. 개발자가 확인할 수 있도록 전달됩니다.', 'success');
      } catch {
        onNotify?.('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="dev-feedback-trigger"
        onClick={() => setOpen(true)}
        aria-label="개발자에게 오류 수정 요청하기"
      >
        오류·수정 요청
      </button>

      {open && (
        <div className="modal-overlay show dev-feedback-overlay" onClick={closeModal}>
          <div className="modal-content dev-feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={closeModal}
              disabled={submitting}
              aria-label="닫기"
            >
              &times;
            </button>
            <h2 className="modal-title">개발자에게 요청</h2>
            <p className="modal-desc">
              오류나 불편한 점, 수정이 필요한 내용을 적어 주세요.
              <br />
              확인 후 반영하겠습니다.
            </p>
            <form onSubmit={handleSubmit}>
              <textarea
                className="dev-feedback-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="예: 단어 카드가 안 넘어가요 / 발음이 안 들려요"
                rows={5}
                maxLength={2000}
                disabled={submitting}
                autoFocus
              />
              <div className="dev-feedback-actions">
                <button type="button" className="dev-feedback-btn secondary" onClick={closeModal} disabled={submitting}>
                  취소
                </button>
                <button type="submit" className="dev-feedback-btn primary" disabled={submitting}>
                  {submitting ? '전송 중…' : '요청 보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
