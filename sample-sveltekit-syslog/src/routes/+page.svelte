<script lang="ts">
	import { enhance } from "$app/forms";

	let { data, form } = $props();
</script>

<svelte:head>
	<title>posix-syslog demo</title>
</svelte:head>

<main>
	<h1>posix-syslog demo</h1>
	<p>Send messages to the system logger via <code>@trasherdk/posix-syslog</code>.</p>

	<form method="POST" action="?/log" use:enhance>
		<label>
			Message
			<input
				type="text"
				name="message"
				placeholder="Something happened..."
				value={form?.message ?? ""}
				required
			/>
		</label>

		<div class="row">
			<label>
				Priority
				<select name="priority">
					{#each data.priorities as p}
						<option value={p} selected={p === (form?.priority ?? "info")}>{p}</option>
					{/each}
				</select>
			</label>

			<label>
				Facility
				<select name="facility">
					{#each data.facilities as f}
						<option value={f} selected={f === (form?.facility ?? "app")}>{f}</option>
					{/each}
				</select>
			</label>
		</div>

		<button type="submit">Send to syslog</button>
	</form>

	{#if form?.error}
		<output class="error">{form.error}</output>
	{/if}

	{#if form?.success}
		<output class="success">
			Sent <strong>{form.sent.priority}</strong> to
			<strong>{form.sent.facility}</strong>: {form.sent.message}
		</output>
	{/if}

	<footer>
		<p>Check output with: <code>journalctl -t sveltekit-syslog --no-pager -n 20</code></p>
	</footer>
</main>

<style>
	:global(body) {
		font-family: system-ui, -apple-system, sans-serif;
		max-width: 40rem;
		margin: 2rem auto;
		padding: 0 1rem;
		color: #1a1a1a;
		background: #fafafa;
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}

	p {
		color: #555;
		margin-top: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: white;
		padding: 1.25rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: #444;
	}

	input, select {
		font-size: 0.95rem;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-family: inherit;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	button {
		padding: 0.6rem 1.25rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: white;
		background: #2563eb;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background: #1d4ed8;
	}

	output {
		display: block;
		margin-top: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.success {
		background: #ecfdf5;
		color: #065f46;
		border: 1px solid #a7f3d0;
	}

	.error {
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #fca5a5;
	}

	footer {
		margin-top: 2rem;
		font-size: 0.8rem;
		color: #888;
	}

	code {
		background: #f0f0f0;
		padding: 0.15em 0.4em;
		border-radius: 3px;
		font-size: 0.9em;
	}
</style>
