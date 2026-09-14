<script setup lang="ts">
import { useEvalStore } from '@/lib/store';
import { Button, Dialog } from 'frappe-ui';
import { storeToRefs } from 'pinia';

const store = useEvalStore();
const { open, currentEval } = storeToRefs(store);
</script>

<template>
	<Dialog v-model="open" :options="{ title: 'Evaluation Form' }">
		<template #body-content>
			<h1>Edit Evaluation</h1>
			<h2>{{ currentEval?.eval_name }}</h2>
		</template>
		<template #actions>
			<div class="flex justify-end">
				<Button variant="solid" @click="() => store.toggleOpen()">Done</Button>
			</div>
		</template>
	</Dialog>
</template>
