package com.quangcd.cinemaproject.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String paymentMethod; // CREDIT_CARD, PAYPAL, etc.
    private String status; // SUCCESS, PENDING, FAILED

    @Column(name = "booking_id")
    private Long bookingId; // Reference to Booking ID

    private double amount;
}

