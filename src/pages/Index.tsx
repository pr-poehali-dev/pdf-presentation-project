import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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
      title: 'Добро пожаловать',
      subtitle: 'Стратегия продвижения',
      content: 'Комплексное решение для продвижения сервиса аренды частных домиков. Мы предлагаем системный подход к развитию вашего присутствия на ключевых площадках.',
      image: '/placeholder.svg'
    },
    {
      id: 2,
      title: 'Стратегия продвижения',
      subtitle: 'Целевые площадки',
      content: '• Яндекс.Карты — локальная видимость и отзывы\n• Instagram — визуальный контент и истории гостей\n• ВКонтакте — комьюнити и прямые продажи\n• Avito — дополнительный канал аренды\n• TripAdvisor — международные гости',
      image: '/placeholder.svg'
    },
    {
      id: 3,
      title: 'Этапы реализации',
      subtitle: 'Пошаговый план',
      content: '1. Аудит текущего присутствия (неделя 1-2)\n2. Создание контент-стратегии (неделя 2-3)\n3. Оптимизация профилей на всех площадках (неделя 3-4)\n4. Запуск рекламных кампаний (неделя 5)\n5. Аналитика и оптимизация (постоянно)',
      image: '/placeholder.svg'
    },
    {
      id: 4,
      title: 'Результаты',
      subtitle: 'Что вы получите',
      content: 'Увеличение узнаваемости бренда на 150%\nРост прямых бронирований на 80%\nУлучшение репутации и рейтинга\nСистемный поток заявок круглый год\nПрозрачная аналитика эффективности',
      image: '/placeholder.svg'
    }
  ]);

  const handleExportDOCX = () => {
    const docContent = slides.map((slide, index) => 
      `
СЛАЙД ${index + 1}
${slide.title}
${slide.subtitle}

${slide.content}

${'='.repeat(80)}
`
    ).join('\n');

    const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presentation-domiki-na-arendu.docx';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Презентация экспортирована в DOCX');
  };

  const handleUpdateSlide = (field: keyof Slide, value: string) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlide] = {
      ...updatedSlides[currentSlide],
      [field]: value
    };
    setSlides(updatedSlides);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateSlide('image', reader.result as string);
        toast.success('Изображение обновлено');
      };
      reader.readAsDataURL(file);
    }
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
              домикинааренду.рф
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
            <Button onClick={handleExportDOCX} className="flex items-center gap-2">
              <Icon name="Download" size={18} />
              Экспорт DOCX
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
            <Card className="overflow-hidden shadow-2xl">
              <div className="aspect-[16/9] bg-gradient-to-br from-background to-muted p-12 flex flex-col justify-center">
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Заголовок</label>
                      <Input
                        value={slides[currentSlide].title}
                        onChange={(e) => handleUpdateSlide('title', e.target.value)}
                        className="text-2xl font-bold h-auto py-3"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Подзаголовок</label>
                      <Input
                        value={slides[currentSlide].subtitle}
                        onChange={(e) => handleUpdateSlide('subtitle', e.target.value)}
                        className="h-auto py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Содержание</label>
                      <Textarea
                        value={slides[currentSlide].content}
                        onChange={(e) => handleUpdateSlide('content', e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Изображение</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl animate-fade-in">
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
                      className="text-xl text-foreground/80 leading-relaxed whitespace-pre-line"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      {slides[currentSlide].content}
                    </div>
                  </div>
                )}
              </div>
            </Card>

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
