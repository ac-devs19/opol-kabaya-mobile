import { useState, useEffect } from "react";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  } else if (hour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
};

export function useGreeting() {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextUpdate = () => {
      const now = new Date();
      const hour = now.getHours();

      const nextUpdate = new Date(now);
      nextUpdate.setMinutes(0, 0, 0);

      if (hour < 12) {
        nextUpdate.setHours(12);
      } else if (hour < 18) {
        nextUpdate.setHours(18);
      } else {
        nextUpdate.setHours(24);
      }

      const timeUntilNextUpdate = nextUpdate.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        setGreeting(getGreeting());
        scheduleNextUpdate();
      }, timeUntilNextUpdate);
    };

    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, []);

  return greeting;
}
