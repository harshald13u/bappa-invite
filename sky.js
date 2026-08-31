(function(){
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function moonImg(S){
    var c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'), r = S / 2;
    var base = g.createRadialGradient(r * .8, r * .75, r * .1, r, r, r);
    base.addColorStop(0, '#f4f2ec');
    base.addColorStop(.55, '#d9d7d0');
    base.addColorStop(.85, '#b7b5ae');
    base.addColorStop(1, '#9a988f');
    g.fillStyle = base;
    g.beginPath(); g.arc(r, r, r * .96, 0, 6.2832); g.fill();
    var craters = [[.32,.38,.13],[.62,.3,.08],[.55,.62,.16],[.78,.55,.07],[.4,.72,.09],[.7,.78,.06],[.25,.58,.06]];
    for (var i = 0; i < craters.length; i++){
      var cx = craters[i][0] * S, cy = craters[i][1] * S, cr = craters[i][2] * S;
      var cg = g.createRadialGradient(cx - cr * .2, cy - cr * .2, cr * .1, cx, cy, cr);
      cg.addColorStop(0, 'rgba(130,128,120,.05)');
      cg.addColorStop(.75, 'rgba(120,118,110,.28)');
      cg.addColorStop(.9, 'rgba(160,158,150,.15)');
      cg.addColorStop(1, 'rgba(160,158,150,0)');
      g.fillStyle = cg;
      g.beginPath(); g.arc(cx, cy, cr, 0, 6.2832); g.fill();
    }
    var sh = g.createRadialGradient(r * 1.25, r * 1.2, r * .2, r, r, r);
    sh.addColorStop(0, 'rgba(40,50,70,0)');
    sh.addColorStop(.8, 'rgba(40,50,70,0)');
    sh.addColorStop(1, 'rgba(30,40,60,.35)');
    g.fillStyle = sh;
    g.beginPath(); g.arc(r, r, r * .96, 0, 6.2832); g.fill();
    return c.toDataURL();
  }
  function sunImg(S){
    var c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'), r = S / 2;
    var gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,252,240,1)');
    gr.addColorStop(.18, 'rgba(255,244,205,1)');
    gr.addColorStop(.3, 'rgba(255,215,122,.95)');
    gr.addColorStop(.45, 'rgba(255,185,90,.5)');
    gr.addColorStop(.7, 'rgba(255,165,80,.16)');
    gr.addColorStop(1, 'rgba(255,150,70,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
    return c.toDataURL();
  }

  var wrap = document.createElement('div');
  wrap.id = 'celestial';
  wrap.innerHTML = '<img id="skyMoon" alt=""><img id="skySun" alt="">';
  var st = document.createElement('style');
  st.textContent =
    '#celestial{position:fixed;left:0;top:0;width:100%;height:56vh;overflow:hidden;z-index:0;pointer-events:none}' +
    '#skyMoon,#skySun{position:absolute;left:0;top:0;will-change:transform,opacity}' +
    '#skyMoon{width:64px;height:64px;filter:drop-shadow(0 0 18px rgba(214,220,235,.45))}' +
    '#skySun{width:190px;height:190px;margin:-95px 0 0 -95px}' +
    '@media (min-width:701px){#skyMoon{width:84px;height:84px}#skySun{width:260px;height:260px;margin:-130px 0 0 -130px}}';
  document.head.appendChild(st);
  var cv = document.getElementById('scene');
  if (cv && cv.parentNode) cv.parentNode.insertBefore(wrap, cv.nextSibling);
  else document.body.appendChild(wrap);
  var moon = document.getElementById('skyMoon');
  var sun = document.getElementById('skySun');
  moon.src = moonImg(128);
  sun.src = sunImg(256);

  var MOON = [
    [0.00, 74, 14, 1, 1],
    [0.10, 58, 24, 1, 1],
    [0.20, 34, 42, .9, 1.05],
    [0.26, 24, 56, 0, 1.1],
    [0.78, 30, 58, 0, 1.1],
    [0.86, 33, 44, .9, 1.05],
    [1.00, 40, 15, 1, 1]
  ];
  var SUN = [
    [0.00, 40, 70, 0, 1.15],
    [0.20, 42, 62, 0, 1.15],
    [0.27, 45, 46, .95, 1.1],
    [0.40, 50, 16, 1, .92],
    [0.52, 55, 13, 1, .9],
    [0.64, 60, 24, 1, 1],
    [0.74, 64, 44, .95, 1.15],
    [0.82, 66, 60, 0, 1.25],
    [1.00, 66, 70, 0, 1.25]
  ];
  function at(path, t){
    var i = 0;
    while (i < path.length - 2 && t > path[i + 1][0]) i++;
    var a = path[i], b = path[i + 1];
    var k = (t - a[0]) / (b[0] - a[0]);
    k = Math.max(0, Math.min(1, k));
    k = k * k * (3 - 2 * k);
    return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k,
            a[3] + (b[3] - a[3]) * k, a[4] + (b[4] - a[4]) * k];
  }
  var target = 0, cur = -1;
  function read(){
    var max = document.body.scrollHeight - window.innerHeight;
    target = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  }
  window.addEventListener('scroll', read, {passive: true});
  window.addEventListener('resize', read);
  read();
  function tick(){
    requestAnimationFrame(tick);
    if (Math.abs(target - (cur < 0 ? 0 : cur)) < 0.0004 && cur >= 0) return;
    cur = cur < 0 ? target : cur + (target - cur) * 0.09;
    var vw = window.innerWidth, vh = window.innerHeight;
    var m = at(MOON, cur);
    moon.style.transform = 'translate(' + (m[0] / 100 * vw - 32) + 'px,' + (m[1] / 100 * vh - 32) + 'px) scale(' + m[3] + ')';
    moon.style.opacity = m[2];
    var s = at(SUN, cur);
    sun.style.transform = 'translate(' + (s[0] / 100 * vw) + 'px,' + (s[1] / 100 * vh) + 'px) scale(' + s[3] + ')';
    sun.style.opacity = s[2];
    var warm = Math.max(0, 1 - Math.abs(cur - 0.27) * 8) + Math.max(0, 1 - Math.abs(cur - 0.76) * 8);
    sun.style.filter = 'hue-rotate(' + (-warm * 14) + 'deg) saturate(' + (1 + warm * .5) + ')';
  }
  tick();
})();
