import { useState } from 'react';
import Head from 'next/head';

const PLATFORMS = [
  { name: 'YouTube', icon: '▶', color: '#ff0000' },
  { name: 'X (Twitter)', icon: '✕', color: '#ffffff' },
  { name: 'Instagram', icon: '◈', color: '#e1306c' },
  { name: 'TikTok', icon: '♪', color: '#69c9d0' },
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('720');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      setStatus({ type: 'error', msg: 'URL을 입력해주세요' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'loading', msg: '영상 정보 가져오는 중...' });
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), quality }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: 'error', msg: data.error || '다운로드 실패' });
        return;
      }

      if (data.status === 'redirect' || data.status === 'stream') {
        setResult(data.url);
        setStatus({ type: 'success', msg: '준비 완료! 아래 버튼을 눌러 저장하세요' });
      } else if (data.status === 'picker') {
        setResult(data.picker?.[0]?.url || data.url);
        setStatus({ type: 'success', msg: '준비 완료! 아래 버튼을 눌러 저장하세요' });
      } else if (data.url) {
        setResult(data.url);
        setStatus({ type: 'success', msg: '준비 완료! 아래 버튼을 눌러 저장하세요' });
      } else {
        setStatus({ type: 'error', msg: '다운로드 링크를 가져올 수 없어요' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: '네트워크 오류가 발생했어요' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'kkaebi_video.mp4';
    a.target = '_blank';
    a.click();
  };

  return (
    <>
      <Head>
        <title>깨비AI · 릴스 소스 다운로더</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        {/* 헤더 */}
        <div className="header">
          <span className="brand">🤖 깨비AI</span>
          <h1 className="title">릴스 소스 다운로더</h1>
          <p className="subtitle">YouTube · X · Instagram · TikTok</p>
        </div>

        {/* 플랫폼 뱃지 */}
        <div className="platforms">
          {PLATFORMS.map(p => (
            <span key={p.name} className="platform-badge">
              <span style={{ color: p.color }}>{p.icon}</span> {p.name}
            </span>
          ))}
        </div>

        {/* URL 입력 */}
        <div className="card">
          <label className="label">영상 URL</label>
          <input
            type="text"
            className="input"
            placeholder="https://youtube.com/... 또는 x.com/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDownload()}
          />

          {/* 화질 선택 */}
          <label className="label" style={{ marginTop: '20px' }}>화질</label>
          <div className="quality-row">
            {[
              { val: 'best', label: '최고화질' },
              { val: '1080', label: '1080p' },
              { val: '720', label: '720p ★' },
              { val: '480', label: '480p' },
            ].map(q => (
              <button
                key={q.val}
                className={`quality-btn ${quality === q.val ? 'active' : ''}`}
                onClick={() => setQuality(q.val)}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* 다운로드 버튼 */}
          <button
            className={`dl-btn ${loading ? 'loading' : ''}`}
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner">⟳</span>
            ) : '⬇  다운로드 링크 가져오기'}
          </button>

          {/* 상태 메시지 */}
          {status && (
            <div className={`status ${status.type}`}>
              {status.type === 'loading' && <span className="dot-anim">●</span>}
              {status.type === 'success' && '✅ '}
              {status.type === 'error' && '❌ '}
              {status.msg}
            </div>
          )}

          {/* 저장 버튼 */}
          {result && (
            <button className="save-btn" onClick={handleSave}>
              💾  저장하기
            </button>
          )}
        </div>

        {/* 안내 */}
        <div className="notice">
          <p>📌 큐레이션 목적으로만 사용하세요</p>
          <p>출처 표기: Source · @원작자 / 플랫폼</p>
        </div>

        <footer>Content curated by @kkaebi.ai</footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #060608;
          color: #ffffff;
          font-family: 'Noto Sans KR', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .container {
          width: 100%;
          max-width: 540px;
          padding: 32px 20px;
        }

        .header { text-align: center; margin-bottom: 28px; }

        .brand {
          font-size: 13px;
          color: #6366f1;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .title {
          font-size: 32px;
          font-weight: 900;
          color: #ffffff;
          margin: 8px 0 6px;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 13px;
          color: #444;
        }

        .platforms {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 24px;
        }

        .platform-badge {
          background: #111;
          border: 1px solid #222;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          color: #888;
        }

        .card {
          background: #0f0f12;
          border: 1px solid #1e1e2a;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .input {
          width: 100%;
          background: #18181f;
          border: 1px solid #2a2a3a;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 14px;
          color: #ffffff;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }

        .input:focus { border-color: #6366f1; }
        .input::placeholder { color: #333; }

        .quality-row {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .quality-btn {
          flex: 1;
          padding: 8px;
          background: #18181f;
          border: 1px solid #2a2a3a;
          border-radius: 8px;
          color: #555;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }

        .quality-btn:hover { border-color: #6366f1; color: #aaa; }

        .quality-btn.active {
          background: #1e1e35;
          border-color: #6366f1;
          color: #6366f1;
          font-weight: 700;
        }

        .dl-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border: none;
          border-radius: 12px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          margin-top: 4px;
        }

        .dl-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .dl-btn:active:not(:disabled) { transform: translateY(0); }
        .dl-btn.loading { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .status {
          margin-top: 14px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status.loading { background: #1a1a2e; color: #6366f1; border: 1px solid #2a2a4a; }
        .status.success { background: #0f2a1f; color: #22c55e; border: 1px solid #1a4a30; }
        .status.error { background: #2a0f0f; color: #ef4444; border: 1px solid #4a1a1a; }

        .dot-anim {
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .save-btn {
          width: 100%;
          padding: 14px;
          background: #0f2a1f;
          border: 1px solid #22c55e;
          border-radius: 12px;
          color: #22c55e;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.15s;
        }

        .save-btn:hover { background: #22c55e; color: #000; }

        .notice {
          background: #0a0a10;
          border: 1px solid #1a1a25;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 12px;
          color: #444;
          line-height: 1.8;
        }

        footer {
          text-align: center;
          margin-top: 24px;
          font-size: 11px;
          color: #2a2a35;
        }
      `}</style>
    </>
  );
}
