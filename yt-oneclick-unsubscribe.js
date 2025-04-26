function waitForMenuAndUnsubscribe() {
  // Wait for the unsubscribe menu to appear after clicking "Subscribed"
  const menuInterval = setInterval(() => {
    const menu = Array.from(document.querySelectorAll('tp-yt-paper-listbox[role="listbox"]'))
      .find(el => el.offsetParent !== null);
    if (menu) {
      clearInterval(menuInterval);
      // Find and click "Unsubscribe"
      const unsubBtn = Array.from(menu.querySelectorAll('tp-yt-paper-item'))
        .find(item => item.textContent.trim().toLowerCase() === 'unsubscribe');
      if (unsubBtn) {
        unsubBtn.click();

        // Wait for the confirmation popup and click "Unsubscribe"
        const confirmInterval = setInterval(() => {
          // Find the button by the unique id and aria-label
          const confirmRenderer = document.querySelector('yt-button-renderer#confirm-button');
          const confirmBtn = confirmRenderer?.querySelector('button[aria-label="Unsubscribe"]');
          if (confirmBtn && confirmBtn.offsetParent !== null) {
            clearInterval(confirmInterval);
            confirmBtn.click();
            console.log("✅ Unsubscribed!");
          }
        }, 100);
        // Stop trying after 3 seconds
        setTimeout(() => clearInterval(confirmInterval), 3000);
      }
    }
  }, 100);
  // Stop trying after 3 seconds
  setTimeout(() => clearInterval(menuInterval), 3000);
}

// Attach to all visible "Subscribed" buttons
function attachOneClickUnsub() {
  document.querySelectorAll('button').forEach(btn => {
    if (
      btn.querySelector('span') &&
      btn.querySelector('span').textContent.trim().toLowerCase() === 'subscribed' &&
      !btn.dataset.oneClickUnsub
    ) {
      btn.dataset.oneClickUnsub = "1";
      btn.addEventListener('click', waitForMenuAndUnsubscribe, {capture: false});
    }
  });
}

// Attach to existing and future buttons
attachOneClickUnsub();
(new MutationObserver(attachOneClickUnsub)).observe(document.body, {childList: true, subtree: true});

console.log("✅ One-click unsubscribe enabled! Click any 'Subscribed' button to instantly unsubscribe.");
