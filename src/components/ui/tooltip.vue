<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';

interface Props {
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  delayDuration: 400,
  side: 'top',
  sideOffset: 6,
});

const anchorId = `--tooltip-${Math.random().toString(36).slice(2, 9)}`;
const isOpen = ref(false);
let openTimeout: ReturnType<typeof setTimeout> | null = null;
let closeTimeout: ReturnType<typeof setTimeout> | null = null;

const positionArea = computed(() => {
  const map: Record<string, string> = {
    top: 'top center',
    bottom: 'bottom center',
    left: 'left center',
    right: 'right center',
  };
  return map[props.side];
});

const marginProp = computed(() => {
  const map: Record<string, string> = {
    top: 'margin-bottom',
    bottom: 'margin-top',
    left: 'margin-right',
    right: 'margin-left',
  };
  return map[props.side];
});

const tooltipStyle = computed(
  () =>
    `position: fixed; position-anchor: ${anchorId}; position-area: ${positionArea.value}; ${marginProp.value}: ${props.sideOffset}px; position-try-fallbacks: flip-block flip-inline; position-visibility: anchors-visible; z-index: 50; max-width: 20rem; width: max-content;`
);

const show = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
  openTimeout = setTimeout(() => {
    isOpen.value = true;
  }, props.delayDuration);
};

const hide = () => {
  if (openTimeout) {
    clearTimeout(openTimeout);
    openTimeout = null;
  }
  closeTimeout = setTimeout(() => {
    isOpen.value = false;
  }, 100);
};

const onTooltipEnter = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
};

onBeforeUnmount(() => {
  if (openTimeout) clearTimeout(openTimeout);
  if (closeTimeout) clearTimeout(closeTimeout);
});
</script>

<template>
  <span
    :style="`anchor-name: ${anchorId}`"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
  >
    <slot name="trigger" />
  </span>

  <div
    v-if="isOpen"
    role="tooltip"
    :style="tooltipStyle"
    class="overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
    @mouseenter="onTooltipEnter"
    @mouseleave="hide"
  >
    <slot />
  </div>
</template>
