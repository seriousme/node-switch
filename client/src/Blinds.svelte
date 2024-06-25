<script>
export let topic;
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();

const down = () => sendMsg("down");
const up = () => sendMsg("up");

function sendMsg(msg) {
	dispatch("message", { topic, msg });
}
</script>


<div class="button-group pull-right">
  <button class="btn btn-default" on:click={down}>Omlaag</button>
  <button class="btn btn-default" on:click={up}>Omhoog</button>
</div>



