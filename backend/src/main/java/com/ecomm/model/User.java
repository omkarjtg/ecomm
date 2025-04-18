    package com.ecomm.model;

    import jakarta.persistence.*;
    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.Size;
    import lombok.AllArgsConstructor;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;

    import java.time.LocalDate;
    import java.util.List;

    @Entity
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Table(name = "users")
    public class User {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @NotBlank(message = "Username cannot be blank")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        private String username;

        @Column(nullable = false, unique = true)
        private String email;

        @NotBlank(message = "Password cannot be blank")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @Column(name = "joined_at", nullable = false, updatable = false)
        private LocalDate joinedAt;

        @Enumerated(EnumType.STRING)  // Store as VARCHAR instead of separate table
        @Column(nullable = false)
        private Role roles;

        @PrePersist
        protected  void onCreate(){
            joinedAt = LocalDate.now();
        }

        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
        private List<Order> orders;

    }
