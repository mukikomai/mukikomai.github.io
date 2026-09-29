// スペックバーはビューポートに入ったら伸びる
const bars = document.querySelectorAll('.bar-fill');
const barIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      barIO.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
bars.forEach((b) => barIO.observe(b));

// 要素が画面内に入ったらフェードイン、画面外に出たら次に備えてリセットする
const revealEls = document.querySelectorAll('.reveal');
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    revealEls.forEach((el) => revealIO.observe(el));
  });
});
