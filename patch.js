(function(){
  'use strict';
  var lk = document.querySelector('link[href="patch.css"]');
  if (lk) document.head.appendChild(lk);
  var vt = document.querySelectorAll('.visarjan .bigtime');
  for (var v = 0; v < vt.length; v++)
    vt[v].innerHTML = vt[v].innerHTML.replace('6:30 PM', '7:00 PM');
  var cap = document.querySelectorAll('.caption');
  for (var b = 0; b < cap.length; b++)
    cap[b].innerHTML = cap[b].innerHTML.replace(' Behave accordingly.', '');
  var kk = document.querySelectorAll('.kicker');
  for (var d = 0; d < kk.length; d++){
    if (kk[d].textContent.replace(/\s+/g, ' ').trim() === 'Darshan'){
      var bg = kk[d].nextElementSibling;
      var sb = bg ? bg.nextElementSibling : null;
      if (sb){
        var ak = document.createElement('p');
        ak.className = 'kicker rise';
        ak.textContent = 'Aarti';
        ak.style.margin = '20px 0 0';
        var ab = document.createElement('p');
        ab.className = 'bigtime rise';
        ab.innerHTML = '1:00 PM <span>&amp;</span> 7:00 PM';
        ab.style.margin = '12px 0 0';
        sb.parentNode.insertBefore(ak, sb);
        sb.parentNode.insertBefore(ab, sb);
      }
      break;
    }
  }
  var vb = document.querySelector('.visarjan .bigtime');
  if (vb){
    var dk = document.createElement('p');
    dk.className = 'kicker rise';
    dk.textContent = 'Dhol Tasha Lezim';
    dk.style.margin = '22px 0 0';
    var db = document.createElement('p');
    db.className = 'bigtime rise';
    db.innerHTML = '7:30 <span>to</span> 9:00 PM';
    db.style.margin = '12px 0 0';
    var ld = vb.nextElementSibling;
    vb.parentNode.insertBefore(dk, ld);
    vb.parentNode.insertBefore(db, ld);
  }
  var m = document.querySelector('main');
  if (!m) return;
  var fin = m.lastElementChild;
  fin.id = 'finalPanel';
  var nt = fin.querySelector('.note');
  if (nt) nt.parentNode.removeChild(nt);
  var scrims = fin.querySelectorAll('.scrim');
  var credBlock = null;
  for (var s = 0; s < scrims.length; s++)
    if (scrims[s].querySelector('.credit')) credBlock = scrims[s];
  if (credBlock){
    credBlock.removeAttribute('style');
    var omp = fin.querySelector('.deva');
    if (omp && omp.textContent.trim() === String.fromCharCode(0x0950)) omp.className += ' om';
    var grid = document.createElement('div');
    grid.className = 'credgrid';
    var creds = credBlock.querySelectorAll('.credit');
    var order = [0, 3, 1, 4, 2, 5, 6];
    for (var j = 0; j < order.length; j++){
      var c = creds[order[j]];
      if (!c) continue;
      c.removeAttribute('style');
      if (order[j] === creds.length - 1) c.className += ' cmd';
      grid.appendChild(c);
    }
    credBlock.innerHTML = '';
    credBlock.appendChild(grid);
  }
  var panels = m.querySelectorAll('.panel');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      for (var k = 0; k < es.length; k++){
        var e = es[k];
        if (e.isIntersecting && e.intersectionRatio >= 0.2) e.target.classList.add('in');
        else if (!e.isIntersecting) e.target.classList.remove('in');
      }
    }, {threshold: [0, 0.22]});
    for (var p = 0; p < panels.length; p++) io.observe(panels[p]);
  } else {
    for (var q = 0; q < panels.length; q++) panels[q].classList.add('in');
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 700){
    var fade = function(){
      var vh = window.innerHeight;
      for (var f = 0; f < panels.length; f++){
        var r = panels[f].getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80){ panels[f].style.opacity = 0; continue; }
        var c2 = (r.top + Math.min(r.height, vh) / 2) - vh / 2;
        var d2 = Math.min(1, Math.abs(c2) / (vh * 0.95));
        panels[f].style.opacity = 1 - d2 * d2 * 0.9;
        panels[f].style.transform = 'translateY(' + (-c2 * 0.05).toFixed(1) + 'px) scale(' + (1 - d2 * 0.045).toFixed(4) + ')';
      }
      requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }
})();
