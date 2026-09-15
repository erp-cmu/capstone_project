<script setup lang="ts">
import { useEvalForm } from '@/composables/useEvalForm';
import { useEvalStore } from '@/lib/store';
import { Button, Dialog, Input } from 'frappe-ui';
import { storeToRefs } from 'pinia';

import EvalFormCLO from './EvalFormCLO.vue';

const { vform, scoreRaw, scoreRawAttrs, scoreScaled, scoreScaledAttrs, isPending, onSubmit } =
	useEvalForm();
const store = useEvalStore();
const { open, currentEval } = storeToRefs(store);
</script>

<template>
	<Dialog v-model="open" :options="{ title: `${currentEval?.score_recipient_information}` }">
		<template #body-content>
			<EvalFormCLO
				v-if="currentEval"
				:cloDesc="currentEval?.eval_clo_description"
				:rubricDesc="currentEval?.eval_rubric"
			/>
			<div class="flex gap-2 p-4">
				<div>
					<Input
						v-model="scoreRaw"
						v-bind="scoreRawAttrs"
						name="score_raw"
						type="number"
						label="Raw Score"
					/>
					<span
						v-if="vform.errors.value.score_raw"
						class="text-xs text-red-500 mt-1 block"
					>
						{{ vform.errors.value.score_raw }}
					</span>
				</div>
				<div>
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
		</template>
		<template #actions>
			<div class="flex justify-end gap-2">
				<Button variant="solid" @click="onSubmit" :loading="isPending">Save</Button>
				<Button variant="subtle" @click="() => store.toggleOpen()" :loading="isPending"
					>Cancel</Button
				>
			</div>
		</template>
	</Dialog>
</template>
