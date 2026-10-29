import { reactive } from "vue";

/**
 * Whether the reader left each navigation group open or closed, for as
 * long as the page lives. The drawers rebuild their lists when they show
 * another category, so without this every group would come back in its
 * default state each time the reader looks at a category again.
 */
const groups = reactive(new Map<string, boolean>());

export function useNavGroupState(): Map<string, boolean> {
  return groups;
}
