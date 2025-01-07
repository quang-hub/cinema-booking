import React from "react";
import { AnimatePresence } from "framer-motion";
import {
  Typography,
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import dayjs from "dayjs";

const ContractModal = ({ open, onClose, contract }) => (
  <AnimatePresence>
    {open && (
      <Box
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[996]"
        onClick={onClose}
      >
        {/* Modal Content */}
        <Box
          className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg relative"
          onClick={(e) => e.stopPropagation()} // Prevent modal close on click inside
          
        >
          <Typography variant="h6" className="font-bold text-center mb-4 !font-bold">
              Chi tiết Hợp đồng
            </Typography>
          {/* Nút "X" */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-black bg-transparent border-none text-xl font-bold z-[997] !font-bold"
          >
            X
          </button>

          {/* Nội dung cuộn */}
          <Box className="h-[75vh] overflow-y-auto">
            
            <TableContainer component={Paper} className="rounded-lg shadow-sm">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      className="font-bold text-base bg-gray-200 !font-bold"
                      style={{ width: "40%" }}
                    >
                      Thông tin
                    </TableCell>
                    <TableCell
                      className="font-bold text-base bg-gray-200 !font-bold"
                      style={{ width: "60%" }}
                    >
                      Giá trị
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">Tên Hợp đồng</TableCell>
                    <TableCell>{contract.name || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">
                      Mã Khu công nghiệp
                    </TableCell>
                    <TableCell>{contract.industrialParkCode || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">Bên cho thuê</TableCell>
                    <TableCell>{contract.lessor || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">
                      Đại diện bên cho thuê
                    </TableCell>
                    <TableCell>
                      {contract.representativeLessor || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">
                      SĐT bên cho thuê
                    </TableCell>
                    <TableCell>{contract.lessorPhone || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">Bên thuê</TableCell>
                    <TableCell>{contract.lessee || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">
                      Đại diện bên thuê
                    </TableCell>
                    <TableCell>
                      {contract.representativeLessee || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">
                      SĐT bên thuê
                    </TableCell>
                    <TableCell>{contract.lesseePhone || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">Ngày bắt đầu</TableCell>
                    <TableCell>
                      {contract.startDate
                        ? dayjs(contract.startDate).format("DD/MM/YYYY HH:mm:ss")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">Ngày kết thúc</TableCell>
                    <TableCell>
                      {contract.endDate
                        ? dayjs(contract.endDate).format("DD/MM/YYYY HH:mm:ss")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold !font-bold">Mô tả</TableCell>
                    <TableCell>
                      <Box sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {contract.description || "N/A"}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    )}
  </AnimatePresence>
);

export default ContractModal;
