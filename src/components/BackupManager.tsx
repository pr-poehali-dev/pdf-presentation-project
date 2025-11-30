import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Backup {
  id: string;
  date: string;
  timestamp: number;
  type: 'auto' | 'manual';
}

interface BackupManagerProps {
  slides: any[];
  settings: any;
  backgroundImage: string;
  onRestore: (slides: any[], settings: any, backgroundImage: string) => void;
}

const BackupManager = ({ slides, settings, backgroundImage, onRestore }: BackupManagerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [backups, setBackups] = useState<Backup[]>(() => {
    const saved = localStorage.getItem('backups');
    return saved ? JSON.parse(saved) : [];
  });
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => {
    return localStorage.getItem('autoBackup') === 'true';
  });
  const [backupInterval, setBackupInterval] = useState(() => {
    return localStorage.getItem('backupInterval') || 'daily';
  });
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  const createBackup = (type: 'auto' | 'manual' = 'manual') => {
    const backup = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU'),
      timestamp: Date.now(),
      type,
      data: {
        slides,
        settings,
        backgroundImage
      }
    };

    const newBackups = [backup, ...backups].slice(0, 20);
    setBackups(newBackups);
    localStorage.setItem('backups', JSON.stringify(newBackups));
    localStorage.setItem(`backup_${backup.id}`, JSON.stringify(backup.data));
    
    toast.success(`Бэкап создан: ${backup.date}`);
    return backup;
  };

  const restoreBackup = (backupId: string) => {
    const backupData = localStorage.getItem(`backup_${backupId}`);
    if (!backupData) {
      toast.error('Бэкап не найден');
      return;
    }

    try {
      const data = JSON.parse(backupData);
      onRestore(data.slides, data.settings, data.backgroundImage);
      toast.success('Данные восстановлены из бэкапа');
      setShowRestoreDialog(false);
    } catch (error) {
      toast.error('Ошибка при восстановлении бэкапа');
    }
  };

  const deleteBackup = (backupId: string) => {
    const newBackups = backups.filter(b => b.id !== backupId);
    setBackups(newBackups);
    localStorage.setItem('backups', JSON.stringify(newBackups));
    localStorage.removeItem(`backup_${backupId}`);
    toast.success('Бэкап удалён');
  };

  const exportDatabase = () => {
    const data = {
      slides,
      settings,
      backgroundImage,
      backups: backups.map(b => ({
        ...b,
        data: JSON.parse(localStorage.getItem(`backup_${b.id}`) || '{}')
      })),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('База данных экспортирована');
  };

  const exportFiles = () => {
    toast.info('Функция экспорта файлов в разработке');
  };

  const exportAll = () => {
    exportDatabase();
    setTimeout(() => {
      toast.info('Архив файлов будет скачан отдельно');
    }, 500);
  };

  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.slides) {
          onRestore(data.slides, data.settings || settings, data.backgroundImage || '');
        }
        
        if (data.backups && data.backups.length > 0) {
          const importedBackups = data.backups.map((b: any) => {
            const backupMeta = {
              id: b.id,
              date: b.date,
              timestamp: b.timestamp,
              type: b.type
            };
            if (b.data) {
              localStorage.setItem(`backup_${b.id}`, JSON.stringify(b.data));
            }
            return backupMeta;
          });
          
          setBackups(importedBackups);
          localStorage.setItem('backups', JSON.stringify(importedBackups));
        }
        
        toast.success('База данных импортирована');
        setShowRestoreDialog(false);
      } catch (error) {
        toast.error('Ошибка при импорте базы данных');
      }
    };
    reader.readAsText(file);
  };

  const toggleAutoBackup = () => {
    const newValue = !autoBackupEnabled;
    setAutoBackupEnabled(newValue);
    localStorage.setItem('autoBackup', newValue.toString());
    toast.success(newValue ? 'Автосохранение включено' : 'Автосохранение выключено');
    
    if (newValue) {
      createBackup('auto');
    }
  };

  const changeBackupInterval = (interval: string) => {
    setBackupInterval(interval);
    localStorage.setItem('backupInterval', interval);
    toast.success(`Периодичность: ${interval === 'daily' ? 'ежедневно' : interval === 'weekly' ? 'еженедельно' : 'ежемесячно'}`);
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Icon name="Database" size={16} />
        Управление данными
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление данными и бэкапами</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Экспорт данных</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={exportDatabase} variant="outline" className="flex flex-col h-auto py-4 gap-2">
                  <Icon name="Database" size={24} />
                  <span className="text-xs">База</span>
                </Button>
                <Button onClick={exportFiles} variant="outline" className="flex flex-col h-auto py-4 gap-2">
                  <Icon name="FileArchive" size={24} />
                  <span className="text-xs">Файлы</span>
                </Button>
                <Button onClick={exportAll} variant="outline" className="flex flex-col h-auto py-4 gap-2">
                  <Icon name="Package" size={24} />
                  <span className="text-xs">Всё</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Бэкапы</h3>
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Автоматическое сохранение</span>
                  <Button
                    onClick={toggleAutoBackup}
                    size="sm"
                    variant={autoBackupEnabled ? 'default' : 'outline'}
                  >
                    {autoBackupEnabled ? 'Вкл' : 'Выкл'}
                  </Button>
                </div>
                
                {autoBackupEnabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Периодичность</span>
                    <select
                      value={backupInterval}
                      onChange={(e) => changeBackupInterval(e.target.value)}
                      className="px-3 py-1 rounded-lg border border-border bg-background text-sm"
                    >
                      <option value="daily">Ежедневно</option>
                      <option value="weekly">Еженедельно</option>
                      <option value="monthly">Ежемесячно</option>
                    </select>
                  </div>
                )}
                
                <Button onClick={() => createBackup('manual')} className="w-full" variant="outline">
                  <Icon name="Save" size={16} className="mr-2" />
                  Создать бэкап сейчас
                </Button>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Сохранённые бэкапы ({backups.length})</h3>
                <Button onClick={() => setShowRestoreDialog(true)} size="sm" variant="outline">
                  <Icon name="Upload" size={14} className="mr-2" />
                  Восстановить
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {backups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Нет сохранённых бэкапов
                  </div>
                ) : (
                  backups.map((backup) => (
                    <Card key={backup.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon name={backup.type === 'auto' ? 'Clock' : 'User'} size={16} className="text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{backup.date}</div>
                          <div className="text-xs text-muted-foreground">
                            {backup.type === 'auto' ? 'Автоматический' : 'Ручной'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => restoreBackup(backup.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Icon name="RotateCcw" size={14} />
                        </Button>
                        <Button
                          onClick={() => deleteBackup(backup.id)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Восстановление данных</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Выберите источник для восстановления данных
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowRestoreDialog(false);
                  setShowDialog(true);
                }}
                variant="outline"
                className="w-full justify-start"
              >
                <Icon name="Database" size={16} className="mr-2" />
                Из сохранённых бэкапов
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importDatabase}
                  className="hidden"
                  id="import-database"
                />
                <Button
                  onClick={() => document.getElementById('import-database')?.click()}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icon name="FileUp" size={16} className="mr-2" />
                  Из файла (база данных)
                </Button>
              </div>
              <div>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                    toast.info('Функция импорта архива в разработке');
                    if (e.target) e.target.value = '';
                  }}
                  className="hidden"
                  id="import-archive"
                />
                <Button
                  onClick={() => document.getElementById('import-archive')?.click()}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icon name="FileArchive" size={16} className="mr-2" />
                  Из файла (архив)
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BackupManager;
