import { reactive } from "vue";

/**
 * Whether the reader left each navigation group open or closed, for as
 * long as they stay on the page they are reading. The drawers rebuild
 * their lists when they show another category, so without this every group
 * would come back in its default state each time the reader looks at a
 * category again.
 *
 * The reader's choices hold until the next page: see `resetNavGroupState`.
 */
const groups = reactive(new Map<string, boolean>());

export function useNavGroupState(): Map<string, boolean> {
  return groups;
}

/**
 * Go back to the defaults of a page: the group holding it open, the other
 * groups closed (unless they start open). Called on navigation, so state
 * belongs to a page rather than to the session — otherwise every category
 * the reader ever visited would stay expanded, and the mobile drawer, which
 * lists the whole tree at once, would come back fully expanded.
 */
export function resetNavGroupState(): void {
  groups.clear();
}
