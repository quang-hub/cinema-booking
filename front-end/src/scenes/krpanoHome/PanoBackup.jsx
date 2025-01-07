import React, { useEffect } from "react";

const PanoBackup = () => {
    const tourData = sessionStorage.getItem('tourData');

    console.log(tourData);

    const runPano = () => {
        if (typeof window !== "undefined" && window.embedpano) {

            window.embedpano({
                xml: tourData,
                target: "pano",
                html5: "only",
                mobilescale: 1.0,
                passQueryParameters: "startscene,startlookat",
                consolelog: false,
                onready: async (krpano) => {
                    await krpanoReady(krpano);
                }
            });
        }
    };

    const krpanoReady = (krpano) => {
        window.krpano = krpano;
        if(krpano){
            krpano.call("removeplugin(toolbox);");
        }
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "http://localhost:8081/tour-direc/tour.js";

        script.onload = () => {
            console.log("Tour.js loaded successfully.");
            runPano();
        };

        script.onerror = () => {
            console.error("Failed to load tour.js script.");
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);


    return (
        <>
            <div id="pano" style={{ width: "100%", height: "100%" }}></div>
        </>
    );
};

export default PanoBackup;
