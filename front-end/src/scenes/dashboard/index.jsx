// Card.js
import React, { useEffect, useState } from "react";
import Card from "./Card";
import Axios from "../../components/Axios";

  
const Dashboard = () => {
  let token = localStorage.getItem("authToken") || "";
  

  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchDataDashboard();
  }, [])
  const fetchDataDashboard = async () => {
    
    const apiEndpoint = '/industrial-park/statistics-preview';
    const postData = {};
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Replace with your authorization header
    };
    console.log(headers);

    await Axios.get(apiEndpoint, { headers })
      .then(response => {

        const responseData = (response.data);
        setData(responseData.data);
        // setMessage(response.data.message);
        if (response.data.code !== 200) {
          return;
        }
      })
      .catch(error => {
        // message = response.message;
        console.error('Error:', error);
      });
  }

  return (<>
    
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
      {data.length !== 0 ? data.map((item, index) => (
        <Card key={index} data={item} />
      )) : <div>Chưa có dữ liệu</div>}
    </div>
    </>
  );
};

export default Dashboard;
