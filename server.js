const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname)));

// Rota para servir o arquivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para salvar dados do formulário
app.post('/saveForm', (req, res) => {
  const formData = req.body;
  const filePath = path.join(__dirname, 'data.json');

  fs.readFile(filePath, (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ error: 'Failed to read file' });
    }

    const jsonData = data ? JSON.parse(data) : [];
    jsonData.push(formData);

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to write file' });
      }

      res.status(200).json({ message: 'Data saved successfully' });
    });
  });
});

// Função para carregar os dados do arquivo JSON
function loadData() {
  const filePath = path.join(__dirname, 'data.json');
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Retorna um array vazio se o arquivo não existir
    } else {
      throw error; // Lança o erro se houver algum problema ao ler o arquivo
    }
  }
}

// Função para salvar os dados no arquivo JSON
function saveData(data) {
  const filePath = path.join(__dirname, 'data.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw error; // Lança o erro se houver algum problema ao escrever no arquivo
  }
}

// Rota para excluir dados do formulário
app.post('/deleteForm', (req, res) => {
  console.log('Recebido pedido de exclusão para ramal:', req.body.ramal);

  try {
    const data = loadData(); // Carrega os dados atuais do arquivo JSON
    const updatedData = data.filter(item => item.ramal !== req.body.ramal); // Filtra para excluir o ramal específico
    saveData(updatedData); // Salva os dados atualizados no arquivo JSON
    res.json({ success: true }); // Responde com sucesso após a exclusão
  } catch (error) {
    console.error('Erro ao processar a exclusão:', error);
    res.status(500).json({ error: 'Erro interno ao processar a exclusão' }); // Trata erro interno do servidor
  }
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
