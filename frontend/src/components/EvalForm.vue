<script setup lang="ts">
import { useEvalStore } from '@/lib/store';
import { toTypedSchema } from '@vee-validate/zod';
import { Button, Dialog, Input } from 'frappe-ui';
import { storeToRefs } from 'pinia';
import { useForm } from 'vee-validate';
import { computed, watch } from 'vue';
import * as z from 'zod';

const store = useEvalStore();
const { open, currentEval } = storeToRefs(store);

//Make validationSchema dynamically react when currentEval changes.
const validationSchema = computed(() => {
	const maxScore = currentEval.value?.eval_score_max ?? 4;
	const minScore = currentEval.value?.eval_score_min ?? 0;
	return toTypedSchema(
		z.object({
			score_raw: z.coerce
				.number()
				.max(maxScore, {
					message: `Raw score must be less than or equal to ${maxScore}`,
				})
				.min(minScore, {
					message: `Raw score must be greater than or equal to ${minScore}`,
				}),
			score_scaled: z.coerce.number().min(0).max(4),
		}),
	);
});

const vform = useForm({
	initialValues: {
		score_raw: String(currentEval.value?.score_score_raw ?? '0'),
		score_scaled: String(currentEval.value?.score_score_scaled ?? '0'),
	},
	validationSchema, // vee-validate unwraps computed schemas automatically
});
const [scoreRaw, scoreRawAttrs] = vform.defineField('score_raw', {
	validateOnInput: true,
});
const [scoreScaled, scoreScaledAttrs] = vform.defineField('score_scaled', {
	validateOnInput: true,
});

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

// Helper function to handle scaling math logic
const calculateScaledScore = (
	raw: number | string,
	score_max: number,
	score_min: number,
): number => {
	const rawNum = Number(raw);
	if (isNaN(rawNum)) return 0;

	if (score_max === score_min) return 0;

	// Standard min-max normalization scaled to a 0-4 range
	const normalized = (rawNum - score_min) / (score_max - score_min);
	const scaled = normalized * 4;

	// console.log(
	// 	`Calculating scaled score: raw=${rawNum}, min=${score_min}, max=${score_max}, normalized=${normalized}, scaled=${scaled}`,
	// );
	// Clamp value between 0 and 4 and round to 2 decimal places
	return Math.min(Math.max(Number(scaled.toFixed(2)), 0), 4);
};

watch(scoreRaw, (newRawVal) => {
	const newScaledScore = calculateScaledScore(
		newRawVal as number | string,
		currentEval.value?.eval_score_max ?? 4,
		currentEval.value?.eval_score_min ?? 0,
	);
	scoreScaled.value = newScaledScore;
});

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
			<Input
				v-model="scoreRaw"
				v-bind="scoreRawAttrs"
				name="score_raw"
				type="number"
				label="Raw Score"
			/>
			<span v-if="vform.errors.value.score_raw" class="text-xs text-red-500 mt-1 block">
				{{ vform.errors.value.score_raw }}
			</span>
			<Input
				v-model="scoreScaled"
				v-bind="scoreScaledAttrs"
				name="score_scaled"
				type="number"
				label="Scaled Score"
				disabled
			/>
			<span v-if="vform.errors.value.score_scaled" class="text-xs text-red-500 mt-1 block">
				{{ vform.errors.value.score_scaled }}
			</span>
		</template>
		<template #actions>
			<div class="flex justify-end gap-2">
				<Button variant="solid" @click="onSubmit">Save</Button>
				<Button variant="subtle" @click="() => store.toggleOpen()">Cancel</Button>
			</div>
		</template>
	</Dialog>
</template>
