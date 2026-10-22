// Paste into the console on https://www.youtube.com/feed/channels
// Matches the Subscribed / Unsubscribe controls in English and Spanish.

const SUBSCRIBED_LABELS = new Set([
  'subscribed',
  'suscrito',
]);

const UNSUBSCRIBE_LABELS = new Set([
  'unsubscribe',
  'cancelar suscripcion',
  'anular suscripcion',
]);

function normalizeLabel(text) {
  return String(text || '')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isSubscribedLabel(text) {
  return SUBSCRIBED_LABELS.has(normalizeLabel(text));
}

function isUnsubscribeLabel(text) {
  return UNSUBSCRIBE_LABELS.has(normalizeLabel(text));
}

function itemLabel(item) {
  const label = item.querySelector?.('yt-formatted-string, .label');
  return label ? label.textContent : item.textContent;
}

function pickUnsubscribeItem(items) {
  return items.find(item => isUnsubscribeLabel(itemLabel(item))) || null;
}

// Prefer the dialog's confirm button (stable id, any language). Fall back to
// a visible button whose label is an unsubscribe phrase. "Cancelar" alone is
// the dismiss button and must not match.
function pickConfirmTarget(candidates) {
  const visible = candidates.filter(candidate => candidate.visible);
  return visible.find(candidate => candidate.confirmId)
    || visible.find(candidate => isUnsubscribeLabel(candidate.label))
    || null;
}

function buttonFaceText(btn) {
  const span = btn.querySelector('span');
  return span ? span.textContent : btn.textContent;
}

function waitForMenuAndUnsubscribe() {
  const menuInterval = setInterval(() => {
    const menu = Array.from(document.querySelectorAll('tp-yt-paper-listbox[role="listbox"]'))
      .find(el => el.offsetParent !== null);
    const unsubBtn = menu && pickUnsubscribeItem(Array.from(
      menu.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer')
    ));
    if (!unsubBtn) return;

    clearInterval(menuInterval);
    unsubBtn.click();

    const confirmInterval = setInterval(() => {
      const picked = pickConfirmTarget(Array.from(document.querySelectorAll('button')).map(btn => ({
        btn,
        confirmId: Boolean(btn.closest('#confirm-button')),
        label: btn.getAttribute('aria-label') || btn.textContent,
        visible: btn.offsetParent !== null,
      })));
      if (!picked) return;
      clearInterval(confirmInterval);
      picked.btn.click();
      console.log('✅ Unsubscribed!');
    }, 100);
    setTimeout(() => clearInterval(confirmInterval), 3000);
  }, 100);
  setTimeout(() => clearInterval(menuInterval), 3000);
}

function attachOneClickUnsub() {
  document.querySelectorAll('button').forEach(btn => {
    if (
      isSubscribedLabel(buttonFaceText(btn)) &&
      !btn.dataset.oneClickUnsub
    ) {
      btn.dataset.oneClickUnsub = '1';
      btn.addEventListener('click', waitForMenuAndUnsubscribe, {capture: false});
    }
  });
}

function startOneClickUnsub() {
  if (window.__ytOneClickUnsub) {
    console.log('One-click unsubscribe is already on. Refresh the page to stop it.');
    return;
  }
  window.__ytOneClickUnsub = true;
  attachOneClickUnsub();
  (new MutationObserver(attachOneClickUnsub)).observe(document.body, {childList: true, subtree: true});
  console.log("✅ One-click unsubscribe enabled (English and Spanish). Click any 'Subscribed' or 'Suscrito' button.");
}

if (typeof document !== 'undefined') {
  startOneClickUnsub();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeLabel,
    isSubscribedLabel,
    isUnsubscribeLabel,
    pickUnsubscribeItem,
    pickConfirmTarget,
  };
}
