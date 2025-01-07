import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Button,
  Autocomplete,
  TextField,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import { refreshToken } from "../../components/RefreshToken";
import Axios from "../../components/Axios";

const TablePermission = ({ selectedRolePermission, onPermissionIdsChange }) => {
  const [rows, setRows] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [filteredPermissions, setFilteredPermissions] = useState([]); // Filtered permissions for display
  const [isLoading, setIsLoading] = useState(false);

  const pageIndex = 1;
  const pageSize = 100;

  const handlePermissionChange = (event, newValue) => {
    setSelectedPermission(newValue.map(permission => permission.id)); // Save selected permission IDs
  };

  // Filter permissions based on search term
  const filterPermissions = (searchTerm) => {
    const filtered = allPermissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPermissions(filtered);
  };

  const fetchPermissions = async (searchTerm = "") => {
    let authToken = localStorage.getItem("authToken");
    setIsLoading(true);
    try {
      const requestBody = {
        pageIndex: pageIndex,
        pageSize: pageSize,
        searchTerm: searchTerm, // Add search term to the request
      };

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      let response = await Axios.post("/sys-permission/search", requestBody, {
        headers,
      });

      if (response.status === 401) {
        const refreshed = await refreshToken();

        if (refreshed) {
          authToken = localStorage.getItem("authToken");
          headers.Authorization = `Bearer ${authToken}`;

          response = await Axios.post("/sys-permission/search", requestBody, {
            headers,
          });
        } else {
          console.error("Unable to refresh token. Redirecting to login.");
          window.location.href = "/login"; 
          return;
        }
      }

      handlePermissionsResult(response.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setAllPermissions([]);
      setFilteredPermissions([]);
    } finally{
      setIsLoading(false);
    }
  };

  const handlePermissionsResult = (result) => {
    if (result.data && Array.isArray(result.data.content)) {
      setAllPermissions(result.data.content);
      if (!searchTerm) {
        setFilteredPermissions(result.data.content); // If no search term, show all permissions
      }
    } else {
      console.error("Invalid data format:", result);
      setAllPermissions([]);
      setFilteredPermissions([]);
    }
  };

  useEffect(() => {
    fetchPermissions(); // Initial fetch on component mount
  }, [pageIndex, pageSize]);

  useEffect(() => {
    if (selectedRolePermission?.listPermission) {
      const formattedRows = selectedRolePermission.listPermission.map(
        (permission) => ({
          id: permission.id,
          code: permission.code,
          name: permission.name,
          note: permission.note,
        })
      );
      setRows(formattedRows);

      const selectedIds = selectedRolePermission.listPermission.map(
        (permission) => permission.id
      );
      setSelectedPermission(selectedIds);
    }
  }, [selectedRolePermission]);

  const handleAddPermission = () => {
    if (selectedPermission.length > 0) {
      const newPermissions = selectedPermission
        .filter(
          (id) => !rows.find((row) => row.id === id) // Check if permission already exists in rows
        )
        .map((id) => {
          const permission = allPermissions.find((p) => p.id === id);
          return {
            id: permission.id,
            code: permission.code,
            name: permission.name,
            note: permission.note,
          };
        });

      setRows((prevRows) => [...prevRows, ...newPermissions]);
      const allPermissionIds = [
        ...rows.map((row) => row.id),
        ...newPermissions.map((permission) => permission.id),
      ];
      onPermissionIdsChange(allPermissionIds);
    }
  };

  const handleDelete = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);
    onPermissionIdsChange(updatedRows.map((row) => row.id));
  };

  const columns = [
    {
      field: "actions",
      headerName: "Tùy chọn",
      renderCell: (params) => (
        <Box>
          <IconButton
            color="warning"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
      flex: 0.5,
      sortable: false,
      filterable: false,
    },
    { field: "id", headerName: "ID" },
    { field: "code", headerName: "Mã quyền", flex: 1 },
    { field: "name", headerName: "Tên quyền", flex: 1 },
    { field: "note", headerName: "Ghi chú", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header subtitle="Tạo quyền cho chức vụ" />
      <Box display="flex" gap="10px" mb="10px">
        <Autocomplete
          multiple
          id="permissions-select"
          options={filteredPermissions}
          getOptionLabel={(option) => `${option.name} (${option.code})`}
          value={allPermissions.filter((permission) =>
            selectedPermission.includes(permission.id)
          )}
          onChange={handlePermissionChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          disableCloseOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              label="Chọn quyền"
              variant="outlined"
              className="w-200"  
              onInputChange={(e, newInputValue) => {
                setSearchTerm(newInputValue);
                filterPermissions(newInputValue);
              }}
            />
          )}
          sx={{ width: '66.67%' }} // Chiều rộng bằng 2/3 khối cha
          />

        <Button
          variant="outlined"
          color="primary"
          sx={{
            height: "56px",
            minWidth: "100px",
            alignSelf: "flex-start",
          }}
          onClick={handleAddPermission}
        >
          Thêm
        </Button>
      </Box>

      <Box height="60vh" sx={{ overflow: "auto" }}>
        <DataGrid
          rows={rows}
          loading={isLoading}
          columns={columns}
          componentsProps={{
            pagination: { style: { display: "none" } },
          }}
        />
      </Box>
    </Box>
  );
};

export default TablePermission;
