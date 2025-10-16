<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { type ButtonVariants, buttonVariants } from './buttonVariants'
import { cn } from '@/lib/utils'

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  as: 'button',
})

const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
)
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
