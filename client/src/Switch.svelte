<script>
  export let topic;
  export let value;
  const active = "btn btn-primary";
  const normal = "btn btn-default";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  function toggle() {
    const msg = value === "on" ? "off" : "on";
    dispatch("message", { topic, msg });
  }
</script>

<div
  class="btn-group btn-toggle pull-right"
  tabindex="-1"
  on:click={toggle}
  on:keydown={toggle}
>
  <button class={value == "on" ? active : normal}>Aan</button>
  <button class={value == "off" ? active : normal}>Uit</button>
</div>
