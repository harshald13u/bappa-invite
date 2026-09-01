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
  wireCues();
})();
