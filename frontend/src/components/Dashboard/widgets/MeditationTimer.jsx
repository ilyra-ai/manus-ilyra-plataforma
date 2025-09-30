import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Slider,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress
} from '@/components/ui';
import {
  Play, Pause, StopCircle, RefreshCw, Volume2, VolumeX, Settings, Clock, Music
} from 'lucide-react';

const MeditationTimer = ({ onRemove, isFullscreen, theme }) => {
  const [duration, setDuration] = useState(10); // Duração em minutos
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Tempo restante em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [meditationSound, setMeditationSound] = useState('none');
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            // Tocar som de fim de meditação
            if (!isMuted) {
              // Implementar som de fim
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (meditationSound !== 'none' && isRunning && !isMuted) {
        audioRef.current.play().catch(e => console.error("Erro ao tocar áudio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [meditationSound, isRunning, isMuted]);

  const togglePlayPause = () => {
    setIsRunning(prev => !prev);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressValue = (1 - (timeLeft / (duration * 60))) * 100;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Temporizador de Meditação</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => { /* Open settings */ }}>
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-4 space-y-6">
        <div className="text-6xl font-bold text-purple-600">
          {formatTime(timeLeft)}
        </div>
        <div className="w-full">
          <Progress value={progressValue} className="w-full" />
        </div>
        <div className="flex space-x-4">
          <Button size="lg" onClick={togglePlayPause}>
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button size="lg" variant="outline" onClick={stopTimer}>
            <StopCircle className="h-6 w-6" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => setIsMuted(prev => !prev)}>
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
        </div>
        <div className="w-full space-y-2">
          <Label htmlFor="duration-slider">Duração da Meditação ({duration} minutos)</Label>
          <Slider
            id="duration-slider"
            min={1}
            max={60}
            step={1}
            value={[duration]}
            onValueChange={(value) => setDuration(value[0])}
            disabled={isRunning}
          />
        </div>
        <div className="w-full space-y-2">
          <Label htmlFor="meditation-sound">Som Ambiente</Label>
          <Select value={meditationSound} onValueChange={setMeditationSound} disabled={isRunning}>
            <SelectTrigger id="meditation-sound">
              <SelectValue placeholder="Selecionar som" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="rain">Chuva Suave</SelectItem>
              <SelectItem value="forest">Sons da Floresta</SelectItem>
              <SelectItem value="ocean">Ondas do Oceano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <audio ref={audioRef} loop>
        {meditationSound === 'rain' && <source src="/sounds/rain.mp3" type="audio/mpeg" />}
        {meditationSound === 'forest' && <source src="/sounds/forest.mp3" type="audio/mpeg" />}
        {meditationSound === 'ocean' && <source src="/sounds/ocean.mp3" type="audio/mpeg" />}
      </audio>
    </Card>
  );
};

export { MeditationTimer };

