import React, { useEffect, useState, useCallback } from "react";
import AddHotspotForm from "./AddHotspotForm";
import Axios from "../../components/Axios";
import Notification from "../../components/Notification";
import './index.css';
import { hasPermission, getUserCode } from "../login/DecodeToken";
import showAlertDialog from "../../components/ShowAlertDialog"; // Import AlertDialog

const Panos = ({ code, hotspot, currentUser }) => {

    let token = localStorage.getItem("authToken") || "";

    const sceneName = sessionStorage.getItem('sceneName');

    const [hPressed, setHPressed] = useState(false);
    const handleFormClose = () => {
        setShowForm(false);
    };
    const hideError = useCallback((e) => {
        if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
            const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
            const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
            if (resizeObserverErr) {
                resizeObserverErr.setAttribute('style', 'display: none');
            }
            if (resizeObserverErrDiv) {
                resizeObserverErrDiv.setAttribute('style', 'display: none');
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('error', hideError);

        return () => {
            window.removeEventListener('error', hideError);
        };
    }, [hideError]);

    const [showForm, setShowForm] = useState(false);
    const [krpanoRef, setKrpanoRef] = useState();
    const [pointList, setPointList] = useState([]);
    const [hotspotData, setHotspotData] = useState();
    let krpanoRef1 = {};
    const runPano = () => {
        if (typeof window !== "undefined" && window.embedpano) {
            console.log(code);

            window.embedpano({
                xml: "http://localhost:8081/tour-direc/" + code + "/tour.xml",
                target: "pano",
                html5: "only",
                mobilescale: 1.0,
                passQueryParameters: "startscene,startlookat",
                vars: { startlookat: hotspot?.hotspotName || "", startscene: sceneName || hotspot?.sceneName || "" },
                consolelog: true,
                onready: async (krpano) => {
                    await krpanoReady(krpano);
                }
            });
            sessionStorage.clear();
        }
    };

    const krpanoReady = (krpano) => {

        window.krpano = krpano;
        krpanoRef1 = krpano;
        setKrpanoRef(krpano);
        console.log("KRPano is ready.");
    };
    useEffect(() => {
        if (krpanoRef !== undefined) {
            console.log(getUserCode() === currentUser);

            // console.log('krpanoRef:', krpanoRef);
            if ((hasPermission("CREATE_HOTSPOT") && hasPermission("UPDATE_HOTSPOT")
                && hasPermission("DELETE_HOTSPOT")) || (hasPermission("MANAGE_INDUSTRIAL_PARK") && getUserCode() === currentUser)) {
                return;
            }
            else {
                krpanoRef.call("removeplugin(toolbox);");
            }
        }
    }, [krpanoRef]);

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
    }, [code]);

    const DeleteHotspot = async (hotspotInfo) => {
        try {
            const url = `/hotspot/delete`;
            const requestData = {
                industrialParkCode: code,
                hotspotName: hotspotInfo.name
            }
            const response = await Axios.post(url, requestData, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            let responseData = response.data;
            console.log(responseData);

            if (responseData.code !== 200) {
                Notification(responseData.message, "WARNING");
            }
            Notification(responseData.message, "SUCCESS");

            setTimeout(function () {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error fetching scenes:', error);
            Notification(error.response?.data?.message, "WARNING");

        }
    }

    const FindHotspotByName = async (hotspotInfo, hotspotName) => {
        try {
            if (!hotspotInfo) {
                hotspotInfo = { name: hotspotName };
            }
            const url = `/hotspot/get-detail/${hotspotInfo.name}`;
            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            let responseData = response.data;
            if (responseData.code === 200) {
                setHotspotData({
                    ...responseData.data,
                    hotspotInfo
                });

            }

        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    }

    const getHotspotInfo = (infoString) => {
        // Ensure the input is a string
        const stringToParse = typeof infoString === 'string' ? infoString : infoString.innerHTML;

        // Regular expression to extract name, ath, atv, scale, depth, tx, ty, tz
        const regex = /name="([^"]+)"\s+ath="([^"]+)"\s+atv="([^"]+)"\s+scale="([^"]+)"\s+depth="([^"]+)"\s+rx="([^"]+)"\s+ry="([^"]+)"\s+rz="([^"]+)"\s+ox="([^"]+)"\s+oy="([^"]+)"\s+tx="([^"]+)"\s+ty="([^"]+)"\s+tz="([^"]+)"/;

        // Parse the string using the regular expression
        const match = stringToParse.match(regex);

        if (match) {
            return {
                name: match[1],
                ath: parseFloat(match[2]),
                atv: parseFloat(match[3]),
                scale: parseFloat(match[4]),
                depth: parseFloat(match[5]),
                tx: parseFloat(match[11]),
                ty: parseFloat(match[12]),
                tz: parseFloat(match[13]),
            };
        }

        return null;  // Return null if no match is found
    };



    const getPoint = (infoDiv) => {
        const htmlContent = infoDiv?.innerHTML || "";

        const pointRegex = /&lt;point ath="([^"]+)" atv="([^"]+)" \/&gt;/g;
        const points = [];
        let match;
        while ((match = pointRegex.exec(htmlContent)) !== null) {
            points.push({ ath: match[1], atv: match[2] });
        }
        return points;
    };

    const getName = (infoDiv) => {
        const htmlContent = infoDiv?.innerHTML || "";

        const unescapedContent = new DOMParser().parseFromString(htmlContent, 'text/html').documentElement.textContent;
        const regex = /<hotspot[^>]*\sname="([^"]+)"/;
        const match = unescapedContent.match(regex);

        return match ? match[1] : "";
    };
    useEffect(() => {
        if (token) {
            const handleKeyDown = async (event) => {
                // Track if 'H' is pressed
                if (event.code === "KeyH") {
                    setHPressed(true);
                }

                const preTags = document.getElementsByTagName('pre');
                let points = [];
                let hotspotName = "";
                let hotspotInfo = "";

                // Check each <pre> tag for hotspot data
                for (const pre of preTags) {
                    const divs = pre.getElementsByTagName('div');
                    const lastDiv = divs[divs.length - 1];

                    if (!lastDiv) continue; // Skip if no divs found

                    points = getPoint(lastDiv);
                    hotspotName = getName(lastDiv);
                    hotspotInfo = getHotspotInfo(lastDiv.innerHTML);

                    if (points.length > 0 || hotspotInfo) {
                        pre.parentElement.style.display = "none";
                        break;
                    }
                }

                switch (event.code) {
                    case 'Space':
                        if (!showForm && points.length > 0 && hotspotName) {
                            event.preventDefault(); // Prevent default space behavior
                            await FindHotspotByName(hotspotInfo, hotspotName);
                            setShowForm(true);
                            setPointList(points);
                        }
                        break;

                    case 'KeyD':
                        if (hPressed && !showForm) {
                            if (!hotspotInfo) {
                                Notification("Chưa chọn điểm để xóa ấn vào nút Print để chọn", "WARNING");
                            } else {
                                const confirmDelete = await showAlertDialog("Bạn có muốn xóa điểm đã chọn?");
                                if (!confirmDelete) return;
                                await DeleteHotspot(hotspotInfo);
                            }
                        }

                        break;

                    case 'KeyE':
                        if (hPressed && !showForm) {
                            if (!hotspotInfo) {
                                Notification("Chưa chọn điểm ấn vào nút Print để chọn", "WARNING");
                            } else {
                                // hotspotInfo.name;
                                const krpano = document.getElementById("krpanoSWFObject");
                                const hotspotPoint = krpano.get(`hotspot[${hotspotInfo.name}].point`);

                                if (hotspotPoint.count !== 0) {
                                    Notification("Chỉnh sửa hotspot hình vẽ vui lòng sử dụng phím p", "WARNING");
                                    return;
                                }

                                event.preventDefault();
                                await FindHotspotByName(hotspotInfo, hotspotName);
                                points = [{ ath: hotspotInfo.ath, atv: hotspotInfo.atv }];
                                setPointList(points);
                                setShowForm(true);
                            }
                        }
                        break;

                    default:
                        break;
                }
            };

            // Add the event listener on mount
            window.addEventListener("keydown", handleKeyDown);

            // Cleanup the event listener on unmount
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [showForm, token, hPressed]);
    // Added token to dependencies for completeness


    return (
        <>
            <div id="pano" style={{ width: "100%", height: "100%" }}></div>

            {(showForm && ((hasPermission("CREATE_HOTSPOT") && hasPermission("UPDATE_HOTSPOT")
                && hasPermission("DELETE_HOTSPOT")) || (hasPermission("MANAGE_INDUSTRIAL_PARK") && getUserCode() === currentUser))) && (
                    <AddHotspotForm
                        krpano={krpanoRef}
                        points={pointList}
                        hotspotData={hotspotData}
                        code={code}
                        onClose={handleFormClose}
                    />
                )}
        </>
    );
};

export { Panos };
