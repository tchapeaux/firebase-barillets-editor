<template>
  <Card class="transition-shadow hover:shadow-lg">
    <CardHeader class="flex-row justify-between items-start space-y-0 pb-2">
      <div class="flex-1">
        <CardTitle>{{ barillet.title || 'Sans titre' }}</CardTitle>
        <div class="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
          <span v-if="barillet.date" class="flex items-center gap-1">
            <Calendar class="h-4 w-4" />
            {{ formatDate(barillet.date) }}
          </span>
          <span v-if="barillet.location" class="flex items-center gap-1">
            <MapPin class="h-4 w-4" />
            {{ barillet.location }}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <template #trigger>
          <Button variant="ghost" size="icon">
            <MoreVertical class="h-4 w-4" />
          </Button>
        </template>

        <DropdownMenuItem @click="handleEdit">
          <Pencil class="h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem @click="handleView">
          <Eye class="h-4 w-4" />
          Voir
        </DropdownMenuItem>
        <DropdownMenuItem @click="handleDuplicate">
          <Copy class="h-4 w-4" />
          Dupliquer
        </DropdownMenuItem>
        <DropdownMenuItem @click="handleExportPdf">
          <Download class="h-4 w-4" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" @click="handleDelete">
          <Trash2 class="h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenu>
    </CardHeader>

    <CardContent class="pt-4">
      <div class="flex flex-wrap gap-4 border-t pt-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground uppercase tracking-wide"
            >Durée totale</span
          >
          <span class="text-base font-semibold">{{ stats.totalDuration }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground uppercase tracking-wide"
            >Thèmes</span
          >
          <span class="text-base font-semibold">{{ stats.themeCount }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground uppercase tracking-wide"
            >Mixtes</span
          >
          <Badge variant="default" class="bg-type-mixte-foreground w-fit">{{
            stats.typeProportions.mixte
          }}</Badge>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground uppercase tracking-wide"
            >Comparées</span
          >
          <Badge variant="default" class="bg-type-comparee-foreground w-fit">{{
            stats.typeProportions.comparee
          }}</Badge>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground uppercase tracking-wide"
            >Libres</span
          >
          <Badge variant="secondary" class="w-fit"
            >{{ stats.libreCount }} ({{ stats.librePercentage }}%)</Badge
          >
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { calculateBarilletStats, type Barillet } from '../types/barillet';
import Card from '@/components/ui/card.vue';
import CardHeader from '@/components/ui/cardHeader.vue';
import CardTitle from '@/components/ui/cardTitle.vue';
import CardContent from '@/components/ui/cardContent.vue';
import Button from '@/components/ui/button.vue';
import Badge from '@/components/ui/badge.vue';
import DropdownMenu from '@/components/ui/dropdownMenu.vue';
import DropdownMenuItem from '@/components/ui/dropdownMenuItem.vue';
import {
  Calendar,
  MapPin,
  MoreVertical,
  Pencil,
  Eye,
  Copy,
  Trash2,
  Download,
} from 'lucide-vue-next';

interface Props {
  barillet: Barillet;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [id: string];
  view: [id: string];
  duplicate: [id: string];
  delete: [id: string];
  exportPdf: [id: string];
}>();

const stats = computed(() => calculateBarilletStats(props.barillet));

const formatDate = (date: Date | null): string => {
  if (!date) return '';

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const handleEdit = () => {
  if (props.barillet.id) {
    emit('edit', props.barillet.id);
  }
};

const handleView = () => {
  if (props.barillet.id) {
    emit('view', props.barillet.id);
  }
};

const handleDuplicate = () => {
  if (props.barillet.id) {
    emit('duplicate', props.barillet.id);
  }
};

const handleDelete = () => {
  if (
    props.barillet.id &&
    confirm(
      `Êtes-vous sûr de vouloir supprimer "${props.barillet.title || 'ce barillet'}" ?`
    )
  ) {
    emit('delete', props.barillet.id);
  }
};

const handleExportPdf = () => {
  if (props.barillet.id) {
    emit('exportPdf', props.barillet.id);
  }
};
</script>
