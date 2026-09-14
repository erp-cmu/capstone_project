<script setup lang="ts">
import { useEvalStore } from '@/lib/store';
import { Button, Dialog, Input } from 'frappe-ui';
import { storeToRefs } from 'pinia';
import { useForm } from 'vee-validate';
import { watch } from 'vue';

const store = useEvalStore();
const { open, currentEval } = storeToRefs(store);
const vform = useForm({
	initialValues: {
		score: currentEval.value?.score_score_raw ?? 0,
	},
});
const [score, scoreAttrs] = vform.defineField('score');

// Sync form values whenever a new evaluation is opened
watch(
	() => currentEval.value,
	(newVal) => {
		if (newVal) {
			vform.setValues({
				score: newVal.score_score_raw ?? 0,
			});
		}
	},
	{ immediate: true },
);

const onSubmit = vform.handleSubmit((values) => {
	// Save your updated values here
	console.log('Saved values:', values);
	store.toggleOpen();
});
</script>

<template>
	<Dialog v-model="open" :options="{ title: 'Evaluation Form' }">
		<template #body-content>
			<h1>Edit Evaluation</h1>
			<h2>{{ currentEval?.eval_name }}</h2>
			<p>Recipient: {{ currentEval?.eval_clo_description }}</p>
			<p>Description: {{ currentEval?.eval_rubric }}</p>
			<Input v-model="score" v-bind="scoreAttrs" type="number" label="Score" />
		</template>
		<template #actions>
			<div class="flex justify-end">
				<Button variant="solid" @click="onSubmit">Save</Button>
				<Button variant="solid" @click="() => store.toggleOpen()">Cancel</Button>
			</div>
		</template>
	</Dialog>
</template>
