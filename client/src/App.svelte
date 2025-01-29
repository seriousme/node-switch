<script>
let error;
import Controls from "./Controls.svelte";
import Settings from "./Settings.svelte";
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

// add auto switch config topics for blinds
for (const item of controls) {
	if (item.type === "blinds") {
		topics.push(`config/auto/${item.topic}`);
	}
}

const state = $state({});
const mqttClient = new MqttClient(topics, (topic, value) => {
	state[topic] = value;
});

// this code is for demo use only
if (mqttClient.isDemo) {
	for (const item of controls) {
		if (item.type === "switch") {
			state[item.topic] = "off";
		}
	}
	state["data/forecast"] = {
		date: "2024-10-27T15:08:03.000Z",
		weer: "halfbewolkt",
		max_temp: 16,
		min_tem: 9,
		windbft: 1,
		windr: "ZW",
		neersl_perc_dag: 0,
		zond_perc_dag: 47,
	};
	for (const item of topics) {
		if (item.startsWith("config/")) {
			state[item] = "on";
		}
	}
}
// end demo

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

    <Controls
      createSendMessage= {createSendMessage}
      state= {state}
      controls= {controls}
      listItemClass= {listItemClass}
    />
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

    <Settings
      createSendMessage= {createSendMessage}
      state= {state}
      controls = {controls}
      listItemClass= {listItemClass}
    />
  {/if}
  <footer class="footer">
    <div class="container">
      {#if state.error}
        <p class="text-muted">{state.error}</p>
      {/if}
    </div>
  </footer>
</main>
