<script setup lang="ts">
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  type SelectRootEmits,
  type SelectRootProps,
} from 'radix-vue';
import { ChevronDown } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const props = defineProps<
  SelectRootProps & {
    placeholder?: string;
    options: Array<{ value: string; label: string }>;
    class?: string;
  }
>();

const emits = defineEmits<SelectRootEmits>();
</script>

<template>
  <SelectRoot
    v-bind="props"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <SelectTrigger
      :class="
        cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          props.class
        )
      "
    >
      <SelectValue :placeholder="placeholder" />
      <ChevronDown class="h-4 w-4 opacity-50" />
    </SelectTrigger>

    <SelectContent
      class="relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      position="popper"
    >
      <SelectViewport class="p-1">
        <SelectGroup>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
          >
            <SelectItemText>
              {{ option.label }}
            </SelectItemText>
          </SelectItem>
        </SelectGroup>
      </SelectViewport>
    </SelectContent>
  </SelectRoot>
</template>
