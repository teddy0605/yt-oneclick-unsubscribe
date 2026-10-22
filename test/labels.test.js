const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isSubscribedLabel,
  isUnsubscribeLabel,
  pickUnsubscribeItem,
  pickConfirmTarget,
} = require('../yt-oneclick-unsubscribe');

test('subscribed buttons match English and Spanish, not the subscribe action', () => {
  assert.equal(isSubscribedLabel('Subscribed'), true);
  assert.equal(isSubscribedLabel('  suscrito '), true);
  assert.equal(isSubscribedLabel('SUSCRITO'), true);
  assert.equal(isSubscribedLabel('Subscribe'), false);
  assert.equal(isSubscribedLabel('Suscribirse'), false);
});

test('unsubscribe labels match the menu and confirm phrases, not dismiss', () => {
  assert.equal(isUnsubscribeLabel('Unsubscribe'), true);
  assert.equal(isUnsubscribeLabel('Cancelar suscripción'), true);
  assert.equal(isUnsubscribeLabel('Cancelar\nsuscripcion'), true);
  assert.equal(isUnsubscribeLabel('Anular suscripción'), true);
  assert.equal(isUnsubscribeLabel('Cancelar'), false);
  assert.equal(isUnsubscribeLabel('No'), false);
  assert.equal(isUnsubscribeLabel('Unsubscribe from Cool Channel'), false);
});

test('menu picker chooses the unsubscribe row', () => {
  const picked = pickUnsubscribeItem([
    { textContent: 'Todas' },
    { textContent: 'Personalizadas' },
    { textContent: 'Ninguna' },
    { textContent: 'Cancelar suscripción' },
  ]);
  assert.equal(picked.textContent, 'Cancelar suscripción');
});

test('menu picker reads a nested label and ignores a dismiss row', () => {
  const picked = pickUnsubscribeItem([
    { textContent: 'Cancelar', querySelector: () => null },
    {
      textContent: 'ignored wrapper text',
      querySelector: () => ({ textContent: 'Unsubscribe' }),
    },
  ]);
  assert.equal(itemText(picked), 'Unsubscribe');
  assert.equal(pickUnsubscribeItem([{ textContent: 'Cancelar' }]), null);
});

test('confirm picker prefers #confirm-button in any language', () => {
  const picked = pickConfirmTarget([
    { id: 'cancel', confirmId: false, label: 'Cancelar', visible: true },
    { id: 'confirm', confirmId: true, label: 'Cancelar suscripción', visible: true },
  ]);
  assert.equal(picked.id, 'confirm');
});

test('confirm picker skips a hidden confirm button and will not click Cancelar', () => {
  const hiddenConfirm = pickConfirmTarget([
    { id: 'confirm', confirmId: true, label: 'Unsubscribe', visible: false },
    { id: 'cancel', confirmId: false, label: 'Cancelar', visible: true },
    { id: 'fallback', confirmId: false, label: 'Unsubscribe', visible: true },
  ]);
  assert.equal(hiddenConfirm.id, 'fallback');

  const dismissOnly = pickConfirmTarget([
    { id: 'cancel', confirmId: false, label: 'Cancelar', visible: true },
  ]);
  assert.equal(dismissOnly, null);
});

function itemText(item) {
  const label = item.querySelector?.('yt-formatted-string, .label');
  return label ? label.textContent : item.textContent;
}
