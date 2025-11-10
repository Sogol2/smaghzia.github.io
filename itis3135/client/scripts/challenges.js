// scripts/challenges.js — jQuery UI + checklist logic + localStorage
$(function(){
    $("#levels").tabs();
    $("#acc-beg").accordion({ heightStyle:"content", collapsible:true, active:false });
    $("#acc-int").accordion({ heightStyle:"content", collapsible:true, active:false });
  
    const key = 'fitnessProgress';
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
  
    // Restore checks/status
    $('.week').each(function(){
      const id = this.dataset.week;
      const data = saved[id] || {};
      $(this).find('input[type="checkbox"]').each(function(i){
        const v = data['c'+i];
        if (v) this.checked = true;
      });
      if (data.done){
        $(this).find('.status').text('Completed ✅');
      }
    });
  
    // Persist per checkbox
    $('.week input[type="checkbox"]').on('change', function(){
      const form = $(this).closest('.week')[0];
      const id = form.dataset.week;
      const data = saved[id] || {};
      // store all
      $(form).find('input[type="checkbox"]').each(function(i){
        data['c'+i] = this.checked;
      });
      saved[id] = data;
      localStorage.setItem(key, JSON.stringify(saved));
    });
  
    // Complete button: require all required to be checked
    $('.week .complete').on('click', function(e){
      e.preventDefault();
      const form = $(this).closest('.week')[0];
      const id = form.dataset.week;
      const req = $(form).find('input[required]');
      const allChecked = Array.from(req).every(cb => cb.checked);
      if (!allChecked){
        $(form).find('.status').text('Please complete all steps ✋');
        return;
      }
      const data = saved[id] || {};
      data.done = true;
      saved[id] = data;
      localStorage.setItem(key, JSON.stringify(saved));
      $(form).find('.status').text('Completed ✅');
  
      // Tiny confetti (emoji burst)
      for (let i=0;i<12;i++){
        setTimeout(()=>window.showToast('Week complete! 🎉'), i*80);
      }
    });
  });
  