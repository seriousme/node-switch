<script>
export let page;
let error;
import Switch from "./Switch.svelte";
import Blinds from "./Blinds.svelte";
import Forecast from "./Forecast.svelte";
import { topics, controls } from "./config.js";
import MqttClient from "./mqttclient.js";

function settingsPage() {
	page = "settings";
}

function controlsPage() {
	page = "controls";
}

const listItemClass =
	"list-group-item d-flex justify-content-between align-items-center";

const state = {};
const mqttClient = new MqttClient(topics, (topic, value) => {
	state[topic] = value;
});

function handleMsg(event) {
	const m = event.detail;
	mqttClient.publish(`${m.topic}/set`, m.msg);
}

// start the show
controlsPage();
</script>

<main>
  {#if page === "controls"}
    <nav class="navbar navbar-inverse bg-inverse">
      <div class="container text-light">
        <span class="navbar-brand">Huis bediening</span>
        <span
          class="navbar-brand my-2 my-sm-0"
          role="link"
          tabindex="-1"
          on:click={settingsPage}
          on:keypress={settingsPage}
        >
          &vellip;
        </span>
      </div>
    </nav>

    <div class="container">
      <ul id="itemList" class="list-group">
        {#each controls as item}
          {#if item.type === "switch"}
            <li class={listItemClass}>
              {item.label}
              <Switch
                topic={item.topic}
                value={state[item.topic]}
                on:message={handleMsg}
              />
            </li>
          {/if}
        {/each}
        {#each controls as item}
          {#if item.type === "blinds"}
            <li class={listItemClass}>
              {item.label}
              <Blinds topic={item.topic} on:message={handleMsg} />
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  {/if}
  {#if page === "settings"}
    <nav class="navbar navbar-inverse bg-inverse">
      <div class="container text-light">
        <span
          class="navbar-brand font-weight-bold"
          role="link"
          tabindex="-1"
          on:click={controlsPage}
          on:keypress={controlsPage}
        >
          &times;
        </span>
      </div>
    </nav>

    <div class="container">
      <ul id="itemList" class="list-group">
        <li class={listItemClass}>
          Automatisch schakelen op tijd
          <Switch
            topic="config/auto"
            value={state["config/auto"]}
            on:message={handleMsg}
          />
        </li>
        {#if state["config/auto"] === "on"}
          <li class={listItemClass}>
            Automatische zonblokkering
            <Switch
              topic="config/sunblock"
              value={state["config/sunblock"]}
              on:message={handleMsg}
            />
          </li>
          {#if state["config/sunblock"] === "on" && state["data/forecast"]}
            <li class={listItemClass}>
              <Forecast data={state["data/forecast"]} />
            </li>
            <li class={listItemClass}>
              Gebruik weerbericht voor zonblokkering
              <Switch
                topic="config/useweather"
                value={state["config/useweather"]}
                on:message={handleMsg}
              />
            </li>
          {/if}
        {/if}
      </ul>
    </div>
  {/if}
  <footer class="footer">
    <div class="container">
      {#if state.error}
        <p class="text-muted">{state.error}</p>
      {/if}
    </div>
  </footer>
</main>
