package com.quangcd.cinemaproject.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String seatNumber; // A1, A2, B1, etc.
    private String type; // REGULAR, VIP, etc.
    private boolean isAvailable;
    private int seatColumn;
    private int seatRow;
    @Column(name = "theater_id")
    private Long theaterId;

    @Column(name = "room_id")
    private Long roomId; // Reference to Theater ID
}

