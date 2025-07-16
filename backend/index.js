require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const gptRoutes = require('./routes/gpts');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir documentos gerados em Word
app.use('/docs', express.static(path.join(__dirname, 'public/docs')));

// Rotas da IA
app.use('/gpts', gptRoutes);

// ✅ Rota principal: exibe o login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

// ✅ Rota para o chat da Ivete IA
app.get('/chat/ivete', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/chat/index.html'));
});

// Fallback para páginas não encontradas
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Ivete IA rodando em http://localhost:${PORT}`);
});
