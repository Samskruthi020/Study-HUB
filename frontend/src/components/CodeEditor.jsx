import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from '../api/axios';

const defaultCode = {
  python: `print("Hello, World!")`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
};

const languageMap = {
  python: 'python',
  java: 'java',
};

const CodeEditor = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultCode.python);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(defaultCode[lang]);
    setOutput('');
    setError('');
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setError('');
    try {
      const res = await axios.post('/api/execute', {
        language,
        code
      });
      setOutput(res.data.output || '');
      setError(res.data.error || '');
    } catch (err) {
      setError('Failed to execute code.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-3 gap-3">
        <select value={language} onChange={handleLanguageChange} className="form-select w-auto">
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button className="btn btn-success px-4" onClick={handleRun} disabled={running}>
          {running ? 'Running...' : 'Run'}
        </button>
      </div>
      <div style={{ border: '1.5px solid #e0e7ff', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <MonacoEditor
          height="300px"
          language={languageMap[language]}
          value={code}
          theme="vs-light"
          onChange={value => setCode(value)}
          options={{ fontSize: 15, minimap: { enabled: false } }}
        />
      </div>
      <div className="card p-3 shadow-sm" style={{ minHeight: 80, background: '#f8fafc' }}>
        <div style={{ fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>Output:</div>
        <pre style={{ margin: 0, color: error ? '#ef4444' : '#22223b' }}>{error ? error : output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor; 