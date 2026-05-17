import { Mic, Send } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function AIAssistant() {
  const [message, setMessage] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [reply, setReply] = useState('');
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendChat(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message });
      setReply(data.reply);
    } finally {
      setLoading(false);
    }
  }

  async function parseVoiceText() {
    if (!voiceText.trim()) return;
    const { data } = await api.post('/ai/parse-text', { text: voiceText });
    setParsed(data.parsed);
  }

  function startVoice() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceText('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
    };
    recognition.start();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={sendChat} className="glass grid gap-4 rounded-lg p-5">
        <h2 className="font-semibold">KhataTrack AI chat</h2>
        <Input label="Ask about your spending" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <Button disabled={loading}>
          <Send size={16} /> {loading ? 'Thinking...' : 'Send'}
        </Button>
        {reply && <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-200">{reply}</p>}
      </form>

      <section className="glass grid gap-4 rounded-lg p-5">
        <h2 className="font-semibold">Voice / quick text parsing</h2>
        <Button type="button" variant="secondary" onClick={startVoice}>
          <Mic size={16} /> Speak expense
        </Button>
        <Input label="Transcript" value={voiceText} onChange={(e) => setVoiceText(e.target.value)} />
        <Button type="button" onClick={parseVoiceText}>
          Parse with Gemini
        </Button>
        {parsed && (
          <pre className="overflow-auto rounded-md bg-slate-900 p-3 text-xs text-emerald-200">{JSON.stringify(parsed, null, 2)}</pre>
        )}
      </section>
    </section>
  );
}
