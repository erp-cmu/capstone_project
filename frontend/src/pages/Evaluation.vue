<script setup lang="ts">
import { useEval } from '@/composables/useEval';
import { type Eval } from '@/types/eval';
import { FlexRender, tableFeatures, useTable, type ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';

const { data } = useEval();

const features = tableFeatures({});

const columns: Array<ColumnDef<typeof features, Eval>> = [
	{
		accessorFn: (row) => row.eval_evaluator_name,
		id: 'Evaluator Name',
		header: () => h('span', 'Evaluator Name'),
		cell: (info) => h('i', info.getValue<string>()),
	},
	{
		accessorFn: (row) => row.score_recipient_type_dynamic,
		id: 'Recipient Type',
		header: () => h('span', 'Recipient Type'),
		cell: (info) => h('i', info.getValue<string>()),
	},
	{
		accessorFn: (row) => row.eval_clo_number,
		id: 'CLO Number',
		header: () => h('span', 'CLO Number'),
		cell: (info) => h('i', info.getValue<string>()),
	},
];

const table = useTable({
	key: 'eval-table',
	features,
	columns,
	data: data,
});
</script>

<template>
	<h1 class="text-2xl font-bold mb-4">Evaluation</h1>

	<table>
		<thead>
			<tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
				<th v-for="header in headerGroup.headers" :key="header.id">
					<FlexRender v-if="!header.isPlaceholder" :header="header" />
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="row in table.getRowModel().rows" :key="row.id">
				<td v-for="cell in row.getAllCells()" :key="cell.id">
					<FlexRender :cell="cell" />
				</td>
			</tr>
		</tbody>
	</table>
	<!-- <div v-if="dataGrouped" v-for="(el1, el1_key) in dataGrouped" :key="el1_key" class="p-2">
		<span>Evaluator: </span>
		<span>
			{{ el1_key }}
		</span>
		<div
			v-for="(el2, el2_key) in el1"
			:key="el2_key"
			class="p-4 ml-4 border-2 border-gray-300"
		>
			<span>Recipeint Type: </span>
			<span>
				{{ el2_key }}
			</span>
			<div
				v-for="(el3, el3_key) in el2"
				:key="el3_key"
				class="p-4 ml-4 border-2 border-gray-300"
			>
				<span>Recipient Info: </span>
				<span>
					{{ el3_key }}
				</span>
				<div
					v-for="_eval in el3"
					:key="_eval.eval_name"
					class="p-4 ml-4 border-2 border-gray-300"
				>
					<span> {{ _eval.eval_name }} - {{ _eval.score_recipient_type_dynamic }} </span>
				</div>
			</div>
		</div>
	</div> -->
</template>
