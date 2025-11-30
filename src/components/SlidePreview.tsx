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
      <div className={`${fullSize ? 'max-w-2xl' : 'max-w-md'} animate-fade-in px-4 sm:px-0`}>
        <div className={`inline-block ${fullSize ? 'px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm mb-4 sm:mb-6' : 'px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs mb-3 sm:mb-4'} bg-secondary/20 rounded-full font-medium text-secondary`}>
          {subtitle}
        </div>
        <h2 
          className={`${fullSize ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 md:mb-8' : 'text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4'} font-bold text-primary leading-tight break-words`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {title}
        </h2>
        <div 
          className={`${fullSize ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs'} text-foreground/80 leading-relaxed prose prose-sm max-w-none`}
          style={{ fontFamily: 'Open Sans, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );

    const imageBlock = (
      <div className={`${layout === 'full' ? 'w-full h-56 sm:h-64 md:h-80' : fullSize ? 'flex-1 min-h-[250px]' : 'flex-1 min-h-[150px]'} rounded-2xl flex items-center justify-center overflow-hidden ${!image ? 'border-2 border-dashed border-muted-foreground/30 bg-muted/20' : ''}`}>
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setIsImageOpen(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
            <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs opacity-50">Место для изображения</span>
          </div>
        )}
      </div>
    );

    switch (layout) {
      case 'center':
        return (
          <div className={`relative ${fullSize ? 'h-full' : 'min-h-[400px]'}`}>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-15">
              {image ? (
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-25 transition-opacity"
                  onClick={() => setIsImageOpen(true)}
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-muted-foreground/10 bg-muted/10 flex items-center justify-center">
                  <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className={`relative z-10 ${fullSize ? 'p-4 sm:p-8 md:p-10 lg:p-12' : 'p-4 sm:p-6 md:p-8'} flex flex-col justify-center h-full`}>
              {contentBlock}
            </div>
          </div>
        );

      case 'left':
        return (
          <div className={`flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 ${fullSize ? 'p-4 sm:p-8 md:p-10 lg:p-12 min-h-full' : 'p-4 sm:p-6 md:p-8'}`}>
            <div className={`${image ? 'flex-1' : 'flex-[2]'} w-full flex flex-col justify-center`}>
              {contentBlock}
            </div>
            {image && (
              <div className="flex-1 w-full">
                {imageBlock}
              </div>
            )}
          </div>
        );

      case 'right':
        return (
          <div className={`flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 ${fullSize ? 'p-4 sm:p-8 md:p-10 lg:p-12 min-h-full' : 'p-4 sm:p-6 md:p-8'}`}>
            {image && (
              <div className="flex-1 w-full">
                {imageBlock}
              </div>
            )}
            <div className={`${image ? 'flex-1' : 'flex-[2]'} w-full flex flex-col justify-center`}>
              {contentBlock}
            </div>
          </div>
        );

      case 'full':
        return (
          <div className={`flex flex-col ${fullSize ? 'p-4 sm:p-6 md:p-8 lg:p-10 min-h-full' : 'p-4 sm:p-6 md:p-8'} gap-4 sm:gap-6`}>
            {image && imageBlock}
            <div className="flex-shrink-0">
              {contentBlock}
            </div>
          </div>
        );

      default:
        return contentBlock;
    }
  };

  return (
    <>
      <div className={`${fullSize ? 'aspect-[16/9]' : 'min-h-[300px]'} bg-gradient-to-br from-background to-muted relative rounded-2xl overflow-hidden`}>
        {renderContent()}
      </div>
      
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none shadow-2xl" onClick={() => setIsImageOpen(false)}>
          <img 
            src={image} 
            alt={title}
            className="w-full h-auto max-h-[90vh] object-contain rounded-3xl"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlidePreview;