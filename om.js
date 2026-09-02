(function(){
  'use strict';
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
  function boost(){
  var SEL = 'h1,h2,.deva,.kicker,.stamp,.sub,.lede,.gloss,.caption,.freedates,.freedow,.bigtime,.addr,.crole,.cname,.sign,.note,.daylab,.btn';
  var g = document.querySelectorAll('.gloss');
  for (var i = 0; i < g.length; i++)
    g[i].innerHTML = g[i].innerHTML.replace(/\s*That is a promise and a warning\.?/i, '');
  function eachText(root, fn){
    var els = root.querySelectorAll(SEL);
    for (var j = 0; j < els.length; j++){
      var el = els[j];
      if (el.closest('.cue')) continue;
      fn(el);
    }
  }
  function measure(p){
    var pr = p.getBoundingClientRect();
    var top = Infinity, bot = -Infinity;
    var all = p.querySelectorAll('*');
    for (var k = 0; k < all.length; k++){
      var el = all[k];
      if (el.classList.contains('cue') || el.closest('.cue')) continue;
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.position === 'fixed') continue;
      var r = el.getBoundingClientRect();
      if (r.height === 0) continue;
      top = Math.min(top, r.top - pr.top);
      bot = Math.max(bot, r.bottom - pr.top);
    }
    var H = window.innerHeight;
    return Math.max(0, bot - H, -top);
  }
  function fitAll(){
    var panels = document.querySelectorAll('main .panel');
    for (var p = 0; p < panels.length; p++){
      var panel = panels[p];
      var tries = 0;
      while (measure(panel) > 0 && tries < 24){
        eachText(panel, function(el){
          el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * 0.975).toFixed(2) + 'px';
        });
        var cs2 = getComputedStyle(panel);
        panel.style.paddingTop = (parseFloat(cs2.paddingTop) * 0.9) + 'px';
        panel.style.paddingBottom = (parseFloat(cs2.paddingBottom) * 0.94) + 'px';
        tries++;
      }
    }
  }
  var panels0 = document.querySelectorAll('main .panel');
  for (var q = 0; q < panels0.length; q++){
    eachText(panels0[q], function(el){
      var w = parseInt(getComputedStyle(el).fontWeight) || 400;
      el.style.fontWeight = Math.min(800, w + 150);
    });
    eachText(panels0[q], function(el){
      el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * 1.155).toFixed(2) + 'px';
    });
  }
  fitAll();
  setTimeout(fitAll, 1400);
  setTimeout(fitAll, 3000);
  var rt;
  window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(fitAll, 350); });
  }
  function run(){ boost(); wireCues(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setTimeout(run, 80); });
  else setTimeout(run, 450);
})();
