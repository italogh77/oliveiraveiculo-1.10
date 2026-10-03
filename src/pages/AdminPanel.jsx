import React, { useEffect, useState, useRef, useId } from 'react';
import PhotoEditor from '../components/admin/PhotoEditor';
import VehicleCatalog from '../components/admin/VehicleCatalog';
import { normalizePhotoAdjustment, photoStyle, movePhotoWithAdjustment } from '../lib/photoAdjustments';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  assertStorageAvailable,
  auth,
  storage,
  getStorageInstance,
  getCurrentBucketName,
  updateStorageBucket,
} from '../lib/firebase';
import { useVehicles } from '../context/VehiclesContext';
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Car,
  Image,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  Eye,
  ChevronLeft,
  Link2,
  HelpCircle,
  Folder,
  ChevronRight,
  Star,
  ExternalLink,
  Copy,
  Check,
  Settings,
} from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { extractYouTubeId, formatImageUrl, formatVideoUrl, validateImageLinks } from '../lib/driveUtils';
import { compressImageFile, extractImagesFromZip } from '../lib/imageImport';
import { formatPhotoForStorage, photoThumbUrl, photoUrl } from '../lib/vehicleImages';

// ─── helpers ────────────────────────────────────────────────────────────────
// Mesmo UID usado em firestore.rules e storage.rules: só essa conta pode
// gravar dados de verdade. Qualquer outra conta é barrada aqui também, antes
// mesmo de tentar salvar algo.
const ADMIN_UID = 'wRmeQXxy18cgZudMMXDmAVh0KYI3';

const fmt = (n) =>
  Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EMPTY_FORM = {
  marca: '',
  modelo: '',
  categoria: 'Sedan',
  ano: new Date().getFullYear(),
  anoModelo: '',
  km: '',
  cambio: 'Automático',
  combustivel: 'Flex',
  cor: '',
  preco: '',
  parcela: '',
  tag: '',
  destaques: '',
  destaqueHome: false,
  fotos: [],   // array of download URLs
  fotosAjustes: [],
  video: '',   // download URL or empty
};

const CATEGORIAS = ['Sedan', 'SUV', 'Hatch', 'Pickup', 'Minivan', 'Esportivo', 'Conversível'];
const CAMBIOS = ['Automático', 'Manual', 'CVT', 'Automatizado'];
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Elétrico', 'Híbrido'];
const TAGS = ['Destaque', 'Novidade', 'Único Dono', 'Oportunidade', 'Financiado', 'Exclusivo'];

