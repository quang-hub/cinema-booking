import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';


const HistoryTableDialog = ({ selectedRow }) => {

    console.log(selectedRow);

    return (

        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Trường đổi</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Giá trị cũ</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Giá trị mới</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {selectedRow && selectedRow.length !== 0 && selectedRow.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.columnName}</TableCell>
                            <TableCell>{row.oldValue}</TableCell>
                            <TableCell>{row.newValue}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default HistoryTableDialog;
