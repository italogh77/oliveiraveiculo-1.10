import React, { useState } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { formatImageUrl } from '../../lib/driveUtils';
import { normalizePhotoAdjustment, photoStyle, DEFAULT_PHOTO_ADJUSTMENT } from '../../lib/photoAdjustments';

export default function PhotoEditor({ url, index, adjustment, onApply, onCancel }) {
  const [draft, setDraft] = useState(() => normalizePhotoAdjustment(adjustment));
  const [preview, setPreview] = useState('desktop');
  const [failed, setFailed] = useState(false);
  const set = (key, value) => setDraft((old) => ({ ...old, [key]: value }));
  const button = 'rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10';
  return (
    <section aria-label={`Ajustar foto ${index + 1}`} className="mt-4 space-y-4 rounded-xl border border-amber-400/40 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sm text-white">Enquadramento · Foto {index + 1}</h3>
        <button type="button" className={button} onClick={onCancel} aria-label="Cancelar ajuste"><X size={16} /></button>
      </div>
      <p className="text-xs text-zinc-400">Ajuste a posição e o zoom. A prévia acompanha o formato usado na vitrine e nos detalhes do carro.</p>
      <div className="flex flex-wrap gap-2">
        {[['desktop', 'Computador'], ['mobile', 'Celular']].map(([value, label]) => (
          <button type="button" key={value} aria-pressed={preview === value} onClick={() => setPreview(value)} className={`${button} ${preview === value ? 'bg-amber-400/20 border-amber-400/50' : ''}`}>{label}</button>
        ))}
      </div>
      <div className="relative mx-auto w-full overflow-hidden rounded-lg bg-zinc-900" style={{ aspectRatio: preview === 'mobile' ? '4 / 3' : '16 / 10', maxWidth: preview === 'mobile' ? 340 : undefined }}>
        <img src={formatImageUrl(url)} alt={`Prévia da foto ${index + 1}`} className="h-full w-full" style={photoStyle(draft)} draggable={false} onError={() => setFailed(true)} />
        {failed && <p role="alert" className="absolute inset-0 flex items-center justify-center bg-zinc-900 p-5 text-center text-sm text-amber-300">Não foi possível carregar a foto. Confira o link e a permissão de acesso.</p>}
      </div>
      <label className="block text-xs text-zinc-300">Encaixe da foto
        <select value={draft.fit} onChange={(e) => set('fit', e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-zinc-900 p-2.5 text-white">
          <option value="cover">Preencher o quadro</option><option value="contain">Mostrar foto inteira</option>
        </select>
      </label>
      {[
        ['zoom', 'Zoom', 1, 3, 0.01, `${Math.round(draft.zoom * 100)}%`],
        ['y', 'Posição vertical (altura)', 0, 100, 1, `${draft.y}%`],
        ['x', 'Posição horizontal', 0, 100, 1, `${draft.x}%`],
      ].map(([key, label, min, max, step, value]) => (
        <label key={key} className="block text-xs text-zinc-300">
          <span className="flex justify-between gap-2"><span>{label}</span><output>{value}</output></span>
          <input type="range" aria-label={label} min={min} max={max} step={step} value={draft[key]} onChange={(e) => set(key, Number(e.target.value))} className="mt-2 h-6 w-full cursor-pointer accent-amber-400" />
        </label>
      ))}
      <p className="text-[11px] text-zinc-400">Se a posição não mudar com zoom de 100%, aumente o zoom para criar espaço de enquadramento. O arquivo original é preservado.</p>
      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className={`${button} flex items-center gap-2`} onClick={() => setDraft({ ...DEFAULT_PHOTO_ADJUSTMENT })}><RotateCcw size={14} /> Restaurar</button>
        <button type="button" disabled={failed} onClick={() => onApply(draft)} className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-black disabled:opacity-40"><Check size={15} /> Aplicar enquadramento</button>
      </div>
      <p className="text-[11px] text-zinc-500">Depois de aplicar, clique em Salvar no formulário do veículo.</p>
    </section>
  );
}
