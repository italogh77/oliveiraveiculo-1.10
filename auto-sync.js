/**
 * Sincronizador Automático GitHub - Oliveira Veículos
 * Monitora alterações locais e sincroniza com o GitHub automaticamente em segundo plano.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastas ignoradas para evitar loops
const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'dist-ssr',
  '.vite',
  '.idea',
  '.vscode'
]);

let syncTimeout = null;
let isSyncing = false;
let pendingChanges = false;

function log(msg) {
  const now = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${now}] ${msg}`);
}

function findGitPath() {
  const desktopRoot = path.join(process.env.LOCALAPPDATA || '', 'GitHubDesktop');

  try {
    const candidates = fs.readdirSync(desktopRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('app-'))
      .map((entry) => {
        const cmdPath = path.join(desktopRoot, entry.name, 'resources', 'app', 'git', 'cmd');
        return {
          cmdPath,
          updatedAt: fs.statSync(path.join(desktopRoot, entry.name)).mtimeMs,
        };
      })
      .filter(({ cmdPath }) => fs.existsSync(path.join(cmdPath, 'git.exe')))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return candidates[0]?.cmdPath || '';
  } catch {
    return '';
  }
}

function runGit(command) {
  return new Promise((resolve, reject) => {
    // Localiza automaticamente a versão mais recente do GitHub Desktop.
    const gitPath = findGitPath();
    const env = {
      ...process.env,
      PATH: `${process.env.PATH};${gitPath}`,
      GIT_TERMINAL_PROMPT: '0',
      GCM_INTERACTIVE: 'Never',
    };

    exec(command, { cwd: __dirname, env }, (err, stdout, stderr) => {
      if (err) {
        reject({ err, stderr: stderr || stdout });
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function syncWithGitHub() {
  if (isSyncing) {
    pendingChanges = true;
    return;
  }

  isSyncing = true;
  pendingChanges = false;

  try {
    // 1. Verificar se existe remote origin configurado
    const remotes = await runGit('git remote -v').catch(() => '');
    if (!remotes || !remotes.includes('origin')) {
      log('ℹ️ Repositório ainda não publicado no GitHub. Publique pelo GitHub Desktop para ativar o envio automático.');
      isSyncing = false;
      return;
    }

    // 2. Verificar se há alterações reais no git status
    const status = await runGit('git status --porcelain');
    if (!status) {
      log('✅ Nenhum arquivo modificado. Tudo sincronizado.');
      isSyncing = false;
      return;
    }

    log('🔄 Alterações detectadas! Preparando para sincronizar...');
    
    // 3. Adicionar arquivos e fazer commit
    await runGit('git add .');
    const timestamp = new Date().toLocaleString('pt-BR');
    await runGit(`git commit -m "Auto-sync: alteracoes em ${timestamp}"`);
    log('📦 Alterações salvas localmente.');

    // 4. Puxar possíveis alterações remotas antes do push
    log('⬇️ Verificando novidades no GitHub...');
    await runGit('git pull --rebase origin main').catch(async () => {
      await runGit('git pull origin main --no-rebase').catch(() => {});
    });

    // 5. Enviar para o GitHub
    log('⬆️ Enviando para o GitHub...');
    await runGit('git push origin main');
    log('🎉 SUCESSO! Alterações sincronizadas com o GitHub!');

  } catch (error) {
    const message = String(error.stderr || error.err || error);
    console.error('[ERRO na sincronização]:', message);
    if (/authentication|username|credential|terminal prompts disabled|could not read/i.test(message)) {
      log('🔐 Execute ATIVAR_SINCRONIZACAO_GITHUB.bat uma vez para autorizar o envio automático.');
    }
  } finally {
    isSyncing = false;
    if (pendingChanges) {
      triggerSync(5000);
    }
  }
}

function triggerSync(delayMs = 12000) {
  if (syncTimeout) clearTimeout(syncTimeout);
  log(`⏳ Alterações em andamento. Enviando em ${Math.round(delayMs / 1000)}s...`);
  syncTimeout = setTimeout(() => {
    syncWithGitHub();
  }, delayMs);
}

// Observar arquivos no diretório
function watchDirectory(dir) {
  try {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      // Ignorar arquivos/diretórios irrelevantes
      const parts = filename.split(path.sep);
      if (parts.some(part => IGNORE_DIRS.has(part) || part.startsWith('.git'))) {
        return;
      }
      if (filename.endsWith('.tmp') || filename.endsWith('.log')) {
        return;
      }

      // Agendar sincronização automática
      triggerSync(12000);
    });
  } catch (e) {
    console.error('Erro ao monitorar diretório:', e.message);
  }
}

// Puxar atualizações a cada 5 minutos caso você tenha alterado no outro PC
setInterval(async () => {
  if (!isSyncing) {
    try {
      const remotes = await runGit('git remote -v').catch(() => '');
      if (remotes && remotes.includes('origin')) {
        log('🔍 Verificação periódica: buscando novidades do outro computador...');
        await runGit('git pull --rebase origin main').catch(() => {});
      }
    } catch {}
  }
}, 5 * 60 * 1000);

console.log('=====================================================');
console.log('   SISTEMA DE SINCRONIZAÇÃO AUTOMÁTICA ATIVO');
console.log('=====================================================');
console.log('📁 Monitorando pasta do projeto Oliveira Veículos...');
console.log('💡 Sempre que você alterar fotos, textos ou códigos:');
console.log('   O sistema salvará e enviará para o GitHub sozinho!');
console.log('=====================================================\n');

watchDirectory(__dirname);

// Executar verificação inicial ao abrir
syncWithGitHub();
