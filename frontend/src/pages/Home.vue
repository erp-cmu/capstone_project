<script setup lang="ts">
import bgUrl from '@/assets/bg.jpg';
</script>

<template>
	<section
		class="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center"
		:style="{ backgroundImage: `url(${bgUrl})` }"
	>
		<div class="relative w-full bg-black/40 px-6 py-10 text-center text-white">
			<p class="text-[2rem] text-violet-200">WELCOME</p>
			<p class="mt-2 text-[1rem] font-bold">Capstone Project</p>
			<div class="mx-auto mt-6 h-1.5 w-24 rounded-full bg-violet-500"></div>
		</div>
	</section>
</template>
