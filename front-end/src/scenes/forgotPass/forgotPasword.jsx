import React from 'react';
import { Link } from 'react-router-dom';
import PanoramaViewer from '../../components/PanoramaViewer';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import NavBar from '../../components/NavBar';
import Notification from '../../components/Notification';
import Axios from '../../components/Axios';
function ForgotPassword() {
  const formik = useFormik({
    initialValues: {
      email: '',
      userName: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Hãy nhập đúng định dạng')
        .required('Bắt buộc!'),
      userName: Yup.string()
        .required('Bắt buộc!')
        .min(1, 'Tối thiểu 1 ký tự')
        .max(45, 'Không nhập quá 45 ký tự'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await Axios.post('/sys-user/forgot-password', values, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const result = response.data; // Dữ liệu phản hồi từ server
    
        if (response.status === 200 && result.code === 200) {
          Notification('Hãy kiểm tra email của bạn và đăng nhập!', 'SUCCESS');
        } else {
          Notification(result.message || 'Đã xảy ra lỗi. Vui lòng thử lại.', 'ERROR');
        }
      } catch (error) {
        console.error('Error:', error);
        Notification('Lỗi hệ thống. Vui lòng thử lại sau.', 'ERROR');
      }
    }
  });

  return (
    <>
      <NavBar />
      <div className="flex h-screen">
        {/* Panorama Viewer */}
        <div className="w-1/2 h-full">
          <PanoramaViewer />
        </div>

        {/* Forgot Password Form */}
        <div className="w-1/2 h-full flex flex-col justify-center items-center p-6 bg-gray-50">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-left">
              <h1 className="text-xl font-semibold text-gray-800">
                Quản lý tour của bạn với VBee360.
              </h1>
            </div>
            <h1 className="text-3xl font-bold mb-4">Quên mật khẩu</h1>
            <p className="text-sm mb-6 text-gray-600">
              Nhập tên tài khoản và email của bạn để lấy lại mật khẩu.
            </p>
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                  Tên tài khoản
                </label>
                <input
                  type="text"
                  id="userName"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập tên đăng nhập"
                  value={formik.values.userName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.userName && formik.touched.userName && (
                  <p className="text-red-500 text-sm">{formik.errors.userName}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.email && formik.touched.email && (
                  <p className="text-red-500 text-sm">{formik.errors.email}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Lấy lại mật khẩu
              </button>
            </form>
            <p className="mt-4 text-center">
              <Link to="/login" className="text-blue-500 hover:underline">
                Về Đăng Nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
