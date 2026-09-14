<script setup lang="ts">
import { useEval } from '@/composables/useEval';
import { useEvalStore } from '@/lib/store';
import { type Eval } from '@/types/eval';
import {
	aggregationFn_count,
	columnGroupingFeature,
	columnOrderingFeature,
	columnVisibilityFeature,
	createColumnHelper,
	createExpandedRowModel,
	createGroupedRowModel,
	FlexRender,
	rowAggregationFeature,
	rowExpandingFeature,
	tableFeatures,
	useTable,
} from '@tanstack/vue-table';
import { Button } from 'frappe-ui';
import { storeToRefs } from 'pinia';
import { computed, h } from 'vue';

const evalStore = useEvalStore();
const { group_mode } = storeToRefs(evalStore);

const { data } = useEval();

const features = tableFeatures({
	columnOrderingFeature,
	columnGroupingFeature,
	rowAggregationFeature,
	rowExpandingFeature,
	columnVisibilityFeature,
	groupedRowModel: createGroupedRowModel(),
	expandedRowModel: createExpandedRowModel(),
	aggregationFns: {
		count: aggregationFn_count,
	},
});

const ch = createColumnHelper<typeof features, Eval>();

// const columns: Array<ColumnDef<typeof features, Eval>> = ch.columns([
const columns = computed(() =>
	ch.columns([
		ch.accessor(
			(row) => {
				if (group_mode.value === 'clo') {
					return `${row.eval_evaluator_name} - ${row.eval_evaluation_round} - ${row.eval_clo_number}`;
				} else if (group_mode.value === 'recipient') {
					return `${row.eval_evaluator_name} - ${row.eval_evaluation_round} - ${row.score_recipient_type} - ${row.score_recipient_type_dynamic}`;
				}
			},
			{
				// Changing the ID dynamically forces TanStack Table to re-calculate grouping & cache
				id: `grouping_column_${group_mode.value}`,
				header: () => h('span', 'Grouping Column'),
				cell: (info) => h('span', info.getValue()),
			},
		),

		// ch.accessor('eval_evaluator_name', {
		// 	header: () => h('span', 'Evaluator Name'),
		// 	cell: (info) => h('span', info.getValue()),
		// }),
		// ch.accessor('eval_evaluation_round', {
		// 	header: () => h('span', 'Evaluation Round'),
		// 	cell: (info) => h('span', info.getValue()),
		// }),
		ch.accessor('eval_clo_number', {
			header: () => h('span', 'CLO Number'),
			// aggregationFn: 'count',
			cell: (info) => {
				return h('span', info.getValue());
			},
			aggregatedCell: () => null,
		}),
		// ch.accessor('score_recipient_type', {
		// 	header: () => h('span', 'Recipeint Type'),
		// 	cell: (info) => h('span', info.getValue()),
		// }),

		ch.accessor('score_recipient_type_dynamic', {
			header: () => h('span', 'Recipient'),
			// aggregationFn: 'count',
			cell: (info) => {
				// Hide value if the current row is a grouped parent row
				// This is be
				if (info.row.getIsGrouped()) {
					return null; // Or return h('span', '—')
				}

				const recipient_info = info.row.original.score_recipient_information;
				return h('span', recipient_info);
			},
			// Explicitly return null/empty on aggregated rows
			aggregatedCell: () => null,
		}),

		ch.accessor((row) => `${row.score_score_raw} (${row.score_score_scaled})`, {
			id: 'score_combined',
			header: () => h('span', 'Score'),
			cell: (info) => {
				return h('span', info.getValue());
			},
			aggregatedCell: () => null,
		}),
	]),
);

const table = useTable({
	key: 'eval-table',
	features,
	get columns() {
		return columns.value;
	},
	data: data,
	state: {
		// get grouping() {
		// 	if (group_mode.value === 'clo') {
		// 		return ['eval_evaluator_name', 'eval_evaluation_round', 'eval_clo_number'];
		// 	} else if (group_mode.value === 'recipient') {
		// 		return [
		// 			'eval_evaluator_name',
		// 			'eval_evaluation_round',
		// 			'score_recipient_type',
		// 			'score_recipient_type_dynamic',
		// 		];
		// 	}
		// },
		// Dynamically match the active column ID
		get grouping() {
			return [`grouping_column_${group_mode.value}`];
		},
		expanded: true,
		columnVisibility: {
			// score_recipient_type_dynamic: false,
		},
	},
});

// const depth = computed(() => {
// 	if (group_mode.value === 'clo') {
// 		return 2;
// 	} else if (group_mode.value === 'recipient') {
// 		return 3;
// 	} else {
// 		return 2;
// 	}
// });
</script>

<template>
	<h1 class="text-2xl font-bold mb-4">Evaluation</h1>

	<Button @click="() => (group_mode = group_mode === 'clo' ? 'recipient' : 'clo')">
		Toggle Grouping Mode (Current: {{ group_mode }})
	</Button>
	<table class="border-collapse border border-slate-800 p-4">
		<thead>
			<tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
				<th
					v-for="header in headerGroup.headers"
					:key="header.id"
					class="border-collapse border border-slate-800 p-2"
				>
					<FlexRender
						:render="header.column.columnDef.header"
						:props="header.getContext()"
					/>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="row in table.getRowModel().rows" :key="row.id">
				<td
					v-for="cell in row.getVisibleCells()"
					:key="cell.id"
					:class="row.getIsGrouped() ? 'bg-gray-200 italic' : ''"
					class="border-collapse border border-slate-800 p-2"
				>
					<!-- 1. Check if this specific column is what we are grouping by -->
					<!-- If it's a member row, we hide the text so it doesn't repeat -->
					<template v-if="cell.column.getIsGrouped()">
						<template v-if="row.getIsGrouped()">
							<!-- Render the group name only once on the parent row header -->
							<FlexRender
								:render="cell.column.columnDef.cell"
								:props="cell.getContext()"
							/>
						</template>
						<template v-else>
							<!-- Leave empty or add an indent placeholder for member rows -->
							<span class="text-gray-300">—</span>
						</template>
					</template>

					<!-- 2. For all other standard/aggregated columns, use your existing logic -->
					<template v-else>
						<FlexRender
							v-if="cell.getIsAggregated() && cell.column.columnDef.aggregatedCell"
							:render="cell.column.columnDef.aggregatedCell"
							:props="cell.getContext()"
						/>
						<FlexRender
							v-else
							:render="cell.column.columnDef.cell"
							:props="cell.getContext()"
						/>
					</template>
				</td>
			</tr>
		</tbody>
	</table>
</template>
