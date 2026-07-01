(function () {

  // ── CONFIG ────────────────────────────────────────────────────
  // WARNING: This key is visible in browser source. Keep it private,
  // set spend limits on your Anthropic dashboard, and restrict usage
  // to this domain if possible.
  const CLAUDE_API_KEY = 'YOUR_API_KEY_HERE';
  const MODEL          = 'claude-sonnet-4-20250514';

  const SYSTEM_PROMPT = `You are Nova, a friendly AI assistant for NovaFlow \
— a web and AI agency based in Auckland, New Zealand. \
Help visitors understand our services, answer their questions, \
and encourage them to get in touch.

Our services:
- Website Development
- Custom Application
- AI Chatbot
- Workflow Automation
- Website Care Plan

Pricing is custom per project — if asked about cost, direct them to request a quote via the quote form, WhatsApp, or email rather than quoting a figure.

Contact details:
- WhatsApp: 022 508 1575
- Email: novaflowbuild@gmail.com
- Website: https://nova-flow-build.vercel.app

Keep responses short, friendly and helpful. \
Never make up information. If unsure, direct them to WhatsApp or email.`;

  const GREETING = "Hi! I'm Nova 👋 NovaFlow's AI assistant. I can tell you about our services or anything else. What can I help you with today?";

  // ── STATE ─────────────────────────────────────────────────────
  let isOpen    = false;
  let isLoading = false;
  let greeted   = false;
  const history = []; // { role: 'user'|'assistant', content: string }

  // ── ELEMENTS ──────────────────────────────────────────────────
  const widget   = document.getElementById('chat-widget');
  const toggle   = document.getElementById('chat-toggle');
  const closeBtn = document.getElementById('chat-close');
  const msgList  = document.getElementById('chat-messages');
  const input    = document.getElementById('chat-input');
  const sendBtn  = document.getElementById('chat-send');

  if (!widget) return; // guard — widget not in DOM

  // ── OPEN / CLOSE ──────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    widget.classList.add('open', 'seen');
    setTimeout(() => input.focus(), 320);
    if (!greeted) {
      greeted = true;
      setTimeout(() => appendBotMsg(GREETING), 350);
    }
  }

  function closeChat() {
    isOpen = false;
    widget.classList.remove('open');
  }

  toggle.addEventListener('click', () => (isOpen ? closeChat() : openChat()));
  closeBtn.addEventListener('click', closeChat);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  // ── RENDER HELPERS ────────────────────────────────────────────
  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function appendBotMsg(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg bot';
    el.innerHTML =
      '<div class="msg-avatar">N</div>' +
      '<div class="msg-bubble">' +
        escHtml(text).replace(/\n/g, '<br>') +
      '</div>';
    msgList.appendChild(el);
    scrollBottom();
    return el;
  }

  function appendUserMsg(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg user';
    el.innerHTML =
      '<div class="msg-bubble">' + escHtml(text).replace(/\n/g, '<br>') + '</div>';
    msgList.appendChild(el);
    scrollBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-msg bot';
    el.id = 'nova-typing';
    el.innerHTML =
      '<div class="msg-avatar">N</div>' +
      '<div class="msg-bubble">' +
        '<div class="typing-dots">' +
          '<span></span><span></span><span></span>' +
        '</div>' +
      '</div>';
    msgList.appendChild(el);
    scrollBottom();
  }

  function hideTyping() {
    const el = document.getElementById('nova-typing');
    if (el) el.remove();
  }

  function scrollBottom() {
    msgList.scrollTop = msgList.scrollHeight;
  }

  // ── API CALL ──────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    setLoading(true);

    appendUserMsg(text);
    history.push({ role: 'user', content: text });
    showTyping();

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'API error ' + res.status);
      }

      const data  = await res.json();
      const reply = data.content?.[0]?.text ||
        "Sorry, I didn't catch that. Please try again.";

      history.push({ role: 'assistant', content: reply });
      hideTyping();
      appendBotMsg(reply);

    } catch (err) {
      hideTyping();
      appendBotMsg(
        "Sorry, something went wrong on my end. You can reach us directly:\n" +
        "📱 WhatsApp: 022 508 1575\n" +
        "📧 novaflowbuild@gmail.com"
      );
      console.error('[Nova chat]', err);
    }

    setLoading(false);
  }

  function setLoading(state) {
    isLoading        = state;
    sendBtn.disabled = state;
    input.disabled   = state;
  }

  // ── INPUT EVENTS ──────────────────────────────────────────────
  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

})();
