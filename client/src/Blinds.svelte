<script>
let { sendMsg } = $props();

const close = () => sendMsg("close");
const stop = () => sendMsg("stop");
const open = () => sendMsg("open");
</script>


<div class="button-group pull-right">
  <button class="btn btn-default" onclick={close}>Omlaag</button>
  <button class="btn btn-default" onclick={stop}>Stop</button>
  <button class="btn btn-default" onclick={open}>Omhoog</button>
</div>



