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
		label: "Laptop Power",
		type: "switch",
		topic: "power",
	},
	{
		label: "Luik opzij",
		type: "newBlinds",
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
