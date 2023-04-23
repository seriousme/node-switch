const controls = [
	{
		label: "Lamp 1",
		type: "switch",
		topic: "lamp/1",
	},
	{
		label: "Lamp 2",
		type: "switch",
		topic: "lamp/2",
	},
	{
		label: "Lamp 3",
		type: "switch",
		topic: "lamp/3",
	},
	{
		label: "Luik opzij",
		type: "blinds",
		topic: "blinds/side",
	},
	{
		label: "Luik voor",
		type: "blinds",
		topic: "blinds/front",
	},
];

const settings = [
	"data/forecast",
	"config/auto",
	"config/sunblock",
	"config/useweather",
];
const topics = controls.map((item) => item.topic).concat(settings);
export { topics, controls };
