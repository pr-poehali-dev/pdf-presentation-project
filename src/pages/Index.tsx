import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import SlideEditor from '@/components/SlideEditor';
import SlidePreview from '@/components/SlidePreview';
import ThemeToggle from '@/components/ThemeToggle';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  image: string;
  layout: 'center' | 'left' | 'right' | 'full';
}

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      title: 'Эко-поселок на берегу Яхромы',
      subtitle: 'Усадьба скульптора Эрьзи',
      content: 'Комплексная стратегия продвижения эко-поселка "Усадьба скульптора Эрьзи" — загородного курорта премиум-класса с уникальной инфраструктурой и природной атмосферой.',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/18.png',
      layout: 'center'
    },
    {
      id: 2,
      title: 'Стратегия продвижения',
      subtitle: 'Целевые площадки и каналы',
      content: '• Яндекс.Карты — геолокация и навигация для гостей\n• Instagram — визуальный контент природы и активностей\n• ВКонтакте — комьюнити любителей экотуризма\n• Сайты бронирования — Booking, Ostrovok\n• Партнерство с горнолыжными курортами (Сорочаны, Тягачево)',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/14.png',
      layout: 'left'
    },
    {
      id: 3,
      title: 'Этапы реализации',
      subtitle: 'Пошаговый план действий',
      content: '1. Аудит присутствия и конкурентов (неделя 1-2)\n2. Разработка контент-стратегии с акцентом на природу (неделя 2-3)\n3. Оптимизация профилей и SEO (неделя 3-4)\n4. Запуск таргетированной рекламы (неделя 5)\n5. Развитие партнерской сети с курортами (постоянно)',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/16.png',
      layout: 'right'
    },
    {
      id: 4,
      title: 'Ожидаемые результаты',
      subtitle: 'Измеримые показатели роста',
      content: '• Рост узнаваемости бренда на 200%\n• Увеличение прямых бронирований на 120%\n• Повышение среднего чека на 35%\n• Загрузка объектов круглый год 75%+\n• Развитие партнерской сети с 5+ курортами',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/20.png',
      layout: 'left'
    }
  ]);

  const handleExportPDF = async () => {
    toast.loading('Генерация PDF...');
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 297, 210, 'F');

        if (slide.image && slide.image.startsWith('http')) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = slide.image;
            });
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              pdf.addImage(imgData, 'JPEG', 150, 20, 130, 85, '', 'FAST');
            }
          } catch (e) {
            console.log('Failed to load image:', slide.image);
          }
        }

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(slide.subtitle.toUpperCase(), 20, 25);

        pdf.setFontSize(32);
        pdf.setTextColor(100, 179, 98);
        pdf.text(slide.title, 20, 40, { maxWidth: 120 });

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        const lines = pdf.splitTextToSize(slide.content, 120);
        pdf.text(lines, 20, 60);

        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('усадьбаэрьзи.рф', 20, 200);
        pdf.text(`${i + 1} / ${slides.length}`, 270, 200);
      }

      pdf.save('presentation-usadba-erzi.pdf');
      toast.success('PDF успешно экспортирован!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте PDF');
    }
  };

  const handleUpdateSlide = (data: { title: string; subtitle: string; content: string; image: string; layout: 'center' | 'left' | 'right' | 'full' }) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlide] = {
      ...updatedSlides[currentSlide],
      ...data
    };
    setSlides(updatedSlides);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Презентация продвижения
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              усадьбаэрьзи.рф
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 flex-1 sm:flex-none text-sm sm:text-base"
            >
              <Icon name={isEditing ? 'Check' : 'Pencil'} size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">{isEditing ? 'Готово' : 'Редактировать'}</span>
              <span className="sm:hidden">{isEditing ? 'Готово' : 'Редакт.'}</span>
            </Button>
            <Button onClick={handleExportPDF} className="flex items-center gap-2 flex-1 sm:flex-none text-sm sm:text-base">
              <Icon name="Download" size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Экспорт PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <Card className="p-3 sm:p-4">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                Слайды
              </h3>
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentSlide === index
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">Слайд {index + 1}</div>
                    <div className="text-sm">{slide.title}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-9">
            {isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto pr-2 sm:pr-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Редактор</h3>
                  <SlideEditor
                    key={currentSlide}
                    title={slides[currentSlide].title}
                    subtitle={slides[currentSlide].subtitle}
                    content={slides[currentSlide].content}
                    image={slides[currentSlide].image}
                    layout={slides[currentSlide].layout}
                    onUpdate={handleUpdateSlide}
                  />
                </div>
                <div className="hidden lg:block">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Превью</h3>
                  <Card className="overflow-hidden shadow-2xl">
                    <SlidePreview
                      title={slides[currentSlide].title}
                      subtitle={slides[currentSlide].subtitle}
                      content={slides[currentSlide].content}
                      image={slides[currentSlide].image}
                      layout={slides[currentSlide].layout}
                      fullSize={false}
                    />
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="overflow-hidden shadow-2xl">
                <SlidePreview
                  title={slides[currentSlide].title}
                  subtitle={slides[currentSlide].subtitle}
                  content={slides[currentSlide].content}
                  image={slides[currentSlide].image}
                  layout={slides[currentSlide].layout}
                  fullSize={true}
                />
              </Card>
            )}

            <div className="flex justify-between items-center mt-4 sm:mt-6 gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="flex items-center gap-2"
              >
                <Icon name="ChevronLeft" size={18} />
                Назад
              </Button>

              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentSlide === index ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === slides.length - 1}
                className="flex items-center gap-2"
              >
                Вперёд
                <Icon name="ChevronRight" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
      
      <ThemeToggle />
    </div>
  );
};

export default Index;