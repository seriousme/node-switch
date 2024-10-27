<script>
let { data } = $props();

function parseData(data) {
	try {
		const fdata = JSON.parse(data);
		const d = new Date(fdata.date);
		fdata.localeDate = d.toLocaleDateString("nl-NL", {
			weekday: "long",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		});
		return fdata;
	} catch (error) {
		return data;
	}
}
data = parseData(data);
</script>

<table>
<tbody>
  <tr>
    <th colspan="2">Weerbericht van {data.localeDate}</th>
  </tr>
  <tr>
    <td>Weer:</td>
    <td>{data.weer}</td>
  </tr>
  <tr>
    <td>Max.:</td>
    <td>{data.max_temp} C</td>
  </tr>
  <tr>
    <td>Min.:</td>
    <td>{data.min_tem} C</td>
  </tr>
  <tr>
    <td>Zon:</td>
    <td>{data.zond_perc_dag} %</td>
  </tr>
  <tr>
    <td>Neerslag:</td>
    <td>{data.neersl_perc_dag} %</td>
  </tr>
  <tr>
    <td>Wind:</td>
    <td>{data.windbft} Bft</td>
  </tr>
  <tr>
    <td>Richting:</td>
    <td>{data.windr}</td>
  </tr>
  </tbody>
</table>
