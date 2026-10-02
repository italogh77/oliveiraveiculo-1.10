import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function git(args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: process.cwd(),
    windowsHide: true,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GCM_INTERACTIVE: 'Never',
    },
  });

  return stdout.trim();
}

function warning(message) {
  console.warn(`[GitHub] ${message}`);
}

async function updateBeforeStart() {
  console.log('[GitHub] Procurando a versao mais recente do projeto...');

  try {
    await git(['rev-parse', '--is-inside-work-tree']);
  } catch {
    warning('Esta pasta nao e um repositorio Git. O site sera iniciado sem sincronizar.');
    return;
  }

  try {
    await git(['remote', 'get-url', 'origin']);
  } catch {
    warning('O repositorio remoto "origin" nao esta configurado. O site sera iniciado sem sincronizar.');
    return;
  }

  let status;
  try {
    status = await git(['status', '--porcelain']);
  } catch (error) {
    warning(`Nao foi possivel verificar os arquivos locais: ${error.message}`);
    return;
  }

  if (status) {
    warning('Existem alteracoes locais ainda nao salvas no GitHub.');
    warning('A atualizacao automatica foi ignorada para nao sobrescrever seu trabalho.');
    warning('Salve/envie as alteracoes e abra o site novamente para atualizar.');
    return;
  }

  try {
    await git(['pull', '--rebase', 'origin', 'main']);
    console.log('[GitHub] Projeto atualizado. Iniciando o site...');
  } catch (error) {
    const details = error.stderr?.trim() || error.message;
    warning(`Nao foi possivel atualizar agora: ${details}`);
    warning('O site sera iniciado com a versao que ja esta neste computador.');
  }
}

await updateBeforeStart();
