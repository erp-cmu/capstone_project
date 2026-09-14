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
		score_raw: String(currentEval.value?.score_score_raw ?? '0'),
		score_scaled: String(currentEval.value?.score_score_scaled ?? '0'),
	},
});
const [scoreRaw, scoreRawAttrs] = vform.defineField('score_raw');
const [scoreScaled, scoreScaledAttrs] = vform.defineField('score_scaled');

// Sync form values whenever a new evaluation is opened
watch(
	() => currentEval.value,
	(newVal) => {
		vform.setValues({
			score_raw: String(newVal?.score_score_raw ?? '0'),
			score_scaled: String(newVal?.score_score_scaled ?? '0'),
		});
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
			<p>{{ currentEval?.score_recipient_information }}</p>
			<p>CLO Description: {{ currentEval?.eval_clo_description }}</p>
			<p>Description: {{ currentEval?.eval_rubric }}</p>
			<Input v-model="scoreRaw" v-bind="scoreRawAttrs" type="number" label="Raw Score" />
			<Input
				v-model="scoreScaled"
				v-bind="scoreScaledAttrs"
				type="number"
				label="Scaled Score"
				disabled
			/>
		</template>
		<template #actions>
			<div class="flex justify-end gap-2">
				<Button variant="solid" @click="onSubmit">Save</Button>
				<Button variant="subtle" @click="() => store.toggleOpen()">Cancel</Button>
			</div>
		</template>
	</Dialog>
</template>
