<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	rubricDesc: string;
}>();

const rubricDescArray = computed(() => props.rubricDesc.split('\n'));
</script>

<template>
	<div class="flex flex-col gap-2">
		<ul
			class="list-disc text-md rounded-md border-l-4 border-violet-500 bg-violet-50 p-2 pl-6 text-slate-700"
		>
			<li v-for="(desc, index) in rubricDescArray" :key="index">{{ desc }}</li>
		</ul>
	</div>
</template>
