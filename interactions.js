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
      document.querySelector('#viewer-count').textContent = (index + 1) + ' / ' + links.length;
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
    viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    viewer.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      resetZoom();
      if (trigger) trigger.focus({ preventScroll: true });
    });
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
