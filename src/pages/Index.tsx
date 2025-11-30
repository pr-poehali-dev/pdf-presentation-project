import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface AppSettings {
  mainTitle: string;
  mainTitleColor: string;
  mainTitleShadow: boolean;
  mainTitleShadowIntensity: number;
  adminLogin: string;
  adminPassword: string;
}

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>({
    mainTitle: 'Презентация продвижения',
    mainTitleColor: '',
    mainTitleShadow: true,
    mainTitleShadowIntensity: 2,
    adminLogin: 'Admin',
    adminPassword: 'admin1234'
  });
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
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

  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
    
    const savedSlides = localStorage.getItem('slides');
    if (savedSlides) {
      setSlides(JSON.parse(savedSlides));
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    if (backgroundImage) {
      localStorage.setItem('backgroundImage', backgroundImage);
    } else {
      localStorage.removeItem('backgroundImage');
    }
  }, [backgroundImage]);
  
  useEffect(() => {
    localStorage.setItem('slides', JSON.stringify(slides));
  }, [slides]);

  const handleLogin = () => {
    if (loginInput === settings.adminLogin && passwordInput === settings.adminPassword) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      setLoginInput('');
      setPasswordInput('');
      toast.success('Вход выполнен успешно');
    } else {
      toast.error('Неверный логин или пароль');
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsEditing(false);
    localStorage.removeItem('isAuthenticated');
    toast.success('Вы вышли из системы');
  };
  
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({ ...settings, ...newSettings });
    toast.success('Настройки сохранены');
  };

  const handleExportPDF = async () => {
    const loadingToast = toast.loading('Генерация PDF...');
    const html2canvas = (await import('html2canvas')).default;
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const wasEditing = isEditing;
      if (wasEditing) setIsEditing(false);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        
        const tempSlide = currentSlide;
        setCurrentSlide(i);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const container = document.createElement('div');
        container.style.width = '1920px';
        container.style.height = '1080px';
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.background = backgroundImage ? `url(${backgroundImage})` : '#ffffff';
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        document.body.appendChild(container);
        
        const tempDiv = document.createElement('div');
        tempDiv.style.width = '100%';
        tempDiv.style.height = '100%';
        tempDiv.style.padding = '60px';
        
        const cardWrapper = document.createElement('div');
        cardWrapper.style.width = '100%';
        cardWrapper.style.height = '100%';
        cardWrapper.style.background = backgroundImage ? 'rgba(255, 255, 255, 0.7)' : '#ffffff';
        cardWrapper.style.backdropFilter = backgroundImage ? 'blur(40px)' : 'none';
        cardWrapper.style.borderRadius = '32px';
        cardWrapper.style.overflow = 'hidden';
        cardWrapper.style.border = '1px solid rgba(0,0,0,0.1)';
        
        const slideElement = document.getElementById(`slide-preview-${i}`);
        if (slideElement) {
          const clonedSlide = slideElement.cloneNode(true) as HTMLElement;
          clonedSlide.style.width = '100%';
          clonedSlide.style.height = '100%';
          cardWrapper.appendChild(clonedSlide);
        }
        
        tempDiv.appendChild(cardWrapper);
        container.appendChild(tempDiv);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const canvas = await html2canvas(container, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          width: 1920,
          height: 1080
        });
        
        document.body.removeChild(container);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
        
        setCurrentSlide(tempSlide);
      }

      if (wasEditing) setIsEditing(true);
      
      pdf.save('presentation-usadba-erzi.pdf');
      toast.success('PDF успешно экспортирован!', { id: loadingToast });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте PDF', { id: loadingToast });
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

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(result);
          toast.success('Фоновое изображение установлено');
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getTitleShadow = () => {
    if (!settings.mainTitleShadow) return 'none';
    const intensity = settings.mainTitleShadowIntensity;
    return `0 ${intensity}px ${intensity * 2}px rgba(0, 0, 0, 0.1)`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      {backgroundImage && (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Button
                variant="outline"
                onClick={() => setShowLoginDialog(true)}
                className="text-sm rounded-xl"
              >
                Разработчику
              </Button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 
                  className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2" 
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    color: settings.mainTitleColor || 'hsl(var(--primary))',
                    textShadow: getTitleShadow()
                  }}
                >
                  {settings.mainTitle}
                </h1>
                {isAuthenticated && isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettingsDialog(true)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Icon name="Settings" size={16} />
                  </Button>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                усадьбаэрьзи.рф
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
            {isAuthenticated && (
              <>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 flex-1 sm:flex-none text-sm sm:text-base"
                >
                  <Icon name={isEditing ? 'Check' : 'Pencil'} size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">{isEditing ? 'Готово' : 'Редактировать'}</span>
                  <span className="sm:hidden">{isEditing ? 'Готово' : 'Редакт.'}</span>
                </Button>
              </>
            )}
            <Button onClick={handleExportPDF} className="flex items-center gap-2 flex-1 sm:flex-none text-sm sm:text-base">
              <Icon name="Download" size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Экспорт PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('background-upload')?.click()}
                  className="flex items-center gap-2 flex-1 sm:flex-none text-sm sm:text-base"
                >
                  <Icon name="Image" size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Фон</span>
                </Button>
                {backgroundImage && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBackgroundImage('');
                      toast.success('Фон удалён');
                    }}
                    className="flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Icon name="X" size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm sm:text-base"
                  title="Выйти"
                >
                  <Icon name="LogOut" size={16} className="sm:w-[18px] sm:h-[18px]" />
                </Button>
                <input
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBackgroundUpload}
                />
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <Card className={`p-3 sm:p-4 shadow-lg ${backgroundImage ? 'bg-background/60 backdrop-blur-xl border-background/20' : ''}`}>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                Слайды
              </h3>
              <div className="space-y-3">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      currentSlide === index
                        ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                        : 'bg-muted hover:bg-muted/80 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">Слайд {index + 1}</div>
                    <div className="text-sm line-clamp-1">{slide.title}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-9">
            {isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className={`shadow-lg ${backgroundImage ? 'bg-background/60 backdrop-blur-xl border-background/20' : ''}`}>
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-4 h-12 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 rounded-t-2xl"></div>
                    <div className="absolute bottom-0 left-0 right-4 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 rounded-b-2xl"></div>
                    <div className="p-4">
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Редактор</h3>
                    </div>
                    <div className="max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto px-4 pb-4 custom-scrollbar">
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
                  </div>
                </Card>
                <div className="hidden lg:block">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Превью</h3>
                  <Card className={`overflow-hidden shadow-xl ${backgroundImage ? 'bg-background/60 backdrop-blur-xl border-background/20' : ''}`}>
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
              <Card className={`overflow-hidden shadow-xl ${backgroundImage ? 'bg-background/60 backdrop-blur-xl border-background/20' : ''}`} id={`slide-preview-${currentSlide}`}>
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
      
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Вход в режим редактирования</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Логин</label>
              <Input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Введите логин"
                className="rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Пароль</label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Введите пароль"
                className="rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full rounded-xl"
            >
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Настройки презентации</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Заголовок презентации</label>
              <Input
                type="text"
                value={settings.mainTitle}
                onChange={(e) => handleUpdateSettings({ mainTitle: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Цвет заголовка</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.mainTitleColor || '#64b362'}
                  onChange={(e) => handleUpdateSettings({ mainTitleColor: e.target.value })}
                  className="w-20 h-10 rounded-xl"
                />
                <Input
                  type="text"
                  value={settings.mainTitleColor || ''}
                  onChange={(e) => handleUpdateSettings({ mainTitleColor: e.target.value })}
                  placeholder="Например: #64b362"
                  className="flex-1 rounded-xl"
                />
                <Button
                  variant="outline"
                  onClick={() => handleUpdateSettings({ mainTitleColor: '' })}
                  className="rounded-xl"
                >
                  Сброс
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Тень заголовка</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.mainTitleShadow}
                    onChange={(e) => handleUpdateSettings({ mainTitleShadow: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span>Включить тень</span>
                </label>
                {settings.mainTitleShadow && (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm">Интенсивность:</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={settings.mainTitleShadowIntensity}
                      onChange={(e) => handleUpdateSettings({ mainTitleShadowIntensity: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-6">{settings.mainTitleShadowIntensity}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Данные для входа</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Логин администратора</label>
                  <Input
                    type="text"
                    value={settings.adminLogin}
                    onChange={(e) => handleUpdateSettings({ adminLogin: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Пароль администратора</label>
                  <Input
                    type="password"
                    value={settings.adminPassword}
                    onChange={(e) => handleUpdateSettings({ adminPassword: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;