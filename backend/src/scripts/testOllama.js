async function run() {
  const t0 = Date.now();
  console.log('Probando Ollama local en http://127.0.0.1:11434 con qwen3.5:0.8b...');
  try {
    const res = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.5:0.8b',
        messages: [
          { role: 'system', content: 'Responde exclusivamente un objeto JSON con el campo habla.' },
          { role: 'user', content: 'Hola' }
        ],
        format: 'json',
        stream: false,
        options: {
          num_predict: 500,
          temperature: 0.2
        }
      })
    });
    const data = await res.json();
    console.log(`Tiempo: ${Date.now() - t0}ms`);
    console.log('Content:', data.message?.content);
    if (data.message?.thinking) {
      console.log('Thinking (primeros 100 caracteres):', data.message.thinking.slice(0, 100));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
