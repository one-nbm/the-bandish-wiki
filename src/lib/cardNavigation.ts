/**
 * Pure helpers for homepage keyboard card navigation.
 * No imports and only erasable TypeScript syntax so they can be unit-tested directly in Node.
 */

export interface RectLike {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Next card index for ArrowUp / ArrowDown.
 * - Down from "nothing active" (-1) lands on the first card.
 * - Down on the last card stays put.
 * - Up on the first card returns -1 ("leave the list", back to the search box)
 *   only when the search box owns focus (canLeaveList); otherwise it stays on 0.
 */
export function stepCardIndex(
  current: number,
  direction: "up" | "down",
  length: number,
  canLeaveList: boolean
): number {
  if (length <= 0) return -1;
  if (direction === "down") {
    if (current < 0) return 0;
    return Math.min(current + 1, length - 1);
  }
  if (current <= 0) return canLeaveList ? -1 : 0;
  return Math.min(current - 1, length - 1);
}

/**
 * Index of the first card (in DOM / data order) that is at least partly inside the
 * visible region below the sticky header. Null rects (cards missing from the DOM) are skipped.
 * Returns -1 when no card is visible.
 */
export function pickFirstVisibleIndex(
  rects: Array<RectLike | null>,
  viewTop: number,
  viewBottom: number
): number {
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (r && r.bottom > viewTop + 8 && r.top < viewBottom) return i;
  }
  return -1;
}

/**
 * Spatial neighbour for ArrowLeft / ArrowRight in the CSS multi-column masonry.
 * Only cards strictly in a neighbouring column are candidates; the nearest column wins,
 * and inside that column the card whose vertical centre is closest to the current card's.
 * Returns -1 when there is no card in that direction.
 */
export function pickHorizontalNeighbor(
  current: RectLike,
  rects: Array<RectLike | null>,
  currentIndex: number,
  direction: "left" | "right"
): number {
  const COLUMN_TOLERANCE = 8;
  const currentCenterY = (current.top + current.bottom) / 2;

  let nearestColumnDistance = Infinity;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r || i === currentIndex) continue;
    const distance = direction === "right" ? r.left - current.right : current.left - r.right;
    if (distance < -1) continue;
    if (distance < nearestColumnDistance) nearestColumnDistance = distance;
  }
  if (nearestColumnDistance === Infinity) return -1;

  let bestIndex = -1;
  let bestVertical = Infinity;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r || i === currentIndex) continue;
    const distance = direction === "right" ? r.left - current.right : current.left - r.right;
    if (distance < -1 || distance > nearestColumnDistance + COLUMN_TOLERANCE) continue;
    const vertical = Math.abs((r.top + r.bottom) / 2 - currentCenterY);
    if (vertical < bestVertical) {
      bestVertical = vertical;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/**
 * Vertical scroll needed to bring `rect` fully into [viewTop, viewBottom].
 * Positive = scroll down, negative = scroll up, 0 = already fully visible.
 * A card taller than the region is top-aligned so its title is never hidden.
 */
export function computeScrollDelta(rect: RectLike, viewTop: number, viewBottom: number): number {
  if (rect.top < viewTop) return rect.top - viewTop;
  if (rect.bottom > viewBottom) return Math.min(rect.bottom - viewBottom, rect.top - viewTop);
  return 0;
}
