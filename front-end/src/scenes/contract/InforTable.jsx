import React from "react";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const InfoTable = ({ basicInfo }) => {
  const columns = [
    { field: "field", headerName: "Thông tin", width: 200 },
    {
      field: "value",
      headerName: "Giá trị",
      flex: 1,
      renderCell: (params) => {
        // Kiểm tra nếu đây là trường "Trạng thái"
        if (params.row.field === "Trạng thái") {
          const expired = params.value; // Giá trị boolean từ basicInfo.expired
          return (
            <span
              className={
                expired ? "text-red-500 font-bold" : "text-green-500 font-bold"
              }
            >
              {expired ? "Hết hạn" : "Còn hạn"}
            </span>
          );
        }
        // Các trường khác sẽ hiển thị giá trị bình thường
        return <span>{params.value}</span>;
      },
    },
  ];

  const rows = [
    { id: 1, field: "Mã", value: basicInfo.code },
    { id: 2, field: "Tên hợp đồng", value: basicInfo.name },
    { id: 3, field: "Ngày bắt đầu", value: basicInfo.startDate },
    { id: 4, field: "Ngày kết thúc", value: basicInfo.endDate },
    { id: 5, field: "Mô tả", value: basicInfo.description },
    { id: 6, field: "Trạng thái", value: basicInfo.expired },
  ];

  const lesseeRows = [
    { id: 7, field: "Bên thuê", value: basicInfo.lessee },
    {
      id: 8,
      field: "Đại diện bên thuê",
      value: basicInfo.representativeLessee,
    },
    { id: 9, field: "SĐT bên thuê", value: basicInfo.lesseePhone },
  ];

  const lessorRows = [
    { id: 10, field: "Bên cho thuê", value: basicInfo.lessor },
    {
      id: 11,
      field: "Đại diện bên cho thuê",
      value: basicInfo.representativeLessor,
    },
    { id: 12, field: "SĐT bên cho thuê", value: basicInfo.lessorPhone },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold">Thông tin chi tiết hợp đồng</h2>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <Box sx={{ width: "48%" }}>
          <h3 className="text-md font-semibold">Thông tin chung</h3>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            hideFooter
            disableColumnMenu
          />
        </Box>
        <Box sx={{ width: "48%" }}>
          <h3 className="text-md font-semibold">Thông tin bên thuê</h3>
          <DataGrid
            rows={lesseeRows}
            columns={columns}
            autoHeight
            hideFooter
            disableColumnMenu
          />
          <h3 className="text-md font-semibold" style={{ marginTop: "16px" }}>
            Thông tin bên cho thuê
          </h3>
          <DataGrid
            rows={lessorRows}
            columns={columns}
            autoHeight
            hideFooter
            disableColumnMenu
          />
        </Box>
      </Box>
    </div>
  );
};

export default InfoTable;
