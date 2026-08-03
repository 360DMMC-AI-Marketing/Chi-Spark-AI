/* Echo Voicebot widget. Generated asset - edit via deploy pipeline. */
(function () {
  function boot() {
    var st = document.createElement("style");
    st.textContent = "\n      /* ============ DESIGN TOKENS ============ */\n      :root {\n        /* CHANGED: --dmmc-brand/--dmmc-header/--dmmc-bot-*/--dmmc-panel\n           below are now verbatim copies of dmmc-index-live.html's\n           --chat--color-primary, --chat--header--background,\n           --chat--message--bot--*, and --chat--color-light tokens\n           (lines ~46-95 of that file). --dmmc-accent and the send-button\n           colors are NOT part of the old theme (it had no equivalent\n           \"accent\" token \u2014 only the primary/shade-50/shade-100 navies,\n           which the old theme only ever applied to the toggle's colored\n           background, and per your choice that colored toggle was never\n           actually rendered \u2014 see the toggle section below). Since this\n           restyle request didn't ask to touch links/send-button, those\n           keep their previously-set values, unchanged by this pass. */\n        --dmmc-brand:   #12213b;                                   /* verbatim --chat--color-primary   */\n        --dmmc-accent:  #ff6b35;                                   /* unchanged by this restyle (no old-theme equivalent; out of scope) */\n        --dmmc-header:  linear-gradient(135deg, #0a1323, #1a2b4b); /* CHANGED verbatim --chat--header--background (was #23378C, #3B5BDB) */\n        --dmmc-bot-bg:  #fff1ea;                                   /* CHANGED verbatim --chat--message--bot--background (was #FFFFFF) */\n        --dmmc-bot-fg:  #1e293b;                                   /* CHANGED verbatim --chat--message--bot--color (was #1F2937, an approximation) */\n        --dmmc-user-bg: #ff6b35;                                   /* verbatim --chat--message--user--background = var(--chat--color-primary); already matched */\n        --dmmc-user-fg: #FFFFFF;                                   /* verbatim --chat--message--user--color; already matched */\n        --dmmc-panel:   #F6F7FB;                                   /* verbatim --chat--color-light; already matched */\n        --dmmc-radius:  24px;                                      /* CHANGED verbatim --chat--border-radius (was 16px) */\n      }\n\n      /* ============ FLOATING TOGGLE (white pill, matches the live .chat-window-toggle override) ============ */\n      /* CHANGED: the old theme defines a round 64px colored toggle via\n         --chat--toggle--* tokens, but a LATER, higher-specificity\n         .chat-window-toggle rule block (with !important on every\n         property) fully overrides it into a white auto-width pill with\n         a robot-image icon and \"Chat Now\" text \u2014 that override is what\n         actually rendered on the live site, so it's what's reproduced\n         here per your confirmed choice. The --chat--toggle--background/\n         hover/active/color/size tokens are consequently not used by\n         anything visible and are omitted (see the report for the full\n         list of unused old-theme tokens). */\n      #dmmc-chat-toggle {\n        position: fixed;                       /* pin to viewport            */\n        bottom: 24px;                          /* offset from bottom         */\n        right: 24px;                           /* offset from right          */\n        z-index: 2147483000;                   /* above all site content     */\n        display: flex;                         /* icon + label side by side  */\n        align-items: center;                   /* vertically center content  */\n        gap: 2px;                              /* CHANGED verbatim .chat-window-toggle gap (was 10px) */\n        padding: 2px 10px 2px 2px;             /* CHANGED verbatim .chat-window-toggle padding */\n        border: 1px solid #e5e7eb;             /* CHANGED verbatim .chat-window-toggle border */\n        border-radius: 50px;                   /* CHANGED verbatim .chat-window-toggle border-radius (was 999px) */\n        background: #ffffff;                   /* CHANGED verbatim .chat-window-toggle background (was the navy\u2192blue gradient) */\n        width: auto;                           /* CHANGED verbatim (was implicit via padding only) */\n        height: auto;                          /* CHANGED verbatim */\n        min-height: 48px;                      /* CHANGED verbatim .chat-window-toggle min-height */\n        font: 500 15px/1 system-ui, -apple-system, \"Segoe UI\", sans-serif; /* CHANGED: weight/size verbatim from .chat-window-toggle::after */\n        cursor: pointer;                       /* hand cursor                */\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);  /* CHANGED verbatim .chat-window-toggle box-shadow */\n        transition: all 0.25s ease;            /* CHANGED verbatim \".chat-window, .chat-window-toggle { transition: all 0.25s ease }\" */\n      }\n      #dmmc-chat-toggle:hover {\n        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);  /* CHANGED verbatim .chat-window-toggle:hover box-shadow */\n        transform: translateY(-2px);                 /* CHANGED verbatim .chat-window-toggle:hover transform (no scale in old spec) */\n      }\n      .dmmc-toggle-icon {\n        width: 44px; height: 44px;             /* CHANGED verbatim .chat-window-toggle::before width/height (the robot icon) */\n        object-fit: contain;                   /* equivalent of background-size: contain for an <img> */\n        flex-shrink: 0;\n        display: block;\n      }\n      .dmmc-toggle-label {\n        color: #1f2937;                        /* CHANGED verbatim .chat-window-toggle::after color */\n        white-space: nowrap;\n        line-height: 1;\n      }\n\n      /* ============ CHAT WINDOW ============ */\n      #dmmc-chat-window {\n        position: fixed;                       /* pin to viewport            */\n        bottom: 24px;                          /* align with toggle          */\n        right: 24px;                           /* align with toggle          */\n        z-index: 2147483001;                   /* above the toggle           */\n        display: none;                         /* hidden until opened        */\n        flex-direction: column;                /* header / feed / input      */\n        width: 420px;                          /* CHANGED verbatim --chat--window--width (was 380px) */\n        height: 620px;                         /* CHANGED verbatim --chat--window--height (was 560px) */\n        max-height: calc(100vh - 48px);        /* never overflow viewport    */\n        background: #fff;                      /* window base                */\n        border-radius: var(--dmmc-radius);     /* now 24px, see tokens above */\n        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);  /* CHANGED verbatim .chat-window box-shadow (was 0 18px 50px rgba(0,0,0,.28)) */\n        backdrop-filter: blur(6px);            /* CHANGED: added, verbatim .chat-window backdrop-filter */\n        overflow: hidden;                      /* clip children to radius    */\n        opacity: 0;                            /* start invisible (anim)     */\n        transform: translateY(12px) scale(.97);/* start offset (anim)        */\n        transition: all 0.25s ease;            /* CHANGED verbatim \".chat-window, .chat-window-toggle { transition: all 0.25s ease }\" (was split opacity/transform at .2s) */\n        font-family: system-ui, -apple-system, \"Segoe UI\", sans-serif;\n      }\n      #dmmc-chat-window.dmmc-open {\n        display: flex;                         /* participate in layout      */\n      }\n      #dmmc-chat-window.dmmc-visible {\n        opacity: 1;                            /* fade in                    */\n        transform: translateY(0) scale(1);     /* settle into place          */\n      }\n\n      /* Mobile: full-width bottom sheet */\n      @media (max-width: 640px) {\n        #dmmc-chat-window {\n          right: 0; bottom: 0; left: 0;        /* span full width            */\n          width: 100%;                         /* full width                 */\n          height: 85vh;                        /* leave site header visible  */\n          border-radius: var(--dmmc-radius) var(--dmmc-radius) 0 0;\n        }\n      }\n\n      /* Respect users who disable animation at the OS level */\n      @media (prefers-reduced-motion: reduce) {\n        #dmmc-chat-toggle, #dmmc-chat-window, .dmmc-dot { transition: none !important; animation: none !important; }\n      }\n\n      /* ============ HEADER ============ */\n      #dmmc-chat-header {\n        display: flex;                         /* identity | actions         */\n        align-items: center;                   /* vertical centering         */\n        justify-content: space-between;        /* push actions right         */\n        padding: 1.2rem 1.4rem;                /* CHANGED verbatim --chat--header--padding (was 12px 14px) */\n        background: var(--dmmc-header);        /* now #0a1323\u2192#1a2b4b, see tokens above */\n        flex-shrink: 0;                        /* never collapse             */\n      }\n      .dmmc-header-id { display: flex; align-items: center; gap: 10px; }\n      .dmmc-header-name { color: #fff; font-weight: 600; font-size: 1.15rem; }  /* CHANGED verbatim --chat--heading--font-size (was 14px) */\n      .dmmc-header-sub  { color: rgba(255,255,255,.75); font-size: 0.85rem; }   /* CHANGED verbatim --chat--subtitle--font-size (was 10px) */\n      .dmmc-header-btn {\n        background: transparent;               /* flat button                */\n        border: none;                          /* strip default              */\n        color: rgba(255,255,255,.85);          /* subtle white               */\n        cursor: pointer;                       /* hand cursor                */\n        border-radius: 8px;                    /* soft corners               */\n        padding: 6px 8px;                      /* tap target                 */\n        font-size: 11px;                       /* small utility text        */\n        line-height: 1;                        /* tight box                  */\n      }\n      .dmmc-header-btn:hover { background: rgba(255,255,255,.12); color: #fff; }\n      #dmmc-live-agent { display: inline-flex; align-items: center; gap: 5px; font-weight: 600; }\n      #dmmc-live-agent::before { content: \"\"; width: 7px; height: 7px; border-radius: 50%; background: #8b98b5; }\n      #dmmc-live-agent.dmmc-live-online::before { background: #2fbf71; box-shadow: 0 0 6px #2fbf71; }\n\n      /* ============ MESSAGE FEED ============ */\n      #dmmc-chat-feed {\n        flex: 1;                               /* fill remaining height      */\n        overflow-y: auto;                      /* scroll long conversations  */\n        padding: 14px;                         /* feed padding               */\n        background: var(--dmmc-panel);         /* verbatim --chat--color-light, already matched */\n      }\n      .dmmc-row      { display: flex; margin-bottom: 0.75rem; align-items: flex-start; gap: 8px; }  /* CHANGED verbatim .chat-message margin-bottom (was 10px) */\n      .dmmc-row-user { justify-content: flex-end; }\n      .dmmc-avatar {\n        width: 28px; height: 28px;             /* small round mark (unchanged dimensions) */\n        border-radius: 50%;                    /* circle                     */\n        flex-shrink: 0;                        /* keep size                  */\n        margin-top: 2px;                       /* align with bubble top      */\n        background: #fff;                      /* same white avatar background as before */\n        display: flex; align-items: center; justify-content: center; /* CHANGED: center the whole (uncropped) mark in the circle */\n      }\n      .dmmc-avatar img {\n        /* CHANGED: the /assets/-v7dI2Vu.png crop attempt is dropped entirely \u2014\n           the 360DMMC wordmark is too wide for a 28px circle and got cut off\n           no matter how it was cropped. This now reuses the same round\n           robot/logo mark the toggle button uses (.dmmc-toggle-icon's image),\n           shown whole via object-fit: contain so nothing is ever clipped. */\n        width: 100%;\n        height: 100%;\n        object-fit: contain;                   /* show the whole mark, no cropping */\n      }\n      .dmmc-bubble {\n        max-width: 82%;                        /* never span full width      */\n        padding: 0.9rem 1rem;                  /* CHANGED verbatim --chat--message--padding (was 10px 14px) */\n        border-radius: 18px;                   /* CHANGED verbatim --chat--message--border-radius (was 16px) */\n        font-size: 0.95rem;                    /* CHANGED verbatim --chat--message--font-size (was 13.5px) */\n        line-height: 1.6;                      /* CHANGED verbatim --chat--message-line-height (was 1.5) */\n        white-space: pre-line;                 /* keep backend line breaks   */\n        word-break: break-word;                /* wrap long tokens/URLs      */\n      }\n      .dmmc-bubble-bot {\n        background: var(--dmmc-bot-bg);        /* now #eef2ff, see tokens above */\n        color: var(--dmmc-bot-fg);             /* now #1e293b, see tokens above */\n        border-top-left-radius: 4px;           /* speech-tail corner         */\n        box-shadow: 0 1px 3px rgba(0,0,0,.08); /* subtle card lift           */\n      }\n      .dmmc-bubble-user {\n        background: var(--dmmc-user-bg);       /* navy #23378C, already matched */\n        color: var(--dmmc-user-fg);            /* white text                 */\n        border-top-right-radius: 4px;          /* speech-tail corner         */\n      }\n      .dmmc-bubble a { color: var(--dmmc-accent); text-decoration: underline; word-break: break-all; }\n      .dmmc-bubble-user a { color: #cfe0f5; }  /* unchanged by this restyle: old theme has no link-color token */\n\n      /* ============ TYPING INDICATOR ============ */\n      .dmmc-dots { display: flex; gap: 5px; align-items: center; padding: 4px 2px; }\n      .dmmc-dot {\n        width: 7px; height: 7px;               /* small dot                  */\n        border-radius: 50%;                    /* circle                     */\n        background: #9CA3AF;                   /* gray                       */\n        animation: dmmc-bounce 1.2s infinite;  /* shared bounce loop         */\n      }\n      .dmmc-dot:nth-child(2) { animation-delay: .15s; }   /* stagger dot 2   */\n      .dmmc-dot:nth-child(3) { animation-delay: .30s; }   /* stagger dot 3   */\n      @keyframes dmmc-bounce {\n        0%, 60%, 100% { transform: translateY(0); }       /* rest            */\n        30%           { transform: translateY(-5px); }    /* hop             */\n      }\n\n      /* ============ INPUT BAR ============ */\n\n      #dmmc-cb-submit {\n        background: var(--dmmc-brand); color: #fff; border: none;\n        border-radius: 10px; padding: 8px 14px;\n        font-weight: 600; font-size: 13px; cursor: pointer;\n      }\n      #dmmc-cb-submit:disabled { opacity: .5; cursor: not-allowed; }\n      #dmmc-cb-status { flex-basis: 100%; margin: 2px 0 0; font-size: 12px; color: #4B5563; }\n      #dmmc-chat-inputbar {\n        display: flex;                         /* input | send               */\n        align-items: center;                   /* vertical centering         */\n        gap: 8px;                              /* space between controls     */\n        padding: 10px 12px;                    /* bar padding (unchanged: old theme has no token for this outer bar) */\n        background: #fff;                      /* white bar                  */\n        border-top: 1px solid #E5E7EB;         /* hairline divider (unchanged: no old-theme token for this either) */\n        flex-shrink: 0;                        /* never collapse             */\n      }\n      #dmmc-chat-input {\n        flex: 1;                               /* fill available width       */\n        padding: 0.75rem 1rem;                 /* CHANGED verbatim --chat--input--padding (was 10px 16px) */\n        border: none;                          /* CHANGED verbatim \".chat-input, :hover, :focus-within { border: none !important }\" (was 1px solid #D1D5DB) */\n        border-radius: 14px;                   /* CHANGED verbatim --chat--input--border-radius (was 999px) */\n        font-size: 0.9rem;                     /* CHANGED verbatim --chat--input--font-size (was 13.5px) */\n        color: #0a1323;                        /* CHANGED verbatim --chat--input--color / .chat-input textarea color (new; was unset) */\n        background: #ffffff;                   /* CHANGED verbatim --chat--input--background (new; was unset) */\n        caret-color: #23378c;                  /* CHANGED verbatim --chat--input--caret-color (new) */\n        outline: none;                         /* custom focus below         */\n        font-family: inherit;                  /* match widget font          */\n      }\n      #dmmc-chat-input::placeholder { color: #9ca3af; opacity: 1; }  /* CHANGED verbatim .chat-input textarea::placeholder */\n      #dmmc-chat-input:disabled { opacity: .55; }\n      #dmmc-chat-send {\n        width: 40px; height: 40px;             /* round send button          */\n        border: none;                          /* strip default              */\n        border-radius: 50%;                    /* circle                     */\n        background: var(--dmmc-accent);        /* unchanged by this restyle (no old-theme send-button token) */\n        color: #fff;                           /* white icon                 */\n        cursor: pointer;                       /* hand cursor                */\n        display: flex; align-items: center; justify-content: center;\n        flex-shrink: 0;                        /* keep size                  */\n        transition: background .15s ease;\n      }\n      #dmmc-chat-send:hover:not(:disabled) { background: var(--dmmc-brand); }\n      #dmmc-chat-send:disabled { opacity: .4; cursor: not-allowed; }\n      #dmmc-chat-mic {\n        width: 40px; height: 40px;             /* round mic button           */\n        border: none; border-radius: 50%;\n        background: #F3F4F6;                   /* ghost when idle            */\n        color: #6B7280;                        /* gray mic icon              */\n        cursor: pointer;\n        display: flex; align-items: center; justify-content: center;\n        flex-shrink: 0; position: relative;\n        transition: background .15s ease, color .15s ease;\n      }\n      #dmmc-chat-mic:hover { background: #E5E7EB; }\n      #dmmc-chat-mic.dmmc-mic-on { background: #FEF2F2; color: #EF4444; }    /* voice mode active */\n      #dmmc-chat-mic.dmmc-mic-on::after {                                     /* listening pulse ring */\n        content: \"\"; position: absolute; inset: 0; border-radius: 50%;\n        animation: dmmc-mic-ping 1.2s cubic-bezier(0,0,.2,1) infinite;\n        background: rgba(239,68,68,.25);\n      }\n      #dmmc-chat-mic.dmmc-mic-speaking { color: var(--dmmc-brand); animation: dmmc-mic-speak 1s ease-in-out infinite; }\n      @keyframes dmmc-mic-ping { 75%,100% { transform: scale(1.5); opacity: 0; } }\n      @keyframes dmmc-mic-speak { 50% { opacity: .55; } }\n    \n      /* ============ ECHO VOICEBOT BRANDING (hard-coded on every tenant widget) ============ */\n      #dmmc-chat-branding {\n        padding: 7px 12px 8px;\n        background: #F8FAFC;\n        border-top: 1px solid #E5E7EB;\n        text-align: center;\n        flex-shrink: 0;\n        font-family: inherit;\n      }\n      #dmmc-chat-branding a {\n        display: inline-flex; align-items: center; justify-content: center; gap: 6px;\n        text-decoration: none; color: #64748B;\n        font-size: 10.5px; letter-spacing: .02em;\n      }\n      #dmmc-chat-branding a strong { color: #0F766E; font-weight: 700; }\n      #dmmc-chat-branding a:hover strong { text-decoration: underline; }\n      #dmmc-chat-branding img { height: 14px; width: auto; display: block; }\n      #dmmc-chat-branding .dmmc-branding-tag {\n        font-size: 9.5px; color: #94A3B8; font-style: italic; margin-top: 1px;\n      }\n    ";
    document.head.appendChild(st);
    document.body.insertAdjacentHTML("beforeend", "<button id=\"dmmc-chat-toggle\" aria-label=\"Open chat with Chi-Spark AI\">\n      <img class=\"dmmc-toggle-icon\" src=\"/spark-mark.png\" alt=\"\" aria-hidden=\"true\" />\n      <span class=\"dmmc-toggle-label\">Chat Now</span>\n    </button>\n\n    \n    \n    <div id=\"dmmc-chat-window\" role=\"dialog\" aria-label=\"Chat with Spark, the Chi-Spark AI assistant\">\n      \n      <div id=\"dmmc-chat-header\">\n        <div class=\"dmmc-header-id\">\n          \n          <div class=\"dmmc-avatar\" aria-hidden=\"true\">\n            <img src=\"/spark-mark.png\" alt=\"Chi-Spark AI\" />\n          </div>\n          <div>\n            \n            <div class=\"dmmc-header-name\" id=\"dmmc-agent-name\">Spark - Chi-Spark AI</div>\n            <div class=\"dmmc-header-sub\">Programs, partnerships &amp; support</div>\n          </div>\n        </div>\n        <div>\n          <button class=\"dmmc-header-btn\" id=\"dmmc-live-agent\" title=\"Chat with a live agent\" hidden>Live Agent</button>\n          <button class=\"dmmc-header-btn\" id=\"dmmc-new-chat\" title=\"Start a new conversation\">New Chat</button>\n          <button class=\"dmmc-header-btn\" id=\"dmmc-close\" aria-label=\"Close chat\" style=\"font-size:16px\">&#10005;</button>\n        </div>\n      </div>\n\n      \n      <div id=\"dmmc-chat-feed\"></div>\n      \n      <form id=\"dmmc-chat-inputbar\">\n        <button type=\"button\" id=\"dmmc-chat-mic\" aria-label=\"Start voice conversation\" title=\"Start voice conversation\" hidden>\n          <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\n            <path d=\"M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"23\"/><line x1=\"8\" y1=\"23\" x2=\"16\" y2=\"23\"/>\n          </svg>\n        </button>\n        <input id=\"dmmc-chat-input\" type=\"text\" placeholder=\"Type your message...\" autocomplete=\"off\" aria-label=\"Type your message\" />\n        <button id=\"dmmc-chat-send\" type=\"submit\" aria-label=\"Send message\">\n          <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\n            <line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/>\n          </svg>\n        </button>\n      </form>\n      \n      <div id=\"dmmc-chat-branding\">\n        <a href=\"https://echovoicebot.com/?utm_source=tenant-widget&utm_medium=referral&utm_campaign=powered-by\" target=\"_blank\" rel=\"noopener\">\n          <img src=\"https://echovoicebot.com/echo-mark.png\" alt=\"Echo Voicebot\" loading=\"lazy\" />\n          <span>Powered by <strong>Echo Voicebot</strong></span>\n        </a>\n        <div class=\"dmmc-branding-tag\">AI that sells while you sleep.</div>\n      </div>\n    </div>");
    try {

    (function () {
      "use strict";

      /* ============ CONSTANTS ============ */
      var API_BASE    = "https://echovoicebot.com";                    // Echo Voicebot platform API (VPS, SSE + JSON)
      var TENANT_KEY  = "chispark";                                     // 360DMMC tenant in widget_tenant_config
      var SESSION_KEY = "dmmc-chat-session-id";                        // prefix apwc- -> dmmc-
      var GREETING    = "Hi! I'm Spark, the Chi-Spark AI assistant. " + "Ask me about our programs for Chicagoland teens and young adults, " + "how to apply, partner, volunteer, or support the mission. " + "How can I help?";

      /* ============ DOM HANDLES ============ */
      var toggleBtn = document.getElementById("dmmc-chat-toggle");     // floating pill button
      var windowEl  = document.getElementById("dmmc-chat-window");     // chat window shell
      var feedEl    = document.getElementById("dmmc-chat-feed");       // scrolling message feed
      var formEl    = document.getElementById("dmmc-chat-inputbar");   // input form (submit = send)
      var inputEl   = document.getElementById("dmmc-chat-input");      // text input
      var sendBtn   = document.getElementById("dmmc-chat-send");       // send button
      var closeBtn  = document.getElementById("dmmc-close");           // header close button
      var newBtn    = document.getElementById("dmmc-new-chat");        // header "New Chat" button
      // agentEl handle removed — the header title is now fixed and
      // no longer looked up/mutated by fetchConfig() (see below).

      var cbToggle = document.getElementById("dmmc-callback-toggle"); // "Have our AI call you" link
      var cbPanel  = document.getElementById("dmmc-callback-panel");  // expandable phone form
      var cbName   = document.getElementById("dmmc-cb-name");         // optional name field
      var cbPhone  = document.getElementById("dmmc-cb-phone");        // phone field
      var cbSubmit = document.getElementById("dmmc-cb-submit");       // "Call me" button
      var cbStatus = document.getElementById("dmmc-cb-status");       // inline status line

      /* AI callback removed for chispark (no Twilio). */

      /* ============ STATE ============ */
      var isOpen        = false;                                       // window open flag
      var isLoading     = false;                                       // request in flight flag
      var configFetched = false;                                       // only fetch config once
      var sessionId     = getOrCreateSessionId();                      // stable per-visitor session

      /* ============ VOICE MODE ============ */
      // Tap the mic once for a hands-free conversation: speech is
      // transcribed and auto-sent, the AI's reply is spoken aloud, then
      // listening resumes. Web Speech API (Chrome/Edge/Safari 14.1+).
      var micBtn      = document.getElementById("dmmc-chat-mic");      // mic toggle button
      var SpeechRec   = window.SpeechRecognition || window.webkitSpeechRecognition;
      var voiceMode   = false;                                         // hands-free loop active
      var recognition = null;                                          // live SpeechRecognition instance
      var isSpeaking  = false;                                         // TTS reply in progress

      var rtSupported = !!(window.RTCPeerConnection && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      if (micBtn && (SpeechRec || rtSupported)) {
        micBtn.hidden = false;                                         // only show where supported
        micBtn.addEventListener("click", toggleVoice);
      }

      function toggleVoice() {
        if (voiceMode) { stopVoice(); return; }
        voiceMode = true;
        micBtn.classList.add("dmmc-mic-on");
        micBtn.setAttribute("aria-label", "Stop voice conversation");
        micBtn.title = "Stop voice conversation";
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        isSpeaking = false;
        // Preferred path: OpenAI Realtime AI voice (same as the 844 phone
        // agent). Falls back to browser speech if unavailable.
        if (realtimeSupported()) {
          inputEl.placeholder = "AI voice active — just speak...";
          startRealtimeVoice().catch(function (err) {
            console.warn("Realtime voice unavailable, using browser speech:", err);
            rtHandle = null;
            if (voiceMode) {
              inputEl.placeholder = "Listening — speak now...";
              startListening();
            }
          });
          return;
        }
        inputEl.placeholder = "Listening — speak now...";
        startListening();
      }

      function stopVoice() {
        voiceMode = false;
        if (rtHandle) { try { rtHandle.stop(); } catch (e) {} rtHandle = null; }
        if (micBtn) {
          micBtn.classList.remove("dmmc-mic-on", "dmmc-mic-speaking");
          micBtn.setAttribute("aria-label", "Start voice conversation");
          micBtn.title = "Start voice conversation";
        }
        inputEl.placeholder = "Type your message...";
        if (recognition) { try { recognition.onend = null; recognition.stop(); } catch (e) {} recognition = null; }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        isSpeaking = false;
      }

      function startListening() {
        if (recognition || isSpeaking || isLoading || !voiceMode) return;
        recognition = new SpeechRec();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.onresult = function (event) {
          var transcript = "", finalText = "";
          for (var i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
            if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
          }
          inputEl.value = transcript;                                  // live transcript preview
          if (finalText.trim()) {
            inputEl.value = "";
            sendMessage(finalText.trim());                             // auto-send the utterance
          }
        };
        recognition.onend = function () {
          recognition = null;
          if (voiceMode && !isSpeaking && !isLoading) {
            setTimeout(function () {
              if (voiceMode && !isSpeaking && !isLoading) startListening();
            }, 350);
          }
        };
        recognition.onerror = function (event) {
          recognition = null;
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            stopVoice();                                               // mic permission denied → give up
            return;
          }
          if (voiceMode) {
            setTimeout(function () {
              if (voiceMode && !isSpeaking && !isLoading) startListening();
            }, 1000);
          }
        };
        try { recognition.start(); } catch (e) { recognition = null; }
      }

      function resumeListening() {
        if (voiceMode && !isSpeaking && !isLoading) startListening();
      }

      // Called by sendMessage() when the bot's reply is complete
      function voiceOnBotReply(text) {
        if (!voiceMode) return;
        if (text) speakReply(text); else resumeListening();
      }

      function speakReply(text) {
        if (!window.speechSynthesis) { resumeListening(); return; }
        var clean = String(text)
          .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")        // markdown links → label
          .replace(/https?:\/\/\S+/g, "")                              // bare URLs out
          .replace(/[*_`#>]/g, "")                                     // markdown punctuation out
          .replace(/\s+/g, " ").trim().slice(0, 600);
        if (!clean) { resumeListening(); return; }
        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = "en-US";
        utterance.rate = 1.02;
        isSpeaking = true;
        micBtn.classList.add("dmmc-mic-speaking");
        var done = function () {
          isSpeaking = false;
          micBtn.classList.remove("dmmc-mic-speaking");
          resumeListening();                                           // keep the conversation going
        };
        utterance.onend = done;
        utterance.onerror = done;
        window.speechSynthesis.speak(utterance);
      }
      /* ============ REALTIME AI VOICE (OpenAI gpt-realtime-2.1) ============ */
      // Preferred voice path — same stack as the VOZ ALTA phone agent.
      // WebRTC signaling is proxied through Echo (/api/chat/realtime-call), so
      // no OpenAI token touches the browser and visitors on networks that
      // block direct api.openai.com calls still get AI voice. Falls back to
      // the browser speech loop above if the connection can't be established.
      var rtHandle    = null;                                          // live realtime session handle
      var rtConnected = false;                                         // realtime session came up
      var rtWatchdog  = null;                                          // connect-timeout timer

      function realtimeSupported() {
        return !!window.RTCPeerConnection &&
               !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      }

      function startRealtimeVoice() {
        rtConnected = false;
        var assistantBubble = null;
        var assistantText = "";
        var pc, mic, dc, audioEl;

        var cleanup = function () {
          try { if (mic) mic.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
          try { if (pc) pc.close(); } catch (e) {}
          try { if (audioEl) { audioEl.srcObject = null; audioEl.remove(); } } catch (e) {}
        };

        pc = new RTCPeerConnection();
        audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        audioEl.playsInline = true;
        audioEl.style.display = "none";
        document.body.appendChild(audioEl);
        try { var up = audioEl.play(); if (up && up.catch) up.catch(function () {}); } catch (e) {}
        pc.ontrack = function (event) {
          audioEl.srcObject = event.streams[0];
          try { var ap = audioEl.play(); if (ap && ap.catch) ap.catch(function () {}); } catch (e) {}
        };

        return navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function (stream) {
            mic = stream;
            mic.getTracks().forEach(function (track) { pc.addTrack(track, mic); });

            dc = pc.createDataChannel("oai-events");
            var sendEvent = function (payload) {
              if (dc.readyState === "open") dc.send(JSON.stringify(payload));
            };

            var handleToolCall = function (msg) {
              var args = {};
              try { args = JSON.parse(msg.arguments || "{}"); } catch (e) {}
              var url = msg.name === "save_lead" ? "/api/chat/voice-lead"
                      : msg.name === "request_human" ? "/api/chat/voice-handoff"
                      : msg.name === "send_verification" ? "/api/chat/send-verification"
                      : msg.name === "verify_code" ? "/api/chat/verify-code" : null;
              if (!url) {
                sendEvent({ type: "conversation.item.create", item: { type: "function_call_output", call_id: msg.call_id, output: JSON.stringify({ success: false, error: "unknown_tool" }) } });
                sendEvent({ type: "response.create" });
                return;
              }
              args.tenantKey = TENANT_KEY;
              args.sessionId = sessionId;
              fetch(API_BASE + url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-key": TENANT_KEY },
                body: JSON.stringify(args)
              })
                .then(function (res) { return res.json().catch(function () { return { success: res.ok }; }); })
                .then(function (result) {
                  if (msg.name === "request_human" && result.success) {
                    addMessage("bot", "You've been connected to our team — someone will follow up with you shortly.");
                  }
                  sendEvent({
                    type: "conversation.item.create",
                    item: { type: "function_call_output", call_id: msg.call_id, output: JSON.stringify(result) }
                  });
                  sendEvent({ type: "response.create" });
                })
                .catch(function () {
                  sendEvent({
                    type: "conversation.item.create",
                    item: { type: "function_call_output", call_id: msg.call_id, output: JSON.stringify({ success: false }) }
                  });
                  sendEvent({ type: "response.create" });
                });
            };

            dc.onopen = function () { rtConnected = true; };
            dc.onmessage = function (event) {
              var msg;
              try { msg = JSON.parse(event.data); } catch (e) { return; }
              rtConnected = true;
              if (msg.type === "session.created") {
                sendEvent({ type: "response.create" });              // trigger the greeting
              } else if (msg.type === "conversation.item.input_audio_transcription.completed") {
                if (msg.transcript) addMessage("user", msg.transcript);
              } else if (msg.type === "response.audio_transcript.delta" || msg.type === "response.output_audio_transcript.delta") {
                if (!msg.delta) return;
                if (!assistantBubble) {
                  assistantBubble = addMessage("bot", "");
                  assistantText = "";
                }
                assistantText += msg.delta;
                renderInto(assistantBubble, assistantText);
                scrollFeed();
              } else if (msg.type === "response.audio_transcript.done" || msg.type === "response.output_audio_transcript.done") {
                assistantBubble = null;
                assistantText = "";
              } else if (msg.type === "response.function_call_arguments.done") {
                handleToolCall(msg);
              }
            };

            // Watchdog: never connected within 15s → bail to browser speech
            rtWatchdog = setTimeout(function () {
              if (!rtConnected && voiceMode) {
                console.warn("Realtime voice connection timed out — using browser speech");
                cleanup();
                rtHandle = null;
                if (voiceMode) {
                  inputEl.placeholder = "Listening — speak now...";
                  startListening();
                }
              }
            }, 15000);

            return pc.createOffer();
          })
          .then(function (offer) { return pc.setLocalDescription(offer); })
          .then(function () {
            // Server-proxied SDP handshake (offer → Echo → OpenAI → answer)
            return fetch(API_BASE + "/api/chat/realtime-call", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-tenant-key": TENANT_KEY },
              body: JSON.stringify({ tenantKey: TENANT_KEY, sdp: pc.localDescription.sdp })
            });
          })
          .then(function (res) {
            return res.json().then(function (data) {
              if (!res.ok || !data.sdp) {
                throw new Error(data.message || ("Voice call setup failed (" + res.status + ")"));
              }
              return data;
            });
          })
          .then(function (data) {
            return pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
          })
          .then(function () {
            pc.onconnectionstatechange = function () {
              if (["failed", "closed", "disconnected"].indexOf(pc.connectionState) !== -1) {
                clearTimeout(rtWatchdog);
                if (voiceMode) {
                  if (rtConnected) { stopVoice(); }                  // was live, then dropped
                  else { rtHandle = null; startListening(); }        // never came up → fallback
                }
              }
            };
            var stopped = false;
            rtHandle = {
              stop: function () {
                if (stopped) return;
                stopped = true;
                clearTimeout(rtWatchdog);
                try { dc.close(); } catch (e) {}
                cleanup();
              }
            };
          })
          .catch(function (err) {
            clearTimeout(rtWatchdog);
            cleanup();
            throw err;
          });
      }

      /* ============ SESSION ID ============ */
      function getOrCreateSessionId() {
        var id = null;
        try { id = localStorage.getItem(SESSION_KEY); } catch (e) {}   // localStorage can throw (privacy mode)
        if (!id) {                                                     // nothing stored yet →
          id = (window.crypto && crypto.randomUUID)                    // prefer the native UUID API
            ? crypto.randomUUID()                                      // modern browsers
            : "dmmc-" + Date.now() + "-" + Math.random().toString(16).slice(2); // fallback id
          try { localStorage.setItem(SESSION_KEY, id); } catch (e) {}  // best-effort persist
        }
        return id;                                                     // hand back the session id
      }

      /* ============ TENANT CONFIG (greeting only — header title is fixed) ============ */
      function fetchConfig() {
        if (configFetched) return;                                     // one fetch per page load
        configFetched = true;                                          // mark before the async call
        fetch(API_BASE + "/api/chat/config", {                         // POST the tenant key
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantKey: TENANT_KEY })
        })
          .then(function (r) { return r.ok ? r.json() : null; })       // parse only on 2xx
          .then(function (cfg) {
            if (!cfg) return;                                          // keep fallbacks on failure
            if (cfg.greeting) GREETING = cfg.greeting;                 // live greeting still wins
            var g = feedEl.querySelector("[data-dmmc-greeting]");      // greeting bubble already shown?
            if (g) g.textContent = cfg.greeting || GREETING;           // refresh it in place
            if (cfg.features && cfg.features.human_handoff) {          // live-agent feature on →
              liveBtn.hidden = false;                                  // reveal header button
              fetch(API_BASE + "/api/chat/live/status", {              // probe agent availability
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-key": TENANT_KEY },
                body: JSON.stringify({ tenantKey: TENANT_KEY })
              })
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (st) { if (st && st.available) liveBtn.classList.add("dmmc-live-online"); })
                .catch(function () {});
            }
          })
          .catch(function () {});                                      // network error → fallbacks stand
      }

      /* ============ FEED HELPERS ============ */
      function scrollFeed() {
        feedEl.scrollTop = feedEl.scrollHeight;                        // pin feed to the newest message
      }

      // Build a bot avatar node (clones the header roundel)
      function makeAvatar() {
        var av = document.querySelector("#dmmc-chat-header .dmmc-avatar").cloneNode(true);
        return av;                                                     // fresh copy per bot row
      }

      // Render text into a bubble, turning bare URLs into safe <a> links.
      // DOM nodes only (textContent) — no innerHTML, so no injection risk.
      function renderInto(el, text) {
        el.textContent = "";                                           // clear previous render
        // token = markdown link | bare URL | **bold** — DOM nodes only, no innerHTML
        var tokRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)|\*\*([^*]+)\*\*/g;
        var str = String(text), last = 0, m;
        function pushText(t) { if (t) el.appendChild(document.createTextNode(t)); }
        function pushLink(label, href) {
          var a = document.createElement("a");                         // build a real anchor
          a.href = href;                                               // link target
          a.target = "_blank";                                         // open in new tab
          a.rel = "noopener noreferrer";                               // safe new-tab link
          a.textContent = label;                                       // visible label
          el.appendChild(a);                                           // attach to bubble
        }
        while ((m = tokRe.exec(str)) !== null) {
          pushText(str.slice(last, m.index));                          // text before the token
          if (m[1] !== undefined) pushLink(m[1], m[2]);                // [label](url)
          else if (m[3] !== undefined) pushLink(m[3], m[3]);           // bare URL
          else {                                                       // **bold**
            var b = document.createElement("strong");
            b.textContent = m[4];
            el.appendChild(b);
          }
          last = tokRe.lastIndex;
        }
        pushText(str.slice(last));                                     // trailing text
      }

      // Append a message row; returns the bubble element (for streaming updates)
      function addMessage(role, text, isGreeting) {
        var row = document.createElement("div");                       // row wrapper
        row.className = "dmmc-row" + (role === "user" ? " dmmc-row-user" : "");
        var bubble = document.createElement("div");                    // the bubble itself
        bubble.className = "dmmc-bubble dmmc-bubble-" + role;          // role-specific styling
        if (isGreeting) bubble.setAttribute("data-dmmc-greeting", ""); // tag so config can refresh it
        renderInto(bubble, text);                                      // safe text/link render
        if (role === "bot") row.appendChild(makeAvatar());             // avatar on bot rows only
        row.appendChild(bubble);                                       // bubble into row
        feedEl.appendChild(row);                                       // row into feed
        scrollFeed();                                                  // keep newest in view
        return bubble;                                                 // caller may stream into it
      }

      // Show / hide the three-dot typing indicator
      function showTyping() {
        var row = document.createElement("div");                       // indicator row
        row.className = "dmmc-row";                                    // bot-side alignment
        row.id = "dmmc-typing";                                        // handle for removal
        row.appendChild(makeAvatar());                                 // bot avatar
        var bubble = document.createElement("div");                    // bubble shell
        bubble.className = "dmmc-bubble dmmc-bubble-bot";              // bot styling
        bubble.innerHTML =                                             // static, trusted markup
          '<div class="dmmc-dots" aria-label="Assistant is typing">' +
          '<span class="dmmc-dot"></span><span class="dmmc-dot"></span><span class="dmmc-dot"></span></div>';
        row.appendChild(bubble);                                       // assemble
        feedEl.appendChild(row);                                       // show it
        scrollFeed();                                                  // keep in view
      }
      function hideTyping() {
        var t = document.getElementById("dmmc-typing");                // find indicator
        if (t) t.remove();                                             // remove if present
      }

      /* ============ LIVE AGENT MODE ============ */
      // Talk-to-a-human flow: check availability, open an SSE channel, and
      // hand the conversation to a live agent. Falls back to the AI (which
      // then captures contact details) if nobody interacts in time.
      var liveBtn       = document.getElementById("dmmc-live-agent");
      var liveState     = "off";                                   // off | pending | active
      var liveSource    = null;                                    // EventSource during live flow
      var liveAgentName = null;                                    // claimed agent's display name
      var lastUserText  = "";                                      // context sent with live requests

      function openLiveStream() {
        if (liveSource) liveSource.close();
        liveSource = new EventSource(
          API_BASE + "/api/chat/live/stream?tenantKey=" + encodeURIComponent(TENANT_KEY) +
          "&sessionId=" + encodeURIComponent(sessionId)
        );
        liveSource.addEventListener("state", function (e) {
          var d; try { d = JSON.parse(e.data); } catch (err) { return; }
          if (d.state === "active" && liveState !== "active") {      // transition only (SSE reconnects re-send state)
            liveState = "active";
            liveAgentName = (d.agent && d.agent.name) || "Agent";
            inputEl.placeholder = "Chatting with " + liveAgentName + "…";
            addMessage("bot", liveAgentName + " joined the chat — you're now talking to a live agent.");
          } else if (d.state === "fallback" && liveState !== "off") {
            liveState = "off"; liveAgentName = null;
            inputEl.placeholder = "Type your message...";
            // the AI's lead-capture reply arrives as bot_message
          } else if (d.state === "closed" && liveState !== "off") {
            liveState = "off"; liveAgentName = null;
            inputEl.placeholder = "Type your message...";
            addMessage("bot", "The live chat has ended. I'm still here if you need anything!");
            if (liveSource) { liveSource.close(); liveSource = null; }
          }
          scrollFeed();
        });
        liveSource.addEventListener("agent_message", function (e) {
          var d; try { d = JSON.parse(e.data); } catch (err) { return; }
          renderInto(addMessage("bot", ""), (d.name ? d.name + ": " : "") + d.text);
          scrollFeed();
        });
        liveSource.addEventListener("bot_message", function (e) {
          var d; try { d = JSON.parse(e.data); } catch (err) { return; }
          renderInto(addMessage("bot", ""), d.text);
          scrollFeed();
        });
      }

      function startLiveRequest() {
        if (liveState === "pending" || liveState === "active") return;
        liveState = "pending";
        stopVoice();                                               // live typing, not voice
        addMessage("bot", "One moment — connecting you to a live agent…");
        fetch(API_BASE + "/api/chat/live/request", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-tenant-key": TENANT_KEY },
          body: JSON.stringify({ tenantKey: TENANT_KEY, sessionId: sessionId, lastText: lastUserText })
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d.state === "fallback") {                          // nobody online right now
              liveState = "off";
              if (d.fallbackText) renderInto(addMessage("bot", ""), d.fallbackText);
            }
            openLiveStream();                                      // track any later state change
          })
          .catch(function () {
            liveState = "off";
            addMessage("bot", "Sorry, I couldn't reach the live team right now. Please try again, or call us at (773) 917-0291.");
          });
      }

      if (liveBtn) liveBtn.addEventListener("click", startLiveRequest);

      /* ============ OPEN / CLOSE ============ */
      function openChat() {
        isOpen = true;                                                 // track state
        windowEl.classList.add("dmmc-open");                           // display:flex
        requestAnimationFrame(function () {                            // next frame →
          requestAnimationFrame(function () {                          // (double rAF = safe transition)
            windowEl.classList.add("dmmc-visible");                    // fade/slide in
          });
        });
        toggleBtn.style.display = "none";                              // hide pill while open
        if (!feedEl.childElementCount) addMessage("bot", GREETING, true); // greeting on first open
        fetchConfig();                                                 // refresh greeting only (also warms backend)
        setTimeout(function () { inputEl.focus(); }, 120);             // focus after animation
      }
      function closeChat() {
        isOpen = false;                                                // track state
        stopVoice();                                                   // mic + TTS off with the window
        windowEl.classList.remove("dmmc-visible");                     // start fade out
        setTimeout(function () {                                       // after transition →
          windowEl.classList.remove("dmmc-open");                      // display:none
          toggleBtn.style.display = "flex";                            // bring pill back
        }, 200);
      }

      /* ============ GLOBAL OPENER (phone-number links) ============ */
      window.__chiChatOpen = function (withVoice) {                  // called by tel: replacement links
        if (!isOpen) openChat();                                     // open widget if still closed
        if (withVoice && micBtn && !micBtn.hidden && !voiceMode) {   // voice wanted + supported + not on
          setTimeout(function () { toggleVoice(); }, 400);           // start AI voice after open animation
        }
      };

      /* ============ SEND + SSE STREAM ============ */
      function sendMessage(text) {
        var trimmed = text.trim();                                     // normalize input
        if (!trimmed || isLoading) return;                             // ignore empty / double-send

        lastUserText = trimmed;                                        // context for live requests
        if (liveState === "active") {                                  // live mode → straight to the agent
          addMessage("user", trimmed);                                 // echo locally
          inputEl.value = "";                                          // clear the input
          fetch(API_BASE + "/api/chat/live/send", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-tenant-key": TENANT_KEY },
            body: JSON.stringify({ tenantKey: TENANT_KEY, sessionId: sessionId, text: trimmed })
          })
            .then(function (r) {
              if (r.status === 409) {                                  // session no longer live
                liveState = "off";
                inputEl.placeholder = "Type your message...";
              }
            })
            .catch(function () {
              addMessage("bot", "That message couldn't be delivered — the agent may have disconnected. I'm still here!");
            });
          return;                                                      // AI stays silent while live
        }

        addMessage("user", trimmed);                                   // echo user's message
        inputEl.value = "";                                            // clear the input
        isLoading = true;                                              // lock while in flight
        inputEl.disabled = true;                                       // freeze input
        sendBtn.disabled = true;                                       // freeze send
        showTyping();                                                  // three-dot indicator

        fetch(API_BASE + "/api/chat/message", {                        // hit the streaming endpoint
          method: "POST",
          headers: {
            "Content-Type": "application/json",                        // JSON body
            "x-tenant-key": TENANT_KEY                                 // tenant header
          },
          body: JSON.stringify({
            tenantKey: TENANT_KEY,                                     // tenant in body too
            chatInput: trimmed,                                        // the user's message
            sessionId: sessionId                                       // conversation continuity
          })
        })
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);        // non-2xx → error path
            var ct = res.headers.get("content-type") || "";            // backend returns JSON for FAQ/handoff replies
            if (ct.indexOf("application/json") !== -1) {
              return res.json().then(function (data) {
                hideTyping();
                var out = (data && data.output) || "";
                if (out) {
                  renderInto(addMessage("bot", ""), out);
                  voiceOnBotReply(out);                                // speak it in voice mode
                }
                if (data && (data.mode === "live_pending" || data.mode === "live")) {
                  liveState = data.mode === "live" ? "active" : "pending";
                  openLiveStream();                                    // follow the live session
                }
                scrollFeed();
              });
            }
            hideTyping();                                              // dots off, stream begins
            var bubble = addMessage("bot", "");                        // empty bubble to fill
            var reader  = res.body.getReader();                        // raw byte stream reader
            var decoder = new TextDecoder();                           // bytes → text
            var content = "";                                          // accumulated reply
            var buffer  = "";                                          // partial-line buffer

            function pump() {                                          // recursive read loop
              return reader.read().then(function (chunk) {
                if (chunk.done) {                                      // stream finished →
                  if (!content) renderInto(bubble, "No response received."); // guard empty stream
                  voiceOnBotReply(content);                            // speak it in voice mode
                  return;                                              // done
                }
                buffer += decoder.decode(chunk.value, { stream: true }); // append decoded bytes
                var lines = buffer.split("\n");                        // split into SSE lines
                buffer = lines.pop();                                  // keep incomplete tail
                for (var i = 0; i < lines.length; i++) {
                  var line = lines[i].trim();                          // normalize the line
                  if (line.indexOf("data:") !== 0) continue;           // only data: lines matter
                  var payload = line.slice(5).trim();                  // strip "data:" prefix
                  if (!payload || payload === "[DONE]") continue;      // skip keepalive / done marker
                  try {
                    var evt = JSON.parse(payload);                     // parse the event JSON
                    if (evt.delta) {                                   // token event →
                      content += evt.delta;                            // append the token
                      renderInto(bubble, content);                     // re-render bubble
                      scrollFeed();                                    // keep in view
                    }
                  } catch (e) {}                                       // ignore non-JSON data lines
                }
                return pump();                                         // read the next chunk
              });
            }
            return pump();                                             // start the loop
          })
          .catch(function () {                                         // network / HTTP failure →
            hideTyping();                                              // dots off
            addMessage("bot", "Sorry, something went wrong. Please try again in a moment, or call us at (773) 917-0291.");
            voiceOnBotReply("");                                       // resume listening after error
          })
          .then(function () {                                          // always (finally) →
            isLoading = false;                                         // unlock
            inputEl.disabled = false;                                  // re-enable input
            sendBtn.disabled = false;                                  // re-enable send
            inputEl.focus();                                           // ready for next message
          });
      }

      /* ============ NEW CONVERSATION ============ */
      function newConversation() {
        sessionId = (window.crypto && crypto.randomUUID)               // mint a fresh session id
          ? crypto.randomUUID()
          : "dmmc-" + Date.now() + "-" + Math.random().toString(16).slice(2); // fallback id
        try { localStorage.setItem(SESSION_KEY, sessionId); } catch (e) {} // persist the new id
        feedEl.textContent = "";                                       // clear the feed
        addMessage("bot", GREETING, true);                             // greet again
      }

      /* ============ EVENT WIRING ============ */
      toggleBtn.addEventListener("click", openChat);                   // pill opens the window
      closeBtn.addEventListener("click", closeChat);                   // X closes it
      newBtn.addEventListener("click", newConversation);               // header New Chat
      formEl.addEventListener("submit", function (e) {                 // Enter / send button
        e.preventDefault();                                            // stay on page
        sendMessage(inputEl.value);                                    // fire the message
      });
      window.addEventListener("keydown", function (e) {                // Escape closes when open
        if (e.key === "Escape" && isOpen) closeChat();
      });
    })();
    
    } catch (err) { if (window.console) console.error("echo-widget boot failed", err); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
