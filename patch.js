(function(){
  'use strict';
  var lk = document.querySelector('link[href="patch.css"]');
  if (lk) document.head.appendChild(lk);
  var vt = document.querySelectorAll('.visarjan .bigtime');
  for (var v = 0; v < vt.length; v++)
    vt[v].innerHTML = vt[v].innerHTML.replace('6:30 PM', '7:00 PM');
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
      for (var k = 0; k < es.length; k++)
        if (es[k].isIntersecting) es[k].target.classList.add('in');
    }, {threshold: 0.22});
    for (var p = 0; p < panels.length; p++) io.observe(panels[p]);
  } else {
    for (var q = 0; q < panels.length; q++) panels[q].classList.add('in');
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var fade = function(){
      var vh = window.innerHeight;
      for (var f = 0; f < panels.length; f++){
        var r = panels[f].getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80){ panels[f].style.opacity = 0; continue; }
        var c2 = (r.top + Math.min(r.height, vh) / 2) - vh / 2;
        var d = Math.min(1, Math.abs(c2) / (vh * 0.95));
        panels[f].style.opacity = 1 - d * d * 0.9;
        panels[f].style.transform = 'translateY(' + (-c2 * 0.05).toFixed(1) + 'px)';
      }
      requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }
})();
