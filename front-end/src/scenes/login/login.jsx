import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import PanoramaViewer from "../../components/PanoramaViewer";
import * as Yup from "yup";
import { useFormik } from "formik";
import NavBar from "../../components/NavBar";
import Axios from "../../components/Axios";

function Login() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("authToken");

  // State để lưu thông báo lỗi
  const [errorMessage, setErrorMessage] = useState("");

  // Hàm gọi API để đăng nhập

  const fetchUserData = async (username, password) => {

    try {
      const response = await Axios.post("/auth/login", {
        username,
        password,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;

      if (response.status === 200) {
        if (result.data) {
          // Lưu token vào localStorage
          localStorage.setItem("authToken", result.data.token);
          localStorage.setItem("refreshToken", result.data.refreshToken);

          // Chuyển hướng tới trang dashboard sau khi đăng nhập thành công
          navigate("/dashboard");
        } else {
          setErrorMessage(result.message || "Đăng nhập thất bại, xin hãy thử lại sau.");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Có lỗi xảy ra, xin hãy thử lại sau.");
    }
  };


  // Khởi tạo useFormik
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Bắt buộc!"),
      password: Yup.string().required("Bắt buộc!"),
    }),
    onSubmit: (values) => {
      fetchUserData(values.username, values.password); // Gọi hàm đăng nhập
    },
  });

  // Nếu người dùng đã đăng nhập, chuyển hướng đến trang dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <NavBar />
      <div className="flex h-screen">
        {/* Panorama Viewer */}
        {/* <div className="w-1/2 h-full">
          <PanoramaViewer />
        </div> */}
        {/* Login Form */}
        <div className="w-full h-full flex flex-col justify-center items-center p-6 bg-gray-50">
          <div className="w-full max-w-sm">
            {/* Brand Name */}
            <div className="mb-12 text-left">
              <h1 className="text-xl font-semibold text-gray-800">
                Quản lý tour của bạn với VBee360.
              </h1>
            </div>
            <h1 className="text-3xl font-bold mb-4"> Đăng nhập</h1>
            <p className="text-sm mb-6 text-gray-600">
              Chào mừng trở lại! Nhập thông tin của bạn tại đây.{" "}
            </p>
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tên Đăng Nhập
                </label>
                <input
                  type="text"
                  id="username"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập tên đăng nhập"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.username && formik.touched.username && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.username}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập mật khẩu"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.password && formik.touched.password && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.password}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Đăng nhập
              </button>
              {/* Hiển thị thông báo lỗi dưới form */}
              {errorMessage && (
                <p className="text-red-500 text-sm mt-4 text-center">
                  {errorMessage}
                </p>
              )}
            </form>

            <p className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Quên mật khẩu.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
