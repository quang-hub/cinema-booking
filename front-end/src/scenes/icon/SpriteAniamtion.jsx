import React, { useEffect, useRef, useState } from "react";

const SpriteAnimation = ({
  imageUrl,     // Đường dẫn ảnh sprite
  onLastFrame,  // Hàm callback khi hoàn thành 1 vòng (tùy chọn)
  frameWidth,
  frameHeight,
  frameRate
}) => {

  const scale = 1;
  const [imageLoaded, setImageLoaded] = useState(false); // Trạng thái tải ảnh
  const [totalFrames, setTotalFrames] = useState(0);     // Tổng số khung hình
  const [currentFrame, setCurrentFrame] = useState(0);   // Khung hình hiện tại
  const [xFrames, setXFrames] = useState(0);             // Số khung theo chiều ngang
  const spriteRef = useRef(null);                        // Tham chiếu DOM

  // Xử lý tải ảnh sprite
  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      const xFramesCalc = Math.floor(image.width / frameWidth);
      const yFramesCalc = Math.floor(image.height / frameHeight);
      setXFrames(xFramesCalc);
      setTotalFrames(xFramesCalc * yFramesCalc);
      setImageLoaded(true);
    };

    image.onerror = () => {
      console.error("Failed to load image sprite.");
    };
  }, [imageUrl]);

  // Xử lý vòng lặp khung hình
  useEffect(() => {
    if (!imageLoaded) return;

    const frameDuration = 1000 / frameRate; // Thời gian mỗi khung hình (ms)
    const intervalId = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        const nextFrame = prevFrame + 1;
        if (nextFrame >= totalFrames) {
          if (onLastFrame) onLastFrame(); // Gọi callback nếu có
          return 0; // Quay lại khung đầu tiên
        }
        return nextFrame;
      });
    }, frameDuration);

    return () => clearInterval(intervalId); // Clear interval khi component bị hủy
  }, [imageLoaded, totalFrames, frameRate, onLastFrame]);

  // Cập nhật vị trí khung hình trong sprite
  useEffect(() => {
    if (!spriteRef.current || !imageLoaded) return;

    const xpos = (currentFrame % xFrames) * frameWidth;
    const ypos = Math.floor(currentFrame / xFrames) * frameHeight;

    // Cập nhật vị trí của `background-position`
    spriteRef.current.style.backgroundPosition = `-${xpos * scale}px -${ypos * scale}px`;
  }, [currentFrame, frameWidth, frameHeight, xFrames, scale, imageLoaded]);

  // Hiển thị trạng thái tải hoặc animation
  if (!imageLoaded) return <div>...</div>;

  return (
    <div
      ref={spriteRef}
      style={{
        width: `${frameWidth * scale}px`,
        height: `${frameHeight * scale}px`,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${frameWidth * xFrames * scale}px auto`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

export default SpriteAnimation;
