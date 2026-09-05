import http from 'http';
import { CopilotRuntime, GoogleGenerativeAIAdapter, copilotRuntimeNodeHttpEndpoint } from '@copilotkit/runtime';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const serviceAdapter = new GoogleGenerativeAIAdapter({
  model: "gemini-3.5-flash",
});

const runtime = new CopilotRuntime();

const handler = copilotRuntimeNodeHttpEndpoint({
  endpoint: '/copilotkit',
  runtime,
  serviceAdapter,
});

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url.startsWith('/copilotkit')) {
    return handler(req, res);
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(4000, () => {
  console.log('CopilotKit Node Runtime running on port 4000 with OpenAIAdapter on Gemini API');
});
