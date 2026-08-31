(function(){
  'use strict';
  var ctx = null, master = null, lp = null;
  var playing = false, userStopped = false, timers = [];

  var unlock = document.createElement('audio');
  unlock.setAttribute('playsinline', '');
  unlock.loop = true;
  unlock.src = 'data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

  var btn = document.createElement('button');
  btn.id = 'omBtn';
  btn.setAttribute('aria-label', 'Om chant on/off');
  btn.innerHTML = '&#2384;';
  var st = document.createElement('style');
  st.textContent = '#omBtn{position:fixed;top:calc(14px + env(safe-area-inset-top,0px));right:14px;z-index:9999;' +
    'width:42px;height:42px;border-radius:50%;border:1px solid rgba(232,163,61,.5);' +
    'background:rgba(8,17,28,.5);color:#E8A33D;font-size:20px;line-height:40px;text-align:center;' +
    'padding:0;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
    'opacity:.5;transition:opacity .4s}' +
    '#omBtn.on{opacity:.95;animation:omPulse 6s ease-in-out infinite}' +
    '@keyframes omPulse{0%,100%{box-shadow:0 0 8px 1px rgba(232,163,61,.2)}50%{box-shadow:0 0 20px 4px rgba(232,163,61,.5)}}';
  document.head.appendChild(st);
  document.body.appendChild(btn);

  function osc(freq, gain, type){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq; g.gain.value = gain;
    o.connect(g); g.connect(lp); o.start();
  }

  function voice(detune, phaseMs){
    var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 108 + detune;
    var f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 8;
    var f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 9;
    var m1 = ctx.createGain(); m1.gain.value = .85;
    var m2 = ctx.createGain(); m2.gain.value = .55;
    var vg = ctx.createGain(); vg.gain.value = 0;
    o.connect(f1); o.connect(f2);
    f1.connect(m1); f2.connect(m2);
    m1.connect(vg); m2.connect(vg); vg.connect(lp);
    o.start();
    function cycle(){
      var t = ctx.currentTime + 0.05;
      f1.frequency.cancelScheduledValues(t); f2.frequency.cancelScheduledValues(t);
      vg.gain.cancelScheduledValues(t);
      f1.frequency.setValueAtTime(470, t);
      f2.frequency.setValueAtTime(950, t);
      vg.gain.setValueAtTime(0.0001, t);
      vg.gain.exponentialRampToValueAtTime(.9, t + 1.8);
      f1.frequency.linearRampToValueAtTime(300, t + 4.6);
      f2.frequency.linearRampToValueAtTime(430, t + 4.6);
      vg.gain.setValueAtTime(.9, t + 4.6);
      vg.gain.exponentialRampToValueAtTime(.45, t + 7.2);
      vg.gain.exponentialRampToValueAtTime(.0001, t + 8.8);
    }
    timers.push(setTimeout(function(){
      cycle();
      timers.push(setInterval(cycle, 9200));
    }, phaseMs));
  }

  function build(){
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    master.connect(ctx.destination);
    lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700;
    lp.connect(master);
    osc(54, .05); osc(108, .15); osc(216, .16); osc(217.3, .07);
    osc(324, .11); osc(432, .07); osc(540, .045);
  }

  function clearTimers(){
    for (var i = 0; i < timers.length; i++){ clearTimeout(timers[i]); clearInterval(timers[i]); }
    timers = [];
  }

  function startAudio(){
    if (!ctx) build();
    if (ctx.resume) ctx.resume();
    unlock.play().catch(function(){});
    clearTimers();
    voice(0, 0); voice(.8, 4600);
    playing = true;
    btn.classList.add('on');
    master.gain.setTargetAtTime(.22, ctx.currentTime, .9);
  }

  function stopAudio(){
    if (!ctx) return;
    playing = false;
    btn.classList.remove('on');
    master.gain.setTargetAtTime(0, ctx.currentTime, .25);
    clearTimers();
    unlock.pause();
    setTimeout(function(){ if (!playing && ctx && ctx.suspend) ctx.suspend(); }, 1200);
  }

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    if (playing){ userStopped = true; stopAudio(); }
    else { userStopped = false; startAudio(); }
  });

  function kick(){
    document.removeEventListener('touchend', kick);
    document.removeEventListener('click', kick);
    if (!playing && !userStopped) startAudio();
  }
  document.addEventListener('touchend', kick, {passive: true});
  document.addEventListener('click', kick);

  document.addEventListener('visibilitychange', function(){
    if (!ctx) return;
    if (document.hidden){ if (playing){ if (ctx.suspend) ctx.suspend(); unlock.pause(); } }
    else if (playing){ if (ctx.resume) ctx.resume(); unlock.play().catch(function(){}); }
  });
})();
