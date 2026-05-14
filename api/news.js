export default async function handler(req, res) {

  const query = req.query.q;

  try {

    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&hl=es&api_key=c6f556e6a1579fa2dbccd7903f215af3787e5cb6195decb882c5fcdf819b28e8`
    );

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {

    res.status(500).json({
      error: "Error obteniendo noticias"
    });

  }

}