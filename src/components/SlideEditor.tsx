import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Block {
  id: string;
  type: 'text' | 'image' | 'title' | 'subtitle';
  content: string;
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
    const initialBlocks: Block[] = [
      { id: '1', type: 'title', content: title },
      { id: '2', type: 'subtitle', content: subtitle }
    ];

    if (image) {
      initialBlocks.push({ id: '3', type: 'image', content: image });
    }

    initialBlocks.push({ id: '4', type: 'text', content: content });

    return initialBlocks;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetBlockId, setTargetBlockId] = useState<string | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedBlockId) return;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (ctrlKey && e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        moveBlock(focusedBlockId, 'up');
      } else if (ctrlKey && e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        moveBlock(focusedBlockId, 'down');
      } else if (ctrlKey && e.key === 'd') {
        e.preventDefault();
        duplicateBlock(focusedBlockId);
      } else if (ctrlKey && e.key === 'Backspace') {
        e.preventDefault();
        deleteBlock(focusedBlockId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedBlockId, blocks]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetBlockId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBlock(targetBlockId, reader.result as string);
        toast.success('Изображение загружено');
        setTargetBlockId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const notifyParent = (updatedBlocks: Block[], newLayout?: 'center' | 'left' | 'right' | 'full') => {
    const titleBlocks = updatedBlocks.filter(b => b.type === 'title');
    const subtitleBlocks = updatedBlocks.filter(b => b.type === 'subtitle');
    const imageBlocks = updatedBlocks.filter(b => b.type === 'image');
    const textBlocks = updatedBlocks.filter(b => b.type === 'text');

    onUpdate({
      title: titleBlocks.map(b => b.content).join(' • '),
      subtitle: subtitleBlocks.map(b => b.content).join(' • '),
      content: textBlocks.map(b => b.content).join('\n\n'),
      image: imageBlocks.find(b => b.content)?.content || '',
      layout: newLayout || currentLayout
    });
  };

  const handleLayoutChange = (newLayout: 'center' | 'left' | 'right' | 'full') => {
    setCurrentLayout(newLayout);
    notifyParent(blocks, newLayout);
  };

  const renderBlock = (block: Block, index: number) => {
    return (
      <div 
        key={block.id} 
        className={`group relative border rounded-lg p-4 mb-4 transition-colors ${
          focusedBlockId === block.id 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'border-border hover:border-primary'
        }`}
        onFocus={() => setFocusedBlockId(block.id)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocusedBlockId(null);
          }
        }}
        tabIndex={0}
      >
        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0"
            onClick={() => moveBlock(block.id, 'up')}
            disabled={index === 0}
            title="Переместить вверх"
          >
            <Icon name="ChevronUp" size={14} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0"
            onClick={() => moveBlock(block.id, 'down')}
            disabled={index === blocks.length - 1}
            title="Переместить вниз"
          >
            <Icon name="ChevronDown" size={14} />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="h-7 w-7 p-0"
            onClick={() => duplicateBlock(block.id)}
            title="Копировать блок"
          >
            <Icon name="Copy" size={14} />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 w-7 p-0"
            onClick={() => deleteBlock(block.id)}
            title="Удалить блок"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>

        {block.type === 'title' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Заголовок</label>
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              className="text-2xl font-bold h-auto py-2"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
        )}

        {block.type === 'subtitle' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Подзаголовок</label>
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              className="h-auto py-2"
            />
          </div>
        )}

        {block.type === 'text' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Текстовый блок</label>
            <ReactQuill
              theme="snow"
              value={block.content}
              onChange={(value) => updateBlock(block.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean']
                ]
              }}
            />
          </div>
        )}

        {block.type === 'image' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Изображение</label>
            {block.content ? (
              <div className="relative">
                <img src={block.content} alt="Preview" className="w-full h-48 object-cover rounded" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
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
                className="w-full h-32"
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

        <div className="flex gap-2 mt-3 pt-3 border-t border-border flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => addBlock(block.id, 'title')}
            className="text-xs"
          >
            <Icon name="Heading1" size={14} className="mr-1" />
            Заголовок
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => addBlock(block.id, 'subtitle')}
            className="text-xs"
          >
            <Icon name="Heading2" size={14} className="mr-1" />
            Подзаголовок
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => addBlock(block.id, 'text')}
            className="text-xs"
          >
            <Icon name="Type" size={14} className="mr-1" />
            Текст
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => addBlock(block.id, 'image')}
            className="text-xs"
          >
            <Icon name="ImagePlus" size={14} className="mr-1" />
            Фото
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
        <label className="text-sm font-medium mb-3 block">Горячие клавиши</label>
        <div className="text-xs text-muted-foreground space-y-1 mb-4">
          <div><kbd className="px-2 py-0.5 bg-background border rounded">Ctrl/⌘ + Shift + ↑</kbd> — Переместить вверх</div>
          <div><kbd className="px-2 py-0.5 bg-background border rounded">Ctrl/⌘ + Shift + ↓</kbd> — Переместить вниз</div>
          <div><kbd className="px-2 py-0.5 bg-background border rounded">Ctrl/⌘ + D</kbd> — Копировать блок</div>
          <div><kbd className="px-2 py-0.5 bg-background border rounded">Ctrl/⌘ + Backspace</kbd> — Удалить блок</div>
        </div>
      </div>
      
      <div className="mb-6 p-4 border border-border rounded-lg">
        <label className="text-sm font-medium mb-3 block">Шаблон раскладки</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleLayoutChange('center')}
            className={`p-3 border rounded-lg transition-all ${
              currentLayout === 'center' 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-full h-8 bg-muted rounded flex items-center justify-center">
                <div className="w-3/4 h-1 bg-foreground/30 rounded" />
              </div>
              <span className="text-xs">Центр</span>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('left')}
            className={`p-3 border rounded-lg transition-all ${
              currentLayout === 'left' 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-full h-8 bg-muted rounded flex items-start justify-start p-1">
                <div className="w-1/2 h-full bg-foreground/30 rounded" />
              </div>
              <span className="text-xs">Слева</span>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('right')}
            className={`p-3 border rounded-lg transition-all ${
              currentLayout === 'right' 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-full h-8 bg-muted rounded flex items-end justify-end p-1">
                <div className="w-1/2 h-full bg-foreground/30 rounded" />
              </div>
              <span className="text-xs">Справа</span>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('full')}
            className={`p-3 border rounded-lg transition-all ${
              currentLayout === 'full' 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-full h-8 bg-foreground/30 rounded" />
              <span className="text-xs">Полный</span>
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
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default SlideEditor;