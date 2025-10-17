<script setup lang="ts">
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props {
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  delayDuration: 400,
  side: 'top',
  sideOffset: 4,
});
</script>

<template>
  <TooltipProvider :delay-duration="props.delayDuration">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot name="trigger" />
      </TooltipTrigger>

      <TooltipContent
        :side="props.side"
        :side-offset="props.sideOffset"
        :class="
          cn(
            'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )
        "
      >
        <slot />
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
</template>
