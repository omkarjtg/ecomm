package com.ecomm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "password_reset_token",
        uniqueConstraints = @UniqueConstraint(
                name = "UK_token_unique",
                columnNames = {"token"}
        ))
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 36)
    private String token;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;


    public PasswordResetToken(String token, User user, LocalDateTime expiryDate) {
        this.token=token;
        this.user=user;
        this.expiryDate=expiryDate;
    }

    public boolean isExpired(){
        return expiryDate.isBefore(LocalDateTime.now());
    }
}