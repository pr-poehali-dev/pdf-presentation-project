import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';

interface SlidePreviewProps {
  title: string;
  subtitle: string;
  content: string;
  image: string;
  layout: 'center' | 'left' | 'right' | 'full';
  fullSize?: boolean;
  logo?: string;
}

const SlidePreview = ({ title, subtitle, content, image, layout, fullSize = false, logo }: SlidePreviewProps) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const renderContent = () => {
    const contentBlock = (
      <div className={`${fullSize ? 'max-w-2xl' : 'max-w-md'} animate-fade-in px-4 sm:px-0`}>
        {logo && (
          <div className="mb-4 sm:mb-6 flex justify-start">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
              style={{ maxHeight: '210px' }}
            />
          </div>
        )}
        <div 
          className={`${fullSize ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs'} text-foreground/80 leading-relaxed prose prose-sm max-w-none`}
          style={{ fontFamily: 'Open Sans, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );

    const imageBlock = (
      <div className={`${layout === 'full' ? 'w-full h-56 sm:h-64 md:h-80' : fullSize ? 'flex-1 min-h-[250px] sm:min-h-[300px]' : 'flex-1 min-h-[150px] sm:min-h-[200px]'} rounded-2xl flex items-center justify-center overflow-hidden ${!image ? 'border-2 border-dashed border-muted-foreground/30 bg-muted/20' : ''}`}>
        {image ? (
          <img 
            src={image} 
            alt={title}
            className={`w-full h-full ${layout === 'full' ? 'object-cover' : 'object-contain'} cursor-pointer hover:opacity-90 transition-opacity rounded-2xl animate-fade-in`}
            onClick={() => setIsImageOpen(true)}
            key={image}
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
                  className="w-full h-full object-cover cursor-pointer hover:opacity-25 transition-opacity animate-fade-in"
                  onClick={() => setIsImageOpen(true)}
                  key={image}
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
          <div className={`flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 md:gap-8 ${fullSize ? 'p-4 sm:p-8 md:p-10 lg:p-12 min-h-full' : 'p-4 sm:p-6 md:p-8'}`}>
            <div className={`${image ? 'flex-1' : 'flex-[2]'} w-full flex flex-col justify-center`}>
              {contentBlock}
            </div>
            {image && (
              <div className="flex-1 w-full flex items-center">
                {imageBlock}
              </div>
            )}
          </div>
        );

      case 'right':
        return (
          <div className={`flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 md:gap-8 ${fullSize ? 'p-4 sm:p-8 md:p-10 lg:p-12 min-h-full' : 'p-4 sm:p-6 md:p-8'}`}>
            {image && (
              <div className="flex-1 w-full flex items-center">
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
          <div className={`flex flex-col ${fullSize ? 'p-4 sm:p-6 md:p-8 lg:p-10' : 'p-4 sm:p-6 md:p-8'} gap-4 sm:gap-6`}>
            {image && (
              <div className="w-full flex-shrink-0">
                {imageBlock}
              </div>
            )}
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
      <div className={`${fullSize ? 'min-h-0' : 'min-h-[300px]'} bg-background/40 backdrop-blur-xl border border-border/30 relative rounded-2xl overflow-hidden`}>
        {renderContent()}
      </div>
      
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none shadow-2xl" onClick={() => setIsImageOpen(false)} aria-describedby="image-preview">
          <DialogDescription id="image-preview" className="sr-only">
            Полноэкранный просмотр изображения слайда
          </DialogDescription>
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