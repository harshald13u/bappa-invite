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
  btn.setAttribute('aria-label', 'Music on/off');
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

  function wireCues(){
    var basecue = document.querySelector('.cue');
    var ps = document.querySelectorAll('main .panel');
    if (!basecue || !ps.length) return;
    for (var p0 = 0; p0 < ps.length - 1; p0++){
      var el = p0 === 0 ? basecue : basecue.cloneNode(true);
      if (p0 > 0) ps[p0].appendChild(el);
      (function(idx, node){
        node.addEventListener('click', function(){
          var nx = document.querySelectorAll('main .panel')[idx + 1];
          if (nx) nx.scrollIntoView({behavior: 'smooth'});
        });
      })(p0, el);
    }
  }
  wireCues();

  function pluck(freq, t, vol){
    var o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = freq;
    var o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = freq * 1.003;
    var f = ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(freq * 9, t);
    f.frequency.exponentialRampToValueAtTime(freq * 2.2, t + 1.6);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(lp);
    o1.start(t); o2.start(t); o1.stop(t + 2.8); o2.stop(t + 2.8);
  }

  function bell(t, vol){
    var parts = [[660, 1], [1782, .5], [2394, .28], [3960, .12]];
    for (var i = 0; i < parts.length; i++){
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = parts[i][0];
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol * parts[i][1], t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5 - i * 0.5);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 4);
    }
  }

  function flutePhrase(t0){
    var scale = [392, 440, 493.88, 587.33, 659.26, 784];
    var motifs = [[0,1,2,1,0],[2,3,4,3],[4,3,2,1,0,0],[1,2,3,4,5,4],[3,2,1,2,0]];
    var motif = motifs[Math.floor(Math.random() * motifs.length)];
    var o = ctx.createOscillator(); o.type = 'triangle';
    var vib = ctx.createOscillator(); vib.frequency.value = 5.1;
    var vg = ctx.createGain(); vg.gain.value = 3.5;
    vib.connect(vg); vg.connect(o.frequency);
    var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2300;
    var g = ctx.createGain(); g.gain.value = 0;
    o.connect(f); f.connect(g); g.connect(master);
    var t = t0, dur;
    o.frequency.setValueAtTime(scale[motif[0]], t);
    for (var i = 0; i < motif.length; i++){
      dur = 0.9 + Math.random() * 0.7;
      o.frequency.setTargetAtTime(scale[motif[i]], t, 0.06);
      g.gain.setTargetAtTime(0.045, t + 0.02, 0.15);
      t += dur;
    }
    g.gain.setTargetAtTime(0, t - 0.3, 0.4);
    o.start(t0); vib.start(t0);
    o.stop(t + 2); vib.stop(t + 2);
  }

  function omVoice(detune, phaseMs){
    var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 108 + detune;
    var f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 8;
    var f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 9;
    var m1 = ctx.createGain(); m1.gain.value = 1.0;
    var m2 = ctx.createGain(); m2.gain.value = .7;
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
      vg.gain.exponentialRampToValueAtTime(1.15, t + 1.6);
      f1.frequency.linearRampToValueAtTime(300, t + 4.6);
      f2.frequency.linearRampToValueAtTime(430, t + 4.6);
      vg.gain.setValueAtTime(1.15, t + 4.6);
      vg.gain.exponentialRampToValueAtTime(.6, t + 7.2);
      vg.gain.exponentialRampToValueAtTime(.0001, t + 8.8);
    }
    timers.push(setTimeout(function(){ cycle(); timers.push(setInterval(cycle, 9200)); }, phaseMs));
  }

  function build(){
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700;
    lp.connect(master);
    var drone = [[54, .04], [108, .1], [216, .1], [217.3, .05], [324, .07]];
    for (var i = 0; i < drone.length; i++){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = drone[i][0]; g.gain.value = drone[i][1];
      o.connect(g); g.connect(lp); o.start();
    }
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
    playing = true;
    omVoice(0, 0); omVoice(.9, 3000); omVoice(-.7, 6100);
    var notes = [98.0, 130.81, 130.81, 65.41], step = 0;
    function tanpura(){
      if (!ctx || !playing) return;
      pluck(notes[step % 4], ctx.currentTime + 0.03, 0.10);
      step++;
    }
    timers.push(setInterval(tanpura, 1150));
    tanpura();
    function scheduleFlute(){
      timers.push(setTimeout(function(){
        if (playing && ctx) flutePhrase(ctx.currentTime + 0.05);
        scheduleFlute();
      }, 16000 + Math.random() * 14000));
    }
    timers.push(setTimeout(function(){ if (playing && ctx) flutePhrase(ctx.currentTime + 0.05); }, 7000));
    scheduleFlute();
    function scheduleBell(){
      timers.push(setTimeout(function(){
        if (playing && ctx) bell(ctx.currentTime + 0.05, 0.05);
        scheduleBell();
      }, 40000 + Math.random() * 30000));
    }
    timers.push(setTimeout(function(){ if (playing && ctx) bell(ctx.currentTime + 0.05, 0.05); }, 2000));
    scheduleBell();
    btn.classList.add('on');
    master.gain.setTargetAtTime(.2, ctx.currentTime, .9);
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
