import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PhoneCard = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // For now, using the same video for all slides
  // Later you can add more videos to this array
  const videos = [
    '/videos/video.MP4',
    '/videos/video.MP4', // Duplicate for now
    '/videos/video.MP4', // Duplicate for now
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 4000); // Change video every 4 seconds

    return () => clearInterval(timer);
  }, [videos.length]);

  return (
    <StyledWrapper>
      <div className="card">
        <div className="btn1" />
        <div className="btn2" />
        <div className="btn3" />
        <div className="btn4" />
        <div className="card-int">
          <div className="video-container">
            {videos.map((video, index) => (
              <video
                key={index}
                className={`video ${index === currentVideoIndex ? 'active' : ''}`}
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ))}
          </div>
          {/* Carousel Indicators */}
          <div className="indicators">
            {videos.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentVideoIndex ? 'active' : ''}`}
                onClick={() => setCurrentVideoIndex(index)}
              />
            ))}
          </div>
        </div>
        <div className="top">
          <div className="camera">
            <div className="int" />
          </div>
          <div className="speaker" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 280px;
    height: 520px;
    background: black;
    border-radius: 45px;
    border: 3px solid rgb(40, 40, 40);
    padding: 10px;
    position: relative;
    box-shadow: 4px 8px 25px rgba(0, 0, 0, 0.6);
    
    @media (max-width: 768px) {
      width: 220px;
      height: 420px;
      border-radius: 35px;
      padding: 8px;
    }
    
    @media (max-width: 480px) {
      width: 180px;
      height: 360px;
      border-radius: 30px;
      padding: 6px;
    }
  }

  .card-int {
    height: 100%;
    border-radius: 25px;
    transition: all 0.6s ease-out;
    overflow: hidden;
    position: relative;
  }

  .video-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 25px;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    
    &.active {
      opacity: 1;
    }
  }

  .indicators {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
    z-index: 10;
  }

  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background-color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
      background-color: rgba(255, 255, 255, 0.9);
      transform: scale(1.2);
    }
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.7);
    }
  }

  .top {
    position: absolute;
    top: 0px;
    right: 50%;
    transform: translate(50%, 0%);
    width: 35%;
    height: 18px;
    background-color: black;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .speaker {
    position: absolute;
    top: 2px;
    right: 50%;
    transform: translate(50%, 0%);
    width: 40%;
    height: 2px;
    border-radius: 2px;
    background-color: rgb(20, 20, 20);
  }

  .camera {
    position: absolute;
    top: 6px;
    right: 84%;
    transform: translate(50%, 0%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.048);
  }

  .int {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    background-color: rgba(0, 0, 255, 0.212);
  }

  .btn1, .btn2, .btn3, .btn4 {
    position: absolute;
    width: 2px;
  }

  .btn1, .btn2, .btn3 {
    height: 45px;
    top: 30%;
    right: -4px;
    background-image: linear-gradient(to right, #111111, #222222, #333333, #464646, #595959);
  }

  .btn2, .btn3 {
    transform: scale(-1);
    left: -4px;
  }

  .btn2, .btn3 {
    transform: scale(-1);
    height: 30px;
  }

  .btn2 {
    top: 26%
  }

  .btn3 {
    top: 36%
  }

`;

export default PhoneCard;
