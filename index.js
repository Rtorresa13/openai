const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI =  require('openai');


const app = express();
app.use(bodyParser.json());


const openai = new OpenAI({
  apiKey: 'sk-None-zHXAmBCFVBoBUj9LqfvOT3BlbkFJ0wbi8UKk0sNhz4l8WVd4' 
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


    // Actualizar el ticket en TeamDesk
    // await axios.post('https://tu-api-de-teamdesk.com/updateTicket', {    
    //   ticket_id,
    //   categoria
    // });

    res.status(200).json({ message: 'Categoría predicha y ticket actualizado.', categoria,prioridad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al predecir la categoría del ticket.' });
  }
});

const PORT = process.env.PORT || 3039;
app.listen(PORT, () => {
  console.log(`Servicio intermedio escuchando en el puerto ${PORT}`);
});