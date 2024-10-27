<script>
let error;
import Switch from "./Switch.svelte";
import Blinds from "./Blinds.svelte";
import Forecast from "./Forecast.svelte";
import { topics, controls } from "./config.js";
import MqttClient from "./mqttclient.js";
let { page = $bindable() } = $props();

function settingsPage() {
	page = "settings";
}

function controlsPage() {
	page = "controls";
}

const listItemClass =
	"list-group-item d-flex justify-content-between align-items-center";

const state = $state({});
const mqttClient = new MqttClient(topics, (topic, value) => {
	state[topic] = value;
});

function createSendMessage(topic) {
	return (message) => mqttClient.publish(`${topic}/set`, message);
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
          onclick={settingsPage}
          onkeypress={settingsPage}
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
                value={state[item.topic]}
                sendMsg=createSendMessage(item.topic)
              />
            </li>
          {/if}
        {/each}
        {#each controls as item}
          {#if item.type === "blinds"}
            <li class={listItemClass}>
              {item.label}
              <Blinds 
               sendMsg=createSendMessage(item.topic)
              />
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
          onclick={controlsPage}
          onkeypress={controlsPage}
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
            value={state["config/auto"]}
            sendMsg= { createSendMessage("config/auto") }
          />
        </li>
        {#if state["config/auto"] === "on"}
          <li class={listItemClass}>
            Automatische zonblokkering
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
              Gebruik weerbericht voor zonblokkering
              <Switch
                value={state["config/useweather"]}
                sendMsg={ createSendMessage("config/useweather")}
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
