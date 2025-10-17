<script setup lang="ts">
import Badge from '@/components/ui/badge.vue';
import { Clock, Pencil } from 'lucide-vue-next';
import type { ThemeDuration } from '../types/barillet';

interface Props {
  durationType: ThemeDuration['type'];
}

defineProps<Props>();
const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <Badge
    :variant="durationType === 'fixed' ? 'secondary' : 'default'"
    class="cursor-pointer shrink-0 p-1.5"
    :title="
      durationType === 'fixed'
        ? 'Durée fixe - Cliquer pour changer en durée spéciale'
        : 'Durée spéciale - Cliquer pour changer en durée fixe'
    "
    @click="emit('toggle')"
  >
    <Clock v-if="durationType === 'fixed'" class="h-3 w-3" />
    <Pencil v-else class="h-3 w-3" />
  </Badge>
</template>
