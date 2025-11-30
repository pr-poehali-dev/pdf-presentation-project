import { useState, useRef } from 'react';
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

  const updateBlock = (id: string, content: string) => {
    const updatedBlocks = blocks.map(block =>
      block.id === id ? { ...block, content } : block
    );
    setBlocks(updatedBlocks);
    notifyParent(updatedBlocks);
  };

  const addBlock = (afterId: string, type: 'text' | 'image') => {
    const index = blocks.findIndex(b => b.id === afterId);
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'image' ? '' : 'Новый текстовый блок'
    };
    
    const updatedBlocks = [
      ...blocks.slice(0, index + 1),
      newBlock,
      ...blocks.slice(index + 1)
    ];
    setBlocks(updatedBlocks);
    
    if (type === 'image') {
      setTargetBlockId(newBlock.id);
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 2) {
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
    const titleBlock = updatedBlocks.find(b => b.type === 'title');
    const subtitleBlock = updatedBlocks.find(b => b.type === 'subtitle');
    const imageBlock = updatedBlocks.find(b => b.type === 'image');
    const textBlocks = updatedBlocks.filter(b => b.type === 'text');

    onUpdate({
      title: titleBlock?.content || '',
      subtitle: subtitleBlock?.content || '',
      content: textBlocks.map(b => b.content).join('\n\n'),
      image: imageBlock?.content || '',
      layout: newLayout || currentLayout
    });
  };

  const handleLayoutChange = (newLayout: 'center' | 'left' | 'right' | 'full') => {
    setCurrentLayout(newLayout);
    notifyParent(blocks, newLayout);
  };

  const renderBlock = (block: Block, index: number) => {
    return (
      <div key={block.id} className="group relative border border-border rounded-lg p-4 mb-4 hover:border-primary transition-colors">
        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0"
            onClick={() => moveBlock(block.id, 'up')}
            disabled={index === 0}
          >
            <Icon name="ChevronUp" size={14} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0"
            onClick={() => moveBlock(block.id, 'down')}
            disabled={index === blocks.length - 1}
          >
            <Icon name="ChevronDown" size={14} />
          </Button>
          {block.type !== 'title' && block.type !== 'subtitle' && (
            <Button
              size="sm"
              variant="destructive"
              className="h-7 w-7 p-0"
              onClick={() => deleteBlock(block.id)}
            >
              <Icon name="Trash2" size={14} />
            </Button>
          )}
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

        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => addBlock(block.id, 'text')}
            className="text-xs"
          >
            <Icon name="Plus" size={14} className="mr-1" />
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