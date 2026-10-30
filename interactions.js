// Links and content remain usable when these enhancements are unavailable.
(() => {
  const viewer = document.querySelector('.image-viewer');
  const links = [...document.querySelectorAll('.image-link')];
  if (viewer && typeof viewer.showModal === 'function') {
    const stage = viewer.querySelector('.viewer-stage');
    const image = stage.querySelector('img');
    const zoom = document.querySelector('#viewer-zoom');
    let index = 0;
    let trigger;
    let previousOverflow = '';
    function resetZoom() {
      stage.classList.remove('is-zoomed');
      zoom.setAttribute('aria-pressed', 'false');
      zoom.textContent = '放大';
      stage.scrollTop = stage.scrollLeft = 0;
    }
    function showImage(next) {
      index = (next + links.length) % links.length;
      const source = links[index].querySelector('img');
      resetZoom();
      image.src = links[index].href;
      image.alt = source.alt;
      document.querySelector('#viewer-title').textContent = links[index].closest('figure').querySelector('figcaption span').textContent;
      document.querySelector('#viewer-count').textContent = '第 ' + (index + 1) + ' 张，共 ' + links.length + ' 张';
      document.querySelector('#viewer-original').href = links[index].href;
    }
    links.forEach((link, i) => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-label', link.querySelector('img').alt + '，放大查看');
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        trigger = link;
        showImage(i);
        previousOverflow = document.body.style.overflow;
        viewer.showModal();
        document.body.style.overflow = 'hidden';
        viewer.querySelector('.viewer-close').focus();
      });
    });
    function restorePage() {
      if (viewer.open) return;
      document.body.style.overflow = previousOverflow;
      resetZoom();
      if (trigger) trigger.focus({ preventScroll: true });
    }
    function closeViewer() {
      viewer.close();
      restorePage();
    }
    viewer.querySelector('.viewer-close').addEventListener('click', closeViewer);
    viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
    viewer.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
    viewer.addEventListener('close', restorePage);
    document.querySelector('#viewer-prev').addEventListener('click', () => showImage(index - 1));
    document.querySelector('#viewer-next').addEventListener('click', () => showImage(index + 1));
    zoom.addEventListener('click', () => {
      const enlarged = stage.classList.toggle('is-zoomed');
      zoom.setAttribute('aria-pressed', String(enlarged));
      zoom.textContent = enlarged ? '适应窗口' : '放大';
      stage.scrollTop = stage.scrollLeft = 0;
    });
    viewer.addEventListener('keydown', event => {
      if (stage.classList.contains('is-zoomed')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showImage(index + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
  }

  const copy = document.querySelector('#copy-email');
  if (copy) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText('2369069850@qq.com');
        status.textContent = '邮箱已复制，可以粘贴到邮件应用了。';
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(document.querySelector('.email'));
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = '未能自动复制，请长按或选中上方邮箱复制。';
      }
    });
  }

  const items = [...document.querySelectorAll('.project-nav a')];
  const projects = [...document.querySelectorAll('.project[id]')];
  let scheduled = false;
  function updateCurrent() {
    const marker = document.querySelector('.project-nav').getBoundingClientRect().height + 64;
    let current = null;
    projects.forEach(project => {
      const bounds = project.getBoundingClientRect();
      if (bounds.top <= marker && bounds.bottom > marker) current = project.id;
    });
    items.forEach(link => {
      if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  if (items.length) {
    const schedule = () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateCurrent); }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    updateCurrent();
  }
})();

(() => {
 document.body.classList.add('enhanced');
 const tabs=[...document.querySelectorAll('[data-showcase]')];
 const panels=[...document.querySelectorAll('.showcase-panel')];
 function select(tab,focus=false){
  tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
  panels.forEach(p=>{p.hidden=p.id!==tab.getAttribute('aria-controls');});
  if(focus)tab.focus();
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab));
  tab.addEventListener('keydown',event=>{
   let index=i;
   if(event.key==='ArrowRight')index=(i+1)%tabs.length;
   else if(event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;
   else if(event.key==='Home')index=0;
   else if(event.key==='End')index=tabs.length-1;
   else return;
   event.preventDefault();select(tabs[index],true);
  });
 });
 if(tabs.length)select(tabs[0]);
 const filters=[...document.querySelectorAll('[data-filter]')];
 const cards=[...document.querySelectorAll('.work-card')];
 const status=document.querySelector('#filter-status');
 function filter(value){
  const valid=filters.some(b=>b.dataset.filter===value)?value:'all';
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===valid)));
  let count=0;cards.forEach(card=>{card.hidden=valid!=='all'&&card.dataset.category!==valid;if(!card.hidden)count++;});
  if(status)status.textContent=count+'个精选项目';
 }
 filters.forEach(button=>button.addEventListener('click',()=>filter(button.dataset.filter)));
 if(filters.length)filter(new URLSearchParams(location.search).get('focus')||'all');
})();
