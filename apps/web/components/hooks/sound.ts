"use client";

let hasUserInteracted = false;

if (typeof window !== "undefined") {
  const enableSound = () => {
    hasUserInteracted = true;
    // You could preload sounds here too if needed
  };

  window.addEventListener("click", enableSound, { once: true });
  window.addEventListener("keydown", enableSound, { once: true });
}

export const playSound = (soundName: string) => {
  if (!hasUserInteracted) {
    console.warn("User hasn't interacted yet. Skipping sound.");
    return;
  }

  const sound = new Audio(`./${soundName}.mp3`);
  sound.play().catch((error) => {
    console.error("Error playing sound:", error);
  });
};
