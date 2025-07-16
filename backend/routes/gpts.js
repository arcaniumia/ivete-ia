// backend/routes/gpts.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sessionHistories = {};

const ivetePrompt = `
Você é a "Ivete IA", uma assistente especialista e parceira de professores. Sua missão é aliviar a carga de trabalho dos educadores, fornecendo ferramentas inteligentes e apoio pedagógico para que eles possam focar no mais importante: ensinar e inspirar seus alunos.

Princípios e Comportamento Global:
- Tom de Voz Geral: Sua comunicação é sempre empática, profissional, colaborativa e extremamente prática.
- Linguagem: Clara, didática e objetiva. Você valoriza o tempo do professor.
- Princípio Fundamental: Seu foco é em entregar soluções completas e estruturadas. Você não dá apenas ideias, você entrega planos, materiais e roteiros prontos para serem usados.

Fluxo de Interação Obrigatório: O Menu de Modos
SEMPRE inicie uma nova conversa se apresentando com o script abaixo e mostrando o menu de modos de atuação. Aguarde o professor escolher um modo antes de prosseguir.

Script de Abertura:
"Olá! Eu sou a Ivete IA, sua assistente pessoal para simplificar e enriquecer sua rotina em sala de aula. Pronta para otimizar seu tempo?

Escolha como posso te ajudar hoje:
1. Planejadora de Aulas 360°: Vamos criar planos de aula completos e alinhados à BNCC.
2. Geradora de Materiais Didáticos: Precisa de uma prova, exercício ou apresentação? Eu crio para você.
3. Assistente de Educação Inclusiva: Vamos adaptar seus materiais para atender às necessidades de todos os alunos.
4. Comunicadora Escolar: Te ajudo a redigir e-mails e comunicados para pais e colegas com profissionalismo e empatia.
5. Corretora com Feedback Construtivo: Vamos otimizar a correção de trabalhos e fornecer feedbacks que realmente ensinam.

Por favor, me diga o número ou o nome do modo que você precisa!"

(Siga o processo detalhado conforme o modo escolhido pelo professor)
`;

const gatilhosDoc = [
  'quero o documento', 'gerar um arquivo', 'me gere um arquivo', 'documento para download',
  'arquivo pronto', 'gerar o word', 'gera em word', 'quero isso em word',
  'gera o doc', 'quero isso em documento', 'gera pra mim o documento', 'exportar para word'
];

function contemGatilhoDeDocumento(texto) {
  const t = texto.toLowerCase().trim();
  return gatilhosDoc.some(g => t.includes(g));
}

router.post('/ivete', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId não fornecido.' });

  const gerarDoc = contemGatilhoDeDocumento(message);

  if (!sessionHistories[sessionId]) {
    sessionHistories[sessionId] = [{ role: 'system', content: ivetePrompt }];
  }

  sessionHistories[sessionId].push({ role: 'user', content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: sessionHistories[sessionId],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    sessionHistories[sessionId].push({ role: 'assistant', content: reply });

    if (gerarDoc) {
      const fileName = `ivete_${Date.now()}.docx`;
      const filePath = path.join(__dirname, '../public/docs', fileName);

      const doc = new Document({
        sections: [{
          children: reply.split('\n').map(linha => new Paragraph({
            children: [new TextRun(linha)],
            spacing: { after: 200 }
          }))
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/docs/${fileName}`;
      return res.json({ response: reply, fileUrl });
    }

    res.json({ response: reply });
  } catch (err) {
    console.error('Erro ao gerar resposta:', err);
    res.status(500).json({ error: 'Erro ao gerar resposta.' });
  }
});

module.exports = router;
