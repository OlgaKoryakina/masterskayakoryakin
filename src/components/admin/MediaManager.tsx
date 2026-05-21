import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client-safe";
import { toast } from "sonner";
import { X, Star, Link as LinkIcon, Upload, GripVertical, Loader2 } from "lucide-react";
import { detectVideoKind, getEmbedUrl } from "@/lib/video-embed";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const BUCKET = "product-images";
const MAX_VIDEO_MB = 50;

type Props = {
  images: string[];
  videos: string[];
  onChange: (next: { images: string[]; videos: string[] }) => void;
};

type Progress = { name: string; pct: number; error?: string };

export function MediaManager({ images, videos, onChange }: Props) {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      const newImgs = [...images];
      const newVids = [...videos];
      const initProgress: Progress[] = files.map((f) => ({ name: f.name, pct: 0 }));
      setProgress(initProgress);

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.type.startsWith("video/") && f.size > MAX_VIDEO_MB * 1024 * 1024) {
          setProgress((p) => p.map((x, idx) => (idx === i ? { ...x, error: `Файл > ${MAX_VIDEO_MB} МБ` } : x)));
          continue;
        }
        const path = `${Date.now()}-${i}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        setProgress((p) => p.map((x, idx) => (idx === i ? { ...x, pct: 30 } : x)));
        const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type, upsert: false });
        if (error) {
          setProgress((p) => p.map((x, idx) => (idx === i ? { ...x, error: error.message } : x)));
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        if (f.type.startsWith("video/")) newVids.push(data.publicUrl);
        else newImgs.push(data.publicUrl);
        setProgress((p) => p.map((x, idx) => (idx === i ? { ...x, pct: 100 } : x)));
      }

      onChange({ images: newImgs, videos: newVids });
      setTimeout(() => setProgress([]), 1500);
    },
    [images, videos, onChange],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  async function removeImage(idx: number) {
    const url = images[idx];
    onChange({ images: images.filter((_, i) => i !== idx), videos });
    await deleteFromStorage(url);
  }
  async function removeVideo(idx: number) {
    const url = videos[idx];
    onChange({ images, videos: videos.filter((_, i) => i !== idx) });
    if (detectVideoKind(url) === "file") await deleteFromStorage(url);
  }
  function makeCover(idx: number) {
    if (idx === 0) return;
    const next = [...images];
    const [it] = next.splice(idx, 1);
    next.unshift(it);
    onChange({ images: next, videos });
  }
  function onDragEndImages(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = images.indexOf(active.id as string);
    const newIdx = images.indexOf(over.id as string);
    onChange({ images: arrayMove(images, oldIdx, newIdx), videos });
  }
  function onDragEndVideos(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = videos.indexOf(active.id as string);
    const newIdx = videos.indexOf(over.id as string);
    onChange({ images, videos: arrayMove(videos, oldIdx, newIdx) });
  }
  function addEmbedLink() {
    const u = linkUrl.trim();
    if (!u) return;
    if (detectVideoKind(u) !== "vk") {
      toast.error("Поддерживаются только ссылки ВК Видео и ВК Клипы");
      return;
    }
    if (!getEmbedUrl(u)) {
      toast.error("Не удалось распознать ссылку ВК Видео / Клипа");
      return;
    }
    onChange({ images, videos: [...videos, u] });
    setLinkUrl("");
  }

  return (
    <div className="space-y-5">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Фото и видео</span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-brass bg-brass/5" : "border-border"
        }`}
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-brass" />
        <p className="text-sm text-bone mb-1">Перетащите файлы сюда или выберите вручную</p>
        <p className="text-[11px] text-muted-foreground mb-3">JPG, PNG, MP4, MOV — несколько файлов сразу. Видео до {MAX_VIDEO_MB} МБ.</p>
        <label className="inline-block border border-brass text-brass px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] cursor-pointer hover:bg-brass hover:text-brass-foreground">
          Выбрать файлы
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              handleFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {progress.length > 0 && (
        <div className="space-y-1">
          {progress.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {p.error ? (
                <span className="text-destructive">⚠ {p.name}: {p.error}</span>
              ) : p.pct < 100 ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-brass" />
                  <span className="text-muted-foreground truncate flex-1">{p.name}</span>
                  <span className="text-brass">{p.pct}%</span>
                </>
              ) : (
                <span className="text-emerald-400">✓ {p.name}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Фото ({images.length}) — перетаскивайте, чтобы изменить порядок. Первое — обложка.
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndImages}>
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-2">
                {images.map((u, i) => (
                  <SortableTile key={u} id={u} isCover={i === 0} onRemove={() => removeImage(i)} onMakeCover={() => makeCover(i)}>
                    <img src={u} alt="" className="w-full h-full object-cover" />
                  </SortableTile>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Видео ({videos.length})</div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndVideos}>
            <SortableContext items={videos} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-2">
                {videos.map((u, i) => {
                  const kind = detectVideoKind(u);
                  return (
                    <SortableTile key={u} id={u} onRemove={() => removeVideo(i)}>
                      {kind === "file" ? (
                        <video src={u} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <div className="w-full h-full bg-graphite flex items-center justify-center text-brass">
                          <LinkIcon className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 bg-background/80 text-[10px] px-1 uppercase">
                        {kind === "file" ? "FILE" : kind}
                      </span>
                    </SortableTile>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Добавить видео по ссылке</div>
        <div className="flex gap-2">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://vk.com/video-XXX_YYY или https://vk.com/clip-XXX_YYY"
            className="flex-1 bg-transparent border border-border focus:border-brass outline-none px-3 py-1.5 text-sm"
          />
          <button type="button" onClick={addEmbedLink} className="border border-brass text-brass px-4 text-sm">
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableTile({
  id,
  isCover,
  onRemove,
  onMakeCover,
  children,
}: {
  id: string;
  isCover?: boolean;
  onRemove: () => void;
  onMakeCover?: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative aspect-square bg-graphite group">
      {children}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="absolute top-1 left-1 bg-background/80 p-1 cursor-grab opacity-0 group-hover:opacity-100"
        aria-label="Перетащить"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      {isCover && (
        <span className="absolute bottom-1 right-1 bg-brass text-brass-foreground text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
          Обложка
        </span>
      )}
      {onMakeCover && !isCover && (
        <button
          type="button"
          onClick={onMakeCover}
          className="absolute bottom-1 right-1 bg-background/80 p-1 opacity-0 group-hover:opacity-100 hover:text-brass"
          title="Сделать обложкой"
        >
          <Star className="w-3 h-3" />
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-background/80 p-1 hover:text-destructive"
        aria-label="Удалить"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

async function deleteFromStorage(url: string) {
  try {
    const marker = `/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    /* noop */
  }
}
