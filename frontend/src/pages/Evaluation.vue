<script setup lang="ts">
import EvalForm from '@/components/EvalForm.vue';
import { useEvalTable } from '@/composables/useEvalTable';
import { useEvalStore } from '@/lib/store';
import { FlexRender } from '@tanstack/vue-table';
import { Button } from 'frappe-ui';
import { storeToRefs } from 'pinia';

const evalStore = useEvalStore();
const { group_mode, currentEval } = storeToRefs(evalStore);
const { table } = useEvalTable();

function handleEditEval(evalData: any) {
	evalStore.setCurrentEval(evalData);
	evalStore.toggleOpen();
}
</script>

<template>
	<div class="flex flex-col gap-4">
		<Button @click="() => evalStore.toggleGroupMode()" variant="solid" class="self-start">
			Display Mode ({{ group_mode === 'clo' ? 'CLO' : 'Recipient' }})
		</Button>
		<table
			class="w-full overflow-hidden rounded-lg border-collapse border border-gray-200 shadow-sm"
		>
			<thead>
				<tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
					<th
						v-for="header in headerGroup.headers"
						:key="header.id"
						class="border-collapse border border-violet-700 bg-violet-600 p-2 text-sm font-semibold text-white"
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
				<tr
					v-for="row in table.getRowModel().rows"
					:key="row.id"
					class="transition-colors"
					:class="[
						row.original.eval_name + row.original.score_name ==
						(currentEval?.eval_name ?? '') + (currentEval?.score_name ?? '')
							? 'bg-violet-200 hover:bg-violet-300'
							: 'bg-white hover:bg-violet-100',
					]"
				>
					<td
						v-for="cell in row.getVisibleCells()"
						:key="cell.id"
						:class="row.getIsGrouped() ? 'bg-gray-200 italic' : ''"
						class="border-collapse border border-gray-400 p-2 text-center align-middle"
					>
						<!-- Render Edit Button on leaf nodes in the 'actions' column -->
						<template v-if="cell.column.id === 'actions' && !row.getIsGrouped()">
							<Button
								v-if="row.original.eval_docstatus === 0"
								variant="solid"
								@click="() => handleEditEval(row.original)"
							>
								Edit
							</Button>
							<Button
								v-else
								variant="subtle"
								disabled
								class="!bg-violet-300 !text-white"
							>
								Confirmed ✔️
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
								v-if="
									cell.getIsAggregated() && cell.column.columnDef.aggregatedCell
								"
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
	</div>
</template>
