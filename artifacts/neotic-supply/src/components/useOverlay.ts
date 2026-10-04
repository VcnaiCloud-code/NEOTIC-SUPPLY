import { useEffect, useRef, type RefObject } from 'react';

const focusable = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useOverlay(root: RefObject<HTMLElement | null>, onEscape: () => void, initialSelector: string, enabled = true) {
  const escRef = useRef(onEscape);
  escRef.current = onEscape;
  useEffect(() => {
    if (!enabled || !root.current) return;
    const dialog = root.current;
    // Another overlay's cleanup may have restored this sibling's old inert
    // value during a detail → bag → checkout transition.
    dialog.inert = false;
    const opener = document.activeElement as HTMLElement | null;
    dialog.querySelector<HTMLElement>(initialSelector)?.focus({ preventScroll: true });
    const siblings = Array.from(dialog.parentElement?.children ?? [])
      .filter((el): el is HTMLElement => el instanceof HTMLElement && el !== dialog && el.getAttribute('role') !== 'status' && el.getAttribute('aria-hidden') !== 'true')
      .map(el => ({ el, inert: el.inert }));
    siblings.forEach(({ el }) => { el.inert = true; });
    const prevHtml = document.documentElement.style.overflow;
    // Lock the viewport without introducing a second body scroll container.
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); escRef.current(); return; }
      if (e.key !== 'Tab' || !root.current) return;
      const items = Array.from(root.current.querySelectorAll<HTMLElement>(focusable));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!root.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.style.overflow = prevHtml;
      siblings.forEach(({ el, inert }) => { el.inert = inert; });
      if (opener && document.contains(opener) && !opener.closest('[inert]')) opener.focus({ preventScroll: true });
    };
  }, [root, initialSelector, enabled]);
}
