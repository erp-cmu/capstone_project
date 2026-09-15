<script setup lang="ts">
import { useEvalForm } from '@/composables/useEvalForm';
import { useEvalStore } from '@/lib/store';
import { Button, Dialog, Input } from 'frappe-ui';
import { storeToRefs } from 'pinia';

import EvalFormCLO from './EvalFormCLO.vue';

const {
	vform,
	scoreRaw,
	scoreRawAttrs,
	scoreScaled,
	scoreScaledAttrs,
	isPending,
	onSubmit,
	incrementScoreRaw,
	decrementScoreRaw,
} = useEvalForm();
const store = useEvalStore();
const { open, currentEval } = storeToRefs(store);
</script>

<template>
	<Dialog
		v-model="open"
		:options="{ title: `${currentEval?.score_recipient_information}`, size: '4xl' }"
	>
		<template #body-content>
			<p class="font-bold text-violet-800">{{ currentEval?.eval_clo_description }}</p>

			<div
				class="my-4 flex flex-col gap-3 rounded-xl border-2 border-violet-300 bg-violet-50 p-5 shadow-sm"
			>
				<p class="text-xs font-semibold uppercase tracking-wide text-violet-600">Score</p>
				<div class="flex gap-4">
					<div class="flex-1">
						<Input
							v-model="scoreRaw"
							v-bind="scoreRawAttrs"
							name="score_raw"
							type="number"
							label="Raw Score"
							class="focus-within:ring-violet-500"
						/>
						<span
							v-if="vform.errors.value.score_raw"
							class="text-xs text-red-500 mt-1 block"
						>
							{{ vform.errors.value.score_raw }}
						</span>
						<div class="mt-2 flex gap-2">
							<Button
								@click="incrementScoreRaw"
								variant="subtle"
								class="!bg-violet-600 hover:!bg-violet-700 text-white px-3"
								>+</Button
							>
							<Button
								@click="decrementScoreRaw"
								variant="subtle"
								class="!bg-violet-600 hover:!bg-violet-700 text-white px-3"
								>-</Button
							>
						</div>
					</div>
					<div class="flex-1">
						<Input
							v-model="scoreScaled"
							v-bind="scoreScaledAttrs"
							name="score_scaled"
							type="number"
							label="Scaled Score"
							disabled
						/>
						<span
							v-if="vform.errors.value.score_scaled"
							class="text-xs text-red-500 mt-1 block"
						>
							{{ vform.errors.value.score_scaled }}</span
						>
					</div>
				</div>
			</div>
			<EvalFormCLO v-if="currentEval" :rubricDesc="currentEval?.eval_rubric" />
		</template>
		<template #actions>
			<div class="flex justify-end gap-2">
				<Button
					variant="solid"
					class="!bg-violet-600 hover:!bg-violet-700"
					@click="onSubmit"
					:loading="isPending"
					>Save</Button
				>
				<Button variant="subtle" @click="() => store.toggleOpen()" :loading="isPending"
					>Cancel</Button
				>
			</div>
		</template>
	</Dialog>
</template>