// ─── Upload progress hook ────────────────────────────────────────────────────
function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  async function upload(file, path) {
    setUploading(true);
    setProgress(0);
    const currentStorage = typeof getStorageInstance === 'function' ? getStorageInstance() : storage;
    const storageRef = ref(currentStorage, path);
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      });
      const timeout = setTimeout(() => {
        task.cancel();
        setUploading(false);
        reject(new Error('O envio demorou demais e foi cancelado. Verifique se o armazenamento está ativo.'));
      }, 30000);
      task.on(
        'state_changed',
        (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (err) => { clearTimeout(timeout); setUploading(false); reject(err); },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            clearTimeout(timeout);
            setUploading(false);
            setProgress(100);
            resolve(url);
          } catch (error) {
            clearTimeout(timeout);
            setUploading(false);
            reject(error);
          }
        }
      );
    });
  }

  return { upload, progress, uploading };
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onBack, unauthorized }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  // "Primeiro acesso" fica escondido por padrão (a conta admin já existe).
  // Só aparece se alguém abrir o link com ?setup, útil caso precise recriar a conta.
  const allowSetup = new URLSearchParams(window.location.search).has('setup');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (setupMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'Usuário não encontrado. Use "Primeiro Acesso" abaixo.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/email-already-in-use': 'Esse e-mail já está cadastrado.',
        'auth/weak-password': 'Senha deve ter ao menos 6 caracteres.',
        'auth/invalid-credential': 'Credenciais inválidas. Verifique e-mail e senha.',
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090A0F] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-amber-500/20 via-yellow-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/30 mb-4">
            <Car className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Oliveira Veículos</h1>
          <p className="text-zinc-400 text-sm mt-1">Painel Administrativo</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">
            {setupMode ? 'Criar conta Admin' : 'Entrar na conta'}
          </h2>

          {unauthorized && (
            <div className="mb-4 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Essa conta não tem permissão de administrador. Entre com a conta correta.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oliveiraveiculos.com"
                required
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.09] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.09] transition-all"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {setupMode ? 'Criar conta' : 'Entrar'}
            </motion.button>
          </form>

          {(allowSetup || setupMode) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => { setSetupMode(!setupMode); setError(''); }}
                className="text-xs text-zinc-500 hover:text-amber-400 transition-colors"
              >
                {setupMode ? '← Voltar ao login' : 'Primeiro acesso? Criar conta admin'}
              </button>
            </div>
          )}

          {onBack && (
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar ao site / Estoque</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Storage Setup / Diagnostic Modal ────────────────────────────────────────
function StorageSetupModal({ isOpen, onClose, onConnected, onSwitchToDrive }) {
  const [bucketInput, setBucketInput] = useState(() => (typeof getCurrentBucketName === 'function' ? getCurrentBucketName() : 'oliveira-veiculos.firebasestorage.app'));
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedRules, setCopiedRules] = useState(false);

  const storageRulesSnippet = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 60 * 1024 * 1024;
    }
  }
}`;

  function handleCopyRules() {
    navigator.clipboard.writeText(storageRulesSnippet);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await assertStorageAvailable(bucketInput.trim());
      setTestResult({
        success: true,
        msg: `Conectado com sucesso ao bucket: ${res.bucket}! Agora você pode fazer o upload direto de fotos do seu computador.`,
      });
      if (onConnected) onConnected(res.bucket);
    } catch {
      setTestResult({
        success: false,
        msg: 'O Storage ainda não foi ativado no Firebase ou o bucket informado não existe. Conclua os passos 1 e 2 no console do Firebase e tente novamente.',
      });
    } finally {
      setTesting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[#141518] border border-amber-400/40 rounded-2xl p-5 sm:p-6 shadow-2xl text-left my-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ativar Envio de Fotos no Firebase</h3>
            <p className="text-xs text-amber-400/90 font-medium">Cloud Storage (Gratuito - 5 GB incluídos)</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-xs text-amber-200/90 leading-relaxed">
          <p>
            O Cloud Storage ainda não foi ativado no painel do seu projeto Firebase. Para fazer upload direto de fotos e pacotes ZIP do computador, basta ativá-lo uma única vez (leva 1 minuto):
          </p>
        </div>

        <ol className="space-y-3.5 text-xs text-zinc-300 mb-5">
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black font-bold text-[11px]">1</span>
            <div>
              <p className="font-semibold text-white">Acesse o Cloud Storage no console do seu Firebase:</p>
              <a
                href="https://console.firebase.google.com/project/oliveira-veiculos/storage"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-1 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-yellow-400 text-black font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>Abrir Firebase Storage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black font-bold text-[11px]">2</span>
            <div>
              <p className="font-semibold text-white">Clique no botão azul "Começar" (ou "Primeiros passos"):</p>
              <p className="text-zinc-400 mt-0.5">Avance as etapas mantendo as configurações padrão e selecione a região (ex: <code>southamerica-east1</code> em São Paulo ou <code>us-central1</code>) e clique em <strong>Concluir</strong>.</p>
            </div>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black font-bold text-[11px]">3</span>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Cole e publique as Regras na aba "Regras" (Rules):</p>
                <button
                  type="button"
                  onClick={handleCopyRules}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRules ? 'Copiado!' : 'Copiar Regras'}</span>
                </button>
              </div>
              <pre className="mt-1 bg-black/60 border border-white/10 rounded-lg p-2 text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-24">
                {storageRulesSnippet}
              </pre>
            </div>
          </li>
        </ol>

        {/* Bucket testing form */}
        <div className="border-t border-white/10 pt-4 mb-4">
          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
            Endereço do Bucket (Auto-detectado):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={bucketInput}
              onChange={(e) => setBucketInput(e.target.value)}
              placeholder="ex: oliveira-veiculos.firebasestorage.app ou oliveira-veiculos.appspot.com"
              className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400/60"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-shine px-3 py-1.5 rounded-lg bg-[#dfb15b] hover:bg-[#efc676] text-black font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`mt-2.5 p-2.5 rounded-lg text-xs flex items-start gap-2 ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => {
              if (onSwitchToDrive) onSwitchToDrive();
              onClose();
            }}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" /> Usar fotos por link do Google Drive enquanto isso
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Vehicle Form Modal ──────────────────────────────────────────────────────
export function VehicleFormModal({ initial, onClose, onSave }) {
  const draftKey = `oliveira:vehicle-draft:${initial?.id || 'new'}`;
  const [form, setForm] = useState(() => {
    const photos = initial?.fotos?.length ? initial.fotos : initial?.foto ? [initial.foto] : [];
    const base = { ...EMPTY_FORM, ...initial, fotos: photos, fotosAjustes: photos.map((_, i) => normalizePhotoAdjustment(initial?.fotosAjustes?.[i])) };
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
      return saved?.form ? { ...base, ...saved.form } : base;
    } catch { return base; }
  });
  const [initialFormSignature] = useState(() => JSON.stringify(form));
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false); // trava contra clique duplo, não depende de re-render
  const [draftId] = useState(() => `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);
  const [toast, setToast] = useState('');
  const photoInputRef = useRef();
  const folderInputRef = useRef();
  const zipInputRef = useRef();
  const photoUpload = useUpload();
  const [photoTab, setPhotoTab] = useState('upload');
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [driveLinksInput, setDriveLinksInput] = useState('');
  const [photoStatus, setPhotoStatus] = useState({});
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedDraftSignature, setSavedDraftSignature] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [optimizationReports, setOptimizationReports] = useState([]);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [videoLinkInput, setVideoLinkInput] = useState(initial?.video || '');
  const formSignature = JSON.stringify(form);
  const isDirty = formSignature !== initialFormSignature;
  const draftSaved = isDirty && savedDraftSignature === formSignature;

  useEffect(() => {
    if (!isDirty) return undefined;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ form, savedAt: Date.now() }));
        setSavedDraftSignature(JSON.stringify(form));
      } catch { /* armazenamento pode estar indisponível */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [draftKey, form, isDirty]);

  useEffect(() => {
    const warn = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  function handleClose() {
    if (isDirty && !window.confirm('Existem alterações não publicadas. Deseja fechar? O rascunho ficará salvo neste aparelho.')) return;
    onClose();
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleAddDriveLinks() {
    if (!driveLinksInput.trim()) return;
    const { urls, errors } = validateImageLinks(driveLinksInput);
    if (urls.length === 0) {
      setToast(errors[0] || 'Nenhum link de imagem válido foi encontrado.');
      return;
    }
    setForm((f) => ({
      ...f,
      fotos: [...new Set([...(f.fotos || []), ...urls])],
      fotosAjustes: [...(f.fotosAjustes || []), ...urls.filter((url) => !(f.fotos || []).includes(url)).map(() => normalizePhotoAdjustment())],
    }));
    setToast(errors[0] || '');
    setDriveLinksInput('');
  }

  function handleApplyVideoLink() {
    if (!videoLinkInput.trim()) {
      setForm((f) => ({ ...f, video: '' }));
      return;
    }
    if (!extractYouTubeId(videoLinkInput.trim())) {
      setToast('Cole um link válido do YouTube (vídeo comum ou Shorts).');
      return;
    }
    setForm((f) => ({ ...f, video: videoLinkInput.trim() }));
    setToast('');
  }

  async function handlePhotoUpload(files) {
    const allFiles = Array.from(files || []);
    const invalidFiles = allFiles.filter((file) => !file.type.startsWith('image/') && !/\.(jpe?g|png|webp)$/i.test(file.name));
    const imageFiles = allFiles
      .filter((file) => file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' }));
    setOptimizationReports([
      ...invalidFiles.map((file) => ({ name: file.name, originalSize: file.size, status: 'error', message: 'Arquivo ignorado: não é uma imagem JPG, PNG ou WebP.' })),
      ...imageFiles.map((file) => ({ name: file.name, originalSize: file.size, status: 'waiting' })),
    ]);
    if (!imageFiles.length) { setToast('Nenhuma imagem válida foi selecionada. Use JPG, PNG ou WebP.'); return; }
    setToast(invalidFiles.length ? `${invalidFiles.length} arquivo(s) ignorado(s) porque não são imagens válidas.` : '');
    setImportStatus('Verificando o armazenamento de fotos...');
    try {
      await assertStorageAvailable();
    } catch (error) {
      setImportStatus('');
      setShowStorageModal(true);
      setToast('O Firebase Storage precisa ser ativado no Firebase Console para uploads diretos.');
      setIsFileDragging(false);
      return;
    }
    setProcessingPhotos(true);
    let uploadedCount = 0;
    for (const [index, file] of imageFiles.entries()) {
      setImportStatus(`Otimizando ${index + 1} de ${imageFiles.length}: ${file.name}`);
      setOptimizationReports((reports) => reports.map((report) => report.name === file.name
        ? { ...report, status: 'optimizing' }
        : report));
      try {
        const optimized = await compressImageFile(file);
        setOptimizationReports((reports) => reports.map((report) => report.name === file.name
          ? { ...report, status: 'uploading', largeSize: optimized.largeSize, thumbSize: optimized.thumbSize }
          : report));
        const uniqueName = typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
        setImportStatus(`Enviando ${index + 1} de ${imageFiles.length}: ${file.name}`);
        const url = await photoUpload.upload(optimized.large, `vehicles/${draftId}/${uniqueName}.${optimized.largeExtension}`);
        const thumbUrl = await photoUpload.upload(optimized.thumbnail, `vehicles/${draftId}/${uniqueName}-thumb.${optimized.thumbExtension}`);
        const photo = {
          url,
          thumbUrl,
          width: optimized.width,
          height: optimized.height,
          thumbWidth: optimized.thumbWidth,
          thumbHeight: optimized.thumbHeight,
        };
        setForm((f) => ({ ...f, fotos: [...(f.fotos || []), photo], fotosAjustes: [...(f.fotosAjustes || []), normalizePhotoAdjustment()] }));
        setOptimizationReports((reports) => reports.map((report) => report.name === file.name
          ? { ...report, status: 'done' }
          : report));
        uploadedCount += 1;
      } catch (e) {
        const storageMessages = {
          'storage/unauthorized': 'Esta conta não tem permissão para enviar fotos.',
          'storage/retry-limit-exceeded': 'A conexão falhou várias vezes. Confira a internet e tente novamente.',
          'storage/canceled': 'O envio foi cancelado antes de terminar.',
          'storage/unknown': 'O Firebase não conseguiu concluir o envio. Confira a conexão e tente novamente.',
        };
        const message = navigator.onLine === false
          ? 'Você está sem conexão com a internet. A foto não foi enviada.'
          : storageMessages[e?.code] || e?.message || 'Não foi possível otimizar ou enviar esta foto.';
        setOptimizationReports((reports) => reports.map((report) => report.name === file.name
          ? { ...report, status: 'error', message }
          : report));
        setToast('Erro nesta foto: ' + message);
      }
    }
    setImportStatus(uploadedCount ? `${uploadedCount} foto${uploadedCount > 1 ? 's' : ''} importada${uploadedCount > 1 ? 's' : ''} com sucesso.` : '');
    setProcessingPhotos(false);
    setIsFileDragging(false);
  }

  async function handleZipImport(file) {
    if (!file || !/\.zip$/i.test(file.name)) { setToast('Selecione um arquivo ZIP contendo as fotos do veículo.'); return; }
    setToast('');
    setImportStatus('Abrindo e conferindo o ZIP...');
    try {
      const images = await extractImagesFromZip(file);
      setImportStatus(`${images.length} fotos encontradas. Preparando o envio...`);
      await handlePhotoUpload(images);
    } catch (error) {
      setImportStatus('');
      setToast('Não foi possível importar o ZIP: ' + error.message);
    } finally {
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  }

  function handleDroppedFiles(files) {
    const dropped = Array.from(files || []);
    if (dropped.length === 1 && /\.zip$/i.test(dropped[0].name)) handleZipImport(dropped[0]);
    else handlePhotoUpload(dropped);
  }

  // Reordenar fotos: setas, "definir como capa" ou arrastar (a 1ª foto é a capa do carro)
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  function movePhoto(from, to) {
    if (editingPhoto !== null) return;
    setForm((f) => movePhotoWithAdjustment(f, from, to));
  }

  function removePhoto(idx) {
    if (editingPhoto !== null) return;
    setForm((f) => ({ ...f,
      fotos: f.fotos.filter((_, i) => i !== idx),
      fotosAjustes: f.fotosAjustes.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (savingRef.current) return;
    if (editingPhoto !== null) { setToast('Aplique ou cancele o enquadramento antes de salvar.'); return; }
    if (processingPhotos || photoUpload.uploading) { setToast('Aguarde a otimização e o envio das fotos antes de salvar.'); return; }
    if ((form.fotos || []).some((photo) => photoStatus[photoUrl(photo)] === 'error')) { setToast('Remova ou substitua as fotos que não carregaram antes de publicar.'); return; }
    savingRef.current = true;
    setSaving(true);
    try {
      const formattedFotos = (form.fotos || []).map(formatPhotoForStorage).filter(Boolean);
      const payload = {
        ...form,
        km: Number(form.km),
        preco: Number(String(form.preco).replace(/\D/g, '')),
        ano: Number(form.ano),
        destaques: typeof form.destaques === 'string'
          ? form.destaques.split(',').map((s) => s.trim()).filter(Boolean)
          : form.destaques,
        fotos: formattedFotos,
        fotosAjustes: formattedFotos.map((_, i) => normalizePhotoAdjustment(form.fotosAjustes?.[i])),
        foto: photoUrl(formattedFotos[0]),
        // veículo novo usa um id fixo por formulário; edição mantém o id existente
        id: initial?.id ?? draftId,
      };
      await onSave(payload);
      localStorage.removeItem(draftKey);
      onClose();
    } catch (e) {
      setToast('Erro ao salvar: ' + e.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-[#111218] border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">
              {initial ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
            </h2>
            {isDirty && <p className="mt-0.5 text-[11px] text-amber-300">{draftSaved ? 'Rascunho salvo neste aparelho' : 'Alterações não publicadas'}</p>}
          </div>
          <button type="button" onClick={handleClose} aria-label="Fechar cadastro" className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <VehicleCatalog onApply={(selection) => setForm((f) => ({ ...f, ...selection }))} />
          {/* Row: Marca / Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Marca" value={form.marca} onChange={(v) => setForm((f) => ({ ...f, marca: v, catalogoFipe: null }))} placeholder="Ex: Toyota" required />
            <Field label="Modelo e versão" value={form.modelo} onChange={(v) => setForm((f) => ({ ...f, modelo: v, catalogoFipe: null }))} placeholder="Ex: Corolla XEi" required />
          </div>

          {/* Row: Categoria / Tag */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Categoria" value={form.categoria} onChange={(v) => set('categoria', v)} options={CATEGORIAS} />
            <SelectField label="Tag" value={form.tag} onChange={(v) => set('tag', v)} options={['', ...TAGS]} />
          </div>

          {/* Row: Ano / Km */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Ano" value={form.ano} onChange={(v) => set('ano', v)} type="number" placeholder="2022" required />
            <Field label="Ano Modelo" value={form.anoModelo} onChange={(v) => setForm((f) => ({ ...f, anoModelo: v, catalogoFipe: null }))} placeholder="2022/2023" />
            <Field label="KM" value={form.km} onChange={(v) => set('km', v)} type="number" placeholder="35000" required />
          </div>

          {/* Row: Câmbio / Combustível / Cor */}
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="Câmbio" value={form.cambio} onChange={(v) => set('cambio', v)} options={CAMBIOS} />
            <SelectField label="Combustível" value={form.combustivel} onChange={(v) => set('combustivel', v)} options={COMBUSTIVEIS} />
            <Field label="Cor" value={form.cor} onChange={(v) => set('cor', v)} placeholder="Prata Metálico" />
          </div>

          {/* Row: Preço / Parcela */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Preço (R$)" value={form.preco} onChange={(v) => set('preco', v)} type="number" placeholder="89900" required />
            <Field label="Parcela (ex: 1.190)" value={form.parcela} onChange={(v) => set('parcela', v)} placeholder="1.190" />
          </div>

          {/* Destaques */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Destaques <span className="text-zinc-600">(separados por vírgula)</span>
            </label>
            <input
              value={Array.isArray(form.destaques) ? form.destaques.join(', ') : form.destaques}
              onChange={(e) => set('destaques', e.target.value)}
              placeholder="Multimídia, Câmera de ré, Bancos em couro"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>

          {/* Destaque no Carretel da Home */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
            <input
              type="checkbox"
              id="destaqueHome"
              checked={Boolean(form.destaqueHome)}
              onChange={(e) => set('destaqueHome', e.target.checked)}
              className="w-4 h-4 rounded text-amber-400 focus:ring-0 cursor-pointer accent-amber-400"
            />
            <label htmlFor="destaqueHome" className="text-xs sm:text-sm font-semibold text-white cursor-pointer select-none">
              Exibir este veículo no carretel de destaques da Página Inicial
            </label>
          </div>

          {/* ── Photo Management (Google Drive / Upload) ── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-400" /> Fotos do Veículo
              </label>

              {/* Tabs selector + Status do Storage */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPhotoTab('upload')}
                    className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                      photoTab === 'upload'
                        ? 'bg-amber-400 text-black shadow-sm font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload de Arquivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoTab('drive')}
                    className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
                      photoTab === 'drive'
                        ? 'bg-amber-400 text-black shadow-sm font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" /> Google Drive / Links
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowStorageModal(true)}
                  title="Configuração e Status do Firebase Storage"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400/90 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 transition-all cursor-pointer shadow-sm"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Status do Storage</span>
                </button>
              </div>
            </div>

            {/* Tab: Google Drive / Web Links */}
            {photoTab === 'drive' ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Cole links de fotos do Google Drive
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Você pode colar múltiplos links de uma vez (um por linha ou separados por espaço).
                    </p>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={driveLinksInput}
                  onChange={(e) => setDriveLinksInput(e.target.value)}
                  placeholder="Ex:&#10;https://drive.google.com/file/d/1aBcDeFg.../view?usp=sharing&#10;https://drive.google.com/file/d/2hIjKlMn.../view?usp=sharing"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400/60 resize-y"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Importante: no Drive, deixe a foto como <strong>"Qualquer pessoa com o link"</strong>.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDriveLinks}
                    disabled={!driveLinksInput.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-yellow-400 disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-xs transition-colors shrink-0 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Fotos
                  </button>
                </div>
              </div>
            ) : (
              /* Tab: Direct File Upload (Firebase Storage) */
              <div
                onDragEnter={(e) => { e.preventDefault(); setIsFileDragging(true); }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsFileDragging(false); }}
                onDrop={(e) => { e.preventDefault(); handleDroppedFiles(e.dataTransfer.files); }}
                className={`rounded-xl transition-colors ${isFileDragging ? 'bg-amber-400/10 ring-2 ring-amber-400/70' : ''}`}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-white/10 hover:border-amber-400/40 rounded-xl p-4 text-center cursor-pointer transition-colors group"
                  >
                    <Upload className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 mx-auto mb-1 transition-colors" />
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      Clique ou arraste fotos aqui (Múltiplas)
                    </p>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                    />
                  </div>
                  <div
                    onClick={() => folderInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-white/10 hover:border-amber-400/40 rounded-xl p-4 text-center cursor-pointer transition-colors group"
                  >
                    <Folder className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 mx-auto mb-1 transition-colors" />
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      Selecionar Pasta Inteira (Mais fácil)
                    </p>
                    <input
                      ref={folderInputRef}
                      type="file"
                      accept="image/*"
                      webkitdirectory="true"
                      directory="true"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => zipInputRef.current?.click()}
                  disabled={processingPhotos}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/10 disabled:opacity-50"
                >
                  <Folder className="h-4 w-4" /> Importar pacote ZIP de fotos
                </button>
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => handleZipImport(e.target.files?.[0])}
                />

                {photoUpload.uploading && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${photoUpload.progress}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{importStatus || `Enviando foto... ${photoUpload.progress}%`}</p>
                  </div>
                )}
                {!photoUpload.uploading && importStatus && <p className="mt-2 text-[11px] text-emerald-400">{importStatus}</p>}
                {optimizationReports.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-lg bg-black/25 p-2.5">
                    {optimizationReports.map((report, index) => (
                      <div key={`${report.name}-${index}`} className="text-[11px] text-zinc-300">
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0 truncate">{report.name}</span>
                          <span className={report.status === 'error' ? 'shrink-0 text-red-400' : report.status === 'done' ? 'shrink-0 text-emerald-400' : 'shrink-0 text-amber-300'}>
                            {report.status === 'waiting' && 'Aguardando'}
                            {report.status === 'optimizing' && 'Otimizando...'}
                            {report.status === 'uploading' && 'Enviando...'}
                            {report.status === 'done' && 'Concluída'}
                            {report.status === 'error' && 'Erro'}
                          </span>
                        </div>
                        <p className="text-zinc-500">
                          Antes: {formatBytes(report.originalSize)}
                          {report.largeSize ? ` · Foto: ${formatBytes(report.largeSize)} · Miniatura: ${formatBytes(report.thumbSize)}` : ''}
                        </p>
                        {report.message && <p className="text-red-300">{report.message}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[11px] text-zinc-500">Upload recomendado: as fotos ficam armazenadas com mais estabilidade no Firebase.</p>
              </div>
            )}

            {editingPhoto !== null && form.fotos[editingPhoto] && (
              <PhotoEditor key={editingPhoto} index={editingPhoto} url={photoUrl(form.fotos[editingPhoto])}
                adjustment={form.fotosAjustes?.[editingPhoto]}
                onCancel={() => setEditingPhoto(null)}
                onApply={(adjustment) => {
                  setForm((f) => ({ ...f, fotosAjustes: f.fotos.map((_, i) => i === editingPhoto ? adjustment : normalizePhotoAdjustment(f.fotosAjustes?.[i])) }));
                  setEditingPhoto(null);
                }} />
            )}
            {/* Preview Grid for all photos */}
            {form.fotos?.length > 0 && (
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-medium text-zinc-400">
                    {form.fotos.length} foto{form.fotos.length > 1 ? 's' : ''} vinculada{form.fotos.length > 1 ? 's' : ''} (a 1ª é a capa — arraste ou use as setas para mudar a ordem):
                  </p>
                  <button
                    type="button"
                    disabled={editingPhoto !== null}
                    onClick={() => setForm((f) => ({ ...f, fotos: [], fotosAjustes: [] }))}
                    className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Limpar todas
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.fotos.map((photo, i) => {
                    const url = photoUrl(photo);
                    return (
                    <div
                      key={`${url}-${i}`}
                      draggable={editingPhoto === null}
                      onDragStart={(e) => {
                        setDragIndex(i);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (overIndex !== i) setOverIndex(i);
                      }}
                      onDragLeave={() => setOverIndex((o) => (o === i ? null : o))}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragIndex !== null) movePhoto(dragIndex, i);
                        setDragIndex(null);
                        setOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setOverIndex(null);
                      }}
                      className={`relative overflow-hidden rounded-lg aspect-video bg-zinc-800 border cursor-grab active:cursor-grabbing transition-all ${
                        overIndex === i && dragIndex !== null && dragIndex !== i
                          ? 'border-amber-400 ring-2 ring-amber-400/60 scale-[1.02]'
                          : 'border-white/10'
                      } ${dragIndex === i ? 'opacity-40' : ''}`}
                    >
                      <img
                        src={photoThumbUrl(photo)}
                        alt={`Foto ${i + 1}`}
                        width="400"
                        height="250"
                        style={photoStyle(form.fotosAjustes?.[i])}
                        draggable={false}
                        className="w-full h-full object-cover select-none"
                        loading="lazy"
                        onLoad={() => setPhotoStatus((current) => ({ ...current, [url]: 'ok' }))}
                        onError={(e) => {
                          setPhotoStatus((current) => ({ ...current, [url]: 'error' }));
                          e.currentTarget.title = "Não foi possível carregar a imagem. Verifique se o link está público no Google Drive.";
                        }}
                      />

                      {photoStatus[url] === 'ok' && (
                        <span className="absolute right-1.5 top-9 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[9px] font-bold text-white">
                          <CheckCircle2 className="h-3 w-3" /> VÁLIDA
                        </span>
                      )}
                      {!photoStatus[url] && (
                        <span className="absolute right-1.5 top-9 flex items-center gap-1 rounded-full bg-black/75 px-2 py-1 text-[9px] font-bold text-zinc-200">
                          <Loader2 className="h-3 w-3 animate-spin" /> VERIFICANDO
                        </span>
                      )}
                      {photoStatus[url] === 'error' && (
                        <span className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-red-950/95 px-2 py-2 text-center text-[10px] font-semibold text-red-200">
                          Não carregou. Confira a permissão ou envie o arquivo.
                        </span>
                      )}

                      <button type="button" disabled={editingPhoto !== null} onClick={() => { setEditingPhoto(i); setToast(''); }}
                        className="absolute left-1.5 top-9 rounded-lg bg-black/80 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-400 hover:text-black disabled:opacity-30"
                        aria-label={`Ajustar foto ${i + 1}`}>
                        Ajustar
                      </button>
                      {/* Posição */}
                      <span className="absolute top-1.5 left-1.5 min-w-[20px] text-center text-[10px] bg-black/70 text-white font-bold rounded-full px-1.5 py-0.5">
                        {i + 1}
                      </span>

                      {/* Remover (sempre visível, funciona no celular) */}
                      <button
                        type="button"
                        disabled={editingPhoto !== null}
                        onClick={() => removePhoto(i)}
                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 rounded-full p-1.5 text-white transition-colors cursor-pointer"
                        title="Remover foto"
                        aria-label={`Remover foto ${i + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Controles de ordem */}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1.5 pt-5">
                        <button
                          type="button"
                          onClick={() => movePhoto(i, i - 1)}
                          disabled={editingPhoto !== null || i === 0}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-amber-400 hover:text-black disabled:opacity-25 disabled:hover:bg-white/15 disabled:hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                          title="Mover para a esquerda"
                          aria-label={`Mover foto ${i + 1} para trás`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {i === 0 ? (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-400 text-black font-extrabold rounded-full px-2 py-1 shadow-sm">
                            <Star className="w-3 h-3 fill-black" /> CAPA
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={editingPhoto !== null}
                            onClick={() => movePhoto(i, 0)}
                            className="flex items-center gap-1 text-[10px] bg-white/15 text-white hover:bg-amber-400 hover:text-black font-semibold rounded-full px-2 py-1 transition-colors cursor-pointer"
                            title="Usar como capa"
                          >
                            <Star className="w-3 h-3" /> Capa
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => movePhoto(i, i + 1)}
                          disabled={editingPhoto !== null || i === form.fotos.length - 1}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-amber-400 hover:text-black disabled:opacity-25 disabled:hover:bg-white/15 disabled:hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                          title="Mover para a direita"
                          aria-label={`Mover foto ${i + 1} para frente`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Link do YouTube: o vídeo permanece hospedado no YouTube */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-400" /> Link do YouTube (Opcional)
              </label>

              <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 border border-white/10 text-xs">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-md bg-amber-400 text-black shadow-sm font-semibold flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" /> YouTube
                </button>
              </div>
            </div>

            {form.video ? (
              <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-white/10">
                {(() => {
                  const vInfo = formatVideoUrl(form.video);
                  if (vInfo?.type === 'youtube' || vInfo?.type === 'drive') {
                    return (
                      <iframe
                        src={vInfo.embedUrl}
                        title="Pré-visualização do Vídeo"
                        loading="lazy"
                        className="w-full aspect-video border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }
                  return <video src={form.video} controls className="w-full max-h-48 object-contain" />;
                })()}
                <button
                  type="button"
                  onClick={() => {
                    set('video', '');
                    setVideoLinkInput('');
                  }}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 rounded-full p-1.5 text-white transition-colors cursor-pointer"
                  title="Remover vídeo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-2">
                <p className="text-xs text-zinc-300">
                  Cole o link do vídeo no <strong className="text-white">YouTube</strong> (vídeo comum ou Shorts). O vídeo não será enviado ao Firebase:
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoLinkInput}
                    onChange={(e) => setVideoLinkInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVideoLink}
                    disabled={!videoLinkInput.trim()}
                    className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-yellow-400 disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    Salvar Vídeo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview do card antes da publicação */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <button
              type="button"
              onClick={() => setShowPreview((visible) => !visible)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold text-white"
              aria-expanded={showPreview}
            >
              <span className="flex items-center gap-2"><Eye className="h-4 w-4 text-amber-400" /> Pré-visualizar anúncio</span>
              <ChevronRight className={`h-4 w-4 text-zinc-400 transition-transform ${showPreview ? 'rotate-90' : ''}`} />
            </button>
            {showPreview && (
              <div className="mx-auto mt-3 max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#181920] shadow-xl">
                <div className="relative aspect-[16/10] bg-zinc-800">
                  {form.fotos?.[0] ? (
                    <img src={photoThumbUrl(form.fotos[0])} alt="Prévia da capa" width="400" height="250" loading="lazy" className="h-full w-full object-cover" style={photoStyle(form.fotosAjustes?.[0])} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-500">Adicione uma foto de capa</div>
                  )}
                  {form.tag && <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase text-black">{form.tag}</span>}
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">{form.marca || 'Marca'}</p>
                  <h3 className="mt-1 truncate text-base font-bold text-white">{form.modelo || 'Modelo e versão'}</h3>
                  <p className="mt-1 text-xs text-zinc-400">{form.ano || 'Ano'} • {Number(form.km || 0).toLocaleString('pt-BR')} km</p>
                  <p className="mt-3 text-xl font-extrabold text-white">{form.preco ? fmt(Number(String(form.preco).replace(/\D/g, ''))) : 'Preço a informar'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              type="submit"
              disabled={saving || processingPhotos || photoUpload.uploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Publicar veículo'}
            </motion.button>
        </form>

        <StorageSetupModal
          isOpen={showStorageModal}
          onClose={() => setShowStorageModal(false)}
          onConnected={(bucket) => {
            setToast(`Storage conectado com sucesso ao bucket: ${bucket}!`);
            setImportStatus('');
          }}
          onSwitchToDrive={() => setPhotoTab('drive')}
        />
      </motion.div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/50 transition-all"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1b23] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-all"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o || '— sem tag —'}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Share Modal ─────────────────────────────────────────────────────────────
function ShareModal({ vehicle, onClose }) {
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?veiculo=${vehicle.id}`;
  const msg = encodeURIComponent(
    `🚗 *${vehicle.marca} ${vehicle.modelo}*\n` +
    `📅 ${vehicle.anoModelo || vehicle.ano} • ${Number(vehicle.km).toLocaleString('pt-BR')} km\n` +
    `💰 ${fmt(vehicle.preco)}\n\n` +
    `Veja todos os detalhes e fotos:\n${shareUrl}\n\n` +
    `Entre em contato: ${COMPANY_DATA.whatsapp}`
  );
  const waLink = `https://wa.me/?text=${msg}`;

  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#111218] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Compartilhar via WhatsApp</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-zinc-400 text-xs mb-4">
          {vehicle.marca} {vehicle.modelo} — {fmt(vehicle.preco)}
        </p>

        <div className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono break-all mb-4">
          {shareUrl}
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel({ onBack }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const { vehicles, loading, isLocalMode, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [shareVehicle, setShareVehicle] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  // Listen to auth state — só o UID do admin (mesmo das regras do Firestore/Storage)
  // pode continuar logado no painel; qualquer outra conta é deslogada na hora.
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.uid !== ADMIN_UID) {
        signOut(auth);
        setUser(null);
        setUnauthorized(true);
        setAuthChecked(true);
        return;
      }
      setUnauthorized(false);
      setUser(u);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  }

  async function handleSave(data) {
    if (editVehicle) {
      await updateVehicle(editVehicle.id, data);
      showToast('Veículo atualizado com sucesso!');
    } else {
      await addVehicle(data);
      showToast('Veículo publicado com sucesso!');
    }
    setEditVehicle(null);
    setShowForm(false);
  }

  async function handleDelete(vehicle) {
    setDeleting(true);
    try {
      await deleteVehicle(vehicle.id);
      showToast('Veículo removido.', 'error');
    } catch (e) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={() => {}} onBack={onBack} unauthorized={unauthorized} />;
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-white">
      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/[0.07] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Site
            </button>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
                <Car className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-sm tracking-tight">Painel Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:block">{user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-lg px-3 py-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Aviso: Firebase recusou o acesso, então nada está indo para o banco */}
      {isLocalMode && (
        <div className="relative z-20 bg-red-500/15 border-b border-red-500/40 px-4 py-3 text-center text-xs sm:text-sm text-red-200">
          <strong>Atenção:</strong> o Firebase recusou o acesso (regras do Firestore). Os veículos
          estão sendo salvos só neste navegador e os clientes <strong>não</strong> vão vê-los.
          Publique as regras do arquivo <code>firestore.rules</code> e depois recarregue a página.
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-3 rounded-lg border border-red-400/50 bg-red-500/20 px-3 py-1 font-semibold hover:bg-red-500/30"
          >
            Recarregar agora
          </button>
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title + Add button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Gerenciar Estoque</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} cadastrado{vehicles.length !== 1 ? 's' : ''}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setEditVehicle(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl px-4 py-2.5 text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
          >
            <Plus className="w-4 h-4" />
            Novo Veículo
          </motion.button>
        </div>

        {/* Vehicle list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum veículo cadastrado ainda.</p>
            <p className="text-sm mt-1">Clique em "Novo Veículo" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {vehicles.map((v) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden group hover:border-amber-400/30 transition-colors"
                >
                  {/* Thumb */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-900">
                    {v.foto || v.fotos?.[0] ? (
                      <img
                        src={v.fotos?.[0] ? photoThumbUrl(v.fotos[0]) : formatImageUrl(v.foto)}
                        alt={v.modelo}
                        width="400"
                        height="250"
                        style={photoStyle(v.fotosAjustes?.[0])}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-10 h-10 text-zinc-700" />
                      </div>
                    )}
                    {v.tag && (
                      <span className="absolute top-2 left-2 bg-amber-400 text-black text-[10px] font-bold rounded-md px-2 py-0.5">
                        {v.tag}
                      </span>
                    )}
                    {v.video && (
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium rounded-md px-2 py-0.5 flex items-center gap-1">
                        <Video className="w-2.5 h-2.5" /> Vídeo
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-zinc-500 font-medium">{v.marca}</p>
                    <h3 className="text-white font-bold leading-tight">{v.modelo}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {v.anoModelo || v.ano} • {Number(v.km).toLocaleString('pt-BR')} km • {v.cambio?.split(' ')[0]}
                    </p>
                    <p className="text-amber-400 font-bold mt-2">{fmt(v.preco)}</p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setShareVehicle(v)}
                        className="flex-1 flex items-center justify-center gap-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 rounded-lg py-1.5 text-xs font-medium transition-colors"
                      >
                        <Share2 className="w-3 h-3" /> WhatsApp
                      </button>
                      <button
                        onClick={() => { setEditVehicle(v); setShowForm(true); }}
                        className="flex items-center justify-center gap-1 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 rounded-lg py-1.5 px-2.5 text-xs transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(v)}
                        className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg py-1.5 px-2.5 text-xs transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <VehicleFormModal
            initial={editVehicle}
            onClose={() => { setShowForm(false); setEditVehicle(null); }}
            onSave={handleSave}
          />
        )}
        {shareVehicle && (
          <ShareModal vehicle={shareVehicle} onClose={() => setShareVehicle(null)} />
        )}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111218] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">Excluir veículo?</h3>
              <p className="text-zinc-400 text-sm mb-5">
                {confirmDelete.marca} {confirmDelete.modelo} será removido permanentemente.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-white/[0.06] text-white rounded-xl py-2.5 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${
              toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
