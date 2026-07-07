import { useEffect, useRef, useState } from "react";

export default function PendingGameTimer(durationMs: number) {
  const [timeLeft, setTimeLeft] = useState<number>(durationMs);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => setIsRunning(true);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(durationMs);
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);

          // FIX: COVER PROBLEM OF RESET RELOAD BY CHECKING MACHINE CLOCK TIME
          // AND COMPARE TO SECONDS PASSED

          // TODO : DO NOT EMIT LEAVE ROOM (AS BACKEND DOES NOT HANDLE EDGECASE OF CALLED FUNC WHEN PLAYER LEFT ALREADY)
          // JUST DISMOUNT COMPONENT
          // TODO: ADD CHCK FO WHEN RELOAD IF PLAYER IS STILL IN ROOM!!!
          // socket.emit("leave_room"); // Forces leave room if socket fails to emit for some reason
          
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  return { timeLeft, isRunning, start, reset };
}