<template>
  <Card
    class="transition-shadow hover:shadow-lg flex flex-col h-full @container"
  >
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

      <!-- More Actions Dropdown -->
      <DropdownMenu>
        <template #trigger>
          <Button variant="ghost" size="icon" class="h-8 w-8">
            <MoreVertical class="h-4 w-4" />
          </Button>
        </template>

        <DropdownMenuItem @click="handleDuplicate">
          <Copy class="h-4 w-4" />
          Dupliquer
        </DropdownMenuItem>

        <!-- Export options -->
        <DropdownMenuItem @click="() => handleExport('pdf')">
          <Download class="h-4 w-4" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem @click="() => handleExport('json')">
          <FileJson class="h-4 w-4" />
          Exporter en JSON
        </DropdownMenuItem>
        <DropdownMenuItem @click="() => handleExport('xlsx')">
          <FileSpreadsheet class="h-4 w-4" />
          Exporter en Excel
        </DropdownMenuItem>
        <DropdownMenuItem @click="() => handleExport('csv')">
          <FileText class="h-4 w-4" />
          Exporter en CSV
        </DropdownMenuItem>

        <DropdownMenuItem variant="destructive" @click="showDeleteConfirm">
          <Trash2 class="h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenu>
    </CardHeader>

    <CardContent class="pt-4 flex-1">
      <div class="border-t pt-4">
        <!-- First row: Duration and Theme count -->
        <div class="flex gap-6 mb-3">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground uppercase tracking-wide"
              >Durée</span
            >
            <span class="text-lg font-semibold">{{ stats.totalDuration }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground uppercase tracking-wide"
              >Thèmes</span
            >
            <span class="text-lg font-semibold">{{ stats.themeCount }}</span>
          </div>
        </div>

        <!-- Second row: Type distribution -->
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <Badge variant="default" class="bg-type-mixte-foreground">
              {{ stats.typeProportions.mixte }}
            </Badge>
            <span class="text-xs text-muted-foreground">Mixte</span>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="default" class="bg-type-comparee-foreground">
              {{ stats.typeProportions.comparee }}
            </Badge>
            <span class="text-xs text-muted-foreground">Comparée</span>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary">
              {{ Math.round(stats.librePercentage) }}%
            </Badge>
            <span class="text-xs text-muted-foreground">Libre</span>
          </div>
        </div>
      </div>
    </CardContent>

    <!-- Primary Actions Footer -->
    <div class="border-t px-4 py-3 flex gap-2 flex-col @[22rem]:flex-row">
      <Button
        variant="default"
        class="flex-1 h-10 whitespace-nowrap"
        @click="handleEdit"
      >
        <Pencil class="h-4 w-4 mr-2" />
        Modifier
      </Button>
      <Button
        variant="outline"
        class="flex-1 h-10 whitespace-nowrap"
        @click="handleView"
      >
        <Eye class="h-4 w-4 mr-2" />
        Voir
      </Button>
      <Button
        variant="outline"
        class="flex-1 h-10 whitespace-nowrap"
        @click="handleLive"
      >
        <Play class="h-4 w-4 mr-2" />
        Live
      </Button>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Confirmer la suppression"
      :description="`Êtes-vous sûr de vouloir supprimer &quot;${barillet.title || 'ce barillet'}&quot; ? Cette action est irréversible.`"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      variant="destructive"
      @confirm="handleDelete"
    />
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { calculateBarilletStats, type Barillet } from '../types/barillet';
import Card from '@/components/ui/card.vue';
import CardHeader from '@/components/ui/cardHeader.vue';
import CardTitle from '@/components/ui/cardTitle.vue';
import CardContent from '@/components/ui/cardContent.vue';
import Button from '@/components/ui/button.vue';
import Badge from '@/components/ui/badge.vue';
import DropdownMenu from '@/components/ui/dropdownMenu.vue';
import DropdownMenuItem from '@/components/ui/dropdownMenuItem.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import {
  Calendar,
  MapPin,
  MoreVertical,
  Pencil,
  Eye,
  Copy,
  Trash2,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Play,
} from 'lucide-vue-next';

interface Props {
  barillet: Barillet;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [id: string];
  view: [id: string];
  live: [id: string];
  duplicate: [id: string];
  delete: [id: string];
  export: [id: string, format: 'pdf' | 'json' | 'xlsx' | 'csv'];
}>();

const deleteDialogOpen = ref(false);

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

const handleLive = () => {
  if (props.barillet.id) {
    emit('live', props.barillet.id);
  }
};

const handleDuplicate = () => {
  if (props.barillet.id) {
    emit('duplicate', props.barillet.id);
  }
};

const showDeleteConfirm = () => {
  deleteDialogOpen.value = true;
};

const handleDelete = () => {
  if (props.barillet.id) {
    emit('delete', props.barillet.id);
  }
};

const handleExport = (format: 'pdf' | 'json' | 'xlsx' | 'csv') => {
  if (props.barillet.id) {
    emit('export', props.barillet.id, format);
  }
};
</script>
