package com.quangcd.cinemaproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId; // Reference to User ID

    @Column(name = "showtime_id")
    private Long showtimeId; // Reference to Showtime ID

    @Temporal(TemporalType.TIMESTAMP)
    private Date bookingTime;

    private double totalPrice;
}

