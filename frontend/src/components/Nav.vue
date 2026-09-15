<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { FeatherIcon } from 'frappe-ui';

const { logout, isAuthenticated, user } = useAuth();
</script>

<template>
	<nav class="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
			<RouterLink to="/" class="flex items-center gap-2.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 shadow-sm transition-transform hover:scale-105"
				>
					<FeatherIcon name="layers" class="h-5 w-5 text-white" />
				</div>
				<span class="text-lg font-semibold tracking-tight text-slate-900">Capstone</span>
			</RouterLink>

			<div class="flex items-center gap-1">
				<RouterLink
					to="/evaluation"
					class="rounded-md px-3 py-2 text-md font-medium text-slate-600 bg-violet-100 transition-colors hover:bg-violet-200 hover:text-violet-700"
					active-class="bg-violet-50 text-violet-700"
				>
					Evaluation
				</RouterLink>
			</div>

			<div class="flex items-center gap-3">
				<div v-if="isAuthenticated" class="flex items-center gap-3">
					<div class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white"
						>
							{{ user?.username?.charAt(0).toUpperCase() }}
						</div>
						<span class="text-sm font-medium text-slate-700">{{
							user?.username
						}}</span>
					</div>
					<RouterLink
						to="/"
						@click="logout"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-800 border border-gray-300 transition-colors hover:bg-red-100 hover:text-red-600 border-none"
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
		</div>
	</nav>
</template>
