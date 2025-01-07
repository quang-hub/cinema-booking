package com.quangcd.cinemaproject.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@MappedSuperclass
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseEntity {

    public static final int CREATED_BY_MAX_LENGTH = 255;
    public static final int UPDATED_BY_MAX_LENGTH = 255;
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @CreatedBy
    @Size(max = CREATED_BY_MAX_LENGTH, message = "common.error.size-validation")
    @Column(name = "created_by")
    private String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @LastModifiedBy
    @Size(max = UPDATED_BY_MAX_LENGTH, message = "common.error.size-validation")
    @Column(name = "updated_by")
    private String updatedBy;
}

