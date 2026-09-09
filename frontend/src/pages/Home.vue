<script setup lang="ts"></script>

<template>
	<section
		class="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center"
		:style="{ backgroundImage: 'url(https://picsum.photos/1600/900?random=1)' }"
	>
		<div class="absolute inset-0 bg-slate-950/75"></div>

		<div class="relative z-10 px-6 text-center text-white">
			<div
				class="mx-auto inline-block rounded-lg border border-white/10 bg-slate-950/80 px-8 py-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm sm:px-10 sm:py-6"
			>
				<p class="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-slate-300">
					Welcome
				</p>
				<h1 class="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
					Capstone Project
				</h1>
			</div>
		</div>
	</section>
</template>
