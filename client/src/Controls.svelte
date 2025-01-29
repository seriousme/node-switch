<script>
import Switch from "./Switch.svelte";
import Blinds from "./Blinds.svelte";
let { createSendMessage, state, controls, listItemClass } = $props();

</script>

<div class="container">
      <ul id="itemList" class="list-group">
        {#each controls as item}
          {#if item.type === "switch"}
            <li class={listItemClass}>
              {item.label}
              <Switch
                value={state[item.topic]}
                sendMsg= { createSendMessage(item.topic) }
              />
            </li>
          {/if}
        {/each}
        {#each controls as item}
          {#if item.type === "blinds"}
            <li class={listItemClass}>
              {item.label}
              <Blinds 
               sendMsg= { createSendMessage(item.topic) }
              />
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  
