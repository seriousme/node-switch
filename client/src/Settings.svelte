<script>
let error;
import Switch from "./Switch.svelte";
import Forecast from "./Forecast.svelte";
const { createSendMessage, state, controls, listItemClass } = $props();
</script>

<div class="container">
  <ul id="itemList" class="list-group">
    <li class={listItemClass}>
      Automatisch schakelen op tijd
      <Switch
        value={state["config/auto"]}
        sendMsg= { createSendMessage("config/auto") }
      />
    </li>
    {#if state["config/auto"] === "on"}
      {#each controls as item}
        {#if item.type === "blinds"}
          <li class={listItemClass}>
            - Automatisch {item.label}
            <Switch
            value={state[`config/auto/${item.topic}`]}
            sendMsg= { createSendMessage(`config/auto/${item.topic}`) }
          />
          </li>
        {/if}
      {/each}
      <li class={listItemClass}>
        - Automatische zonblokkering
        <Switch
          value={state["config/sunblock"]}
          sendMsg= { createSendMessage("config/sunblock")}
        />
      </li>
      {#if state["config/sunblock"] === "on" && state["data/forecast"]}
        <li class={listItemClass}>
          <Forecast data={state["data/forecast"]} />
        </li>
        <li class={listItemClass}>
          - Gebruik weerbericht voor zonblokkering
          <Switch
            value={state["config/useweather"]}
            sendMsg={ createSendMessage("config/useweather")}
          />
        </li>
      {/if}
    {/if}
  </ul>
</div>

