import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Block {
  id: string;
  type: 'text' | 'image' | 'title' | 'subtitle';
  content: string;
  originalImage?: string;
}

interface SlideEditorProps {
  title: string;
  subtitle: string;
  content: string;
  image: string;
  layout: 'center' | 'left' | 'right' | 'full';
  onUpdate: (data: { title: string; subtitle: string; content: string; image: string; layout: 'center' | 'left' | 'right' | 'full' }) => void;
}

const SlideEditor = ({ title, subtitle, content, image, layout, onUpdate }: SlideEditorProps) => {
  const [currentLayout, setCurrentLayout] = useState<'center' | 'left' | 'right' | 'full'>(layout);
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const initialBlocks: Block[] = [];
    let blockIdCounter = 1;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const children = Array.from(tempDiv.children);
    
    if (children.length === 0) {
      initialBlocks.push({ id: String(blockIdCounter++), type: 'title', content: title });
      initialBlocks.push({ id: String(blockIdCounter++), type: 'subtitle', content: subtitle });
      if (image) {
        initialBlocks.push({ id: String(blockIdCounter++), type: 'image', content: image });
      }
      initialBlocks.push({ id: String(blockIdCounter++), type: 'text', content: content || 'Текст' });
    } else {
      children.forEach((child) => {
        const blockType = (child as HTMLElement).getAttribute('data-block-type');
        
        if (blockType === 'title' || child.tagName === 'H2' || (child as HTMLElement).classList.contains('slide-title')) {
          initialBlocks.push({ id: String(blockIdCounter++), type: 'title', content: child.textContent || '' });
        } else if (blockType === 'subtitle' || (child as HTMLElement).classList.contains('slide-subtitle') || (child.tagName === 'DIV' && child.getAttribute('style')?.includes('border-radius: 9999px'))) {
          initialBlocks.push({ id: String(blockIdCounter++), type: 'subtitle', content: child.textContent || '' });
        } else {
          initialBlocks.push({ id: String(blockIdCounter++), type: 'text', content: child.innerHTML });
        }
      });
      
      if (image) {
        initialBlocks.push({ id: String(blockIdCounter++), type: 'image', content: image });
      }
    }

    return initialBlocks;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetBlockId, setTargetBlockId] = useState<string | null>(null);
  
  useEffect(() => {
    const handleAddBlock = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: 'text' | 'image' | 'title' | 'subtitle' }>;
      const lastBlockId = blocks[blocks.length - 1]?.id || '1';
      addBlock(lastBlockId, customEvent.detail.type);
    };
    
    document.addEventListener('addBlock', handleAddBlock);
    return () => document.removeEventListener('addBlock', handleAddBlock);
  }, [blocks]);

  const updateBlock = (id: string, content: string) => {
    const updatedBlocks = blocks.map(block =>
      block.id === id ? { ...block, content } : block
    );
    setBlocks(updatedBlocks);
    notifyParent(updatedBlocks);
  };

  const addBlock = (afterId: string, type: 'text' | 'image' | 'title' | 'subtitle') => {
    const index = blocks.findIndex(b => b.id === afterId);
    
    let defaultContent = '';
    if (type === 'title') defaultContent = 'Новый заголовок';
    else if (type === 'subtitle') defaultContent = 'Новый подзаголовок';
    else if (type === 'text') defaultContent = 'Новый текстовый блок';
    
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: defaultContent
    };
    
    const updatedBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1)
    ];
    setBlocks(updatedBlocks);
    notifyParent(updatedBlocks);
    
    if (type === 'image') {
      setTargetBlockId(newBlock.id);
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      toast.error('Нельзя удалить все блоки');
      return;
    }
    const updatedBlocks = blocks.filter(b => b.id !== id);
    setBlocks(updatedBlocks);
    notifyParent(updatedBlocks);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) {
      return;
    }

    const updatedBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedBlocks[index], updatedBlocks[targetIndex]] = [updatedBlocks[targetIndex], updatedBlocks[index]];
    setBlocks(updatedBlocks);
    notifyParent(updatedBlocks);
  };

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    const blockToCopy = blocks[index];
    
    const newBlock: Block = {
      id: Date.now().toString(),
      type: blockToCopy.type,
      content: blockToCopy.content
    };
    
    const updatedBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1)
    ];
    setBlocks(updatedBlocks);
    notifyParent(updatedBlocks);
    toast.success('Блок скопирован');
  };

  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<{ compressed: string; original: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve({ compressed, original: e.target?.result as string });
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetBlockId) {
      const { compressed, original } = await compressImage(file);
      
      const updatedBlocks = blocks.map(block =>
        block.id === targetBlockId 
          ? { ...block, content: compressed, originalImage: original } 
          : block
      );
      setBlocks(updatedBlocks);
      notifyParent(updatedBlocks);
      toast.success('Изображение загружено');
      setTargetBlockId(null);
    }
  };

  const notifyParent = (updatedBlocks: Block[], newLayout?: 'center' | 'left' | 'right' | 'full') => {
    const titleBlocks = updatedBlocks.filter(b => b.type === 'title');
    const subtitleBlocks = updatedBlocks.filter(b => b.type === 'subtitle');
    const imageBlocks = updatedBlocks.filter(b => b.type === 'image');
    
    const contentParts: string[] = [];
    updatedBlocks.forEach(block => {
      if (block.type === 'title') {
        contentParts.push(`<h2 class="slide-title" data-block-type="title">${block.content}</h2>`);
      } else if (block.type === 'subtitle') {
        contentParts.push(`<div class="slide-subtitle" data-block-type="subtitle">${block.content}</div>`);
      } else if (block.type === 'text') {
        contentParts.push(`<div class="slide-text" data-block-type="text">${block.content}</div>`);
      }
    });

    onUpdate({
      title: titleBlocks.length > 0 ? titleBlocks[0].content : 'Заголовок',
      subtitle: subtitleBlocks.length > 0 ? subtitleBlocks[0].content : 'Подзаголовок',
      content: contentParts.join(''),
      image: imageBlocks.find(b => b.content)?.content || '',
      layout: newLayout || currentLayout
    });
  };

  const handleLayoutChange = (newLayout: 'center' | 'left' | 'right' | 'full') => {
    setCurrentLayout(newLayout);
    notifyParent(blocks, newLayout);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);
      notifyParent(newBlocks);
    }
  };

  const SortableBlock = ({ block, index }: { block: Block; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: block.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="group relative border border-border rounded-2xl p-4 mb-4 transition-all bg-card hover:border-primary hover:shadow-lg"
      >
        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing rounded-full shadow-md hover:shadow-lg"
            title="Перетащить"
            {...attributes}
            {...listeners}
          >
            <Icon name="GripVertical" size={14} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 rounded-full shadow-md hover:shadow-lg"
            onClick={() => moveBlock(block.id, 'up')}
            disabled={index === 0}
            title="Переместить вверх"
          >
            <Icon name="ChevronUp" size={14} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 rounded-full shadow-md hover:shadow-lg"
            onClick={() => moveBlock(block.id, 'down')}
            disabled={index === blocks.length - 1}
            title="Переместить вниз"
          >
            <Icon name="ChevronDown" size={14} />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="h-8 w-8 p-0 rounded-full shadow-md hover:shadow-lg"
            onClick={() => duplicateBlock(block.id)}
            title="Копировать блок"
          >
            <Icon name="Copy" size={14} />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0 rounded-full shadow-md hover:shadow-lg"
            onClick={() => deleteBlock(block.id)}
            title="Удалить блок"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>

        {block.type === 'title' && (
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Заголовок</label>
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              className="text-xl sm:text-2xl font-bold h-auto py-3 bg-background text-foreground rounded-xl border-2 focus:border-primary transition-all"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
        )}

        {block.type === 'subtitle' && (
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Подзаголовок</label>
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              className="h-auto py-2 bg-background text-foreground rounded-xl border-2 focus:border-primary transition-all"
            />
          </div>
        )}

        {block.type === 'text' && (
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Текстовый блок</label>
            <ReactQuill
              theme="snow"
              value={block.content}
              onChange={(value) => updateBlock(block.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ color: [] }, { background: [] }],
                  ['clean']
                ]
              }}
            />
          </div>
        )}

        {block.type === 'image' && (
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-2 block">Изображение</label>
            {block.content ? (
              <div className="relative group/image">
                <img src={block.content} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 rounded-full shadow-lg opacity-0 group-hover/image:opacity-100 transition-all"
                  onClick={() => {
                    setTargetBlockId(block.id);
                    fileInputRef.current?.click();
                  }}
                >
                  <Icon name="Upload" size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-32 rounded-2xl border-2 border-dashed hover:border-primary transition-all"
                onClick={() => {
                  setTargetBlockId(block.id);
                  fileInputRef.current?.click();
                }}
              >
                <Icon name="ImagePlus" size={24} />
              </Button>
            )}
          </div>
        )}


      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6 p-5 border border-border rounded-2xl bg-card shadow-md">
        <label className="text-sm font-medium mb-4 block text-foreground">Шаблон раскладки</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleLayoutChange('center')}
            className={`p-4 border-2 rounded-2xl transition-all hover:scale-105 ${
              currentLayout === 'center' 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-8 bg-muted rounded-lg flex items-center justify-center">
                <div className="w-3/4 h-1.5 bg-foreground/30 rounded-full" />
              </div>
              <span className="text-xs font-medium text-foreground">Центр</span>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('left')}
            className={`p-4 border-2 rounded-2xl transition-all hover:scale-105 ${
              currentLayout === 'left' 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-8 bg-muted rounded-lg flex items-start justify-start p-1">
                <div className="w-1/2 h-full bg-foreground/30 rounded-md" />
              </div>
              <span className="text-xs font-medium text-foreground">Слева</span>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('right')}
            className={`p-4 border-2 rounded-2xl transition-all hover:scale-105 ${
              currentLayout === 'right' 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-8 bg-muted rounded-lg flex items-end justify-end p-1">
                <div className="w-1/2 h-full bg-foreground/30 rounded-md" />
              </div>
              <span className="text-xs font-medium text-foreground">Справа</span>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('full')}
            className={`p-4 border-2 rounded-2xl transition-all hover:scale-105 ${
              currentLayout === 'full' 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-8 bg-foreground/30 rounded-lg" />
              <span className="text-xs font-medium text-foreground">Полный</span>
            </div>
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block, index) => (
            <SortableBlock key={block.id} block={block} index={index} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SlideEditor;