import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onAudioRecorded?: (audioBlob: Blob) => void;
  onAudioUrlChange?: (url: string | null) => void;
  existingAudioUrl?: string | null;
}

export function AudioRecorder({ onAudioRecorded, onAudioUrlChange, existingAudioUrl }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (existingAudioUrl) {
      setAudioURL(existingAudioUrl);
    }
  }, [existingAudioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL && !existingAudioUrl) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL, existingAudioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onAudioRecorded?.(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Speak clearly to record your audio description",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioPlayerRef.current || !audioURL) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioURL && !existingAudioUrl) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setRecordingTime(0);
    onAudioUrlChange?.(null);
    toast({
      title: "Recording deleted",
      description: "Audio recording has been removed",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3" data-testid="audio-recorder">
      {!audioURL ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              type="button"
              onClick={startRecording}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-start-recording"
            >
              <Mic className="h-4 w-4" />
              Record Audio Description
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center gap-2"
                data-testid="button-stop-recording"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-mono" data-testid="recording-time">{formatTime(recordingTime)}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <audio
            ref={audioPlayerRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <Button
            type="button"
            onClick={togglePlayPause}
            variant="outline"
            size="sm"
            data-testid="button-play-pause-audio"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Audio Description {recordingTime > 0 && `(${formatTime(recordingTime)})`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click play to listen to your recording
            </p>
          </div>
          <Button
            type="button"
            onClick={deleteRecording}
            variant="ghost"
            size="sm"
            data-testid="button-delete-audio"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      )}
      {!audioURL && !isRecording && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Optional: Record a voice description of your gig requirements (max 3 minutes)
        </p>
      )}
    </div>
  );
}

interface AudioPlayerProps {
  audioUrl: string;
  label?: string;
}

export function AudioPlayer({ audioUrl, label = "Audio Description" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg" data-testid="audio-player">
      <audio
        ref={audioPlayerRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <Button
        type="button"
        onClick={togglePlayPause}
        variant="outline"
        size="sm"
        className="bg-blue-600 text-white hover:bg-blue-700"
        data-testid="button-play-audio"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          🎤 {label}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Click play to listen to the audio description
        </p>
      </div>
    </div>
  );
}
