package com.ecomm.dto;

import com.ecomm.model.Role;
import com.ecomm.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
    private String username;
    private String email;
    private Set<Role> roles;

        public ProfileDTO(User user) {
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.roles = Set.of(user.getRoles());

        }
}


