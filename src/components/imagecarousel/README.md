# 🎠 What We Are Doing Right Now (Making Carousel Image and How to Use)

## 🧩 Overview

This document explains the process of creating and implementing a **Responsive Image Carousel Component** in React.js using **Swiper.js**. The carousel will be featured on the landing page and will automatically slide through images smoothly with beautiful hover animations, fixed dimensions, and responsive design.

Our goal is to create a visually appealing image gallery section that enhances the user experience while maintaining clean, maintainable, and modular React code.

---

## ⚙️ Key Features

- 🎞️ **Automatic Sliding:** The carousel automatically transitions between images every 3 seconds.  
- 🔁 **Infinite Loop:** The carousel loops endlessly without abrupt stops.  
- 🖱️ **Hover Animation:** Each image smoothly scales up and adds a shadow when hovered.  
- 📱 **Responsive Design:** The number of images shown adjusts based on screen size (1, 2, or 3).  
- 💅 **Inline Styling:** All styling is applied directly inside the component — no CSS file required.  
- 🧱 **Modular Component:** Can be imported and reused across different pages easily.

---

## 🛠️ Technologies Used

| Tool / Library | Purpose |
|----------------|----------|
| **React.js** | Frontend JavaScript framework |
| **Swiper.js** | For the carousel and pagination functionality |
| **JavaScript (ES6)** | Logic and event handling |
| **Inline CSS Styling** | Component-level design |

---

## 🧠 Implementation Steps

### 1️⃣ Install Swiper

Make sure Swiper is installed in your React project:

```bash
npm install swiper
```

```
2️⃣ Add Image Assets
Place your images inside the public directory at the following path:

/public
  /imagecarousel
    /gallery
      slide1.jpg
      slide2.jpg
      slide3.jpg
      slide4.jpg

Ensure the images are optimized for web (243x351 px recommended).
```

3️⃣ Create the Component Folder
Inside your React source directory, navigate to:

```bash
Copy code
src/components/
Create a new folder named: ImageCarousel
```

```bash
Copy code
ImageCarousel
Inside that folder, create the component file: ImageCarousel.tsx
```

Copy code
ImageCarousel.jsx
4️⃣ Add the Component Code
Paste the following complete code inside ImageCarousel.jsx:

```tsx
Copy code
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const ImageCarousel: React.FC = () => {
  const images: string[] = [
    '/CarouselImages/slide1.jpg',
    '/CarouselImages/slide2.jpg',
    '/CarouselImages/slide3.jpg',
    '/CarouselImages/slide4.jpg',
  ];

  return (
    <section
      style={{
        padding: '60px 0',
        backgroundColor: '#fff',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '40px',
          letterSpacing: '1px',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          opacity: 1,
          transform: 'translateY(0)',
        }}
      >
        <span style={{ color: '#22543D' }}>OUR</span>{' '}
        <span style={{ color: '#F4C542' }}>GALLERY</span>
      </h2>

      <Swiper
        spaceBetween={20}
        slidesPerView={3}
        pagination={{ clickable: true }}
        grabCursor={true}
        loop={true}
        speed={1000} // Smooth transition between slides
        autoplay={{
          delay: 3000, // Slides every 3 seconds
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        modules={[Pagination, Autoplay]}
        style={{
          width: '90%',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingBottom: '50px',
        }}
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                width: '100%',
                height: '350px',
                overflow: 'hidden',
                borderRadius: '15px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.5s ease, box-shadow 0.5s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
              }}
            >
              <img
                src={src}
                alt={`Gallery ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 1s ease-in-out',
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ImageCarousel;
```


5️⃣ Import and Use in Landing Page
In your landing page (e.g., LandingPage.jsx), import and display the carousel:

```tsx
Copy code
import ImageCarousel from '@/components/ImageCarousel/ImageCarousel';

function LandingPage() {
  return (
    <>
      {/* Other sections of your landing page */}
      <ImageCarousel />
    </>
  );
}

export default LandingPage;
```

🖼️ Expected Output
The component will display a responsive, smoothly sliding image carousel with hover animations.
Each image will have the following behavior:

Fixed size: 243x351 px

Soft rounded corners and shadow

Scales up slightly when hovered

Auto transitions every 3 seconds

Loops infinitely

📱 Responsive Behavior
Screen Width	Slides per View	Description
320px – 639px	1 slide	Centered mobile view
640px – 1023px	2 slides	Tablet view
1024px and above	3 slides	Desktop full layout

💡 Tips & Customization
You can adjust the autoplay speed by modifying the value of delay (in milliseconds).

To make slides fade instead of slide, add the EffectFade module from Swiper.

Update image paths or add more images by editing the images array.

You can change the background color by modifying the backgroundColor value inside the <section>.

✅ Summary
By following this guide, we successfully created a professional and reusable image carousel component using React and Swiper.js.
The component enhances the landing page visually while maintaining performance, responsiveness, and simplicity.

This approach ensures:

Clean and readable code

Easy maintenance and reusability

A modern user experience aligned with current web design standards

✨ Author
Developed by Kobe Bryant Dacera and collaborators.
Crafted with 💻, ☕, and creativity.