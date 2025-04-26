// (Paste the full script here from your working version)
    function waitForMenuAndUnsubscribe() {
      const menuInterval = setInterval(() => {
        const menu = Array.from(document.querySelectorAll('tp-yt-paper-listbox[role="listbox"]'))
          .find(el => el.offsetParent !== null);
        if (menu) {
          clearInterval(menuInterval);
          const unsubBtn = Array.from(menu.querySelectorAll('tp-yt-paper-item'))
            .find(item => item.textContent.trim().toLowerCase() === 'unsubscribe');
          if (unsubBtn) {
            unsubBtn.click();
            const confirmInterval = setInterval(() => {
              const confirmRenderer = document.querySelector('yt-button-renderer#confirm-button');
              const confirmBtn = confirmRenderer?.querySelector('button[aria-label="Unsubscribe"]');
              if (confirmBtn && confirmBtn.offsetParent !== null) {
                clearInterval(confirmInterval);
                confirmBtn.click();
                console.log("✅ Unsubscribed!");
              }
            }, 100);
            setTimeout(() => clearInterval(confirmInterval), 3000);
          }
        }
      }, 100);
      setTimeout(() => clearInterval(menuInterval), 3000);
    }

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

    attachOneClickUnsub();
    (new MutationObserver(attachOneClickUnsub)).observe(document.body, {childList: true, subtree: true});

    console.log("✅ One-click unsubscribe enabled! Click any 'Subscribed' button to instantly unsubscribe.");
