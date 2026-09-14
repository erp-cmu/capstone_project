<script setup lang="ts">
import EvalForm from '@/components/EvalForm.vue';
import { useEvalTable } from '@/composables/useEvalTable';
import { useEvalStore } from '@/lib/store';
import { FlexRender } from '@tanstack/vue-table';
import { Button } from 'frappe-ui';
import { storeToRefs } from 'pinia';

const evalStore = useEvalStore();
const { group_mode } = storeToRefs(evalStore);
const { table } = useEvalTable();

function handleEditEval(evalData: any) {
	evalStore.setCurrentEval(evalData);
	evalStore.toggleOpen();
}
</script>

<template>
	<h1 class="text-2xl font-bold mb-4">Evaluation</h1>

	<Button @click="() => evalStore.toggleGroupMode()">
		Display Mode ({{ group_mode === 'clo' ? 'CLO' : 'Recipient' }})
	</Button>
	<table class="border-collapse border border-slate-800 p-4">
		<thead>
			<tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
				<th
					v-for="header in headerGroup.headers"
					:key="header.id"
					class="border-collapse border border-slate-800 p-2"
					:style="{ width: `${header.getSize()}px` }"
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
					<!-- Render Edit Button on leaf nodes in the 'actions' column -->
					<template v-if="cell.column.id === 'actions'">
						<Button
							v-if="!row.getIsGrouped()"
							appearance="subtle"
							@click="() => handleEditEval(row.original)"
						>
							Edit
						</Button>
					</template>

					<!-- Check if this specific column is what we are grouping by -->
					<!-- If it's a member row, we hide the text so it doesn't repeat -->
					<template v-else-if="cell.column.getIsGrouped()">
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

					<!-- For all other standard/aggregated columns, use your existing logic -->
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

	<!-- Evaluation Form -->
	<EvalForm />
</template>
