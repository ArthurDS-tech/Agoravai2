const fs = require('fs');
const path = require('path');

console.log('� Configurando projeto Google Ads API Backend...');

const dirs = ['logs'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Diretório criado: ${dir}`);
  }
});

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Arquivo .env não encontrado!');
  console.log('� Copie .env.example para .env e configure suas credenciais.');
}

console.log('✨ Setup concluído!');
