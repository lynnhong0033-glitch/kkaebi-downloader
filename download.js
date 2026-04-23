export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, quality } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL이 필요합니다' });
  }

  try {
    const qualityMap = {
      'best': '1080',
      '1080': '1080',
      '720': '720',
      '480': '480',
    };

    const videoQuality = qualityMap[quality] || '720';

    const response = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        videoQuality: videoQuality,
        filenameStyle: 'pretty',
        downloadMode: 'auto',
      }),
    });

    const data = await response.json();

    if (data.status === 'error') {
      return res.status(400).json({ error: data.error?.code || '다운로드 실패' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: '서버 오류: ' + error.message });
  }
}
