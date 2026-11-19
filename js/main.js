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

// ---------- PV料金：簡易見積もり・SKIMA依頼文 ----------
(() => {
  const estimator = document.querySelector('#estimator');
  if (!estimator) return;
  const priceTable = {
    '文字入れのみ本家再現': { short: 3000, chorus: 4000, full: 6000 },
    '本家再現': { short: 6000, chorus: 8000, full: 12000 },
    '本家風オリジナルPV・MV': { short: 9000, chorus: 12000, full: 18000 },
    '完全オリジナルPV・MV': { short: 15000, chorus: 20000, full: 30000 }
  };
  const yen = value => `${Math.round(value).toLocaleString('ja-JP')}円`;
  const get = selector => document.querySelector(selector);
  function calculate() {
    const quality = get('input[name="quality"]:checked')?.value || '文字入れのみ本家再現';
    const length = get('input[name="length"]:checked')?.value || 'short';
    const base = priceTable[quality][length];
    const addonInputs = [...document.querySelectorAll('.addon:checked')];
    const addons = addonInputs.reduce((sum, item) => sum + Number(item.value), 0);
    const revisionCount = Math.max(0, Number(get('#extra-revisions').value) || 0);
    const revisions = revisionCount * 500;
    const subtotal = base + addons + revisions;
    const rush = get('#rush').checked;
    const total = rush ? subtotal * 1.5 : subtotal;
    get('#estimate-base').textContent = yen(base);
    get('#estimate-addons').textContent = yen(addons);
    get('#estimate-revisions').textContent = yen(revisions);
    get('#estimate-rush').textContent = rush ? '1.5倍' : 'なし';
    get('#estimate-total').textContent = yen(total);
    get('#estimate-note').textContent = rush
      ? '短納期補正を適用した概算です。短納期対応の可否は事前確認が必要です。'
      : '概算金額です。正式な見積もりとは異なる場合があります。';
    return { quality, length, base, addons, addonLabels: addonInputs.map(item => item.dataset.label), revisionCount, revisions, rush, total };
  }
  document.querySelectorAll('#estimator input').forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });
  get('#apply-estimate').addEventListener('click', () => {
    const e = calculate();
    const lengthLabel = { short: 'Short（1分以内）', chorus: 'サビのみ', full: 'フル（4分以内）' }[e.length];
    const notes = get('#other-notes');
    notes.value = [notes.value, `【簡易見積もり】${e.quality} / ${lengthLabel}`, `概算：${yen(e.total)}（基本 ${yen(e.base)}、追加作業 ${yen(e.addons)}、修正超過 ${yen(e.revisions)}${e.rush ? '、短納期1.5倍適用' : ''}）`].filter(Boolean).join('\n');
    document.querySelector('#request-template').scrollIntoView({ behavior: 'smooth' });
  });
  get('#generate-template').addEventListener('click', () => {
    const e = calculate();
    const lengthLabel = { short: 'Short（1分以内）', chorus: 'サビのみ', full: 'フル（4分以内）' }[e.length];
    const value = id => get(`#${id}`).value.trim() || '未記入';
    get('#template-output').value = `はじめまして。PV・MV制作をお願いしたく、ご連絡いたしました。

■依頼者名・活動名
${value('client-name')}

■希望する制作内容
${e.quality}
${lengthLabel}

■楽曲名・アーティスト
${value('song-title')}

■音源URL
${value('audio-url')}

■イラストURL
${value('illustration-url')}

■参考MV・PV
${value('reference-url')}

■希望納期
${value('desired-deadline')}

■コンセプト・世界観
${value('concept')}

■希望する演出・表現
${value('direction')}

■その他・補足
${value('other-notes')}

■概算見積もり
基本料金：${yen(e.base)}
追加作業：${yen(e.addons)}${e.addonLabels.length ? `（${e.addonLabels.join('、')}）` : ''}
修正回数超過：${yen(e.revisions)}（無料4回を超える分：${e.revisionCount}回）
短納期補正：${e.rush ? '1.5倍' : 'なし'}
概算合計：${yen(e.total)}

※上記は簡易見積もりです。正式な料金・納期は素材と制作内容を確認したうえでご相談できればと思います。
どうぞよろしくお願いいたします。`;
    get('#copy-status').textContent = '依頼文を作成しました。内容を確認して必要に応じて編集してください。';
  });
  get('#copy-template').addEventListener('click', async () => {
    const output = get('#template-output');
    if (!output.value.trim()) { get('#copy-status').textContent = '先に「依頼文を作成」を押してください。'; return; }
    try {
      await navigator.clipboard.writeText(output.value);
      get('#copy-status').textContent = '依頼文をコピーしました。';
    } catch (error) {
      output.focus(); output.select();
      get('#copy-status').textContent = '自動コピーできませんでした。文章を選択して手動でコピーしてください。';
    }
  });
  calculate();
})();
