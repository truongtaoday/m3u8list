import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [referer, setReferer] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setContent('');

    try {
      const response = await fetch('/api/fetch-m3u8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, referer }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch content');
      }

      setContent(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadContent = () => {
    if (!content) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const downloadFilename = filename || 'playlist.m3u8';
    
    // Ensure proper file extension
    const finalFilename = downloadFilename.endsWith('.m3u8') || downloadFilename.endsWith('.txt') 
      ? downloadFilename 
      : `${downloadFilename}.m3u8`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>M3U8 Playlist Fetcher</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>M3U8 URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={styles.input}
              placeholder="https://example.com/playlist.m3u8"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              style={styles.input}
              placeholder="playlist.m3u8"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Referer (Optional)</label>
            <input
              type="url"
              value={referer}
              onChange={(e) => setReferer(e.target.value)}
              style={styles.input}
              placeholder="https://example.com"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Fetching...' : 'Fetch Playlist'}
          </button>
        </form>

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {content && (
          <div style={styles.result}>
            <div style={styles.resultHeader}>
              <h3>Playlist Content</h3>
              <button 
                onClick={downloadContent}
                style={styles.downloadButton}
              >
                Download as TXT
              </button>
            </div>
            <textarea
              value={content}
              readOnly
              style={styles.textarea}
              rows={20}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  form: {
    marginBottom: '30px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  downloadButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  result: {
    marginTop: '30px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  textarea: {
    width: '100%',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
};