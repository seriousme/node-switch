<script>
export let topic;
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();

const close = () => sendMsg("close");
const stop = () => sendMsg("stop");
const open = () => sendMsg("open");

function sendMsg(msg) {
	dispatch("message", { topic, msg });
}
</script>


<div class="button-group pull-right">
  <button class="btn btn-default" on:click={close}>Omlaag</button>
  <button class="btn btn-default" on:click={stop}>Stop</button>
  <button class="btn btn-default" on:click={open}>Omhoog</button>
</div>



