<script>
  export let data;
  let fdata={};
  try {
    fdata = JSON.parse(data);
    const d = new Date(fdata.date);
    fdata.localeDate = d.toLocaleDateString("nl-NL", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  } catch (error) {
    fdata = data;
  }
</script>

<table>
  <tr>
    <th colspan="2">Weerbericht van {fdata.localeDate}</th>
  </tr>
  <tr>
    <td>Weer:</td>
    <td>{fdata.weer}</td>
  </tr>
  <tr>
    <td>Max.:</td>
    <td>{fdata.tmax} C</td>
  </tr>
  <tr>
    <td>Min.:</td>
    <td>{fdata.tmin} C</td>
  </tr>
  <tr>
    <td>Zon:</td>
    <td>{fdata.zon} %</td>
  </tr>
  <tr>
    <td>Neerslag:</td>
    <td>{fdata.neerslag} %</td>
  </tr>
  <tr>
    <td>Wind:</td>
    <td>{fdata.windk} Bft</td>
  </tr>
  <tr>
    <td>Richting:</td>
    <td>{fdata.windr}</td>
  </tr>
</table>
