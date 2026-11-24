import { toBlob, toPng } from 'html-to-image';

/**
 * High-Resolution One-Click Bill Image Download & Native Share Utility
 * Captures only the bill element without modals, backdrops, or website chrome.
 *
 * @param {HTMLElement} billElement - The DOM node of the bill to export
 * @param {Object} options - Configuration options
 * @param {string} options.filename - Desired filename for the PNG
 * @param {number} options.targetWidthPx - Exact width in CSS pixels (e.g. 472.44 for 125mm, 396.85 for 105mm)
 * @param {number} [options.targetHeightPx] - Exact height in CSS pixels if fixed, or null for natural height
 * @param {string} [options.shareTitle] - Title for Web Share API
 * @param {function} [options.onStatusChange] - Status message callback
 * @returns {Promise<{ success: boolean, method?: string, aborted?: boolean, error?: string }>}
 */
export async function downloadBillImage(billElement, options = {}) {
  const {
    filename = 'Deva_Bill_A5.png',
    targetWidthPx = 723, // Exact master reference bill width (723px)
    targetHeightPx = 1024, // Exact master reference bill height (1024px)
    shareTitle = 'DEVA & CO Bill',
    onStatusChange = () => {}
  } = options;

  if (!billElement) {
    console.error('[billImageDownload] Invalid bill element provided');
    onStatusChange('Bill element not found');
    return { success: false, error: 'Bill element not found' };
  }

  let exportContainer = null;
  try {
    onStatusChange('Generating high-resolution PNG...');

    // Create an unscaled, isolated off-screen export container
    exportContainer = document.createElement('div');
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-99999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = `${targetWidthPx}px`;
    exportContainer.style.minWidth = `${targetWidthPx}px`;
    exportContainer.style.maxWidth = `${targetWidthPx}px`;
    exportContainer.style.height = targetHeightPx ? `${targetHeightPx}px` : 'auto';
    if (targetHeightPx) {
      exportContainer.style.minHeight = `${targetHeightPx}px`;
      exportContainer.style.maxHeight = `${targetHeightPx}px`;
    }
    exportContainer.style.margin = '0';
    exportContainer.style.padding = '0';
    exportContainer.style.boxSizing = 'border-box';
    exportContainer.style.overflow = 'hidden';
    exportContainer.style.background = '#ffffff';
    exportContainer.style.zIndex = '-9999';
    exportContainer.style.transform = 'none';

    // Deep clone the bill element so modal responsive styles and zoom don't affect export
    const clone = billElement.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.boxSizing = 'border-box';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.borderRadius = '0';
    clone.style.width = `${targetWidthPx}px`;
    clone.style.minWidth = `${targetWidthPx}px`;
    clone.style.maxWidth = `${targetWidthPx}px`;
    if (targetHeightPx) {
      clone.style.height = `${targetHeightPx}px`;
      clone.style.minHeight = `${targetHeightPx}px`;
      clone.style.maxHeight = `${targetHeightPx}px`;
    }

    exportContainer.appendChild(clone);
    document.body.appendChild(exportContainer);

    // Wait for Tamil & Inter web fonts to finish loading
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (fontErr) {
        console.warn('[billImageDownload] Font readiness warning:', fontErr);
      }
    }

    // Ensure all images (such as DEVA logo and bill template background) inside the cloned bill are 100% loaded
    const imgElements = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      imgElements.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 600);
        });
      })
    );

    // Small tick to ensure layout and text rendering stability
    await new Promise((r) => setTimeout(r, 60));

    // Measure height if not fixed
    const captureHeight = targetHeightPx || clone.offsetHeight || clone.scrollHeight || targetWidthPx;

    // Generate high-resolution (3x) PNG blob with clean zero margins
    let blob = null;
    const captureOptions = {
      pixelRatio: 3,
      width: targetWidthPx,
      height: captureHeight,
      backgroundColor: '#ffffff',
      cacheBust: false,
      style: {
        margin: '0',
        padding: '0',
        width: `${targetWidthPx}px`,
        minWidth: `${targetWidthPx}px`,
        maxWidth: `${targetWidthPx}px`,
        height: `${captureHeight}px`,
        minHeight: `${captureHeight}px`,
        maxHeight: `${captureHeight}px`,
        transform: 'none',
        boxShadow: 'none'
      }
    };

    try {
      blob = await toBlob(clone, captureOptions);
    } catch (blobErr) {
      console.warn('[billImageDownload] toBlob direct capture fallback to toPng:', blobErr);
      const dataUrl = await toPng(clone, captureOptions);
      const resp = await fetch(dataUrl);
      blob = await resp.blob();
    }

    if (!blob) {
      throw new Error('Image generation produced an empty blob');
    }

    // Device-Specific Download / Share:
    // Android & iOS: Use Web Share API if supported for direct Save to Photos / Gallery
    const file = new File([blob], filename, { type: 'image/png' });
    const canShare =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] });

    let shared = false;
    if (canShare) {
      try {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: `${shareTitle} - தேவா & கோ`
        });
        shared = true;
        onStatusChange('Bill image ready to save or share!');
        return { success: true, method: 'share' };
      } catch (shareErr) {
        if (shareErr.name === 'AbortError') {
          // User dismissed the share sheet
          onStatusChange('');
          return { success: true, aborted: true };
        }
        console.warn('[billImageDownload] Native share error, falling back to download:', shareErr);
      }
    }

    // Desktop/Laptop & standard mobile browser download fallback
    if (!shared) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 3000);

      onStatusChange('Bill image downloaded!');
      return { success: true, method: 'download' };
    }

    return { success: true };
  } catch (err) {
    console.error('[billImageDownload] Export error:', err);
    onStatusChange('Failed to download bill image');
    return { success: false, error: err.message };
  } finally {
    if (exportContainer && exportContainer.parentNode) {
      exportContainer.parentNode.removeChild(exportContainer);
    }
  }
}
