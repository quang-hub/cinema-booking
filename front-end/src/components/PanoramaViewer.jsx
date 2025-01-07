import React, { useEffect, useRef } from 'react';
import * as PANOLENS from 'panolens';

function PanoramaViewer() {
  const imageContainerRef = useRef(null);

  useEffect(() => {
    const panoramaImage = new PANOLENS.ImagePanorama('assets/anhToanCanh.JPG');
    const viewer = new PANOLENS.Viewer({
      container: imageContainerRef.current,
      autoRotate: true,
      autoRotateSpeed: 0.3,
      controlBar: false,
    });

    viewer.add(panoramaImage);

    // Clean up on unmount
    // return () => {
    //   viewer.dispose();
    // };
  }, []);

  return (
    <div
      ref={imageContainerRef}
      className="w-full h-full"
      style={{ height: '100%' }} 
    ></div>
  );
}

export default PanoramaViewer;
