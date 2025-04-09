package com.ecomm.dto;

import com.ecomm.model.Role;
import com.ecomm.model.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {

    private String username;
    private String email;
    private Set<Role> roles;
    private LocalDate joinedAt;

    public ProfileDTO(User user) {
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.roles = Set.of(user.getRoles());
        this.joinedAt = user.getJoinedAt();
    }

}


