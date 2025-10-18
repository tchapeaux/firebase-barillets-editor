<script setup lang="ts">
import { computed } from 'vue';
import {
  ComboboxRoot,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxPortal,
  ComboboxContent,
  ComboboxViewport,
  ComboboxItem,
  ComboboxItemIndicator,
} from 'radix-vue';
import { Check } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { useCategories } from '@/composables/useCategories';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  class?: string;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void;
}>();

const { categoryNames } = useCategories();

// Writable computed for v-model binding
const value = computed({
  get() {
    return props.modelValue || '';
  },
  set(newValue: string) {
    emits('update:modelValue', newValue);
  },
});

// Filtered categories based on current value
const filteredCategories = computed(() => {
  if (!value.value) {
    return categoryNames;
  }
  const search = value.value.toLowerCase();
  return categoryNames.filter((name) => name.toLowerCase().includes(search));
});

// Only show dropdown when there are matching categories
const shouldShowDropdown = computed(() => filteredCategories.value.length > 0);

// Custom filter function - we handle filtering manually via filteredCategories
const filterFunction = (values: string[]) => values;
</script>

<template>
  <ComboboxRoot
    v-model="value"
    v-model:search-term="value"
    :filter-function="filterFunction"
    class="relative"
  >
    <ComboboxAnchor>
      <ComboboxInput
        :placeholder="placeholder"
        :class="
          cn(
            'flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            props.class
          )
        "
      />
    </ComboboxAnchor>

    <ComboboxPortal v-if="shouldShowDropdown">
      <ComboboxContent
        class="z-50 mt-1 max-h-60 min-w-[var(--radix-combobox-trigger-width)] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        position="popper"
        :side-offset="4"
      >
        <ComboboxViewport class="p-1">
          <ComboboxItem
            v-for="category in filteredCategories"
            :key="category"
            :value="category"
            class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <ComboboxItemIndicator class="mr-2 h-4 w-4">
              <Check class="h-4 w-4" />
            </ComboboxItemIndicator>
            <span>{{ category }}</span>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
