#!/usr/bin/env node
/**
 * Script de setup do banco de dados
 * Executa o schema SQL e popula com dados iniciais
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'secureshop',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function setupDatabase() {
  console.log('🔧 Iniciando setup do banco de dados...\n');

  try {
    // Testar conexão
    console.log('📡 Testando conexão com PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Ler e executar schema
    console.log('📄 Executando schema.sql...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Schema criado com sucesso!\n');

    // Ler e executar seeds
    console.log('🌱 Executando seeds.sql...');
    const seedsPath = path.join(__dirname, '../database/seeds.sql');
    const seedsSql = fs.readFileSync(seedsPath, 'utf-8');
    await pool.query(seedsSql);
    console.log('✅ Seeds populados com sucesso!\n');

    // Verificar dados
    console.log('📊 Verificando dados...');
    const productsResult = await pool.query('SELECT COUNT(*) FROM products');
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    
    console.log(`   • Produtos: ${productsResult.rows[0].count}`);
    console.log(`   • Usuários: ${usersResult.rows[0].count}`);
    console.log('✅ Dados verificados!\n');

    console.log('🎉 Setup do banco de dados concluído com sucesso!\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. API estará disponível em: http://localhost:3001');
    console.log('   3. Health check: http://localhost:3001/health\n');

  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
