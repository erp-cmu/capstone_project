<script setup lang="ts">
import { ref } from "vue";
import { useDoc } from "frappe-ui";
import { Badge } from "frappe-ui";
const todo = useDoc({
	doctype: "ToDo",
	name: "TODO-0001",
});
</script>

<template>
	<Badge>Example Badge</Badge>
	<h1 class="text-3xl font-bold underline">Hello world!</h1>
	<pre>{{ todo }}</pre>
</template>
