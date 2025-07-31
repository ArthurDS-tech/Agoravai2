const fs = require('fs');
const path = require('path');

console.log('Ì∫Ä Configurando projeto Google Ads API Backend...');

const dirs = ['logs'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`‚úÖ Diret√≥rio criado: ${dir}`);
  }
});

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('‚ö†Ô∏è  Arquivo .env n√£o encontrado!');
  console.log('Ì≥ã Copie .env.example para .env e configure suas credenciais.');
}

console.log('‚ú® Setup conclu√≠do!');
