import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  background?: string;
  showLogo?: boolean;
  name?: string;
}

interface AppSettings {
  mainTitle: string;
  mainTitleColor: string;
  mainTitleShadow: boolean;
  mainTitleShadowIntensity: number;
  adminLogin: string;
  adminPassword: string;
  logo: string;
  slidesBlockTitle: string;
}

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [selectedSlideForBg, setSelectedSlideForBg] = useState<number | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    mainTitle: 'Презентация продвижения',
    mainTitleColor: '',
    mainTitleShadow: true,
    mainTitleShadowIntensity: 2,
    adminLogin: 'Admin',
    adminPassword: 'admin1234',
    logo: '',
    slidesBlockTitle: 'Слайды'
  });
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportMode, setExportMode] = useState<'full' | 'selective'>('full');
  const [selectedSlides, setSelectedSlides] = useState<number[]>([]);
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      title: 'Эко-поселок на берегу Яхромы',
      subtitle: 'Усадьба скульптора Эрьзи',
      content: '<div style="display: inline-block; padding: 0.5rem 1rem; font-size: 0.875rem; background: hsl(var(--secondary) / 0.3); border-radius: 9999px; font-weight: 500; color: hsl(var(--secondary-foreground)); margin-bottom: 1.5rem;">Усадьба скульптора Эрьзи</div><h2 style="font-family: Montserrat, sans-serif; font-size: clamp(1.5rem, 4vw, 3rem); font-weight: 700; color: hsl(var(--primary)); margin-bottom: 1.5rem; line-height: 1.2;">Эко-поселок на берегу Яхромы</h2><div style="margin-bottom: 1rem;">Комплексная стратегия продвижения эко-поселка "Усадьба скульптора Эрьзи" — загородного курорта премиум-класса с уникальной инфраструктурой и природной атмосферой.</div>',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/18.png',
      layout: 'center',
      showLogo: true,
      name: 'Слайд 1'
    },
    {
      id: 2,
      title: 'Стратегия продвижения',
      subtitle: 'Целевые площадки и каналы',
      content: '<div style="display: inline-block; padding: 0.5rem 1rem; font-size: 0.875rem; background: hsl(var(--secondary) / 0.3); border-radius: 9999px; font-weight: 500; color: hsl(var(--secondary-foreground)); margin-bottom: 1.5rem;">Целевые площадки и каналы</div><h2 style="font-family: Montserrat, sans-serif; font-size: clamp(1.5rem, 4vw, 3rem); font-weight: 700; color: hsl(var(--primary)); margin-bottom: 1.5rem; line-height: 1.2;">Стратегия продвижения</h2><div style="margin-bottom: 1rem;">• Яндекс.Карты — геолокация и навигация для гостей<br/>• Instagram — визуальный контент природы и активностей<br/>• ВКонтакте — комьюнити любителей экотуризма<br/>• Сайты бронирования — Booking, Ostrovok<br/>• Партнерство с горнолыжными курортами (Сорочаны, Тягачево)</div>',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/14.png',
      layout: 'left',
      showLogo: false,
      name: 'Слайд 2'
    },
    {
      id: 3,
      title: 'Этапы реализации',
      subtitle: 'Пошаговый план действий',
      content: '<div style="display: inline-block; padding: 0.5rem 1rem; font-size: 0.875rem; background: hsl(var(--secondary) / 0.3); border-radius: 9999px; font-weight: 500; color: hsl(var(--secondary-foreground)); margin-bottom: 1.5rem;">Пошаговый план действий</div><h2 style="font-family: Montserrat, sans-serif; font-size: clamp(1.5rem, 4vw, 3rem); font-weight: 700; color: hsl(var(--primary)); margin-bottom: 1.5rem; line-height: 1.2;">Этапы реализации</h2><div style="margin-bottom: 1rem;">1. Аудит присутствия и конкурентов (неделя 1-2)<br/>2. Разработка контент-стратегии с акцентом на природу (неделя 2-3)<br/>3. Оптимизация профилей и SEO (неделя 3-4)<br/>4. Запуск таргетированной рекламы (неделя 5)<br/>5. Развитие партнерской сети с курортами (постоянно)</div>',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/16.png',
      layout: 'right',
      showLogo: false,
      name: 'Слайд 3'
    },
    {
      id: 4,
      title: 'Ожидаемые результаты',
      subtitle: 'Измеримые показатели роста',
      content: '<div style="display: inline-block; padding: 0.5rem 1rem; font-size: 0.875rem; background: hsl(var(--secondary) / 0.3); border-radius: 9999px; font-weight: 500; color: hsl(var(--secondary-foreground)); margin-bottom: 1.5rem;">Измеримые показатели роста</div><h2 style="font-family: Montserrat, sans-serif; font-size: clamp(1.5rem, 4vw, 3rem); font-weight: 700; color: hsl(var(--primary)); margin-bottom: 1.5rem; line-height: 1.2;">Ожидаемые результаты</h2><div style="margin-bottom: 1rem;">• Рост узнаваемости бренда на 200%<br/>• Увеличение прямых бронирований на 120%<br/>• Повышение среднего чека на 35%<br/>• Загрузка объектов круглый год 75%+<br/>• Развитие партнерской сети с 5+ курортами</div>',
      image: 'https://xn--80aaclrg8cdr7gdk.xn--p1ai/wp-content/uploads/2024/08/20.png',
      layout: 'left',
      showLogo: false,
      name: 'Слайд 4'
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
      try {
        localStorage.setItem('backgroundImage', backgroundImage);
      } catch (error) {
        console.error('Failed to save background to localStorage:', error);
        toast.error('Не удалось сохранить фон. Изображение слишком большое.');
        setBackgroundImage('');
      }
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
  


  const handleExportPDF = async (slideIndices?: number[]) => {
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

      const slidesToExport = slideIndices || slides.map((_, idx) => idx);
      
      for (let idx = 0; idx < slidesToExport.length; idx++) {
        const i = slidesToExport[idx];
        if (idx > 0) pdf.addPage();
        
        const slide = slides[i];
        const slideBackground = slide.background || backgroundImage;
        
        const container = document.createElement('div');
        container.style.width = '2560px';
        container.style.height = '1440px';
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.overflow = 'hidden';
        if (slideBackground) {
          container.style.backgroundImage = `url(${slideBackground})`;
          container.style.backgroundSize = 'cover';
          container.style.backgroundPosition = 'center';
          container.style.backgroundRepeat = 'no-repeat';
        } else {
          container.style.background = '#ffffff';
        }
        document.body.appendChild(container);
        
        if (settings.logo && slide.showLogo) {
          const logoEl = document.createElement('img');
          logoEl.src = settings.logo;
          logoEl.style.position = 'absolute';
          logoEl.style.top = '40px';
          logoEl.style.left = '40px';
          logoEl.style.height = 'auto';
          logoEl.style.width = 'auto';
          logoEl.style.maxHeight = '240px';
          logoEl.style.maxWidth = '300px';
          logoEl.style.objectFit = 'contain';
          logoEl.style.zIndex = '10';
          container.appendChild(logoEl);
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.style.width = '100%';
        tempDiv.style.height = '100%';
        tempDiv.style.padding = '60px 40px 40px 40px';
        tempDiv.style.display = 'flex';
        tempDiv.style.alignItems = 'flex-start';
        tempDiv.style.justifyContent = 'center';
        tempDiv.style.paddingTop = '180px';
        
        const cardWrapper = document.createElement('div');
        cardWrapper.style.width = '100%';
        cardWrapper.style.background = '#ffffff';
        cardWrapper.style.borderRadius = '24px';
        cardWrapper.style.overflow = 'hidden';
        cardWrapper.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
        cardWrapper.style.position = 'relative';
        
        const contentDiv = document.createElement('div');
        contentDiv.style.width = '100%';
        contentDiv.style.padding = '80px';
        contentDiv.style.display = 'flex';
        contentDiv.style.flexDirection = slide.layout === 'full' ? 'column' : 'row';
        contentDiv.style.alignItems = slide.layout === 'center' ? 'center' : 'stretch';
        contentDiv.style.justifyContent = 'center';
        contentDiv.style.gap = '60px';
        contentDiv.style.background = 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)';
        

        const textContainer = document.createElement('div');
        textContainer.style.flex = slide.layout === 'left' || slide.layout === 'right' ? '1.2' : '1';
        textContainer.style.display = 'flex';
        textContainer.style.flexDirection = 'column';
        textContainer.style.justifyContent = 'center';
        textContainer.style.maxWidth = slide.layout === 'center' ? '900px' : 'none';
        
        const contentEl = document.createElement('div');
        contentEl.innerHTML = slide.content;
        contentEl.style.fontSize = '28px';
        contentEl.style.lineHeight = '1.7';
        contentEl.style.color = '#333333';
        contentEl.style.fontFamily = 'Open Sans, sans-serif';
        contentEl.style.fontWeight = '400';
        contentEl.style.maxWidth = '100%';
        
        textContainer.appendChild(contentEl);
        
        if (slide.layout === 'center') {
          contentDiv.appendChild(textContainer);
          if (slide.image) {
            const bgImage = document.createElement('div');
            bgImage.style.position = 'absolute';
            bgImage.style.right = '0';
            bgImage.style.top = '0';
            bgImage.style.bottom = '0';
            bgImage.style.width = '50%';
            bgImage.style.backgroundImage = `url(${slide.image})`;
            bgImage.style.backgroundSize = 'cover';
            bgImage.style.backgroundPosition = 'center';
            bgImage.style.opacity = '0.12';
            contentDiv.insertBefore(bgImage, textContainer);
          }
        } else if (slide.layout === 'left') {
          contentDiv.appendChild(textContainer);
          if (slide.image) {
            const imageContainer = document.createElement('div');
            imageContainer.style.flex = '0.8';
            imageContainer.style.display = 'flex';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.justifyContent = 'center';
            
            const imageEl = document.createElement('img');
            imageEl.src = slide.image;
            imageEl.style.width = '100%';
            imageEl.style.maxHeight = '700px';
            imageEl.style.objectFit = 'contain';
            imageEl.style.borderRadius = '16px';
            imageContainer.appendChild(imageEl);
            contentDiv.appendChild(imageContainer);
          }
        } else if (slide.layout === 'right') {
          if (slide.image) {
            const imageContainer = document.createElement('div');
            imageContainer.style.flex = '0.8';
            imageContainer.style.display = 'flex';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.justifyContent = 'center';
            
            const imageEl = document.createElement('img');
            imageEl.src = slide.image;
            imageEl.style.width = '100%';
            imageEl.style.maxHeight = '700px';
            imageEl.style.objectFit = 'contain';
            imageEl.style.borderRadius = '16px';
            imageContainer.appendChild(imageEl);
            contentDiv.appendChild(imageContainer);
          }
          contentDiv.appendChild(textContainer);
        } else if (slide.layout === 'full') {
          contentDiv.style.padding = '0';
          contentDiv.style.gap = '0';
          contentDiv.style.justifyContent = 'flex-start';
          
          if (slide.image) {
            const imageContainer = document.createElement('div');
            imageContainer.style.width = '100%';
            imageContainer.style.height = '700px';
            imageContainer.style.borderRadius = '24px 24px 0 0';
            imageContainer.style.overflow = 'hidden';
            imageContainer.style.flexShrink = '0';
            
            const imageEl = document.createElement('img');
            imageEl.src = slide.image;
            imageEl.style.width = '100%';
            imageEl.style.height = '100%';
            imageEl.style.objectFit = 'cover';
            imageContainer.appendChild(imageEl);
            contentDiv.appendChild(imageContainer);
          }
          
          const textWrapper = document.createElement('div');
          textWrapper.style.padding = '60px 80px';
          textWrapper.style.flexShrink = '0';
          textContainer.style.flex = '0';
          textContainer.style.maxWidth = '100%';
          textWrapper.appendChild(textContainer);
          contentDiv.appendChild(textWrapper);
        }
        
        cardWrapper.appendChild(contentDiv);
        tempDiv.appendChild(cardWrapper);
        container.appendChild(tempDiv);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(container, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: slideBackground ? null : '#ffffff',
          logging: false,
          width: 2560,
          height: 1440
        });
        
        document.body.removeChild(container);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgWidth = 297;
        const imgHeight = 210;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      }

      if (wasEditing) setIsEditing(true);
      
      pdf.save('presentation-usadba-erzi.pdf');
      toast.success('PDF успешно экспортирован!', { id: loadingToast });
      setShowExportDialog(false);
      setSelectedSlides([]);
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
  
  const handleToggleSlideShowLogo = (slideIndex: number) => {
    const updatedSlides = [...slides];
    updatedSlides[slideIndex].showLogo = !updatedSlides[slideIndex].showLogo;
    setSlides(updatedSlides);
    toast.success(updatedSlides[slideIndex].showLogo ? 'Логотип включен' : 'Логотип выключен');
  };
  
  const handleUpdateSlideName = (slideIndex: number, newName: string) => {
    const updatedSlides = [...slides];
    updatedSlides[slideIndex].name = newName;
    setSlides(updatedSlides);
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSlideForBg !== null) {
      try {
        const compressed = await compressBackgroundImage(file);
        const updatedSlides = [...slides];
        updatedSlides[selectedSlideForBg].background = compressed;
        setSlides(updatedSlides);
        toast.success('Фон слайда установлен');
        setShowBackgroundDialog(false);
        setSelectedSlideForBg(null);
      } catch (error) {
        console.error('Background upload error:', error);
        toast.error('Ошибка при загрузке фона. Попробуйте меньший размер изображения.');
      }
    }
    if (e.target) e.target.value = '';
  };
  
  const handleRemoveSlideBackground = (slideIndex: number) => {
    const updatedSlides = [...slides];
    updatedSlides[slideIndex].background = '';
    setSlides(updatedSlides);
    toast.success('Фон слайда удалён');
  };
  
  const handleBackgroundClick = () => {
    setShowBackgroundDialog(true);
  };
  
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      title: 'Новый слайд',
      subtitle: 'Подзаголовок',
      content: 'Содержание слайда',
      image: '',
      layout: 'center',
      background: '',
      showLogo: false,
      name: `Слайд ${slides.length + 1}`
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
    toast.success('Слайд добавлен');
  };
  
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error('Нельзя удалить последний слайд');
      return;
    }
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
    if (currentSlide >= updatedSlides.length) {
      setCurrentSlide(updatedSlides.length - 1);
    }
    toast.success('Слайд удалён');
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressBackgroundImage(file, true);
        handleUpdateSettings({ logo: compressed });
        toast.success('Логотип загружен');
      } catch (error) {
        console.error('Logo upload error:', error);
        toast.error('Ошибка при загрузке логотипа');
      }
    }
    if (e.target) e.target.value = '';
  };
  
  const compressBackgroundImage = (file: File, preserveTransparency = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1920;
          const maxHeight = 1080;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const format = preserveTransparency ? 'image/png' : 'image/jpeg';
          const quality = preserveTransparency ? 0.92 : 0.85;
          const compressed = canvas.toDataURL(format, quality);
          
          if (compressed.length > 4 * 1024 * 1024) {
            const evenMoreCompressed = canvas.toDataURL(format, preserveTransparency ? 0.75 : 0.6);
            if (evenMoreCompressed.length > 4 * 1024 * 1024) {
              reject(new Error('Image too large even after compression'));
              return;
            }
            resolve(evenMoreCompressed);
          } else {
            resolve(compressed);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };
  
  const getTitleShadow = () => {
    if (!settings.mainTitleShadow) return 'none';
    const intensity = settings.mainTitleShadowIntensity;
    return `0 ${intensity}px ${intensity * 2}px rgba(0, 0, 0, 0.1)`;
  };
  
  const handleExportClick = () => {
    setShowExportDialog(true);
    setSelectedSlides(slides.map((_, idx) => idx));
  };
  
  const handleFullExport = () => {
    setShowExportDialog(false);
    handleExportPDF();
  };
  
  const handleSelectiveExport = () => {
    if (selectedSlides.length === 0) {
      toast.error('Выберите хотя бы один слайд');
      return;
    }
    handleExportPDF(selectedSlides);
  };
  
  const toggleSlideSelection = (index: number) => {
    if (selectedSlides.includes(index)) {
      setSelectedSlides(selectedSlides.filter(i => i !== index));
    } else {
      setSelectedSlides([...selectedSlides, index].sort((a, b) => a - b));
    }
  };

  const currentSlideBackground = slides[currentSlide]?.background || backgroundImage;
  
  return (
    <div className="min-h-screen relative" style={{ background: currentSlideBackground ? 'transparent' : 'var(--background)' }}>
      {currentSlideBackground && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ 
            backgroundImage: `url(${currentSlideBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
      )}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ position: 'relative', zIndex: 1 }}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
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
            <Button onClick={handleExportClick} className="flex items-center gap-2 flex-1 sm:flex-none text-sm sm:text-base">
              <Icon name="Download" size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Экспорт PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBackgroundClick}
                  className="flex items-center gap-2 flex-1 sm:flex-none text-sm sm:text-base"
                >
                  <Icon name="Image" size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Фон</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm sm:text-base"
                  title="Выйти"
                >
                  <Icon name="LogOut" size={16} className="sm:w-[18px] sm:h-[18px]" />
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <Card className="p-3 sm:p-4 shadow-lg bg-background/60 backdrop-blur-xl border-background/20">
              <div className="flex items-center gap-2 mb-4">
                {isEditing ? (
                  <Input
                    value={settings.slidesBlockTitle}
                    onChange={(e) => handleUpdateSettings({ slidesBlockTitle: e.target.value })}
                    className="font-semibold text-sm uppercase tracking-wide h-8 px-2 text-foreground bg-background"
                  />
                ) : (
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    {settings.slidesBlockTitle}
                  </h3>
                )}
              </div>
              <div className="space-y-3 mb-6">
                {slides.map((slide, index) => (
                  <div key={slide.id} className="relative group">
                    <button
                      onClick={() => setCurrentSlide(index)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        currentSlide === index
                          ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                          : 'bg-muted hover:bg-muted/80 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1 flex items-center justify-between">
                        {isEditing ? (
                          <Input
                            value={slide.name || `Слайд ${index + 1}`}
                            onChange={(e) => handleUpdateSlideName(index, e.target.value)}
                            className="h-5 px-1 text-xs font-semibold py-0 min-w-0 text-foreground bg-background"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span>{slide.name || `Слайд ${index + 1}`}</span>
                        )}
                        <div className="flex items-center gap-1">
                          {slide.background && (
                            <Icon name="Image" size={12} className="opacity-60" />
                          )}
                          {settings.logo && slide.showLogo && (
                            <Icon name="FileImage" size={12} className="opacity-60" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm line-clamp-1">{slide.title}</div>
                    </button>
                    {isEditing && (
                      <>
                        {settings.logo && (
                          <Button
                            size="sm"
                            variant={slide.showLogo ? "default" : "secondary"}
                            className="absolute -top-2 -left-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => handleToggleSlideShowLogo(index)}
                            title={slide.showLogo ? "Скрыть логотип" : "Показать логотип"}
                          >
                            <Icon name="FileImage" size={12} />
                          </Button>
                        )}
                        {slides.length > 1 && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => handleDeleteSlide(index)}
                          >
                            <Icon name="X" size={12} />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <Button
                  onClick={handleAddSlide}
                  className="w-full mb-4 rounded-xl"
                  variant="outline"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить слайд
                </Button>
              )}
              {isEditing && (
                <div className="pt-4 border-t border-border/50">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Добавить блок:
                  </h4>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const lastBlockId = slides[currentSlide].id.toString();
                        document.dispatchEvent(new CustomEvent('addBlock', { detail: { type: 'title' } }));
                      }}
                      className="w-full justify-start text-xs rounded-xl hover:bg-primary/10 hover:border-primary"
                    >
                      <Icon name="Heading1" size={14} className="mr-2" />
                      Заголовок
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        document.dispatchEvent(new CustomEvent('addBlock', { detail: { type: 'subtitle' } }));
                      }}
                      className="w-full justify-start text-xs rounded-xl hover:bg-primary/10 hover:border-primary"
                    >
                      <Icon name="Heading2" size={14} className="mr-2" />
                      Подзаголовок
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        document.dispatchEvent(new CustomEvent('addBlock', { detail: { type: 'text' } }));
                      }}
                      className="w-full justify-start text-xs rounded-xl hover:bg-primary/10 hover:border-primary"
                    >
                      <Icon name="Type" size={14} className="mr-2" />
                      Текст
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        document.dispatchEvent(new CustomEvent('addBlock', { detail: { type: 'image' } }));
                      }}
                      className="w-full justify-start text-xs rounded-xl hover:bg-primary/10 hover:border-primary"
                    >
                      <Icon name="ImagePlus" size={14} className="mr-2" />
                      Фото
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-9">
            {isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="shadow-lg overflow-hidden bg-background/60 backdrop-blur-xl border-background/20">
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-card to-transparent pointer-events-none z-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none z-10"></div>
                    <div className="p-4">
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Редактор</h3>
                    </div>
                    <div className="max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto px-4 pb-4 pr-2 custom-scrollbar-inset">
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
                  <Card className="shadow-xl overflow-hidden bg-background/60 backdrop-blur-xl border-background/20">
                    <div className="overflow-auto max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] custom-scrollbar-inset">
                      <SlidePreview
                        key={`preview-editor-${currentSlide}-${slides[currentSlide].id}`}
                        title={slides[currentSlide].title}
                        subtitle={slides[currentSlide].subtitle}
                        content={slides[currentSlide].content}
                        image={slides[currentSlide].image}
                        layout={slides[currentSlide].layout}
                        fullSize={false}
                        logo={slides[currentSlide].showLogo ? settings.logo : ''}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="overflow-hidden shadow-xl bg-background/60 backdrop-blur-xl border-background/20" id={`slide-preview-${currentSlide}`}>
                <SlidePreview
                  key={`preview-${currentSlide}-${slides[currentSlide].id}`}
                  title={slides[currentSlide].title}
                  subtitle={slides[currentSlide].subtitle}
                  content={slides[currentSlide].content}
                  image={slides[currentSlide].image}
                  layout={slides[currentSlide].layout}
                  fullSize={true}
                  logo={slides[currentSlide].showLogo ? settings.logo : ''}
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
                    className={`w-2.5 h-2.5 rounded-full transition-all border-2 ${
                      currentSlide === index 
                        ? 'bg-primary border-primary w-8' 
                        : 'bg-background border-primary/40'
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
      `}</style>
      
      <ThemeToggle />
      
      {!isAuthenticated && (
        <Button
          variant="outline"
          onClick={() => setShowLoginDialog(true)}
          className="fixed bottom-6 left-6 z-40 text-sm rounded-xl shadow-xl backdrop-blur-md bg-background/80 border-2"
        >
          Разработчику
        </Button>
      )}
      
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Экспорт презентации</DialogTitle>
            <DialogDescription className="text-center">
              Выберите режим экспорта презентации в PDF формат
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {exportMode === 'full' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleFullExport}
                    className="p-6 border-2 rounded-2xl transition-all hover:scale-105 border-primary bg-primary/10 shadow-lg"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Icon name="FileDown" size={32} />
                      <div className="text-lg font-bold">Полный</div>
                      <div className="text-sm text-muted-foreground">Экспорт всей презентации</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setExportMode('selective')}
                    className="p-6 border-2 rounded-2xl transition-all hover:scale-105 border-border bg-card hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Icon name="ListChecks" size={32} />
                      <div className="text-lg font-bold">Выборочный</div>
                      <div className="text-sm text-muted-foreground">Выберите страницы для экспорта</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Выберите слайды для экспорта</h3>
                  <Button variant="ghost" onClick={() => setExportMode('full')} size="sm">
                    <Icon name="ArrowLeft" size={16} className="mr-2" />
                    Назад
                  </Button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      onClick={() => toggleSlideSelection(index)}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedSlides.includes(index)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            selectedSlides.includes(index)
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {selectedSlides.includes(index) && (
                            <Icon name="Check" size={16} className="text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold mb-1">{slide.name || `Слайд ${index + 1}`}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{slide.title}</div>
                      </div>
                    </div>
                  ))}  
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedSlides.length === slides.length) {
                        setSelectedSlides([]);
                      } else {
                        setSelectedSlides(slides.map((_, idx) => idx));
                      }
                    }}
                    className="flex-1"
                  >
                    {selectedSlides.length === slides.length ? 'Снять все' : 'Выбрать все'}
                  </Button>
                  <Button onClick={handleSelectiveExport} className="flex-1">
                    Экспортировать ({selectedSlides.length})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Вход в режим редактирования</DialogTitle>
            <DialogDescription className="text-center">
              Введите логин и пароль для доступа к редактору презентации
            </DialogDescription>
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
            <DialogDescription>
              Настройте логотип, заголовок и параметры доступа к презентации
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Логотип</label>
              <div className="flex items-center gap-4">
                {settings.logo ? (
                  <div className="relative">
                    <img 
                      src={settings.logo} 
                      alt="Logo" 
                      className="h-24 w-auto object-contain border-2 border-border rounded-xl p-2"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg"
                      onClick={() => handleUpdateSettings({ logo: '' })}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </div>
                ) : (
                  <div className="h-24 w-32 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center text-muted-foreground">
                    <Icon name="ImagePlus" size={32} className="opacity-30" />
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="rounded-xl"
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  {settings.logo ? 'Изменить' : 'Загрузить'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Рекомендуемая высота: не более 210px</p>
            </div>
            
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
      
      <Dialog open={showBackgroundDialog} onOpenChange={setShowBackgroundDialog}>
        <DialogContent className="sm:max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Выбор фона для слайда</DialogTitle>
            <DialogDescription className="text-center">
              Выберите слайд и загрузите изображение для фона
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center">Выберите слайд, для которого хотите установить фон</p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-4 p-4 border-2 rounded-xl transition-all hover:shadow-md bg-card border-border hover:border-primary/50"
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1">{slide.name || `Слайд ${index + 1}`}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{slide.title}</div>
                    {slide.background && (
                      <div className="text-xs text-primary mt-1 flex items-center gap-1">
                        <Icon name="Check" size={12} />
                        Фон установлен
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSlideForBg(index);
                        document.getElementById('background-upload')?.click();
                      }}
                      className="rounded-xl"
                    >
                      <Icon name="Upload" size={14} className="mr-2" />
                      Загрузить
                    </Button>
                    {slide.background && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveSlideBackground(index)}
                        className="rounded-xl"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <input
        id="background-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundUpload}
      />
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />
    </div>
  );
};

export default Index;