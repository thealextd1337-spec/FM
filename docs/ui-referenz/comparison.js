(() => {
  const designs = document.querySelector('.designs');
  const buttons = document.querySelectorAll('[data-view] button,button[data-view]');
  buttons.forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.view;
    designs.dataset.view = view;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('.design').forEach(card => {
      const image = card.querySelector('img');
      const key = card.querySelector('.preview').href.split('design=')[1].split('#')[0];
      image.src = `${key}-${view}.jpg`;
      image.width = view === 'mobile' ? 390 : 1440;
      image.height = view === 'mobile' ? 844 : 960;
    });
  }));
})();
