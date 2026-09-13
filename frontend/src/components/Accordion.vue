<script setup>
import { computed } from 'vue';

// Define the properties this component accepts
const props = defineProps({
	node: { type: Object, required: true },
	modelValue: { type: Array, required: true }, // Array of active/open IDs
	depth: { type: Number, default: 1 }, // Tracks nested level automatically
});

const emit = defineEmits(['update:model-value']);

// A node is a final leaf if it has no children
const isLeaf = computed(() => !props.node.children || props.node.children.length === 0);

// Check if this specific node ID should be open
const isOpen = (id) => props.modelValue.includes(id);

// Sync native HTML toggle event up to the parent array structure
const handleToggle = (id, event) => {
	const isCurrentlyOpen = event.target.open;
	let updatedList = [...props.modelValue];

	if (isCurrentlyOpen) {
		if (!updatedList.includes(id)) updatedList.push(id);
	} else {
		updatedList = updatedList.filter((nodeId) => nodeId !== id);
	}

	emit('update:model-value', updatedList);
};
</script>

<template>
	<div class="accordion-branch">
		<details :open="isOpen(node.id)" @toggle="handleToggle(node.id, $event)">
			<!-- Accordion Header -->
			<summary :class="['accordion-summary', `depth-${depth}`]">
				<span class="icon">{{ isLeaf ? '📄' : '📁' }}</span>
				<span class="title">{{ node.name }}</span>
			</summary>

			<!-- Accordion Body Content -->
			<div class="accordion-content">
				<!-- Render description if it's a leaf node -->
				<p v-if="isLeaf && node.description" class="leaf-text">
					{{ node.description }}
				</p>

				<!-- Recursively render children if they exist -->
				<template v-else-if="node.children && node.children.length">
					<AppAccordion
						v-for="child in node.children"
						:key="child.id"
						:node="child"
						:model-value="modelValue"
						:depth="depth + 1"
						@update:model-value="$emit('update:model-value', $event)"
					/>
				</template>
			</div>
		</details>
	</div>
</template>

<style scoped>
.accordion-branch {
	margin: 0.25rem 0;
}

details {
	border: 1px solid #e5e7eb;
	border-radius: 0.375rem;
	background-color: #f9fafb;
	overflow: hidden;
}

details[open] {
	border-color: #cbd5e1;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.accordion-summary {
	font-weight: 600;
	cursor: pointer;
	padding: 0.75rem 1rem;
	user-select: none;
	outline: none;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.accordion-summary:hover {
	background-color: #f3f4f6;
}

/* Dynamic styling per nested layer depth */
.depth-1 {
	color: #1f2937;
	font-size: 1rem;
}
.depth-2 {
	color: #4b5563;
	font-size: 0.95rem;
}
.depth-3 {
	color: #6b7280;
	font-size: 0.9rem;
	font-weight: 500;
}

.accordion-content {
	padding: 0.25rem 0.5rem 0.5rem 1rem;
	border-left: 2px dashed #e5e7eb;
	margin-left: 1.25rem;
	background-color: #ffffff;
}

.leaf-text {
	font-size: 0.875rem;
	color: #4b5563;
	padding: 0.5rem 0.75rem;
	margin: 0;
	border-left: 2px solid #3b82f6;
}
</style>
