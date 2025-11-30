import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SlidePreviewProps {
  title: string;
  subtitle: string;
  content: string;
  image: string;
  layout: 'center' | 'left' | 'right' | 'full';
  fullSize?: boolean;
}

const SlidePreview = ({ title, subtitle, content, image, layout, fullSize = false }: SlidePreviewProps) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const renderContent = () => {
    const contentBlock = (
      <div className={`${fullSize ? 'max-w-2xl' : 'max-w-md'} animate-fade-in`}>
        <div className={`inline-block ${fullSize ? 'px-4 py-1.5' : 'px-3 py-1'} bg-secondary/20 rounded-full ${fullSize ? 'text-sm' : 'text-xs'} font-medium text-secondary ${fullSize ? 'mb-6' : 'mb-4'}`}>
          {subtitle}
        </div>
        <h2 
          className={`${fullSize ? 'text-5xl mb-8' : 'text-3xl mb-4'} font-bold text-primary leading-tight`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {title}
        </h2>
        <div 
          className={`${fullSize ? 'text-base' : 'text-xs'} text-foreground/80 leading-relaxed`}
          style={{ fontFamily: 'Open Sans, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );

    const imageBlock = image && (
      <div className={`${layout === 'full' ? 'w-full h-64' : 'flex-1'} overflow-hidden rounded-lg`}>
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsImageOpen(true)}
        />
      </div>
    );

    switch (layout) {
      case 'center':
        return (
          <div className="relative h-full">
            {image && (
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-20">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-30 transition-opacity"
                  onClick={() => setIsImageOpen(true)}
                />
              </div>
            )}
            <div className={`relative z-10 ${fullSize ? 'p-12' : 'p-8'} flex flex-col justify-center h-full`}>
              {contentBlock}
            </div>
          </div>
        );

      case 'left':
        return (
          <div className={`flex items-center gap-6 h-full ${fullSize ? 'p-12' : 'p-8'}`}>
            <div className="flex-1">
              {contentBlock}
            </div>
            {imageBlock}
          </div>
        );

      case 'right':
        return (
          <div className={`flex items-center gap-6 h-full ${fullSize ? 'p-12' : 'p-8'}`}>
            {imageBlock}
            <div className="flex-1">
              {contentBlock}
            </div>
          </div>
        );

      case 'full':
        return (
          <div className={`flex flex-col h-full ${fullSize ? 'p-12' : 'p-8'} gap-6`}>
            {imageBlock}
            {contentBlock}
          </div>
        );

      default:
        return contentBlock;
    }
  };

  return (
    <>
      <div className="aspect-[16/9] bg-gradient-to-br from-background to-muted relative">
        {renderContent()}
      </div>
      
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none" onClick={() => setIsImageOpen(false)}>
          <img 
            src={image} 
            alt={title}
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlidePreview;