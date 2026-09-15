<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	rubricDesc: string;
}>();

// Split rubric text into lines, extracting a leading "Score N" label (if present) from the rest of the text
// e.g. "Score 1: Problem identification is unclear..." -> ["Score 1", "Problem identification is unclear..."]
const rubricDescArray = computed(() =>
	props.rubricDesc.split('\n').map((line) => {
		const match = line.match(/^(S\w*\s*\d)[:\s]*/);
		return match ? [match[1], line.slice(match[0].length)] : [line];
	}),
);
</script>

<template>
	<div class="flex flex-col gap-2">
		<ul
			class="list-disc text-md rounded-md border-l-4 border-violet-500 bg-violet-50 p-2 pl-6 text-slate-700"
		>
			<li v-for="(parts, index) in rubricDescArray" :key="index">
				<!-- Show extracted "Score N" as a badge, otherwise render the raw line -->
				<span
					v-if="parts.length === 2"
					class="mr-2 rounded-full bg-violet-500 px-2 py-0.5 text-xs font-semibold text-white"
					>{{ parts[0] }}</span
				>{{ parts.length === 2 ? parts[1] : parts[0] }}
			</li>
		</ul>
	</div>
</template>
