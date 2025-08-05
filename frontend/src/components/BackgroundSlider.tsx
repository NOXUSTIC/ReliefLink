import { useEffect, useState } from 'react';
import communityMeal from '@/assets/community-meal.jpg';
import riceField from '@/assets/rice-field.jpg';
import floodRescue from '@/assets/flood-rescue.jpg';
import fireEmergency from '@/assets/fire-emergency.jpg';

const images = [
  communityMeal,
  riceField,
  floodRescue,
  fireEmergency
];

export const BackgroundSlider = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-40' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Background ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
    </div>
  );
};