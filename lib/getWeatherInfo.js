export async function getWeatherInfo(location, key) {
	const url =
		`https://weerlive.nl/api/weerlive_api_v2.php?key=${key}&locatie=${location}`;

	const response = await fetch(url);
	const json = await response.json();
	const today = json.wk_verw[0];
	const rawDate = json.liveweer[0].time;
	const [dt,time] = rawDate.split(' ');
	const nd = dt.split('-').reverse();
	const date = new Date([...nd,time]).toISOString();
	return {
		date,
		weer: today.image,
		max_temp: Number(today.max_temp),
		min_tem: Number(today.min_temp),
		windbft: Number(today.windbft),
		windr: today.windr,
		neersl_perc_dag: Number(today.neersl_perc_dag),
		zond_perc_dag: Number(today.zond_perc_dag),
	};
}
