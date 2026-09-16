<script setup lang="ts">
import { ref } from 'vue';

import { useAuth } from '@/composables/useAuth';
import { FeatherIcon } from 'frappe-ui';

const { logout, isAuthenticated, user } = useAuth();

const isMobileMenuOpen = ref(false);

function closeMobileMenu() {
	isMobileMenuOpen.value = false;
}
</script>

<template>
	<nav class="border-slate-200 sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
			<RouterLink to="/" class="flex items-center gap-2.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 shadow-sm transition-transform hover:scale-105"
				>
					<FeatherIcon name="layers" class="h-5 w-5 text-white" />
				</div>
				<span class="text-slate-900 text-lg font-semibold tracking-tight">Capstone</span>
			</RouterLink>

			<div class="hidden items-center gap-1 md:flex">
				<RouterLink
					to="/evaluation"
					class="text-md text-slate-600 rounded-md bg-violet-100 px-3 py-2 font-medium transition-colors hover:bg-violet-200 hover:text-violet-700"
					active-class="bg-violet-50 text-violet-700"
				>
					Evaluation
				</RouterLink>
			</div>

			<div class="hidden items-center gap-3 md:flex">
				<div v-if="isAuthenticated" class="flex items-center gap-3">
					<div class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white"
						>
							{{ user?.username?.charAt(0).toUpperCase() }}
						</div>
						<span class="text-slate-700 text-sm font-medium">{{
							user?.username
						}}</span>
					</div>
					<RouterLink
						to="/"
						@click="logout"
						class="rounded-md border border-none border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-red-100 hover:text-red-600"
					>
						Log out
					</RouterLink>
				</div>
				<RouterLink
					v-else
					to="/login"
					class="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
				>
					Log in
				</RouterLink>
			</div>

			<button
				type="button"
				class="flex items-center justify-center rounded-md p-2 text-violet-600 hover:bg-violet-50 md:hidden"
				:aria-expanded="isMobileMenuOpen"
				aria-label="Toggle navigation menu"
				@click="isMobileMenuOpen = !isMobileMenuOpen"
			>
				<span v-if="!isMobileMenuOpen" class="lucide-menu size-7"></span>
				<span v-else class="lucide-x size-7"></span>
			</button>
		</div>

		<div
			v-if="isMobileMenuOpen"
			class="border-slate-200 border-t bg-white px-6 py-4 md:hidden"
		>
			<div class="flex flex-col gap-1">
				<RouterLink
					to="/evaluation"
					class="text-md text-slate-600 rounded-md bg-violet-100 px-3 py-2 font-medium transition-colors hover:bg-violet-200 hover:text-violet-700"
					active-class="bg-violet-50 text-violet-700"
					@click="closeMobileMenu"
				>
					Evaluation
				</RouterLink>
			</div>

			<div class="border-slate-200 mt-4 border-t pt-4">
				<div v-if="isAuthenticated" class="flex flex-col gap-3">
					<div class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white"
						>
							{{ user?.username?.charAt(0).toUpperCase() }}
						</div>
						<span class="text-slate-700 text-sm font-medium">{{
							user?.username
						}}</span>
					</div>
					<RouterLink
						to="/"
						class="rounded-md border border-none border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-800 transition-colors hover:bg-red-100 hover:text-red-600"
						@click="
							logout();
							closeMobileMenu();
						"
					>
						Log out
					</RouterLink>
				</div>
				<RouterLink
					v-else
					to="/login"
					class="block rounded-md bg-violet-600 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
					@click="closeMobileMenu"
				>
					Log in
				</RouterLink>
			</div>
		</div>
	</nav>
</template>
