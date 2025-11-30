import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import SlideEditor from '@/components/SlideEditor';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  image: string;
}

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      title: 'Усадьба Эрьзи',
      subtitle: 'Эко-поселок на берегу реки Яхрома',
      content: 'Комплексная стратегия продвижения эко-поселка "Усадьба скульптора Эрьзи" — загородного курорта премиум-класса с уникальной инфраструктурой и природной атмосферой.',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/18.png'
    },
    {
      id: 2,
      title: 'Стратегия продвижения',
      subtitle: 'Целевые площадки и каналы',
      content: '• Яндекс.Карты — геолокация и навигация для гостей\n• Instagram — визуальный контент природы и активностей\n• ВКонтакте — комьюнити любителей экотуризма\n• Сайты бронирования — Booking, Ostrovok\n• Партнерство с горнолыжными курортами (Сорочаны, Тягачево)',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/14.png'
    },
    {
      id: 3,
      title: 'Этапы реализации',
      subtitle: 'Пошаговый план действий',
      content: '1. Аудит присутствия и конкурентов (неделя 1-2)\n2. Разработка контент-стратегии с акцентом на природу (неделя 2-3)\n3. Оптимизация профилей и SEO (неделя 3-4)\n4. Запуск таргетированной рекламы (неделя 5)\n5. Развитие партнерской сети с курортами (постоянно)',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/16.png'
    },
    {
      id: 4,
      title: 'Ожидаемые результаты',
      subtitle: 'Измеримые показатели роста',
      content: '• Рост узнаваемости бренда на 200%\n• Увеличение прямых бронирований на 120%\n• Повышение среднего чека на 35%\n• Загрузка объектов круглый год 75%+\n• Развитие партнерской сети с 5+ курортами',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/20.png'
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

  const handleUpdateSlide = (data: { title: string; subtitle: string; content: string; image: string }) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlide] = {
      ...updatedSlides[currentSlide],
      ...data
    };
    setSlides(updatedSlides);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Презентация продвижения
            </h1>
            <p className="text-muted-foreground" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              усадьбаэрьзи.рф
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Icon name={isEditing ? 'Check' : 'Pencil'} size={18} />
              {isEditing ? 'Готово' : 'Редактировать'}
            </Button>
            <Button onClick={handleExportPDF} className="flex items-center gap-2">
              <Icon name="Download" size={18} />
              Экспорт PDF
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <Card className="p-4">
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
              <div className="grid grid-cols-2 gap-6">
                <div className="max-h-[700px] overflow-y-auto pr-4">
                  <h3 className="text-lg font-semibold mb-4">Редактор</h3>
                  <SlideEditor
                    title={slides[currentSlide].title}
                    subtitle={slides[currentSlide].subtitle}
                    content={slides[currentSlide].content}
                    image={slides[currentSlide].image}
                    onUpdate={handleUpdateSlide}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Превью</h3>
                  <Card className="overflow-hidden shadow-2xl">
                    <div className="aspect-[16/9] bg-gradient-to-br from-background to-muted relative">
                      {slides[currentSlide].image && (
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
                          <img 
                            src={slides[currentSlide].image} 
                            alt={slides[currentSlide].title}
                            className="w-full h-full object-cover opacity-30"
                          />
                        </div>
                      )}
                      <div className="relative z-10 p-8 flex flex-col justify-center h-full">
                        <div className="max-w-md animate-fade-in">
                          <div className="inline-block px-3 py-1 bg-secondary/20 rounded-full text-xs font-medium text-secondary mb-4">
                            {slides[currentSlide].subtitle}
                          </div>
                          <h2 
                            className="text-3xl font-bold text-primary mb-4 leading-tight"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {slides[currentSlide].title}
                          </h2>
                          <div 
                            className="text-sm text-foreground/80 leading-relaxed"
                            style={{ fontFamily: 'Open Sans, sans-serif' }}
                            dangerouslySetInnerHTML={{ __html: slides[currentSlide].content }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="overflow-hidden shadow-2xl">
                <div className="aspect-[16/9] bg-gradient-to-br from-background to-muted relative">
                  {slides[currentSlide].image && (
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
                      <img 
                        src={slides[currentSlide].image} 
                        alt={slides[currentSlide].title}
                        className="w-full h-full object-cover opacity-30"
                      />
                    </div>
                  )}
                  <div className="relative z-10 p-12 flex flex-col justify-center h-full">
                    <div className="max-w-2xl animate-fade-in">
                      <div className="inline-block px-4 py-1.5 bg-secondary/20 rounded-full text-sm font-medium text-secondary mb-6">
                        {slides[currentSlide].subtitle}
                      </div>
                      <h2 
                        className="text-5xl font-bold text-primary mb-8 leading-tight"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {slides[currentSlide].title}
                      </h2>
                      <div 
                        className="text-xl text-foreground/80 leading-relaxed"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                        dangerouslySetInnerHTML={{ __html: slides[currentSlide].content }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-between items-center mt-6">
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
    </div>
  );
};

export default Index;