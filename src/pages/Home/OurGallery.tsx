import React from 'react';
import ImageCarousel from '../../components/carousels/GalleryCarousel';

const OurGallery: React.FC = () => {
  const galleryImages = [
    '/CarouselImages/slide1.jpg',
    '/CarouselImages/slide2.jpg',
    '/CarouselImages/slide3.jpg',
    '/CarouselImages/slide4.jpg',
  ];

  return (
    <ImageCarousel
      title={
        <>
          <span className="green header">OUR</span>{' '}
          <span className="yellow header">GALLERY</span>
        </>
      }
      images={galleryImages}
    />
  );
};

export default OurGallery;
