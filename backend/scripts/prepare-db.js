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
  let updatedContent = schemaContent.replace(
    /datasource\s+db\s+{[^}]*provider\s*=\s*"[^"]*"[^}]*}/s,
    (match) => {
      return match.replace(/provider\s*=\s*"[^"]*"/, `provider = "${provider}"`);
    }
  );

  // Handle @db.Text markers based on provider
  if (provider === 'mysql' || provider === 'postgresql') {
    // Enable: Find "String // @db.Text" and change to "String @db.Text"
    updatedContent = updatedContent.replace(/\/\/\s+(@db\.(Text|LongText|MediumText))/g, '$1');
    console.log('🚀 Enabled @db.Text for MySQL/PostgreSQL.');
  } else {
    // Disable: Find "String @db.Text" and change to "String // @db.Text"
    // (Only if not already commented out)
    updatedContent = updatedContent.replace(/([^\/\n\s])\s+(@db\.(Text|LongText|MediumText))/g, '$1 // $2');
    console.log('📦 Kept @db.Text disabled for SQLite.');
  }

  if (schemaContent !== updatedContent) {
    fs.writeFileSync(schemaPath, updatedContent);
    console.log('✅ Updated prisma/schema.prisma successfully.');
  } else {
    console.log('ℹ️ prisma/schema.prisma is already up to date.');
  }
} catch (error) {
  console.error('❌ Failed to update prisma/schema.prisma:', error.message);
  process.exit(1);
}
