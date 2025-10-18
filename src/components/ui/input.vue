<script setup lang="ts">
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
  type?: string;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

// Computed writable model for proper v-model support
const model = computed({
  get() {
    return props.modelValue ?? props.defaultValue ?? '';
  },
  set(value: string | number) {
    emits('update:modelValue', value);
  },
});
</script>

<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :disabled="disabled"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        props.class
      )
    "
  />
</template>
