fetch("http://localhost:8000/api/attractions/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Teste de Atração",
    start_time: "2026-08-23T10:00:00-03:00",
    end_time: "2026-08-23T12:00:00-03:00",
    location: "Sala 1",
    block: "A",
    status: "scheduled"
  })
}).then(async r => {
  console.log("Status:", r.status);
  console.log("Body:", await r.text());
}).catch(console.error);
