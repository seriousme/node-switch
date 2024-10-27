<script>
const active = "btn btn-primary";
const normal = "btn btn-default";

let { sendMsg, value } = $props();

function toggle() {
	const msg = value === "on" ? "off" : "on";
	sendMsg(msg);
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="btn-group btn-toggle pull-right"
  tabindex="-1"
  onclick={toggle}
  onkeydown={toggle}
  aria-pressed="false"
>
  <button class={value == "on" ? active : normal}>Aan</button>
  <button class={value == "off" ? active : normal}>Uit</button>
</div>
