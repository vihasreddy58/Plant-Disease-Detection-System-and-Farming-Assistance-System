import React from "react";

const HeroSection = () => {
  return (
    <section className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Background Image */}
      <img
        src="/images.jpg"  // Ensure the correct path in public/assets or static folder
        alt="Her Section Banner"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      
      {/* Overlay for better readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-white text-4xl md:text-6xl font-bold">Welcome to Her Section</h1>
        <p className="text-white text-lg md:text-2xl mt-4 max-w-2xl">
          Empowering women in agriculture through knowledge and support.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
