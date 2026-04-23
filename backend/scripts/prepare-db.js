const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables.');
  process.exit(1);
}

let provider = '';
if (databaseUrl.startsWith('mysql://')) {
  provider = 'mysql';
} else if (databaseUrl.startsWith('file:') || databaseUrl.includes('.db')) {
  provider = 'sqlite';
} else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  provider = 'postgresql';
} else {
  console.log('⚠️ Unknown database provider in DATABASE_URL. Defaulting to sqlite.');
  provider = 'sqlite';
}

console.log(`🔧 Detected database provider: ${provider}`);

try {
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Regex to find the datasource block and replace the provider
  const newSchemaContent = schemaContent.replace(
    /datasource\s+db\s+{[^}]*provider\s*=\s*"[^"]*"[^}]*}/s,
    (match) => {
      return match.replace(/provider\s*=\s*"[^"]*"/, `provider = "${provider}"`);
    }
  );

  if (schemaContent !== newSchemaContent) {
    fs.writeFileSync(schemaPath, newSchemaContent);
    console.log('✅ Updated prisma/schema.prisma provider successfully.');
  } else {
    console.log('ℹ️ prisma/schema.prisma provider is already correct.');
  }
} catch (error) {
  console.error('❌ Failed to update prisma/schema.prisma:', error.message);
  process.exit(1);
}
