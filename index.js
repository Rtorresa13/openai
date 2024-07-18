const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI =  require('openai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
app.post('/webhook', async (req, res) => {
  const { contenido_ticket, ticket_id } = req.body;

  if (!contenido_ticket || !ticket_id) {
    return res.status(400).json({ error: 'Faltan datos necesarios del ticket.' });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "system", "content": "que categoria tendra este ticket? ["+ contenido_ticket +"] responde una unica categoria"}],
      });
      const categoria = chatCompletion.choices[0].message.content;

      const chatCompletion2 = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "system", "content": "que prioridad tendra este ticket? ["+ contenido_ticket +"] responde una unica palabra"}],
      });

      const prioridad = chatCompletion2.choices[0].message.content;

      const data = {
        Id: ticket_id,
        priority: prioridad,
        category: categoria
      };
     await axios.post('https://www.teamdesk.net/secure/api/v2/96583/62A5EEF968AA49FC8C1A6E3925C30639/Ticket/upsert.json', data);

    res.status(200).json({ message: 'Categoría predicha y ticket actualizado.', categoria,prioridad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al predecir la categoría del ticket.' });
  }
});

const PORT = process.env.PORT || 3045;
app.listen(PORT, () => {
  console.log(`Servicio intermedio escuchando en el puerto ${PORT}`);
});