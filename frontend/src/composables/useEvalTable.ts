import { useEval } from '@/composables/useEval';
import { useEvalStore } from '@/lib/store';
import { type Eval } from '@/types/eval';
import {
  aggregationFn_count,
  aggregationFn_sum,
  columnGroupingFeature,
  columnOrderingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  rowAggregationFeature,
  rowExpandingFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/vue-table';
import { storeToRefs } from 'pinia';
import { computed, h, ref } from 'vue';

export function useEvalTable() {
  const evalStore = useEvalStore();
  const { group_mode } = storeToRefs(evalStore);

  const { data } = useEval();

  const features = tableFeatures({
    columnOrderingFeature,
    columnGroupingFeature,
    rowAggregationFeature,
    rowExpandingFeature,
    columnVisibilityFeature,
    columnSizingFeature,
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    groupedRowModel: createGroupedRowModel(),
    expandedRowModel: createExpandedRowModel(),
    aggregationFns: {
      sum: aggregationFn_sum,
      count: aggregationFn_count,
    },
  });

  const ch = createColumnHelper<typeof features, Eval>();

  const columns = computed(() =>
    ch.columns([
      ch.accessor(
        (row) => {
          if (group_mode.value === 'clo') {
            return `${row.eval_evaluator_name} - ${row.eval_evaluation_round} - CLO${row.eval_clo_number}`;
          } else if (group_mode.value === 'recipient') {
            return `${row.eval_evaluator_name} - ${row.eval_evaluation_round} - ${row.score_recipient_type} - ${row.score_recipient_type_dynamic}`;
          }
        },
        {
          // Changing the ID dynamically forces TanStack Table to re-calculate grouping & cache
          id: `grouping_column_${group_mode.value}`,
          header: () => h('span', 'Grouping Column'),
          cell: (info) => h('span', info.getValue()),
          size: 250,
          minSize: 150,
          maxSize: 300,
        },
      ),

      ch.accessor('eval_clo_number', {
        header: () => h('span', 'CLO Number'),
        // aggregationFn: 'count',
        cell: (info) => {
          return h('span', info.getValue());
        },
        aggregatedCell: () => null, // Optional
      }),

      ch.accessor('score_recipient_type_dynamic', {
        header: () => h('span', 'Recipient'),
        // aggregationFn: 'count',
        cell: (info) => {
          if (info.row.getIsGrouped()) {
            return null; // Or return h('span', '—')
          }

          const recipient_info = info.row.original.score_recipient_information;
          return h('span', recipient_info);
        },
        // Explicitly return null/empty on aggregated rows. This prevents the default behavior of showing the aggregated value.
        aggregatedCell: () => null,
      }),

      ch.accessor(
        (row) => `${row.score_score_raw} (${row.score_score_scaled})`,
        {
          id: 'score_combined',
          header: () => h('span', 'Score'),
          cell: (info) => {
            return h('span', info.getValue());
          },
          aggregatedCell: () => null,
        },
      ),
      ch.display({
        id: 'actions',
        header: () => h('span', 'Actions'),
        cell: () => null, // Left empty; rendered directly in the template
        enableSorting: false,
      }),
    ]),
  );
  const sorting = ref([{ id: 'eval_clo_number', desc: true }]);
  const table = useTable({
    key: 'eval-table',
    features,
    get columns() {
      return columns.value;
    },
    data: data,
    state: {
      get grouping() {
        return [`grouping_column_${group_mode.value}`];
      },
      expanded: true,
      columnVisibility: {
        // score_recipient_type_dynamic: false,
      },
      get sorting() {
        return sorting.value;
      },
    },
    onSortingChange: (updaterOrValue) => {
      sorting.value =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(sorting.value)
          : updaterOrValue;
    },
  });

  return { table };
}
